import type {
  ChatApiRequest,
  ChatApiResponse,
  ReflectionApiRequest,
  ReflectionApiResponse,
} from '../types';

/**
 * Extracts a readable error message from a Fetch response, safely handling JSON, HTML, or plain text.
 */
async function parseErrorResponse(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') || '';
  let fallbackMessage = `Server returned status ${res.status}`;

  if (contentType.includes('application/json')) {
    try {
      const data = await res.json();
      return data.error || fallbackMessage;
    } catch {
      // Fall through to text handling
    }
  }

  try {
    const rawText = await res.text();
    if (
      rawText.includes('503') ||
      rawText.includes('high demand') ||
      rawText.includes('Service Unavailable') ||
      rawText.includes('UNAVAILABLE')
    ) {
      return 'The AI service is experiencing high demand. Please wait a moment and try again.';
    }
    if (rawText.includes('429') || rawText.includes('RESOURCE_EXHAUSTED')) {
      return 'Rate limit reached. Please wait a few seconds before trying again.';
    }
    if (rawText.includes('404') || rawText.includes('NOT_FOUND')) {
      return 'The requested AI model is temporarily unavailable.';
    }
    if (rawText.length > 0 && rawText.length < 200 && !rawText.includes('<html')) {
      return rawText;
    }
  } catch {
    // Ignore text parse errors
  }

  return fallbackMessage;
}

/**
 * Sends a multi-turn journal prompt to the server proxy with Firebase ID token.
 */
export async function sendJournalPrompt(
  idToken: string,
  payload: ChatApiRequest
): Promise<ChatApiResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res);
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.includes('503') || text.includes('high demand')) {
      throw new Error(
        'The AI service is temporarily experiencing high demand. Please try again in a moment.'
      );
    }
    throw new Error('Unexpected response format from server. Please retry.');
  }

  return res.json();
}

/**
 * Requests an AI Reflection Insight for the current conversation messages.
 */
export async function requestReflectionInsight(
  idToken: string,
  payload: ReflectionApiRequest
): Promise<ReflectionApiResponse> {
  const res = await fetch('/api/reflection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res);
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.includes('503') || text.includes('high demand')) {
      throw new Error(
        'The AI service is temporarily experiencing high demand. Please try again in a moment.'
      );
    }
    throw new Error('Unexpected response format from server. Please retry.');
  }

  return res.json();
}
