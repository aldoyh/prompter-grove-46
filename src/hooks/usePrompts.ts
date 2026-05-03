// Custom Hook for Prompt Management
import { useState, useEffect, useCallback, useRef } from 'react';
import { promptRepository } from '@/data/repository';
import { Prompt, PromptService } from '@/domain/models/Prompt';
import { useAuth } from './useAuth';

interface UsePromptsOptions {
  search?: string;
  tags?: string[];
  limit?: number;
}

export function usePrompts(options: UsePromptsOptions = {}) {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const optionsRef = useRef(options);

  // Keep options ref in sync
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetchPrompts = useCallback(async (userId: string, opts: UsePromptsOptions) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let result: Prompt[];
      
      if (opts.search || opts.tags?.length) {
        result = await promptRepository.search(userId, opts.search || '', 100);
        if (opts.tags?.length) {
          result = result.filter(p => opts.tags!.every(tag => p.tags.includes(tag)));
        }
      } else {
        result = await promptRepository.findByUser(userId, { limit: opts.limit });
      }
      
      if (isMountedRef.current) {
        setPrompts(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prompts';
      if (isMountedRef.current) {
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Use setTimeout to defer and avoid setState in effect
      const timer = setTimeout(() => {
        fetchPrompts(user.uid || user.id || '', optionsRef.current);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [user, user?.uid, user?.id, fetchPrompts]);

  const create = useCallback(async (data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const validatedData = {
        ...data,
        tags: PromptService.normalizeTags(data.tags || []),
      };
      
      PromptService.validateCreate(validatedData);
      
      const newPrompt = await promptRepository.create(validatedData, user.uid || user.id || '');
      setPrompts(prev => [newPrompt, ...prev]);
      return newPrompt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prompt';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  const update = useCallback(async (id: string, data: Partial<Prompt>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const existing = prompts.find(p => p.id === id);
      if (!existing) throw new Error('Prompt not found');
      
      const updatedData: Partial<Prompt> = { ...data };
      
      if (data.tags !== undefined) {
        updatedData.tags = PromptService.normalizeTags(data.tags);
      }
      
      PromptService.validateUpdate(updatedData);
      await promptRepository.update(id, updatedData);
      
      setPrompts(prev => prev.map(p => 
        p.id === id ? { ...p, ...updatedData, updatedAt: new Date().toISOString() } : p
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt';
      setError(errorMessage);
      throw err;
    }
  }, [user, prompts]);

  const remove = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await promptRepository.delete(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(errorMessage);
      throw err;
    }
  }, [user]);

  return {
    prompts,
    loading,
    error,
    create,
    update,
    remove,
    refetch: () => user && fetchPrompts(user.uid || user.id || '', optionsRef.current),
  };
}