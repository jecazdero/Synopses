import { create } from "zustand";
import { Icon } from "./Icon";

interface ToastState {
  message: string | null;
  show: (message: string) => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    if (timer) clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: null }), 3200);
  },
}));

export function toast(message: string) {
  useToastStore.getState().show(message);
}

export function ToastHost() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border-default bg-bg-elevated px-4 py-3 text-sm font-medium text-text-primary shadow-2xl">
      <Icon name="check_circle" className="!text-base text-status-done" />
      {message}
    </div>
  );
}
