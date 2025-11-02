import type { Card, Category, Tag } from '@/types/card';
import { BaseRepository } from '@/lib/storage/repository';
import { validateCard, sanitizeCard } from '@/lib/validation/card-rules';
import { StorageError, ValidationError } from '@/lib/utils/error-handling';

/**
 * Card Service Layer
 * Handles all card CRUD operations with validation and persistence
 */

class CardRepository extends BaseRepository<Card> {
  constructor() {
    super('qanc_cards');
  }
}

class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('qanc_categories');
  }
}

class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super('qanc_tags');
  }
}

const cardRepo = new CardRepository();
const categoryRepo = new CategoryRepository();
const tagRepo = new TagRepository();

/**
 * Card Service
 */
export const cardService = {
  /**
   * Get all cards
   */
  async getAllCards(): Promise<Card[]> {
    try {
      return await cardRepo.findAll();
    } catch (error) {
      throw new StorageError('Failed to load cards');
    }
  },

  /**
   * Get card by ID
   */
  async getCardById(id: string): Promise<Card | null> {
    try {
      return await cardRepo.findById(id);
    } catch (error) {
      throw new StorageError('Failed to load card');
    }
  },

  /**
   * Create new card
   */
  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    // Sanitize input
    const sanitized = sanitizeCard(cardData);
    
    // Validate
    const errors = validateCard(sanitized);
    if (errors.length > 0) {
      throw new ValidationError(errors[0].message, errors[0].field as string);
    }

    // Check for duplicate question
    const existingCards = await cardRepo.findAll();
    const duplicate = existingCards.find(
      card => card.question.toLowerCase() === sanitized.question?.toLowerCase()
    );
    if (duplicate) {
      throw new ValidationError('A card with this question already exists', 'question');
    }

    try {
      return await cardRepo.create(sanitized as Omit<Card, 'id' | 'createdAt' | 'updatedAt'>);
    } catch (error) {
      throw new StorageError('Failed to create card');
    }
  },

  /**
   * Update existing card
   */
  async updateCard(id: string, updates: Partial<Card>): Promise<Card> {
    // Sanitize input
    const sanitized = sanitizeCard(updates);
    
    // Validate updates
    const errors = validateCard(sanitized);
    if (errors.length > 0) {
      throw new ValidationError(errors[0].message, errors[0].field as string);
    }

    // If updating question, check for duplicates
    if (sanitized.question) {
      const existingCards = await cardRepo.findAll();
      const duplicate = existingCards.find(
        card => card.id !== id && card.question.toLowerCase() === sanitized.question?.toLowerCase()
      );
      if (duplicate) {
        throw new ValidationError('A card with this question already exists', 'question');
      }
    }

    try {
      return await cardRepo.update(id, sanitized);
    } catch (error) {
      throw new StorageError('Failed to update card');
    }
  },

  /**
   * Delete card
   */
  async deleteCard(id: string): Promise<boolean> {
    try {
      return await cardRepo.delete(id);
    } catch (error) {
      throw new StorageError('Failed to delete card');
    }
  },

  /**
   * Search cards by query
   */
  async searchCards(query: string): Promise<Card[]> {
    const cards = await cardRepo.findAll();
    const lowerQuery = query.toLowerCase();
    
    return cards.filter(card =>
      card.question.toLowerCase().includes(lowerQuery) ||
      card.answer.toLowerCase().includes(lowerQuery) ||
      card.notes?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get cards due for review
   */
  async getDueCards(): Promise<Card[]> {
    const cards = await cardRepo.findAll();
    const now = new Date();
    
    return cards.filter(card => {
      if (!card.nextReviewAt) return true; // New cards
      return new Date(card.nextReviewAt) <= now;
    });
  },
};

/**
 * Category Service
 */
export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    try {
      return await categoryRepo.findAll();
    } catch (error) {
      throw new StorageError('Failed to load categories');
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      return await categoryRepo.findById(id);
    } catch (error) {
      throw new StorageError('Failed to load category');
    }
  },

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Category name is required', 'name');
    }

    // Check for duplicate name
    const existing = await categoryRepo.findAll();
    if (existing.some(cat => cat.name.toLowerCase() === data.name.toLowerCase())) {
      throw new ValidationError('A category with this name already exists', 'name');
    }

    try {
      return await categoryRepo.create(data);
    } catch (error) {
      throw new StorageError('Failed to create category');
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (updates.name) {
      const existing = await categoryRepo.findAll();
      const duplicate = existing.find(
        cat => cat.id !== id && cat.name.toLowerCase() === updates.name?.toLowerCase()
      );
      if (duplicate) {
        throw new ValidationError('A category with this name already exists', 'name');
      }
    }

    try {
      return await categoryRepo.update(id, updates);
    } catch (error) {
      throw new StorageError('Failed to update category');
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      return await categoryRepo.delete(id);
    } catch (error) {
      throw new StorageError('Failed to delete category');
    }
  },
};

/**
 * Tag Service
 */
export const tagService = {
  async getAllTags(): Promise<Tag[]> {
    try {
      return await tagRepo.findAll();
    } catch (error) {
      throw new StorageError('Failed to load tags');
    }
  },

  async getTagById(id: string): Promise<Tag | null> {
    try {
      return await tagRepo.findById(id);
    } catch (error) {
      throw new StorageError('Failed to load tag');
    }
  },

  async createTag(data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Tag name is required', 'name');
    }

    // Check for duplicate name
    const existing = await tagRepo.findAll();
    if (existing.some(tag => tag.name.toLowerCase() === data.name.toLowerCase())) {
      throw new ValidationError('A tag with this name already exists', 'name');
    }

    try {
      return await tagRepo.create(data);
    } catch (error) {
      throw new StorageError('Failed to create tag');
    }
  },

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    if (updates.name) {
      const existing = await tagRepo.findAll();
      const duplicate = existing.find(
        tag => tag.id !== id && tag.name.toLowerCase() === updates.name?.toLowerCase()
      );
      if (duplicate) {
        throw new ValidationError('A tag with this name already exists', 'name');
      }
    }

    try {
      return await tagRepo.update(id, updates);
    } catch (error) {
      throw new StorageError('Failed to update tag');
    }
  },

  async deleteTag(id: string): Promise<boolean> {
    try {
      return await tagRepo.delete(id);
    } catch (error) {
      throw new StorageError('Failed to delete tag');
    }
  },
};
