'use client';

import { useEffect, useState } from 'react';

export default function TestDbPage() {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function test() {
      try {
        setStatus('Loading sql.js...');
        const initSqlJs = (await import('sql.js')).default;
        
        setStatus('Initializing database...');
        const SQL = await initSqlJs({
          locateFile: () => '/sql-wasm.wasm'
        });
        
        setStatus('Creating database...');
        const db = new SQL.Database();
        
        setStatus('Creating table...');
        db.run('CREATE TABLE IF NOT EXISTS test (id TEXT PRIMARY KEY, name TEXT)');
        
        setStatus('Inserting data...');
        db.run('INSERT INTO test (id, name) VALUES (?, ?)', ['1', 'test']);
        
        setStatus('Querying data...');
        const stmt = db.prepare('SELECT * FROM test');
        if (stmt.step()) {
          const row = stmt.getAsObject();
          setStatus(`Success! Got row: ${JSON.stringify(row)}`);
        }
        stmt.free();
        
        setStatus('Saving to localStorage...');
        const data = db.export();
        const buffer = Array.from(data);
        localStorage.setItem('test-db', JSON.stringify(buffer));
        
        setStatus('Loading from localStorage...');
        const saved = localStorage.getItem('test-db');
        if (saved) {
          const savedDb = new SQL.Database(new Uint8Array(JSON.parse(saved)));
          const stmt2 = savedDb.prepare('SELECT * FROM test');
          if (stmt2.step()) {
            const row2 = stmt2.getAsObject();
            setStatus(`Success! Round-trip works: ${JSON.stringify(row2)}`);
          }
          stmt2.free();
        }
        
      } catch (err) {
        setError(String(err));
        setStatus('Failed!');
        console.error('Test failed:', err);
      }
    }
    
    test();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Database Test</h1>
        <div className="mb-4">
          <div className="text-lg font-semibold text-indigo-600">{status}</div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-red-800 mb-2">Error:</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}
        <a href="/" className="text-indigo-600 hover:underline">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
