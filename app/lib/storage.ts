/**
 * LocalStorage Operations for User Progress
 * 
 * Handles saving and loading user progress data from browser localStorage.
 */

import { UserProgress, DEFAULT_USER_PROGRESS, validateUserProgress } from '@/app/types/flashcard';

// Storage key for user progress
const STORAGE_KEY = 'daydaylearn:progress';

/**
 * Load user progress from localStorage
 * 
 * @returns UserProgress object (or default if not found/invalid)
 */
export function loadProgress(): UserProgress {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage not available, using default progress');
      return { ...DEFAULT_USER_PROGRESS };
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      console.log('No saved progress found, using defaults');
      return { ...DEFAULT_USER_PROGRESS };
    }

    const parsed = JSON.parse(stored);
    
    // Validate the loaded data
    if (!validateUserProgress(parsed)) {
      console.warn('Invalid progress data in localStorage, resetting to defaults');
      return { ...DEFAULT_USER_PROGRESS };
    }

    console.log('Progress loaded from localStorage');
    return parsed as UserProgress;
  } catch (error) {
    console.error('Error loading progress from localStorage:', error);
    return { ...DEFAULT_USER_PROGRESS };
  }
}

/**
 * Save user progress to localStorage
 * 
 * @param progress - UserProgress object to save
 * @returns true if saved successfully, false otherwise
 */
export function saveProgress(progress: UserProgress): boolean {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage not available, cannot save progress');
      return false;
    }

    // Validate before saving
    if (!validateUserProgress(progress)) {
      console.error('Invalid progress object, not saving');
      return false;
    }

    // Update timestamp
    const updatedProgress = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };

    const serialized = JSON.stringify(updatedProgress);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    
    console.log('Progress saved to localStorage');
    return true;
  } catch (error) {
    // Handle QuotaExceededError
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded, cannot save progress');
      alert('Storage is full. Please clear some browser data to continue saving progress.');
    } else {
      console.error('Error saving progress to localStorage:', error);
    }
    return false;
  }
}

/**
 * Clear all user progress from localStorage
 * 
 * @returns true if cleared successfully, false otherwise
 */
export function clearProgress(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage not available');
      return false;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    console.log('Progress cleared from localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing progress from localStorage:', error);
    return false;
  }
}

/**
 * Check if progress data exists in localStorage
 * 
 * @returns true if progress exists, false otherwise
 */
export function hasProgress(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Error checking for progress in localStorage:', error);
    return false;
  }
}
