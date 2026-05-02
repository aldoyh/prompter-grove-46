// Custom Hook for Prompt Management with Real-time Updates
import { useState, useEffect, useCallback, useMemo } from 'react';
import { promptRepository } from '@/data/repository';
import { Prompt, PromptService } from '@/domain/models/Prompt';
import { useAuth } from './useAuth';

interface UsePromptsOptions {
  search?: string;
  tags?: string[];
  limit?: number;
  enableRealtime?: boolean;
}

export function usePrompts(options: UsePromptsOptions = {}) {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async (userId: string, opts: UsePromptsOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let result: Prompt[];
      
      if (opts.search || opts.tags?.length) {
        // Use search for combined filtering
        result = await promptRepository.search(userId, opts.search || '', 100);
        
        // Apply tag filtering if needed
        if (opts.tags?.length) {
          result = result.filter(prompt =>
            opts.tags!.every(tag => prompt.tags.includes(tag))
          );
        }
      } else {
        result = await promptRepository.findByUser(userId, {
          limit: opts.limit,
        });
      }
      
      setPrompts(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPrompts(user.uid || user.id || '', options);
    }
  }, [user?.uid, JSON.stringify(options), fetchPrompts]);

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
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, promptRepository]);

  const update = useCallback(async (id: string, data: Partial<Prompt>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const existing = prompts.find(p => p.id === id);
      if (!existing) throw new Error('Prompt not found');
      
      const updatedData: Partial<Prompt> = {
        ...data,
      };
      
      if (data.tags !== undefined) {
        updatedData.tags = PromptService.normalizeTags(data.tags);
      }
      
      PromptService.validateUpdate(updatedData);
      await promptRepository.update(id, updatedData);
      
      setPrompts(prev => prev.map(p => 
        p.id === id 
          ? { ...p, ...updatedData, updatedAt: new Date().toISOString() }
          : p
      ));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, prompts]);

  const remove = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await promptRepository.delete(id);
      setPrompts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
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
    refetch: () => user && fetchPrompts(user.uid || user.id || '', options),
  };
}