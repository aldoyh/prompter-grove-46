// Database seeding script for testing persistence
import { createPrompt } from './db';

const samplePrompts = [
  {
    title: 'Welcome to Prompt Manager',
    text: 'This is your first prompt. You can edit or delete it anytime.',
    tags: ['welcome', 'getting-started'],
    color: 'indigo' as const,
  },
  {
    title: 'Brainstorming Ideas',
    text: 'Generate 10 creative ideas for a new mobile app that helps people track their daily water intake with gamification elements.',
    tags: ['brainstorming', 'creative', 'mobile'],
    color: 'emerald' as const,
  },
  {
    title: 'Code Review Checklist',
    text: 'Review the following code for: 1) Security vulnerabilities 2) Performance issues 3) Code style 4) Best practices 5) Edge cases',
    tags: ['code', 'review', 'checklist'],
    color: 'cyan' as const,
  },
  {
    title: 'Meeting Summary',
    text: 'Summarize the key points from our team meeting: discussed Q3 goals, new feature prioritization, and timeline adjustments.',
    tags: ['meeting', 'summary', 'work'],
    color: 'amber' as const,
  },
  {
    title: 'Learning Resources',
    text: 'Find the best online resources to learn React Server Components, including tutorials, documentation, and example projects.',
    tags: ['learning', 'react', 'resources'],
    color: 'violet' as const,
  },
];

export async function seedDatabase(userId: string = 'default-user'): Promise<void> {
  console.log('Seeding database with sample prompts...');

  for (const prompt of samplePrompts) {
    await createPrompt(prompt, userId);
  }

  console.log(`Successfully seeded ${samplePrompts.length} prompts`);
}

export async function clearDatabase(): Promise<void> {
  const { getUserPrompts, deletePrompt } = await import('./db');
  const prompts = await getUserPrompts('default-user');

  for (const prompt of prompts) {
    await deletePrompt(prompt.id);
  }

  console.log(`Cleared ${prompts.length} prompts from database`);
}
