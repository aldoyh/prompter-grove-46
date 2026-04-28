// Repository Pattern for Prompt Data Access
import { db } from '@/lib/firebase/config';
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
} from 'firebase/firestore';
import { Prompt } from '@/domain/models/Prompt';
import { AuthError, DatabaseError, ValidationError } from '@/domain/utils/errors';

export class PromptRepository {
  private collectionName = 'prompts';

  async create(promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Prompt> {
    try {
      const newPrompt: Prompt = {
        ...promptData,
        id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, this.collectionName), newPrompt);
      return newPrompt;
    } catch (error) {
      throw new DatabaseError('Failed to create prompt', error);
    }
  }

  async findById(id: string): Promise<Prompt | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Prompt) : null;
    } catch (error) {
      throw new DatabaseError('Failed to fetch prompt', error);
    }
  }

  async findByUser(userId: string, options?: {
    limit?: number;
    startAfter?: any;
    search?: string;
  }): Promise<Prompt[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      if (options?.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
    } catch (error) {
      throw new DatabaseError('Failed to fetch user prompts', error);
    }
  }

  async findByTag(userId: string, tag: string): Promise<Prompt[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where(`tags.${tag}`, '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
    } catch (error) {
      throw new DatabaseError('Failed to fetch prompts by tag', error);
    }
  }

  async update(id: string, updates: Partial<Prompt>): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new DatabaseError('Failed to update prompt', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      throw new DatabaseError('Failed to delete prompt', error);
    }
  }

  async search(userId: string, searchTerm: string, limit = 20): Promise<Prompt[]> {
    try {
      // Get prompts and filter client-side for search
      const prompts = await this.findByUser(userId, { limit });
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return prompts.filter(prompt =>
        prompt.title.toLowerCase().includes(lowerSearchTerm) ||
        prompt.text.toLowerCase().includes(lowerSearchTerm) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    } catch (error) {
      throw new DatabaseError('Failed to search prompts', error);
    }
  }

  async countByTag(userId: string, tag: string): Promise<number> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where(`tags.${tag}`, '==', true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      throw new DatabaseError('Failed to count prompts by tag', error);
    }
  }
}

// Export singleton instance
export const promptRepository = new PromptRepository();