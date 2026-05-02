// SQLite Database using sql.js
// @ts-ignore - sql.js doesn't have proper TypeScript declarations
import initSqlJs from 'sql.js';

let db: any = null;
let initialized = false;

export async function initDatabase() {
  if (initialized && db) return db;

  try {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
    
    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('prompts-db');
    if (savedDb) {
      const buffer = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    // Create tables if they don't exist
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
    throw error;
  }
}

function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Array.from(data);
  localStorage.setItem('prompts-db', JSON.stringify(buffer));
}

// Prompt operations
export async function createPrompt(prompt: Omit<any, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
  const database = await initDatabase();
  const id = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  database.run(`
    INSERT INTO prompts (id, title, text, tags, color, userId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, prompt.title || '', prompt.text, JSON.stringify(prompt.tags || []), prompt.color || null, userId, now, now]);
  
  saveDatabase();
  return { ...prompt, id, userId, createdAt: now, updatedAt: now };
}

export async function getPrompt(promptId: string) {
  const database = await initDatabase();
  const stmt = database.prepare('SELECT * FROM prompts WHERE id = ?');
  stmt.bind([promptId]);
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      id: row.id,
      title: row.title,
      text: row.text,
      tags: JSON.parse(row.tags as string),
      color: row.color || undefined,
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
  stmt.free();
  return null;
}

export async function getUserPrompts(userId: string) {
  const database = await initDatabase();
  const stmt = database.prepare('SELECT * FROM prompts WHERE userId = ? ORDER BY createdAt DESC');
  stmt.bind([userId]);
  
  const prompts = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    prompts.push({
      id: row.id,
      title: row.title,
      text: row.text,
      tags: JSON.parse(row.tags as string),
      color: row.color || undefined,
      userId: row.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  stmt.free();
  return prompts;
}

export async function updatePrompt(promptId: string, updates: any) {
  const database = await initDatabase();
  const now = new Date().toISOString();
  
  const fields = [];
  const values = [];
  
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

export async function deletePrompt(promptId: string) {
  const database = await initDatabase();
  database.run('DELETE FROM prompts WHERE id = ?', [promptId]);
  saveDatabase();
}

export async function searchPrompts(userId: string, searchTerm: string) {
  const prompts = await getUserPrompts(userId);
  const term = searchTerm.toLowerCase();
  
  return prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(term) ||
    prompt.text.toLowerCase().includes(term) ||
    prompt.tags.some((tag: string) => tag.toLowerCase().includes(term))
  );
}

export async function getPromptsByTag(userId: string, tag: string) {
  const prompts = await getUserPrompts(userId);
  return prompts.filter(prompt => prompt.tags.includes(tag));
}

// User operations
export async function getUser(userId: string) {
  const database = await initDatabase();
  const stmt = database.prepare('SELECT * FROM users WHERE id = ?');
  stmt.bind([userId]);
  
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return { id: row.id, email: row.email, createdAt: row.createdAt, updatedAt: row.updatedAt };
  }
  stmt.free();
  return null;
}

export async function createUser(userId: string, email: string) {
  const database = await initDatabase();
  const now = new Date().toISOString();
  
  database.run(`
    INSERT OR REPLACE INTO users (id, email, createdAt, updatedAt)
    VALUES (?, ?, ?, ?)
  `, [userId, email, now, now]);
  
  saveDatabase();
  return { id: userId, email, createdAt: now, updatedAt: now };
}
