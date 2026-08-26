export type Question = {
  id: string;
  number: string;
  text: string;
  parentNumber?: string;
  subPart?: string;
  order: number;
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

export type AnswerMapping = {
  questionId: string;
  answerId?: string;
  
  aiSuggestedMarks?: number;
  aiFeedback?: string;
  aiConfidence?: number;
  
  finalMarks?: number;
  teacherEdited?: boolean;
  
  status: "matched" | "unanswered" | "ambiguous" | "unmatched";
};

export type ProcessingStage =
  | "uploading"
  | "extracting_questions"
  | "extracting_answers"
  | "mapping_answers"
  | "preparing_review"
  | "completed"
  | "failed";
