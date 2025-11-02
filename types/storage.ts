/**
 * Storage Type Definitions
 */

import { Card, Category, Tag } from './card';
import { ReviewSession, ReviewEvent, DailyReviewStats } from './review';

export interface StorageSchema {
  version: number;
  cards: Card[];
  categories: Category[];
  tags: Tag[];
  reviewSessions: ReviewSession[];
  reviewEvents: ReviewEvent[];
  dailyStats: DailyReviewStats[];
  settings: UserSettings;
  lastBackup?: Date;
}

export interface UserSettings {
  maxNewCardsPerDay: number;
  maxReviewsPerDay: number;
  defaultEaseFactor: number;
  theme: 'light' | 'dark' | 'auto';
  cardTransitionSpeed: number;
  showProgress: boolean;
  autoAdvance: boolean;
  enableReminders: boolean;
  reminderTime?: string;
  reminderDays: number[];
  backupFrequency: 'daily' | 'weekly' | 'never';
  exportFormat: 'json' | 'csv';
  debugMode: boolean;
}

export interface StorageQuota {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

export interface BackupData {
  timestamp: Date;
  version: number;
  data: StorageSchema;
  checksum: string;
}

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  migratedRecords: number;
  errors?: string[];
}

export interface RepositoryError {
  operation: 'read' | 'write' | 'delete' | 'migrate';
  entity: keyof StorageSchema;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

export interface StorageEvent {
  type: 'create' | 'update' | 'delete' | 'bulk_update';
  entity: keyof StorageSchema;
  entityId?: string;
  timestamp: Date;
  changes?: Partial<unknown>;
}

export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface BulkOperation<T> {
  operation: 'create' | 'update' | 'delete';
  entities: T[];
  batchSize?: number;
}

export interface SyncStatus {
  lastSync?: Date;
  pendingChanges: number;
  conflictCount: number;
  status: 'synced' | 'pending' | 'error' | 'offline';
}
