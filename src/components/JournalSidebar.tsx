import React from 'react';
import { Plus, BookOpen, Trash2, Calendar, MessageSquare, Sparkles, X } from 'lucide-react';
import type { JournalEntry } from '../types';

interface JournalSidebarProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string, e: React.MouseEvent) => void;
  isLoading: boolean;
  onCloseMobile?: () => void;
}

export const JournalSidebar: React.FC<JournalSidebarProps> = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  isLoading,
  onCloseMobile,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <aside
      id="journal-sidebar"
      className="w-full md:w-80 bg-[#0f121a] border-r border-white/[0.08] flex flex-col h-full shrink-0 select-none"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between gap-2 bg-[#121622]/70">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#a78bfa]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c8c6bf]">
            Journal Ledger
          </h2>
          <span className="text-[10px] font-mono bg-white/[0.06] text-[#a19e95] px-1.5 py-0.2 rounded">
            {entries.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-new-entry"
            onClick={onNewEntry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8b7cf7] text-white hover:bg-[#7a6ae8] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[#8a8880] hover:text-[#f3f2ee] hover:bg-white/[0.06]"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#8a8880]">
            Retrieving encrypted ledger...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center space-y-2.5">
            <p className="text-xs text-[#a19e95] font-medium">Your ledger is empty.</p>
            <p className="text-[11px] text-[#6b6962] leading-relaxed">
              Create an entry to explore your thoughts and extract reflection insights with Gemini.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            const hasInsight = Boolean(entry.reflection);

            return (
              <div
                key={entry.id}
                id={`entry-item-${entry.id}`}
                onClick={() => {
                  onSelectEntry(entry);
                  onCloseMobile?.();
                }}
                className={`group relative rounded-xl p-3.5 text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#191d29] border-white/[0.16] shadow-md ring-1 ring-[#a78bfa]/25'
                    : 'bg-[#131620]/40 border-white/[0.04] hover:bg-[#181c28] hover:border-white/[0.08]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4
                    className={`text-xs font-semibold line-clamp-1 transition-colors ${
                      isActive ? 'text-[#f3f2ee]' : 'text-[#dedcd5] group-hover:text-[#f3f2ee]'
                    }`}
                  >
                    {entry.title || 'Untitled Thought'}
                  </h4>

                  <button
                    id={`btn-delete-entry-${entry.id}`}
                    onClick={(e) => onDeleteEntry(entry.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6b6962] hover:text-red-400 rounded transition-opacity"
                    title="Delete reflection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {entry.summary && (
                  <p className="text-[11px] text-[#9a978f] line-clamp-2 mb-2.5 leading-relaxed font-normal">
                    {entry.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#716f68] pt-1 border-t border-white/[0.04]">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#8a8880]" />
                    {formatDate(entry.updatedAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasInsight && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded tracking-wider uppercase">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        Insight
                      </span>
                    )}

                    <span className="flex items-center gap-1 font-mono text-[#8a8880]">
                      <MessageSquare className="w-3 h-3" />
                      {entry.messages.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
