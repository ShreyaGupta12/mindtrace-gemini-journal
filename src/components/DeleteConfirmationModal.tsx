import React from 'react';
import { Trash2, AlertCircle, Loader2, X } from 'lucide-react';
import type { JournalEntry } from '../types';

interface DeleteConfirmationModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  error?: string | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  entry,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  error,
}) => {
  if (!isOpen || !entry) return null;

  return (
    <div
      id="delete-confirmation-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        id="delete-confirmation-dialog"
        className="w-full max-w-md bg-gradient-to-b from-[#161f21] via-[#12191b] to-[#0f1416] border border-red-500/25 rounded-3xl shadow-2xl p-6 space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative subtle red accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-300 shrink-0 shadow-sm">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-[#78887b] hover:text-[#f7f5ed] hover:bg-white/[0.08] rounded-xl transition-all disabled:opacity-30 cursor-pointer"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-semibold text-[#f8f6f0] font-newsreader">
            Delete this journal page?
          </h3>
          <p className="text-xs sm:text-sm text-[#9aaba1] font-lora leading-relaxed">
            Are you sure you want to remove <span className="font-semibold text-amber-200">"{entry.title || 'Untitled Reflection'}"</span>? This will permanently delete this conversation and its reflection insight.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs text-red-200 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 font-lora">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-emerald-500/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#abb9af] hover:text-[#f7f5ed] hover:bg-white/[0.06] border border-emerald-500/20 transition-all cursor-pointer font-newsreader tracking-wide"
          >
            Keep Page
          </button>

          <button
            id="btn-confirm-delete"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-700 text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-md cursor-pointer font-newsreader tracking-wide"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Page</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
