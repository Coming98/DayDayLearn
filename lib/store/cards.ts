import { create } from 'zustand';
import type { Card, Category, Tag } from '@/types/card';

interface CardsState {
  // Cards
  cards: Card[];
  selectedCardId: string | null;
  
  // Categories
  categories: Category[];
  
  // Tags
  tags: Tag[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions - Cards
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  getCard: (id: string) => Card | undefined;
  setCards: (cards: Card[]) => void;
  selectCard: (id: string | null) => void;
  
  // Actions - Categories
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  
  // Actions - Tags
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  setTags: (tags: Tag[]) => void;
  
  // Actions - State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed/Query methods
  getCardsByCategory: (categoryId: string) => Card[];
  getCardsByTag: (tagId: string) => Card[];
  getDueCards: () => Card[];
  getNewCards: () => Card[];
  searchCards: (query: string) => Card[];
}

export const useCardsStore = create<CardsState>((set, get) => ({
  // Initial state
  cards: [],
  selectedCardId: null,
  categories: [],
  tags: [],
  isLoading: false,
  error: null,

  // Card actions
  addCard: (card) => set((state) => ({
    cards: [...state.cards, card],
  })),

  updateCard: (id, updates) => set((state) => ({
    cards: state.cards.map(card =>
      card.id === id
        ? { ...card, ...updates, updatedAt: new Date() }
        : card
    ),
  })),

  deleteCard: (id) => set((state) => ({
    cards: state.cards.filter(card => card.id !== id),
    selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
  })),

  getCard: (id) => {
    return get().cards.find(card => card.id === id);
  },

  setCards: (cards) => set({ cards }),

  selectCard: (id) => set({ selectedCardId: id }),

  // Category actions
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category],
  })),

  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(cat =>
      cat.id === id
        ? { ...cat, ...updates, updatedAt: new Date() }
        : cat
    ),
  })),

  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(cat => cat.id !== id),
    // Remove category from all cards
    cards: state.cards.map(card =>
      card.categoryId === id
        ? { ...card, categoryId: undefined }
        : card
    ),
  })),

  setCategories: (categories) => set({ categories }),

  // Tag actions
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, tag],
  })),

  updateTag: (id, updates) => set((state) => ({
    tags: state.tags.map(tag =>
      tag.id === id
        ? { ...tag, ...updates, updatedAt: new Date() }
        : tag
    ),
  })),

  deleteTag: (id) => set((state) => ({
    tags: state.tags.filter(tag => tag.id !== id),
    // Remove tag from all cards
    cards: state.cards.map(card => ({
      ...card,
      tags: card.tags.filter(tagId => tagId !== id),
    })),
  })),

  setTags: (tags) => set({ tags }),

  // State actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),

  // Query methods
  getCardsByCategory: (categoryId) => {
    return get().cards.filter(card => card.categoryId === categoryId);
  },

  getCardsByTag: (tagId) => {
    return get().cards.filter(card => card.tags.includes(tagId));
  },

  getDueCards: () => {
    const now = new Date();
    return get().cards.filter(card => {
      if (!card.nextReviewAt) return true; // New cards
      return new Date(card.nextReviewAt) <= now;
    });
  },

  getNewCards: () => {
    return get().cards.filter(card => 
      card.repetitionCount === 0 && !card.lastReviewedAt
    );
  },

  searchCards: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().cards.filter(card =>
      card.question.toLowerCase().includes(lowerQuery) ||
      card.answer.toLowerCase().includes(lowerQuery) ||
      card.notes?.toLowerCase().includes(lowerQuery)
    );
  },
}));
