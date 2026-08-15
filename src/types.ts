export type Role = "Producer" | "Translator" | "Reviewer";

export type MovieStatus = "To do" | "In progress" | "Blocked" | "Done";

export type TranslationStatus =
  | "To do"
  | "In progress"
  | "Blocked"
  | "Review"
  | "Done";

export type TranslationMethod = "AI" | "Manual" | "Hybrid";

export interface CommentReply {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  author: string;
  authorRole: Role;
  text: string;
  timestamp: string;
  replies: CommentReply[];
}

export interface Translation {
  language: string;
  status: TranslationStatus;
  assignedTranslatorId: string | null;
  assignedDate: string | null;
  daysSpent: number;
  blockedReason: string | null;
  translatedText: string;
  method: TranslationMethod | null;
  comments: Comment[];
  /** Reviewer assigned once the translation is routed for review. */
  reviewerId: string | null;
  /** Outcome of the most recent review pass — null while pending or untouched. */
  reviewOutcome: "Approved" | "Declined" | null;
}

export interface Movie {
  id: string;
  title: string;
  originalSynopsis: string;
  director: string;
  producerId: string;
  deadline: string;
  createdDate: string;
  status: MovieStatus;
  translations: Translation[];
}

export interface AbsencePeriod {
  id: string;
  reason: "Sick leave" | "PTO";
  startDate: string;
  endDate: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  rating?: number;
  absencePeriods?: AbsencePeriod[];
}

export const LANGUAGES = [
  "Spanish (LatAm)",
  "French",
  "Japanese",
  "German",
  "Portuguese",
  "Italian",
  "Korean",
  "Mandarin Chinese",
  "Arabic",
  "Hindi",
  "Russian",
  "Turkish",
  "Polish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Hebrew",
  "Ukrainian",
] as const;

export const TOTAL_LANGUAGES = 190;
