import type { Repository, QueryOptions } from '@/types/storage';

/**
 * Base Repository class for localStorage persistence
 * Implements offline-first storage with generic CRUD operations
 */
export class BaseRepository<T extends { id: string }> implements Repository<T> {
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Get all items from storage
   */
  async findAll(): Promise<T[]> {
    try {
      return this.readFromStorage();
    } catch (error) {
      console.error(`Error reading from storage key "${this.storageKey}":`, error);
      return [];
    }
  }

  /**
   * Get a single item by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const data = this.readFromStorage();
      return data.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error reading item ${id} from storage:`, error);
      return null;
    }
  }

  /**
   * Create a new item
   */
  async create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const data = this.readFromStorage();
      
      // Generate new item with metadata
      const newItem = {
        ...item,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as T;

      data.push(newItem);
      this.writeToStorage(data);
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  /**
   * Update an existing item
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    try {
      const data = this.readFromStorage();
      const index = data.findIndex(item => item.id === id);

      if (index === -1) {
        throw new Error(`Item with ID ${id} not found`);
      }

      const updated = { 
        ...data[index], 
        ...updates, 
        id, // Preserve ID
        updatedAt: new Date(),
      } as T;
      
      data[index] = updated;
      this.writeToStorage(data);
      return updated;
    } catch (error) {
      console.error(`Error updating item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const data = this.readFromStorage();
      const index = data.findIndex(item => item.id === id);

      if (index === -1) {
        return false;
      }

      data.splice(index, 1);
      this.writeToStorage(data);
      return true;
    } catch (error) {
      console.error(`Error deleting item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get count of items
   */
  async count(): Promise<number> {
    try {
      const data = this.readFromStorage();
      return data.length;
    } catch (error) {
      console.error('Error counting items:', error);
      return 0;
    }
  }

  /**
   * Delete all items (clear storage)
   */
  async deleteAll(): Promise<void> {
    try {
      this.writeToStorage([]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Query with filters and sorting
   */
  async query(options: QueryOptions): Promise<T[]> {
    try {
      let items = this.readFromStorage();

      // Apply filters
      if (options.filters) {
        items = items.filter(item => {
          return Object.entries(options.filters!).every(([key, value]) => {
            return (item as Record<string, unknown>)[key] === value;
          });
        });
      }

      // Apply sorting
      if (options.sortBy) {
        const sortOrder = options.sortOrder || 'asc';
        items = [...items].sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[options.sortBy!];
          const bVal = (b as Record<string, unknown>)[options.sortBy!];
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
          }
          
          const aStr = String(aVal);
          const bStr = String(bVal);
          if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      if (options.offset !== undefined || options.limit !== undefined) {
        const offset = options.offset || 0;
        const limit = options.limit || items.length;
        items = items.slice(offset, offset + limit);
      }

      return items;
    } catch (error) {
      console.error('Error querying items:', error);
      return [];
    }
  }

  /**
   * Generate unique ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Read data from localStorage
   */
  protected readFromStorage(): T[] {
    if (typeof window === 'undefined') {
      return []; // SSR safety
    }

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored) as T[];
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return [];
    }
  }

  /**
   * Write data to localStorage with quota handling
   */
  protected writeToStorage(data: T[]): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    try {
      const serialized = JSON.stringify(data);
      
      // Check approximate size (5MB limit)
      const sizeInBytes = new Blob([serialized]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 4.5) { // Leave 0.5MB buffer
        throw new Error(`Storage quota exceeded: ${sizeInMB.toFixed(2)}MB (limit: 5MB)`);
      }

      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        throw new Error('Storage quota exceeded. Please delete some cards or media.');
      }
      throw error;
    }
  }
}
