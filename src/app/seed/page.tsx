'use client';

import { useState } from 'react';
import { seedDatabase, clearDatabase } from '@/lib/sqlite/seed';
import { useAuth } from '@/hooks/useAuth';

export default function SeedPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSeed = async () => {
    setLoading(true);
    setStatus('Seeding database...');
    try {
      const userId = user?.id || 'default-user';
      await seedDatabase(userId);
      setStatus('✅ Database seeded successfully! Check the home page.');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setStatus('Clearing database...');
    try {
      await clearDatabase();
      setStatus('✅ Database cleared successfully!');
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Database Seed Tool
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Use this page to seed the database with sample prompts for testing.
          Data is stored in localStorage and persists across sessions.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? 'Processing...' : '🌱 Seed Sample Data'}
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? 'Processing...' : '🗑️ Clear All Data'}
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300">{status}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
