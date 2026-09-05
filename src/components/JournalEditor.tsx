import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Heart,
  Bot,
  User,
  Eye,
  Coffee,
  Sprout,
  Sun,
  Smile,
  Trash2,
} from 'lucide-react';
import type { JournalEntry } from '../types';
import { ReflectionCard } from './ReflectionCard';

interface JournalEditorProps {
  entry: JournalEntry;
  onUpdateTitle: (newTitle: string) => void;
  onSendMessage: (prompt: string) => Promise<void>;
  onGenerateReflection: () => Promise<void>;
  isSending: boolean;
  isGeneratingReflection: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDeleteEntry?: () => void;
}

type ViewMode = 'all' | 'insight';

const GENTLE_MENTAL_HEALTH_SPARKS = [
  { label: '🌿 Unpack something that feels heavy', prompt: 'I would like to unpack something that has been feeling heavy or stressful on my mind today.' },
  { label: '🍵 A small, quiet comfort today', prompt: 'I want to reflect on a small, quiet moment that brought me comfort or a brief feeling of peace today.' },
  { label: '🕊️ Untangle an anxious worry', prompt: 'I am feeling anxious or overthinking about a situation right now and want to look at it with gentle perspective.' },
  { label: '🌤️ Speak kindly to myself', prompt: 'I have been being hard on myself lately, and I want to practice giving myself some warmth and understanding.' },
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onUpdateTitle,
  onSendMessage,
  onGenerateReflection,
  isSending,
  isGeneratingReflection,
  error,
  onRetry,
  onDeleteEntry,
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
      className="flex-1 flex flex-col h-full bg-[#0d1214] text-[#f7f5ed] overflow-hidden relative"
    >
      {/* Background soft ambient calming gradients */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-amber-500/4 rounded-full blur-3xl pointer-events-none" />

      {/* Entry Header */}
      <header className="px-5 sm:px-8 py-3.5 border-b border-emerald-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101618]/90 backdrop-blur-md shrink-0 z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400/80 text-sm">•</span>
            <input
              id="entry-title-input"
              type="text"
              value={entry.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="Title for today's thoughts..."
              className="text-base sm:text-lg font-semibold text-[#f8f6f0] bg-transparent border-b border-transparent hover:border-emerald-400/30 focus:border-emerald-400/60 focus:outline-hidden w-full transition-colors truncate font-newsreader"
            />
          </div>
          {entry.summary && (
            <p
              id="entry-summary-display"
              className="text-xs text-[#9aaba1] mt-0.5 line-clamp-1 font-lora italic pl-4"
            >
              Summary: "{entry.summary}"
            </p>
          )}
        </div>

        {/* View mode switcher & status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-[#131d1f] border border-emerald-500/20 p-0.5 rounded-xl text-xs shadow-xs">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg transition-all font-newsreader text-xs ${
                viewMode === 'all'
                  ? 'bg-gradient-to-r from-emerald-800/50 to-teal-800/50 text-[#fbf9f4] font-semibold shadow-xs border border-emerald-400/30'
                  : 'text-[#8f9d92] hover:text-[#dce4dc]'
              }`}
              title="View full conversation and reflection"
            >
              <span className="hidden sm:inline">Notebook</span>
              <span className="sm:hidden">All</span>
            </button>
            <button
              onClick={() => setViewMode('insight')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 font-newsreader text-xs ${
                viewMode === 'insight'
                  ? 'bg-gradient-to-r from-amber-800/40 to-emerald-800/40 text-amber-200 font-semibold shadow-xs border border-amber-400/30'
                  : 'text-[#8f9d92] hover:text-amber-200'
              }`}
              title="Focus purely on Gentle Reflection Insight"
            >
              <Heart className="w-3 h-3 text-rose-300" />
              <span>Insight</span>
            </button>
          </div>

          {onDeleteEntry && (
            <button
              id="btn-delete-active-chat"
              type="button"
              onClick={onDeleteEntry}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs text-[#8f9d92] hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              title="Delete this chat"
              aria-label="Delete this chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-newsreader text-xs">Delete Chat</span>
            </button>
          )}

          <span className="text-[10px] text-[#718275] font-mono hidden md:inline">
            Safe &amp; Confidential
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 space-y-6">
        {/* Reflection Insight section */}
        <div className={viewMode === 'insight' ? 'max-w-3xl mx-auto' : ''}>
          <ReflectionCard
            insight={entry.reflection}
            onGenerate={handleTriggerReflection}
            isGenerating={isGeneratingReflection}
            canGenerate={entry.messages.length > 0}
            error={reflectionError}
          />
        </div>

        {/* Multi-turn conversation feed */}
        {viewMode !== 'insight' && (
          <div className="max-w-3xl mx-auto space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#9aaba1] uppercase tracking-wider font-newsreader pt-2">
              <Coffee className="w-3.5 h-3.5 text-amber-300" />
              <span>Your Gentle Journal Dialogue</span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/20 via-amber-400/20 to-transparent ml-2" />
            </div>

            {entry.messages.length === 0 ? (
              <div
                id="empty-chat-state"
                className="py-10 px-5 text-center space-y-4 border border-dashed border-emerald-500/20 rounded-2xl bg-[#111719]/60 relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1c2825] to-[#131d1c] border border-emerald-400/30 text-emerald-300 flex items-center justify-center mx-auto shadow-sm animate-gentle-breathe">
                  <Coffee className="w-5 h-5 text-amber-200" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#f8f6f0] font-newsreader">
                    A Quiet Cup of Tea for Your Thoughts
                  </p>
                  <p className="text-xs text-[#9aaba1] font-lora italic text-sm max-w-md mx-auto leading-relaxed">
                    Take your time. Write about something that made you smile, unpack a lingering worry, or simply describe how your day felt.
                  </p>
                </div>

                {/* Whimsical mental health sparks */}
                <div className="pt-2">
                  <p className="text-[10px] text-amber-200/80 font-newsreader uppercase tracking-wider mb-2.5">
                    Gentle Ideas to Begin
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                    {GENTLE_MENTAL_HEALTH_SPARKS.map((spark, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInputPrompt(spark.prompt)}
                        className="text-xs px-3.5 py-1.5 rounded-full bg-[#162123] hover:bg-[#1c2b2e] border border-emerald-500/20 hover:border-emerald-400/40 text-[#dce4dc] hover:text-[#fbf9f4] transition-all cursor-pointer shadow-xs font-lora text-sm italic"
                      >
                        {spark.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1c2925] to-[#121c1a] border border-emerald-400/25 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Sprout className="w-4 h-4 text-emerald-300" />
                      </div>
                    )}

                    <div
                      className={`max-w-xl rounded-2xl px-4.5 py-3 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-br from-[#1a2729] to-[#152123] text-[#fbf9f4] border border-emerald-400/20 rounded-tr-xs shadow-sm'
                          : 'bg-[#12191b] text-[#dce4dc] border border-emerald-500/15 rounded-tl-xs shadow-xs whitespace-pre-wrap font-lora text-sm sm:text-base'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-[#172224] text-[#a5b5a8] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/15">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isSending && (
              <div className="flex gap-3 items-center text-xs text-[#9aaba1] italic py-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1c2925] to-[#121c1a] border border-emerald-400/25 text-emerald-300 flex items-center justify-center shrink-0">
                  <Coffee className="w-4 h-4 text-amber-300 animate-gentle-breathe" />
                </div>
                <div className="flex items-center gap-2.5 bg-[#12191b] border border-emerald-500/15 px-4 py-2.5 rounded-2xl text-[#dce4dc] shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                  <span className="font-lora italic text-sm">Holding space for your thoughts...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Writing Bar */}
      <footer className="p-4 sm:p-5 border-t border-emerald-500/15 bg-[#0f1517]/90 backdrop-blur-md relative z-10 space-y-3">
        {error && (
          <div
            id="editor-error-banner"
            className="max-w-3xl mx-auto p-3 text-xs text-red-200 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-between gap-3 shadow-md"
          >
            <span className="font-lora">✦ {error}</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1 bg-red-800/40 hover:bg-red-800/60 border border-red-400/40 rounded-lg text-red-100 font-newsreader text-xs tracking-wide transition-all cursor-pointer shrink-0"
              >
                Try Again
              </button>
            )}
          </div>
        )}

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
              placeholder="Write whatever is on your mind... (Enter to send, Shift+Enter for newline)"
              className="w-full text-xs sm:text-sm p-3.5 pr-10 border border-emerald-500/20 rounded-2xl focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30 focus:outline-hidden resize-none bg-[#141d1f] text-[#f8f6f0] placeholder-[#798a7d] transition-all shadow-inner font-lora text-base"
            />
          </div>

          <button
            id="btn-send-message"
            type="submit"
            disabled={!inputPrompt.trim() || isSending}
            className="h-12 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer active:scale-[0.98]"
            title="Send your reflection"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
      </footer>
    </main>
  );
};
