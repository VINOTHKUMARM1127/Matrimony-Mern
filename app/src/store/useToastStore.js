import { create } from 'zustand';

const useToastStore = create((set) => ({
  toast: null,
  showToast: (type = 'info', title, message, duration = 3000) => {
    set({ toast: { type, title, message, duration, id: Date.now() } });
  },
  hideToast: () => {
    set({ toast: null });
  },
}));

export default useToastStore;
