/**
 * Review Session Store
 * Manages active review sessions, card queue, and session state
 */

import { create } from 'zustand';
import type { Card } from '@/types/card';
import type { ReviewSession, ReviewResponse } from '@/types/review';

interface SessionState {
  // Session state
  activeSession: ReviewSession | null;
  currentFace: 'question' | 'answer' | 'notes';
  sessionStartTime: number | null;
  cardStartTime: number | null;
  
  // Session data
  sessionCards: Card[];
  
  // Actions
  startSession: (cards: Card[], sessionType?: 'daily' | 'focused' | 'catch-up', sessionId?: string) => void;
  endSession: () => void;
  setCurrentFace: (face: 'question' | 'answer' | 'notes') => void;
  nextCard: () => void;
  previousCard: () => void;
  jumpToCard: (index: number) => void;
  recordResponse: (response: ReviewResponse) => void;
  startCardTimer: () => void;
  getCardTimeSpent: () => number;
  
  // Computed helpers
  getCurrentCard: () => Card | null;
  getAdjacentCards: () => { previous: Card | null; next: Card | null };
  getSessionProgress: () => { current: number; total: number; percentage: number };
  getSessionStats: () => { reviewed: number; passed: number; failed: number; accuracy: number };
  isSessionActive: () => boolean;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  activeSession: null,
  currentFace: 'question',
  sessionStartTime: null,
  cardStartTime: null,
  sessionCards: [],

  // Start a new review session
  startSession: (cards, sessionType = 'daily', sessionId) => {
    const now = Date.now();
    const session: ReviewSession = {
      id: sessionId || `session-${now}`,
      startedAt: new Date(now),
      cards: cards.map(c => c.id),
      currentCardIndex: 0,
      responses: [],
      sessionType,
    };

    set({
      activeSession: session,
      sessionCards: cards,
      currentFace: 'question',
      sessionStartTime: now,
      cardStartTime: now,
    });
  },

  // End the current session
  endSession: () => {
    const state = get();
    if (state.activeSession) {
      const endTime = new Date();
      
      set({
        activeSession: {
          ...state.activeSession,
          endedAt: endTime,
        },
      });
    }

    // Clear session after a brief delay to allow final state to be saved
    setTimeout(() => {
      set({
        activeSession: null,
        sessionCards: [],
        currentFace: 'question',
        sessionStartTime: null,
        cardStartTime: null,
      });
    }, 100);
  },

  // Set the current card face
  setCurrentFace: (face) => {
    set({ currentFace: face });
  },

  // Move to next card
  nextCard: () => {
    const state = get();
    if (!state.activeSession) return;
    
    const nextIndex = state.activeSession.currentCardIndex + 1;
    
    if (nextIndex < state.sessionCards.length) {
      set({
        currentFace: 'question',
        cardStartTime: Date.now(),
        activeSession: {
          ...state.activeSession,
          currentCardIndex: nextIndex,
        },
      });
    }
  },

  // Move to previous card
  previousCard: () => {
    const state = get();
    if (!state.activeSession) return;
    
    const prevIndex = state.activeSession.currentCardIndex - 1;
    
    if (prevIndex >= 0) {
      set({
        currentFace: 'question',
        cardStartTime: Date.now(),
        activeSession: {
          ...state.activeSession,
          currentCardIndex: prevIndex,
        },
      });
    }
  },

  // Jump to specific card by index
  jumpToCard: (index) => {
    const state = get();
    if (!state.activeSession) return;
    
    if (index >= 0 && index < state.sessionCards.length) {
      set({
        currentFace: 'question',
        cardStartTime: Date.now(),
        activeSession: {
          ...state.activeSession,
          currentCardIndex: index,
        },
      });
    }
  },

  // Record a review response
  recordResponse: (response) => {
    const state = get();
    if (!state.activeSession) return;

    const updatedResponses = [...state.activeSession.responses, response];

    set({
      activeSession: {
        ...state.activeSession,
        responses: updatedResponses,
      },
    });
  },

  // Start timer for current card
  startCardTimer: () => {
    set({ cardStartTime: Date.now() });
  },

  // Get time spent on current card
  getCardTimeSpent: () => {
    const state = get();
    if (!state.cardStartTime) return 0;
    return Date.now() - state.cardStartTime;
  },

  // Get current card
  getCurrentCard: () => {
    const state = get();
    if (!state.activeSession) return null;
    return state.sessionCards[state.activeSession.currentCardIndex] || null;
  },

  // Get adjacent cards for preview chips
  getAdjacentCards: () => {
    const state = get();
    if (!state.activeSession) {
      return { previous: null, next: null };
    }
    
    const currentIndex = state.activeSession.currentCardIndex;
    const prevIndex = currentIndex - 1;
    const nextIndex = currentIndex + 1;
    
    return {
      previous: prevIndex >= 0 ? state.sessionCards[prevIndex] : null,
      next: nextIndex < state.sessionCards.length ? state.sessionCards[nextIndex] : null,
    };
  },

  // Get session progress
  getSessionProgress: () => {
    const state = get();
    if (!state.activeSession) {
      return { current: 0, total: 0, percentage: 0 };
    }
    
    const total = state.sessionCards.length;
    const current = state.activeSession.currentCardIndex + 1;
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return { current, total, percentage };
  },

  // Get session statistics
  getSessionStats: () => {
    const state = get();
    if (!state.activeSession) {
      return { reviewed: 0, passed: 0, failed: 0, accuracy: 0 };
    }

    const responses = state.activeSession.responses;
    const reviewed = responses.length;
    const passed = responses.filter(r => r.grade === 'pass').length;
    const failed = responses.filter(r => r.grade === 'fail').length;
    const accuracy = reviewed > 0 ? (passed / reviewed) * 100 : 0;

    return { reviewed, passed, failed, accuracy };
  },

  // Check if session is active
  isSessionActive: () => {
    return get().activeSession !== null;
  },
}));
