import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { JournalEntry, JournalMessage, ReflectionInsight } from '../types';

/**
 * Remove undefined properties from objects to prevent Firestore write crashes.
 */
function sanitizeForFirestore<T extends Record<string, any>>(data: T): T {
  const clean: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitizeForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean as T;
}

/**
 * Saves or updates a journal entry strictly under /users/{userId}/entries/{entryId}.
 * Enforces authenticated UID matching.
 */
export async function saveJournalEntry(
  userId: string,
  entry: JournalEntry
): Promise<void> {
  if (!userId || entry.userId !== userId) {
    throw new Error('Unauthorized: User ID mismatch during journal persistence.');
  }

  const entryRef = doc(db, 'users', userId, 'entries', entry.id);

  const cleanData = sanitizeForFirestore({
    id: entry.id,
    userId: entry.userId,
    title: entry.title || 'Untitled Journal Reflection',
    summary: entry.summary || '',
    messages: entry.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
    reflection: entry.reflection
      ? {
          mainTheme: entry.reflection.mainTheme,
          emotionalTone: entry.reflection.emotionalTone,
          keyObservation: entry.reflection.keyObservation,
          actionableReflection: entry.reflection.actionableReflection,
          generatedAt: entry.reflection.generatedAt,
        }
      : null,
    createdAt: entry.createdAt,
    updatedAt: Date.now(),
    serverTimestamp: serverTimestamp(),
  });

  await setDoc(entryRef, cleanData, { merge: true });
}

/**
 * Loads all journal entries belonging strictly to the authenticated user.
 */
export async function loadUserJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];

  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('updatedAt', 'desc'));

  try {
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: data.id || docSnap.id,
        userId: data.userId || userId,
        title: data.title || 'Journal Entry',
        summary: data.summary || '',
        messages: Array.isArray(data.messages) ? data.messages : [],
        reflection: data.reflection || undefined,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      });
    });

    return entries;
  } catch (error) {
    console.error('Error fetching user journal entries:', error);
    throw error;
  }
}

/**
 * Deletes a journal entry belonging strictly to the authenticated user.
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) return;
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryRef);
}

/**
 * Saves an AI Reflection Insight directly to Firestore under /users/{userId}/reflections/{id}
 * and updates the entry's reflection field.
 */
export async function saveReflectionInsight(
  userId: string,
  entryId: string,
  insight: ReflectionInsight
): Promise<void> {
  if (!userId || !entryId) {
    throw new Error('User ID and Entry ID required for saving reflection.');
  }

  // 1. Update the entry
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  const cleanInsight = sanitizeForFirestore({
    mainTheme: insight.mainTheme,
    emotionalTone: insight.emotionalTone,
    keyObservation: insight.keyObservation,
    actionableReflection: insight.actionableReflection,
    generatedAt: insight.generatedAt,
  });

  await setDoc(
    entryRef,
    {
      reflection: cleanInsight,
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  // 2. Also log to separate reflections subcollection for aggregated analysis
  const reflectionDocRef = doc(db, 'users', userId, 'reflections', entryId);
  await setDoc(
    reflectionDocRef,
    {
      entryId,
      userId,
      ...cleanInsight,
      serverTimestamp: serverTimestamp(),
    },
    { merge: true }
  );
}
