import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

export type Question = {
  id: string;
  number: string;
  text: string;
  parentNumber?: string;
  subPart?: string;
  order: number;
  maxScore: number;
};

export type AnswerRegion = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Answer = {
  id: string;
  text: string;
  detectedQuestionNumber?: string;
  regions: AnswerRegion[];
};

export type MappedItem = {
  question: Question;
  answer?: Answer;
  
  aiSuggestedMarks?: number;
  aiFeedback?: string;
  aiConfidence?: number;
  
  finalMarks?: number;
  teacherEdited?: boolean;
  
  status: "matched" | "unanswered" | "ambiguous" | "unmatched";
};

interface MappingState {
  isProcessing: boolean;
  error: string | null;
  mappedData: MappedItem[];
  questionPaperBase64: { base64: string; mimeType: string } | null;
  answerSheetBase64: { base64: string; mimeType: string } | null;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  setMappedData: (data: MappedItem[]) => void;
  setQuestionPaperBase64: (data: { base64: string; mimeType: string } | null) => void;
  setAnswerSheetBase64: (data: { base64: string; mimeType: string } | null) => void;
  updateMappedItem: (questionId: string, updates: Partial<MappedItem>) => void;
  reset: () => void;
}

// Custom storage for large objects using IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useMappingStore = create<MappingState>()(
  persist(
    (set) => ({
      isProcessing: false,
      error: null,
      mappedData: [],
      questionPaperBase64: null,
      answerSheetBase64: null,
      setProcessing: (isProcessing) => set({ isProcessing }),
      setError: (error) => set({ error }),
      setMappedData: (mappedData) => set({ mappedData }),
      setQuestionPaperBase64: (questionPaperBase64) => set({ questionPaperBase64 }),
      setAnswerSheetBase64: (answerSheetBase64) => set({ answerSheetBase64 }),
      updateMappedItem: (questionId, updates) => set((state) => ({
        mappedData: state.mappedData.map(item => 
          item.question.id === questionId ? { ...item, ...updates } : item
        )
      })),
      reset: () => set({ isProcessing: false, error: null, mappedData: [], questionPaperBase64: null, answerSheetBase64: null }),
    }),
    {
      name: 'mapping-store-idb',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({ 
        mappedData: state.mappedData,
        questionPaperBase64: state.questionPaperBase64,
        answerSheetBase64: state.answerSheetBase64 
      }) // Persist only data, not processing status/errors
    }
  )
);
