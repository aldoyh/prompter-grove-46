// SQLite Database Service using sql.js
import initSqlJs from 'sql.js';
import type { Prompt } from '@/domain/models/Prompt';
import type { Database } from 'sql.js';

// Expose test function for debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testDatabase = async () => {
    try {
      console.log('Testing database initialization...');
      const db = await getDatabase();
      console.log('Database initialized successfully:', db);
      
      // Test insert
      const testId = 'test_' + Date.now();
      db.run('INSERT INTO prompts (id, title, text, tags, color, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [testId, 'Test', 'Test prompt', '[]', null, 'test-user', new Date().toISOString(), new Date().toISOString()]);
      console.log('Test prompt inserted');
      
      // Test select
      const stmt = db.prepare('SELECT * FROM prompts WHERE id = ?');
      stmt.bind([testId]);
      if (stmt.step()) {
        console.log('Test prompt retrieved:', stmt.getAsObject());
      }
      stmt.free();
      
      return 'Database test passed!';
    } catch (err) {
      console.error('Database test failed:', err);
      return 'Database test failed: ' + err;
    }
  };
}

interface DatabaseRow {
  id: string;
  title: string;
  text: string;
  tags: string;
  color: ('slate' | 'rose' | 'amber' | 'emerald' | 'cyan' | 'indigo' | 'violet' | 'fuchsia') | null;
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

let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

async function getDatabase(): Promise<Database> {
  if (db) {
    console.log('Database already initialized');
    return db;
  }
  
  if (initPromise) {
    console.log('Database initialization already in progress');
    return initPromise;
  }
  
  initPromise = (async () => {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin
        : '';
      
      const wasmUrl = `${baseUrl}/sql-wasm.wasm`;
      console.log('Initializing SQL.js with WASM path:', wasmUrl);
      
      // Test WASM file accessibility
      if (typeof window !== 'undefined') {
        try {
          const testResponse = await fetch(wasmUrl);
          console.log('WASM file fetch status:', testResponse.status, 'content-type:', testResponse.headers.get('content-type'));
          if (!testResponse.ok) {
            throw new Error(`WASM file returned status ${testResponse.status}`);
          }
        } catch (fetchErr) {
          console.error('Failed to fetch WASM file:', fetchErr);
        }
      }
      
      const SQL = await initSqlJs({
        locateFile: (file: string) => {
          // Try multiple sources for the wasm file
          if (file.endsWith('.wasm')) {
            return wasmUrl;
          }
          return `${baseUrl}/${file}`;
        }
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
       
      console.log('Database initialized successfully');
      return db;
    } catch (err) {
      console.error('Failed to initialize database:', err);
      initPromise = null;
      throw err;
    }
  })();
  
  return initPromise;
}

function createTables(database: Database): void {
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
      updatedAt TEXT NOT NULL
    )
  `);
}

function saveDatabase(database: Database): void {
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
    color: row.color || undefined as Prompt['color'],
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createPrompt(data: { title?: string; text: string; tags?: string[]; color?: 'slate' | 'rose' | 'amber' | 'emerald' | 'cyan' | 'indigo' | 'violet' | 'fuchsia' }, userId: string): Promise<Prompt> {
  console.log('createPrompt called with:', { title: data.title, userId });
  const database = await getDatabase();
  console.log('Database obtained, inserting prompt...');
  const id = userId + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  
  database.run(
    'INSERT INTO prompts (id, title, text, tags, color, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
  const values: unknown[] = [];  
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.text !== undefined) { fields.push('text = ?'); values.push(updates.text); }
  if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }
  if (updates.color !== undefined) { fields.push('color = ?'); values.push(updates.color); }
  
  fields.push('updatedAt = ?');
  values.push(now);
  values.push(id);
  
  const sql = 'UPDATE prompts SET ' + fields.join(', ') + ' WHERE id = ?';
  database.run(sql, values as unknown[]);
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