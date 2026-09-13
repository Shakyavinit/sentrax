import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  gridColumns: 1 | 2 | 3 | 4;
  globalSearchQuery: string;
  toggleSidebar: () => void;
  setGridColumns: (cols: 1 | 2 | 3 | 4) => void;
  setGlobalSearchQuery: (q: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  gridColumns: 2,
  globalSearchQuery: '',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setGridColumns: (cols) => set({ gridColumns: cols }),
  setGlobalSearchQuery: (q) => set({ globalSearchQuery: q }),
}));
