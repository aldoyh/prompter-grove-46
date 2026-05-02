// Domain Model for Prompt
export interface Prompt {
  id: string;
  title: string;
  text: string;
  tags: string[];
  color?: 'slate' | 'rose' | 'amber' | 'emerald' | 'cyan' | 'indigo' | 'violet' | 'fuchsia';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptCreateDTO {
  title?: string;
  text: string;
  tags?: string[];
  color?: Prompt['color'];
}

export interface PromptUpdateDTO {
  title?: string;
  text?: string;
  tags?: string[];
  color?: Prompt['color'];
}

// Domain Services
export class PromptService {
  static validateCreate(data: PromptCreateDTO): void {
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('Prompt content is required');
    }
    
    if (data.text.length > 10000) {
      throw new Error('Prompt text exceeds maximum length of 10000 characters');
    }
  }

  static validateUpdate(data: PromptUpdateDTO): void {
    if (data.text && data.text.trim().length === 0) {
      throw new Error('Prompt content cannot be empty');
    }
    
    if (data.text && data.text.length > 10000) {
      throw new Error('Prompt text exceeds maximum length of 10000 characters');
    }
  }

  static sanitize(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static normalizeTags(tags: string[]): string[] {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
  }

  static calculateRelevance(prompt: Prompt, searchTerm: string): number {
    const term = searchTerm.toLowerCase();
    let score = 0;
    
    // Title match (higher weight)
    if (prompt.title.toLowerCase().includes(term)) {
      score += 10;
    }
    
    // Content match
    if (prompt.text.toLowerCase().includes(term)) {
      score += 5;
    }
    
    // Tag matches
    prompt.tags.forEach(tag => {
      if (tag.toLowerCase().includes(term)) {
        score += 3;
      }
    });
    
    return score;
  }
}