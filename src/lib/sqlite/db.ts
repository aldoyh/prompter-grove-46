// SQLite Database using sql.js
// @ts-ignore - sql.js doesn't have proper TypeScript declarations
import initSqlJs from 'sql.js';
import { Prompt } from '@/domain/models/Prompt';

let db: any = null;
let initialized = false;
let initPromise: Promise<any> | null = null;

function getLocalStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export async function initDatabase() {
  if (initialized && db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/${file}`
      });
      
      const storage = getLocalStorage();
      
      if (storage) {
        const savedDb = storage.getItem('prompts-db');
        if (savedDb) {
          try {
            const buffer = new Uint8Array(JSON.parse(savedDb));
            db = new SQL.Database(buffer);
          } catch (e) {
            console.warn('Failed to load saved database, creating new one:', e);
            db = new SQL.Database();
          }
        } else {
          db = new SQL.Database();
        }
      } else {
        db = new SQL.Database();
      }

      db.run(`
        CREATE TABLE IF NOT EXISTS prompts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          text TEXT NOT NULL,
          tags TEXT NOT NULL,
          color TEXT,
          userId TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      initialized = true;
      saveDatabase();
      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Array.from(data);
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem('prompts-db', JSON.stringify(buffer));
    }
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

export async function createPrompt(promptData: { title?: string; text: string; tags?: string[]; color?: string }, userId: string): Promise<Prompt> {
  const database = await initDatabase();
  const id = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const now = new Date().toISOString();
  
  database.run(`
    INSERT INTO prompts (id, title, text, tags, color, userId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, promptData.title || '', promptData.text, JSON.stringify(promptData.tags || []), promptData.color || null, userId, now, now]);
  
  saveDatabase();
  return { ...promptData, id, userId, createdAt: now, updatedAt: now } as Prompt;
}

export async function getPrompt(promptId: string): Promise<Prompt | null> {
  const database = await initDatabase();
  const stmt = database.prepare('SELECT * FROM prompts WHERE id = ?');
  stmt.bind([promptId]);
  
  try {
    if (stmt.step()) {
      const row = stmt.getAsObject();
      return {
        id: row.id as string,
        title: row.title as string,
        text: row.text as string,
        tags: JSON.parse(row.tags as string),
        color: row.color as Prompt['color'] || undefined,
        userId: row.userId as string,
        createdAt: row.createdAt as string,
        updatedAt: row.updatedAt as string
      };
    }
  } finally {
    stmt.free();
  }
  return null;
}

export async function getUserPrompts(userId: string): Promise<Prompt[]> {
  const database = await initDatabase();
  const stmt = database.prepare('SELECT * FROM prompts WHERE userId = ? ORDER BY createdAt DESC');
  stmt.bind([userId]);
  
  const prompts: Prompt[] = [];
  try {
    while (stmt.step()) {
      const row = stmt.getAsObject();
      prompts.push({
        id: row.id as string,
        title: row.title as string,
        text: row.text as string,
        tags: JSON.parse(row.tags as string),
        color: row.color as Prompt['color'] || undefined,
        userId: row.userId as string,
        createdAt: row.createdAt as string,
        updatedAt: row.updatedAt as string
      });
    }
  } finally {
    stmt.free();
  }
  return prompts;
}

export async function updatePrompt(promptId: string, updates: Partial<Prompt>): Promise<void> {
  const database = await initDatabase();
  const now = new Date().toISOString();
  
  const fields: string[] = [];
  const values: any[] = [];  
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.text !== undefined) {
    fields.push('text = ?');
    values.push(updates.text);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  
  fields.push('updatedAt = ?');
  values.push(now);
  values.push(promptId);
  
  database.run(`UPDATE prompts SET ${fields.join(', ')} WHERE id = ?`, values);
  saveDatabase();
}

export async function deletePrompt(promptId: string): Promise<void> {
  const database = await initDatabase();
  database.run('DELETE FROM prompts WHERE id = ?', [promptId]);
  saveDatabase();
}

export async function searchPrompts(userId: string, searchTerm: string): Promise<Prompt[]> {
  const prompts = await getUserPrompts(userId);
  const term = searchTerm.toLowerCase();
  
  return prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(term) ||
    prompt.text.toLowerCase().includes(term) ||
    prompt.tags.some((tag: string) => tag.toLowerCase().includes(term))
  );
}

export async function getPromptsByTag(userId: string, tag: string): Promise<Prompt[]> {
  const prompts = await getUserPrompts(userId);
  return prompts.filter(prompt => prompt.tags.includes(tag));
}

export async function getUser(userId: string): Promise<{ id: string; email: string; createdAt: string; updatedAt: string } | null> {
  const database = await initDatabase();
  const stmt = database.prepare('SELECT * FROM users WHERE id = ?');
  stmt.bind([userId]);
  
  try {
    if (stmt.step()) {
      const row = stmt.getAsObject();
      return { 
        id: row.id as string, 
        email: row.email as string, 
        createdAt: row.createdAt as string, 
        updatedAt: row.updatedAt as string 
      };
    }
  } finally {
    stmt.free();
  }
  return null;
}

export async function createUser(userId: string, email: string): Promise<{ id: string; email: string; createdAt: string; updatedAt: string }> {
  const database = await initDatabase();
  const now = new Date().toISOString();
  
  database.run(`
    INSERT OR REPLACE INTO users (id, email, createdAt, updatedAt)
    VALUES (?, ?, ?, ?)
  `, [userId, email, now, now]);
  
  saveDatabase();
  return { id: userId, email, createdAt: now, updatedAt: now };
}
