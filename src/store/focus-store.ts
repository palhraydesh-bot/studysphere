import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FocusSession } from '@/types/life-os';

interface FocusState {
  history: FocusSession[];
  isActive: boolean;
  timeLeft: number;
  distractionsThisSession: number;
  setHistory: (history: FocusSession[]) => void;
  setIsActive: (isActive: boolean) => void;
  setTimeLeft: (timeLeft: number) => void;
  incrementDistractions: () => void;
  addSessionLocal: (session: FocusSession) => void;
  resetSessionState: () => void;
}

export const useFocusStore = create<FocusState>()(
  devtools(
    (set) => ({
      history: [],
      isActive: false,
      timeLeft: 1500, // 25 minutes default
      distractionsThisSession: 0,
      setHistory: (history) => set({ history }),
      setIsActive: (isActive) => set({ isActive }),
      setTimeLeft: (timeLeft) => set({ timeLeft }),
      incrementDistractions: () => set((state) => ({ distractionsThisSession: state.distractionsThisSession + 1 })),
      addSessionLocal: (session) => set((state) => ({ history: [session, ...state.history] })),
      resetSessionState: () => set({ isActive: false, timeLeft: 1500, distractionsThisSession: 0 }),
    }),
    { name: 'StudySphere-FocusStore' }
  )
);