import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Exam } from '@/types/life-os';

interface ExamState {
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  setExams: (exams: Exam[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addExamLocal: (exam: Exam) => void;
  updateExamTransactionLocal: (examId: string, updates: Partial<Exam>) => void;
  removeExamLocal: (examId: string) => void;
  resetExamStore: () => void;
}

export const useExamStore = create<ExamState>()(
  devtools(
    (set) => ({
      exams: [],
      isLoading: false,
      error: null,
      setExams: (exams) => set({ exams, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      addExamLocal: (exam) => set((state) => ({ exams: [exam, ...state.exams] })),
      updateExamTransactionLocal: (examId, updates) =>
        set((state) => ({
          exams: state.exams.map((e) => (e.id === examId ? { ...e, ...updates } : e)),
        })),
      removeExamLocal: (examId) => set((state) => ({ exams: state.exams.filter((e) => e.id !== examId) })),
      resetExamStore: () => set({ exams: [], isLoading: false, error: null }),
    }),
    { name: 'StudySphere-ExamStore' }
  )
);