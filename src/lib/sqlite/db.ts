// SQLite Database Service using sql.js'
import initSqlJs from 'sql.js';
import type { Prompt } from '@/domain/models/Prompt';

interface DatabaseRow {
  id: string;
  title: string;
  text: string;
  tags: string;
  color: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserRow {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Simplified return type for user operations
interface UserBasicInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
}

let db: any = null;
let initPromise: Promise<any> | null = null;

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

async function getDatabase(): Promise<any> {
  if (db) return db;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/${file}`
      });
      
      const storage = getStorage();
      const saved = storage?.getItem('prompts-db');
      
      if (saved) {
        try {
          const buffer = new Uint8Array(JSON.parse(saved));
          db = new SQL.Database(buffer);
        } catch {
          db = new SQL.Database();
        }
      } else {
        db = new SQL.Database();
      }
      
      createTables(db);
      saveDatabase(db);
      
      return db;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();
  
  return initPromise;
}

function createTables(database: any): void {
  database.run(`
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

  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL`
    )
  `);
}

function saveDatabase(database: any): void {
  if (!database) return;
  
  try {
    const data = database.export();
    const buffer = Array.from(data);
    const storage = getStorage();
    storage?.setItem('prompts-db', JSON.stringify(buffer));
  } catch {
    // Silently fail - storage might not be available
  }
}

function rowToPrompt(row: DatabaseRow): Prompt {
  return {
    id: row.id,
    title: row.title,
    text: row.text,
    tags: JSON.parse(row.tags),
    color: row.color || undefined,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createPrompt(data: { title?: string; text: string; tags?: string[]; color?: string }, userId: string): Promise<Prompt> {
  const database = await getDatabase();
  const id = userId + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  
  database.run(
    'INSERT INTO prompts (id, title, text, tags, color, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.title || '', data.text, JSON.stringify(data.tags || []), data.color || null, userId, now, now]
  );
  
  saveDatabase(database);
  return { ...data, id, userId, createdAt: now, updatedAt: now } as Prompt;
}

export async function getPrompt(id: string): Promise<Prompt | null> {
  const database = await getDatabase();
  const stmt = database.prepare('SELECT * FROM prompts WHERE id = ?');
  stmt.bind([id]);
  
  try {
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as DatabaseRow;
      return rowToPrompt(row);
    }
  } finally {
    stmt.free();
  }
  return null;
}

export async function getUserPrompts(userId: string): Promise<Prompt[]> {
  const database = await getDatabase();
  const stmt = database.prepare('SELECT * FROM prompts WHERE userId = ? ORDER BY createdAt DESC');
  stmt.bind([userId]);
  
  const prompts: Prompt[] = [];
  try {
    while (stmt.step()) {
      const row = stmt.getAsObject() as unknown as DatabaseRow;
      prompts.push(rowToPrompt(row));
    }
  } finally {
    stmt.free();
  }
  return prompts;
}

export async function updatePrompt(id: string, updates: Partial<Prompt>): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];  
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.text !== undefined) { fields.push('text = ?'); values.push(updates.text); }
  if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }
  if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }
  
  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id);
  
  const sql = 'UPDATE prompts SET ' + fields.join(', ') + ' WHERE id = ?';
  database.run(sql, values);
  saveDatabase(database);
}

export async function deletePrompt(id: string): Promise<void> {
  const database = await getDatabase();
  database.run('DELETE FROM prompts WHERE id = ?', [id]);
  saveDatabase(database);
}

export async function searchPrompts(userId: string, term: string): Promise<Prompt[]> {
  const prompts = await getUserPrompts(userId);
  const lowerTerm = term.toLowerCase();
  
  return prompts.filter(p => 
    p.title.toLowerCase().includes(lowerTerm) ||
    p.text.toLowerCase().includes(lowerTerm) ||
    p.tags.some((tag: string) => tag.toLowerCase().includes(lowerTerm))
  );
}

export async function getPromptsByTag(userId: string, tag: string): Promise<Prompt[]> {
  const prompts = await getUserPrompts(userId);
  return prompts.filter(p => p.tags.includes(tag));
}

export async function getUser(id: string): Promise<UserBasicInfo | null> {
  const database = await getDatabase();
  const stmt = database.prepare('SELECT id, createdAt, updatedAt FROM users WHERE id = ?');
  stmt.bind([id]);
  
  try {
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as UserRow;
      return { id: row.id, createdAt: row.createdAt, updatedAt: row.updatedAt };
    }
  } finally {
    stmt.free();
  }
  return null;
}

export async function createUser(id: string, email: string): Promise<UserBasicInfo> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  
  database.run(
    'INSERT OR REPLACE INTO users (id, email, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [id, email, now, now]
  );
  
  saveDatabase(database);
  return { id, createdAt: now, updatedAt: now };
}
