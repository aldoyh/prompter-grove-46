// Repository Pattern for Prompt Data Access (SQLite version)
import {
  createPrompt,
  getPrompt,
  getUserPrompts,
  updatePrompt,
  deletePrompt,
  searchPrompts,
  getPromptsByTag,
} from '@/lib/sqlite/db';
import { Prompt, PromptCreateDTO, PromptUpdateDTO } from '@/domain/models/Prompt';
import { DatabaseError } from '@/domain/utils/errors';

export class PromptRepository {
  async create(promptData: PromptCreateDTO, userId: string): Promise<Prompt> {
    try {
      return await createPrompt(promptData, userId) as Prompt;
    } catch (error) {
      throw new DatabaseError('Failed to create prompt', error);
    }
  }

  async findById(id: string): Promise<Prompt | null> {
    try {
      return await getPrompt(id) as Prompt | null;
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
      let prompts = await getUserPrompts(userId);
      
      if (options?.search) {
        prompts = prompts.filter(prompt =>
          prompt.title.toLowerCase().includes(options.search!.toLowerCase()) ||
          prompt.text.toLowerCase().includes(options.search!.toLowerCase()) ||
          prompt.tags.some((tag: string) => tag.toLowerCase().includes(options.search!.toLowerCase()))
        );
      }
      
      if (options?.limit) {
        prompts = prompts.slice(0, options.limit);
      }
      
      return prompts;
    } catch (error) {
      throw new DatabaseError('Failed to fetch user prompts', error);
    }
  }

  async findByTag(userId: string, tag: string): Promise<Prompt[]> {
    try {
      return await getPromptsByTag(userId, tag) as Prompt[];
    } catch (error) {
      throw new DatabaseError('Failed to fetch prompts by tag', error);
    }
  }

  async update(id: string, updates: PromptUpdateDTO): Promise<void> {
    try {
      await updatePrompt(id, updates);
    } catch (error) {
      throw new DatabaseError('Failed to update prompt', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deletePrompt(id);
    } catch (error) {
      throw new DatabaseError('Failed to delete prompt', error);
    }
  }

  async search(userId: string, searchTerm: string, limit = 20): Promise<Prompt[]> {
    try {
      const prompts = await searchPrompts(userId, searchTerm);
      return limit ? prompts.slice(0, limit) : prompts;
    } catch (error) {
      throw new DatabaseError('Failed to search prompts', error);
    }
  }

  async countByTag(userId: string, tag: string): Promise<number> {
    try {
      const prompts = await getPromptsByTag(userId, tag);
      return prompts.length;
    } catch (error) {
      throw new DatabaseError('Failed to count prompts by tag', error);
    }
  }
}

// Export singleton instance
export const promptRepository = new PromptRepository();
