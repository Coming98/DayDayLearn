/**
 * Card Type Definitions
 */

export interface Card {
  id: string;
  question: string;
  answer: string;
  notes?: string;
  categoryId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  easeFactor: number;
  interval: number;
  repetitionCount: number;
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  correctCount: number;
  incorrectCount: number;
  averageResponseTime?: number;
  mediaAttachments: MediaAttachment[];
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  attachedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardFilters {
  categoryId?: string;
  tags?: string[];
  reviewStatus?: 'new' | 'learning' | 'review' | 'overdue';
  scoreRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
}

export interface CardSortOptions {
  field: 'score' | 'createdAt' | 'lastReviewedAt' | 'nextReviewAt';
  direction: 'asc' | 'desc';
}

export type CardFace = 'question' | 'answer' | 'notes';

export interface CardValidationError {
  field: keyof Card;
  message: string;
}
