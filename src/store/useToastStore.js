import { create } from 'zustand';

let hideTimer = null;

export const useToastStore = create((set) => ({
  message: null,
  show: (message) => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    set({ message });
    hideTimer = setTimeout(() => {
      set({ message: null });
      hideTimer = null;
    }, 2000);
  },
  hide: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    set({ message: null });
  },
}));