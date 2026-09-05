import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthenticatedRequest } from './server/auth.ts';
import {
  generateJournalResponse,
  generateSummaryAndTitle,
  generateReflectionInsight,
} from './server/gemini.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Health check endpoint for Cloud Run
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mindtrace-personal-gemini-journal',
    timestamp: new Date().toISOString(),
    cloudRunReady: true,
  });
});

/**
 * Multi-turn Gemini chat API for authenticated journal sessions.
 * Validates bearer token, handles rate limits and upstream Gemini errors gracefully.
 */
app.post('/api/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { history = [], prompt = '' } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required and must not be empty.' });
      return;
    }

    if (prompt.length > 4000) {
      res.status(400).json({ error: 'Prompt exceeds maximum length of 4,000 characters.' });
      return;
    }

    // Sanitize message history, filtering out empty or malformed messages
    const safeHistory = Array.isArray(history)
      ? history
          .filter((m: any) => m && typeof m.content === 'string' && m.content.trim())
          .slice(-20)
          .map((m: any) => ({
            role: m.role === 'model' ? ('model' as const) : ('user' as const),
            content: String(m.content).slice(0, 4000),
          }))
      : [];

    const { text } = await generateJournalResponse(safeHistory, prompt.trim());

    // Generate summary and title for the ongoing conversation
    let summary: string | undefined;
    let title: string | undefined;

    const fullConversation = [
      ...safeHistory,
      { role: 'user' as const, content: prompt.trim() },
      { role: 'model' as const, content: text },
    ];

    try {
      const summaryResult = await generateSummaryAndTitle(fullConversation);
      title = summaryResult.title;
      summary = summaryResult.summary;
    } catch (sumErr: any) {
      console.log('[Server] Summary generation skipped:', sumErr?.message || sumErr);
    }

    res.json({
      response: text,
      title,
      summary,
    });
  } catch (error: any) {
    const errorMessage = String(error?.message || '');
    console.log('[Server] /api/chat handled exception:', errorMessage.slice(0, 200));

    if (
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('503') ||
      errorMessage.includes('UNAVAILABLE') ||
      errorMessage.includes('high demand')
    ) {
      res.status(429).json({
        error: 'The journal assistant is experiencing high volume. Please wait a moment and try again.',
      });
      return;
    }

    if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
      res.status(404).json({
        error: 'Requested Gemini model service not found or temporarily unavailable.',
      });
      return;
    }

    if (errorMessage.includes('500') || errorMessage.includes('INTERNAL')) {
      res.status(500).json({
        error: 'Gemini encountered an internal error. Please try again shortly.',
      });
      return;
    }

    res.status(500).json({
      error: 'An unexpected error occurred while processing your journal reflection. Please try again.',
    });
  }
});

/**
 * AI Reflection Insight generator for the active authenticated user.
 * Generates mainTheme, emotionalTone, keyObservation, and actionableReflection.
 */
app.post('/api/reflection', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { messages = [] } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Conversation messages are required to generate an insight.' });
      return;
    }

    const safeMessages = messages
      .filter((m: any) => m && typeof m.content === 'string' && m.content.trim())
      .slice(-20)
      .map((m: any) => ({
        role: m.role === 'model' ? ('model' as const) : ('user' as const),
        content: String(m.content).slice(0, 4000),
      }));

    if (safeMessages.length === 0) {
      res.status(400).json({ error: 'No valid message content provided to generate an insight.' });
      return;
    }

    const insightData = await generateReflectionInsight(safeMessages);

    const insight = {
      ...insightData,
      generatedAt: Date.now(),
    };

    res.json({ insight });
  } catch (error: any) {
    const errorMessage = String(error?.message || '');
    console.log('[Server] /api/reflection handled exception:', errorMessage.slice(0, 200));

    if (
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('503') ||
      errorMessage.includes('UNAVAILABLE') ||
      errorMessage.includes('high demand')
    ) {
      res.status(429).json({
        error: 'AI Reflection Insight is busy with high demand. Please try again in a few seconds.',
      });
      return;
    }

    if (errorMessage.includes('404') || errorMessage.includes('NOT_FOUND')) {
      res.status(404).json({
        error: 'Requested insight model service was not found.',
      });
      return;
    }

    res.status(500).json({
      error: 'Unable to generate reflection insight. Please try again shortly.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindTrace Personal Gemini Journal Server listening on port ${PORT}`);
  });
}

startServer();
