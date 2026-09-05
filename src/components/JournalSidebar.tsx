import React from 'react';
import { Plus, BookOpen, Trash2, Calendar, MessageSquare, Sparkles, X, Sprout, Heart, Coffee } from 'lucide-react';
import type { JournalEntry } from '../types';

interface JournalSidebarProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entry: JournalEntry, e: React.MouseEvent) => void;
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
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <aside
      id="journal-sidebar"
      className="w-full md:w-80 bg-[#0f1517]/95 border-r border-emerald-500/15 flex flex-col h-full shrink-0 select-none backdrop-blur-md relative"
    >
      {/* Decorative ambient background glow */}
      <div className="absolute top-12 left-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar Header */}
      <div className="p-4 border-b border-emerald-500/15 flex items-center justify-between gap-2 bg-[#12191b]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-300">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#dce4dc] font-newsreader">
              Gentle Notebooks
            </h2>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">
            {entries.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-new-entry"
            onClick={onNewEntry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            title="Start a new journal page"
          >
            <Plus className="w-3.5 h-3.5 text-amber-200" />
            <span className="font-newsreader text-xs tracking-wide">New Page</span>
          </button>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-[#8f9d92] hover:text-[#f7f5ed] hover:bg-white/[0.08]"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Whimsical English comfort quote banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-emerald-950/20 via-amber-950/20 to-transparent border-b border-emerald-500/10 flex items-center gap-2 text-[11px] text-amber-200/90 font-lora italic">
        <Coffee className="w-3 h-3 text-amber-300 shrink-0" />
        <span className="truncate">"Be gentle with your thoughts today."</span>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading ? (
          <div className="p-8 text-center space-y-2">
            <Sprout className="w-5 h-5 text-emerald-400 animate-spin mx-auto opacity-70" />
            <p className="text-xs text-[#8f9d92] font-lora italic">
              Opening your quiet pages...
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-900/20 border border-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
              <Sprout className="w-5 h-5 text-emerald-300 animate-gentle-breathe" />
            </div>
            <p className="text-sm text-[#e4ede5] font-newsreader font-semibold">Your Notebook is Ready</p>
            <p className="text-xs text-[#8f9d92] font-lora italic leading-relaxed">
              Pour out whatever is on your mind today. There is no right or wrong way to write.
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
                className={`group relative rounded-xl p-3.5 text-left transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-br from-[#162222] to-[#121c1d] border-emerald-400/40 shadow-md ring-1 ring-emerald-400/20'
                    : 'bg-[#12191b]/60 border-emerald-500/10 hover:bg-[#162123]/80 hover:border-emerald-400/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-[11px] ${isActive ? 'text-amber-300' : 'text-emerald-400/70'}`}>
                      •
                    </span>
                    <h4
                      className={`text-xs font-medium line-clamp-1 transition-colors font-newsreader tracking-wide ${
                        isActive ? 'text-[#fbf9f4]' : 'text-[#d6ded7] group-hover:text-[#fbf9f4]'
                      }`}
                    >
                      {entry.title || 'Quiet Reflection'}
                    </h4>
                  </div>

                  <button
                    id={`btn-delete-entry-${entry.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry, e);
                    }}
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-[#8a998d] hover:text-red-300 rounded-lg hover:bg-red-500/15 transition-all shrink-0 cursor-pointer"
                    title="Delete page"
                    aria-label={`Delete ${entry.title || 'entry'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {entry.summary && (
                  <p className="text-[11px] text-[#abb9af] line-clamp-2 mb-2.5 leading-relaxed font-lora italic pl-2.5 border-l border-emerald-400/25">
                    "{entry.summary}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#78887b] pt-1.5 border-t border-emerald-500/10">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-[#8f9d92]">
                    <Calendar className="w-3 h-3 text-emerald-400/60" />
                    {formatDate(entry.updatedAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasInsight && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-300 bg-emerald-400/15 border border-emerald-400/25 px-2 py-0.5 rounded-full">
                        <Heart className="w-2.5 h-2.5 text-rose-300" />
                        Gentle Insight
                      </span>
                    )}

                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#8f9d92]">
                      <MessageSquare className="w-3 h-3 text-emerald-400/60" />
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
