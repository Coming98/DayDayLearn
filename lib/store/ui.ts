import { create } from 'zustand';
import type { Toast } from '@/lib/utils/error-handling';
import type { CardFace } from '@/types/card';

interface UIState {
  // Toast notifications
  toasts: Toast[];
  
  // Modal states
  isModalOpen: boolean;
  modalType: 'create' | 'edit' | 'delete' | 'settings' | null;
  modalData: unknown;
  
  // Card view states
  currentCardFace: CardFace;
  showAnswer: boolean;
  
  // Sidebar/Navigation
  sidebarOpen: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'auto';
  
  // Actions - Toasts
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Actions - Modal
  openModal: (type: 'create' | 'edit' | 'delete' | 'settings', data?: unknown) => void;
  closeModal: () => void;
  
  // Actions - Card View
  setCardFace: (face: CardFace) => void;
  toggleAnswer: () => void;
  resetCardView: () => void;
  
  // Actions - Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Actions - Theme
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  toasts: [],
  isModalOpen: false,
  modalType: null,
  modalData: null,
  currentCardFace: 'question',
  showAnswer: false,
  sidebarOpen: false,
  theme: 'auto',

  // Toast actions
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, toast],
  })),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(toast => toast.id !== id),
  })),

  clearToasts: () => set({ toasts: [] }),

  // Modal actions
  openModal: (type, data) => set({
    isModalOpen: true,
    modalType: type,
    modalData: data,
  }),

  closeModal: () => set({
    isModalOpen: false,
    modalType: null,
    modalData: null,
  }),

  // Card view actions
  setCardFace: (face) => set({ currentCardFace: face }),

  toggleAnswer: () => set((state) => ({
    showAnswer: !state.showAnswer,
  })),

  resetCardView: () => set({
    currentCardFace: 'question',
    showAnswer: false,
  }),

  // Sidebar actions
  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen,
  })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Theme actions
  setTheme: (theme) => set({ theme }),
}));
