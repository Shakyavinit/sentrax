import { create } from 'zustand';

interface UiState {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  gridColumns: 1 | 2 | 3 | 4;
  globalSearchQuery: string;
  introModalOpen: boolean;
  setIntroModalOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setGridColumns: (cols: 1 | 2 | 3 | 4) => void;
  setGlobalSearchQuery: (q: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  sidebarCollapsed: false,
  gridColumns: 2,
  globalSearchQuery: '',
  introModalOpen: false,
  setIntroModalOpen: (introModalOpen) => set({ introModalOpen }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setGridColumns: (cols) => set({ gridColumns: cols }),
  setGlobalSearchQuery: (q) => set({ globalSearchQuery: q }),
}));
