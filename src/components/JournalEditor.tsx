import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  User,
  Bot,
  AlertCircle,
  Save,
  Compass,
  MessageSquare,
  Columns,
} from 'lucide-react';
import type { JournalEntry } from '../types';
import { ReflectionCard } from './ReflectionCard';

interface JournalEditorProps {
  entry: JournalEntry;
  onSendMessage: (prompt: string) => Promise<void>;
  onGenerateReflection: () => Promise<void>;
  isSending: boolean;
  isGeneratingReflection: boolean;
  onUpdateTitle: (newTitle: string) => void;
  error?: string | null;
  onRetry?: () => void;
}

type ViewMode = 'all' | 'dialogue' | 'insight';

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onSendMessage,
  onGenerateReflection,
  isSending,
  isGeneratingReflection,
  onUpdateTitle,
  error,
  onRetry,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (viewMode !== 'insight') {
      scrollToBottom();
    }
  }, [entry.messages, isSending, viewMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;
    const promptToSend = inputPrompt.trim();
    setInputPrompt('');
    await onSendMessage(promptToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTriggerReflection = async () => {
    setReflectionError(null);
    try {
      await onGenerateReflection();
    } catch (err: any) {
      setReflectionError(err.message || 'Failed to generate reflection insight.');
    }
  };

  return (
    <main
      id="journal-editor-main"
      className="flex-1 flex flex-col h-full bg-[#0c0e14] text-[#f3f2ee] overflow-hidden"
    >
      {/* Entry Header */}
      <header className="px-5 sm:px-8 py-3.5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f121a]">
        <div className="flex-1 min-w-0">
          <input
            id="entry-title-input"
            type="text"
            value={entry.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder="Journal Title..."
            className="text-base sm:text-lg font-medium text-[#f3f2ee] bg-transparent border-b border-transparent hover:border-white/[0.15] focus:border-[#a78bfa] focus:outline-hidden w-full transition-colors truncate"
          />
          {entry.summary && (
            <p
              id="entry-summary-display"
              className="text-xs text-[#8a8880] mt-0.5 line-clamp-1 italic"
            >
              Summary: {entry.summary}
            </p>
          )}
        </div>

        {/* View mode switcher & status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-[#151924] border border-white/[0.08] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'all'
                  ? 'bg-[#222738] text-[#f3f2ee] font-medium shadow-xs'
                  : 'text-[#8a8880] hover:text-[#dedcd5]'
              }`}
              title="View conversation and reflection insight"
            >
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">All</span>
            </button>
            <button
              onClick={() => setViewMode('insight')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'insight'
                  ? 'bg-[#222738] text-amber-300 font-medium shadow-xs'
                  : 'text-[#8a8880] hover:text-amber-200'
              }`}
              title="Focus purely on AI Reflection Insight"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Insight</span>
            </button>
            <button
              onClick={() => setViewMode('dialogue')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'dialogue'
                  ? 'bg-[#222738] text-[#f3f2ee] font-medium shadow-xs'
                  : 'text-[#8a8880] hover:text-[#dedcd5]'
              }`}
              title="Dialogue only"
            >
              Dialogue
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#8a8880]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Encrypted in Firestore</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Reflection Insight Section */}
        {(viewMode === 'all' || viewMode === 'insight') && (
          <div className="max-w-3xl mx-auto">
            <ReflectionCard
              insight={entry.reflection}
              onGenerate={handleTriggerReflection}
              isGenerating={isGeneratingReflection}
              canGenerate={entry.messages.length > 0}
              error={reflectionError}
            />
          </div>
        )}

        {error && (
          <div
            id="editor-error-banner"
            className="max-w-3xl mx-auto flex items-center justify-between gap-3 p-3.5 text-xs text-red-300 bg-red-950/40 border border-red-800/60 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                id="btn-retry-action"
                onClick={onRetry}
                className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800/80 text-red-100 font-medium text-xs transition-colors shrink-0 cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Conversation Stream Section */}
        {(viewMode === 'all' || viewMode === 'dialogue') && (
          <div className="max-w-3xl mx-auto space-y-4">
            {entry.messages.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#151824] border border-white/[0.08] text-[#c4b8f3] flex items-center justify-center mx-auto shadow-inner">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium text-[#f3f2ee]">
                  Begin your reflection
                </h3>
                <p className="text-xs text-[#8a8880] max-w-sm mx-auto leading-relaxed">
                  Write out the puzzle, decision, emotion, or experience you are working through. Gemini will explore it with you.
                </p>
              </div>
            ) : (
              entry.messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    id={`chat-message-${msg.id}`}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-[#181c28] border border-[#a78bfa]/30 text-[#c4b8f3] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-xl rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#1e2330] text-[#f3f2ee] border border-white/[0.1] rounded-tr-xs shadow-xs'
                          : 'bg-[#131620] text-[#dedcd5] border border-white/[0.06] rounded-tl-xs whitespace-pre-wrap'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-[#222736] text-[#a19e95] flex items-center justify-center shrink-0 mt-0.5 border border-white/[0.08]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex gap-3 items-center text-xs text-[#8a8880] italic py-2">
                <div className="w-7 h-7 rounded-lg bg-[#181c28] border border-[#a78bfa]/30 text-[#c4b8f3] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 bg-[#131620] border border-white/[0.06] px-3.5 py-2 rounded-xl text-[#dedcd5]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a78bfa]" />
                  <span>Contemplating your thoughts...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Writing Bar */}
      <footer className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0d0f15]">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-end gap-2.5"
        >
          <div className="flex-1 relative">
            <textarea
              id="chat-input-textarea"
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Inquire, reflect, or brainstorm... (Enter to send, Shift+Enter for newline)"
              className="w-full text-xs sm:text-sm p-3.5 pr-10 border border-white/[0.1] rounded-xl focus:border-[#a78bfa]/60 focus:ring-1 focus:ring-[#a78bfa]/30 focus:outline-hidden resize-none bg-[#141722] text-[#f3f2ee] placeholder-[#64625b] transition-all"
            />
          </div>

          <button
            id="btn-send-message"
            type="submit"
            disabled={!inputPrompt.trim() || isSending}
            className="h-11 px-4 rounded-xl bg-[#8b7cf7] text-white hover:bg-[#7a6ae8] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer active:scale-[0.98]"
            title="Send thought to Gemini"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </footer>
    </main>
  );
};
