import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import {
  loadUserJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
  saveReflectionInsight,
} from './lib/journalService';
import { sendJournalPrompt, requestReflectionInsight } from './lib/apiClient';
import type { JournalEntry, JournalMessage } from './types';
import { AuthScreen } from './components/AuthScreen';
import { AppHeader } from './components/AppHeader';
import { JournalSidebar } from './components/JournalSidebar';
import { JournalEditor } from './components/JournalEditor';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Journal state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);

  // Delete modal state
  const [entryPendingDelete, setEntryPendingDelete] = useState<JournalEntry | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
      setAuthError(null);

      if (user) {
        await fetchEntries(user.uid);
      } else {
        setEntries([]);
        setActiveEntry(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEntries = async (uid: string) => {
    setIsLoadingEntries(true);
    try {
      const userEntries = await loadUserJournalEntries(uid);
      setEntries(userEntries);
      if (userEntries.length > 0) {
        setActiveEntry(userEntries[0]);
      } else {
        createNewEntry(uid);
      }
    } catch (err: any) {
      console.error('Failed to load user entries from Firestore:', err);
      // If none or first time, create a fresh entry
      createNewEntry(uid);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Firebase Auth sign in failed:', err);
      setAuthError(
        err.message || 'Failed to sign in with Google. Please check popup blockers and try again.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const createNewEntry = (uid?: string) => {
    const targetUid = uid || currentUser?.uid;
    if (!targetUid) return;

    const newEntry: JournalEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: targetUid,
      title: 'New Reflection',
      summary: '',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveEntry(newEntry);
    setEntries((prev) => [newEntry, ...prev]);
    setEditorError(null);
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setEditorError(null);
  };

  const handleRequestDeleteEntry = (entry: JournalEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEntryPendingDelete(entry);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!currentUser || !entryPendingDelete) return;

    setIsDeletingEntry(true);
    setDeleteError(null);

    try {
      const entryId = entryPendingDelete.id;
      await deleteJournalEntry(currentUser.uid, entryId);
      
      const remaining = entries.filter((ent) => ent.id !== entryId);
      setEntries(remaining);
      
      if (activeEntry?.id === entryId) {
        if (remaining.length > 0) {
          setActiveEntry(remaining[0]);
        } else {
          createNewEntry(currentUser.uid);
        }
      }
      
      setEntryPendingDelete(null);
    } catch (err: any) {
      console.error('Failed to delete entry from Firestore:', err);
      setDeleteError(err.message || 'Failed to delete page. Please check your connection.');
    } finally {
      setIsDeletingEntry(false);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!activeEntry || !currentUser) return;
    const updated = {
      ...activeEntry,
      title: newTitle,
      updatedAt: Date.now(),
    };
    setActiveEntry(updated);
    setEntries((prev) =>
      prev.map((e) => (e.id === activeEntry.id ? updated : e))
    );

    try {
      await saveJournalEntry(currentUser.uid, updated);
    } catch (err) {
      console.error('Auto-save title failed:', err);
    }
  };

  const handleSendMessage = async (promptText: string) => {
    if (!activeEntry || !currentUser || isSendingPrompt) return;

    setEditorError(null);
    setIsSendingPrompt(true);

    const userMessage: JournalMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: promptText,
      createdAt: Date.now(),
    };

    // Optimistically update conversation
    const updatedMessages = [...activeEntry.messages, userMessage];
    const optimisticEntry: JournalEntry = {
      ...activeEntry,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setActiveEntry(optimisticEntry);
    setEntries((prev) =>
      prev.map((e) => (e.id === activeEntry.id ? optimisticEntry : e))
    );

    try {
      const idToken = await currentUser.getIdToken();

      const apiHistory = activeEntry.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendJournalPrompt(idToken, {
        history: apiHistory,
        prompt: promptText,
        existingTitle: activeEntry.title,
      });

      const modelMessage: JournalMessage = {
        id: 'msg_gemini_' + Date.now(),
        role: 'model',
        content: response.response,
        createdAt: Date.now(),
      };

      const finalEntry: JournalEntry = {
        ...optimisticEntry,
        title:
          response.title && (!activeEntry.title || activeEntry.title === 'New Reflection')
            ? response.title
            : activeEntry.title,
        summary: response.summary || activeEntry.summary,
        messages: [...updatedMessages, modelMessage],
        updatedAt: Date.now(),
      };

      setActiveEntry(finalEntry);
      setEntries((prev) =>
        prev.map((e) => (e.id === activeEntry.id ? finalEntry : e))
      );

      // Persist to Firestore strictly under authenticated user ID
      await saveJournalEntry(currentUser.uid, finalEntry);
      setFailedPrompt(null);
    } catch (err: any) {
      console.error('Failed to process message or persist:', err);
      setFailedPrompt(promptText);
      setEditorError(
        err.message || 'Error communicating with Gemini. Your prompt was saved locally.'
      );
      // Attempt to save user prompt to Firestore even if Gemini call encountered error
      try {
        await saveJournalEntry(currentUser.uid, optimisticEntry);
      } catch (saveErr) {
        console.error('Failed to fallback save:', saveErr);
      }
    } finally {
      setIsSendingPrompt(false);
    }
  };

  const handleGenerateReflection = async () => {
    if (!activeEntry || !currentUser || activeEntry.messages.length === 0) return;

    setIsGeneratingReflection(true);
    try {
      const idToken = await currentUser.getIdToken();
      const messagesPayload = activeEntry.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await requestReflectionInsight(idToken, {
        messages: messagesPayload,
      });

      const updatedEntry: JournalEntry = {
        ...activeEntry,
        reflection: res.insight,
        updatedAt: Date.now(),
      };

      setActiveEntry(updatedEntry);
      setEntries((prev) =>
        prev.map((e) => (e.id === activeEntry.id ? updatedEntry : e))
      );

      // Persist reflection to Firestore under authenticated user's collection
      await saveReflectionInsight(currentUser.uid, activeEntry.id, res.insight);
    } catch (err: any) {
      console.error('Failed to generate reflection insight:', err);
      throw err;
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0d1214] text-[#f7f5ed] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 relative">
          <div className="w-10 h-10 rounded-2xl bg-[#141d1f] border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
          </div>
          <p className="text-xs font-medium text-[#9aaba1] tracking-wide font-lora italic text-sm">
            Preparing your quiet notebook...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        isLoading={isSigningIn}
        error={authError}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d1214] text-[#f7f5ed] overflow-hidden">
      <AppHeader
        user={currentUser}
        onSignOut={handleSignOut}
        onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <JournalSidebar
            entries={entries}
            activeEntryId={activeEntry?.id || null}
            onSelectEntry={handleSelectEntry}
            onNewEntry={() => createNewEntry()}
            onDeleteEntry={handleRequestDeleteEntry}
            isLoading={isLoadingEntries}
          />
        </div>

        {/* Mobile Sidebar Drawer with Backdrop */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-4/5 max-w-xs h-full bg-[#0f1517] shadow-2xl">
              <JournalSidebar
                entries={entries}
                activeEntryId={activeEntry?.id || null}
                onSelectEntry={handleSelectEntry}
                onNewEntry={() => createNewEntry()}
                onDeleteEntry={handleRequestDeleteEntry}
                isLoading={isLoadingEntries}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Active Workspace / Editor */}
        {activeEntry ? (
          <JournalEditor
            entry={activeEntry}
            onSendMessage={handleSendMessage}
            onGenerateReflection={handleGenerateReflection}
            isSending={isSendingPrompt}
            isGeneratingReflection={isGeneratingReflection}
            onUpdateTitle={handleUpdateTitle}
            onDeleteEntry={() => activeEntry && handleRequestDeleteEntry(activeEntry)}
            error={editorError}
            onRetry={
              failedPrompt
                ? () => {
                    handleSendMessage(failedPrompt);
                  }
                : undefined
            }
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1214] p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#141d1f] border border-emerald-400/25 flex items-center justify-center text-emerald-300 shadow-sm">
              <Loader2 className="w-6 h-6 opacity-60 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#f8f6f0] font-newsreader">No Active Page</h3>
              <p className="text-xs text-[#9aaba1] font-lora italic text-sm max-w-xs mx-auto mt-1">
                Select a page from your notebooks or write a new one to begin.
              </p>
            </div>
            <button
              onClick={() => createNewEntry()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 text-xs font-semibold font-newsreader tracking-wide transition-all shadow-sm cursor-pointer"
            >
              + Write New Page
            </button>
          </div>
        )}
      </div>

      {/* In-app non-blocking Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(entryPendingDelete)}
        entry={entryPendingDelete}
        onClose={() => {
          if (!isDeletingEntry) {
            setEntryPendingDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingEntry}
        error={deleteError}
      />
    </div>
  );
}
