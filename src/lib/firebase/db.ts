// Firestore Database Operations
import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { Prompt } from '@/domain/models/Prompt';

// Collections
const PROMPTS_COLLECTION = 'prompts';
const USERS_COLLECTION = 'users';

// Query helpers
export const getPromptsQuery = (userId: string, options?: {
  limit?: number;
  startAfter?: any;
  search?: string;
  tags?: string[];
}) => {
  let q = query(
    collection(db, PROMPTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  if (options?.limit) {
    q = query(q, limit(options.limit));
  }
  if (options?.startAfter) {
    q = query(q, startAfter(options.startAfter));
  }
  if (options?.search) {
    // Firestore search would require additional setup (Algolia or custom search)
    console.warn('Search filtering should be implemented with Firestore indexes or search service');
  }
  if (options?.tags?.length) {
    // Array-contains for multiple tags would need additional logic
    options.tags.forEach(tag => {
      q = query(q, where(`tags.${tag}`, '==', true));
    });
  }

  return q;
};

// Prompt operations
export const createPrompt = async (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => {
  const newPrompt: Prompt = {
    ...prompt,
    id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, PROMPTS_COLLECTION), newPrompt);
  return newPrompt;
};

export const getPrompt = async (promptId: string) => {
  const docSnap = await getDoc(doc(db, PROMPTS_COLLECTION, promptId));
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Prompt) : null;
};

export const getUserPrompts = async (userId: string, options?: {
  limit?: number;
  startAfter?: any;
}) => {
  const q = getPromptsQuery(userId, options);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
};

export const updatePrompt = async (promptId: string, updates: Partial<Prompt>) => {
  await updateDoc(doc(db, PROMPTS_COLLECTION, promptId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deletePrompt = async (promptId: string) => {
  await deleteDoc(doc(db, PROMPTS_COLLECTION, promptId));
};

// User operations
export const getUser = async (userId: string) => {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const createUser = async (userId: string, email: string) => {
  await setDoc(doc(db, USERS_COLLECTION, userId), {
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Advanced query operations
export const searchPrompts = async (userId: string, searchTerm: string, limit = 20) => {
  // Firestore doesn't support full-text search natively
  // This would typically use:
  // 1. Firestore array-contains with indexed tags
  // 2. External search service (Algolia, ElasticSearch)
  // 3. Client-side filtering (for small datasets)
  
  const prompts = await getUserPrompts(userId, { limit });
  return prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

export const getPromptsByTag = async (userId: string, tag: string) => {
  const q = query(
    collection(db, PROMPTS_COLLECTION),
    where('userId', '==', userId),
    // Note: Firestore array-contains requires proper schema design
    // This is a simplified example
    where(`tags.${tag}`, '==', true)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
};