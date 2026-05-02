// SQLite Database Operations (replaces Firestore)
// Re-exports from the new SQLite database layer

export {
  createPrompt,
  getPrompt,
  getUserPrompts,
  updatePrompt,
  deletePrompt,
  searchPrompts,
  getPromptsByTag,
  getUser,
  createUser,
} from '@/lib/sqlite/db';

// For compatibility with existing code
export const PROMPTS_COLLECTION = 'prompts';
export const USERS_COLLECTION = 'users';

// Query helpers (simplified for SQLite)
export const getPromptsQuery = (userId: string, options?: {
  limit?: number;
  startAfter?: any;
  search?: string;
  tags?: string[];
}) => {
  // This is now handled directly in the SQLite functions
  return { userId, ...options };
};
