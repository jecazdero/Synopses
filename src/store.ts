import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedMovies, USERS } from "./seed";
import type {
  AbsencePeriod,
  Comment,
  Movie,
  MovieStatus,
  Role,
  Translation,
  TranslationStatus,
  User,
} from "./types";

const REVIEWER_ID = "reviewer-1";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function recomputeMovieStatus(translations: Translation[]): MovieStatus {
  if (translations.length === 0) return "To do";
  if (translations.some((t) => t.status === "Blocked")) return "Blocked";
  if (translations.every((t) => t.status === "Done")) return "Done";
  if (translations.some((t) => t.status !== "To do")) return "In progress";
  return "To do";
}

const AI_SAMPLE_PHRASES = [
  "A gripping tale of ambition, betrayal, and the price of survival, translated to preserve the tone and rhythm of the original synopsis.",
  "An emotionally charged story that follows its characters through impossible choices, faithfully rendered for a new audience.",
  "A tense, atmospheric drama exploring family, duty, and the cost of secrets — carried across languages with care.",
];

function generateAiTranslation(language: string, sourceText: string): string {
  const flavor = AI_SAMPLE_PHRASES[sourceText.length % AI_SAMPLE_PHRASES.length];
  return `[AI draft — ${language}] ${flavor}`;
}

function generateAiReviewNote(): string {
  const notes = [
    "AI check: tone and pacing match the source. No terminology issues detected. Ready for human review.",
    "AI check: one phrase in the second sentence reads slightly literal — consider a more idiomatic alternative. Otherwise consistent with the original.",
    "AI check: names and locations are consistent with the source synopsis. No missing content detected.",
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

interface SynopsesState {
  movies: Movie[];
  users: User[];
  currentUserId: string;
  currentRole: Role;

  setCurrentUser: (userId: string) => void;

  createMovie: (input: {
    title: string;
    director: string;
    deadline: string;
    originalSynopsis: string;
    languages: string[];
  }) => string;
  updateMovieMeta: (
    movieId: string,
    patch: Partial<Pick<Movie, "title" | "director" | "deadline" | "originalSynopsis">>,
  ) => void;
  deleteMovie: (movieId: string) => void;

  assignTranslator: (movieId: string, language: string, translatorId: string | null) => void;
  setTranslationMethodPreference: (movieId: string, language: string, method: "AI" | "Manual") => void;

  aiTranslateLanguage: (movieId: string, language: string) => Promise<void>;
  polishWithAi: (movieId: string, language: string) => Promise<void>;
  bulkAiTranslateAndRoute: (movieId: string, languages: string[]) => Promise<number>;

  updateTranslatedText: (movieId: string, language: string, text: string) => void;
  updateTranslationStatus: (
    movieId: string,
    language: string,
    status: TranslationStatus,
    blockedReason?: string,
  ) => void;
  submitForReview: (movieId: string, language: string) => void;

  addComment: (movieId: string, language: string, author: string, authorRole: Role, text: string) => void;
  addReply: (movieId: string, language: string, commentId: string, author: string, text: string) => void;

  aiReviewNote: (movieId: string, language: string) => Promise<string>;
  approveTranslation: (movieId: string, language: string) => void;
  declineTranslation: (movieId: string, language: string, comment: string) => void;

  setAbsence: (userId: string, period: Omit<AbsencePeriod, "id">) => void;
}

export const useStore = create<SynopsesState>()(
  persist(
    (set, get) => ({
      movies: seedMovies(),
      users: USERS,
      currentUserId: "producer-1",
      currentRole: "Producer",

      setCurrentUser: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return;
        set({ currentUserId: userId, currentRole: user.role });
      },

      createMovie: ({ title, director, deadline, originalSynopsis, languages }) => {
        const id = uid("movie");
        const movie: Movie = {
          id,
          title,
          director,
          producerId: get().currentUserId,
          deadline,
          createdDate: new Date().toISOString().slice(0, 10),
          status: "To do",
          originalSynopsis,
          translations: languages.map((language) => ({
            language,
            status: "To do",
            assignedTranslatorId: null,
            assignedDate: null,
            daysSpent: 0,
            blockedReason: null,
            translatedText: "",
            method: null,
            comments: [],
            reviewerId: null,
            reviewOutcome: null,
          })),
        };
        set((s) => ({ movies: [movie, ...s.movies] }));
        return id;
      },

      updateMovieMeta: (movieId, patch) => {
        set((s) => ({
          movies: s.movies.map((m) => (m.id === movieId ? { ...m, ...patch } : m)),
        }));
      },

      deleteMovie: (movieId) => {
        set((s) => ({ movies: s.movies.filter((m) => m.id !== movieId) }));
      },

      assignTranslator: (movieId, language, translatorId) => {
        set((s) => ({
          movies: s.movies.map((m) => {
            if (m.id !== movieId) return m;
            const translations = m.translations.map((t) =>
              t.language === language
                ? {
                    ...t,
                    assignedTranslatorId: translatorId,
                    assignedDate: translatorId ? new Date().toISOString().slice(0, 10) : null,
                    method: translatorId ? ("Manual" as const) : t.method,
                  }
                : t,
            );
            return { ...m, translations, status: recomputeMovieStatus(translations) };
          }),
        }));
      },

      setTranslationMethodPreference: (movieId, language, method) => {
        set((s) => ({
          movies: s.movies.map((m) =>
            m.id !== movieId
              ? m
              : {
                  ...m,
                  translations: m.translations.map((t) =>
                    t.language === language ? { ...t, method } : t,
                  ),
                },
          ),
        }));
      },

      aiTranslateLanguage: async (movieId, language) => {
        const movie = get().movies.find((m) => m.id === movieId);
        if (!movie) return;
        await new Promise((r) => setTimeout(r, 1000));
        const text = generateAiTranslation(language, movie.originalSynopsis);
        set((s) => ({
          movies: s.movies.map((m) =>
            m.id !== movieId
              ? m
              : {
                  ...m,
                  translations: m.translations.map((t) =>
                    t.language === language
                      ? { ...t, translatedText: text, method: "AI" }
                      : t,
                  ),
                },
          ),
        }));
      },

      polishWithAi: async (movieId, language) => {
        const movie = get().movies.find((m) => m.id === movieId);
        const current = movie?.translations.find((t) => t.language === language);
        if (!movie || !current) return;
        await new Promise((r) => setTimeout(r, 900));
        const polished = current.translatedText
          ? `${current.translatedText.trim()} (polished for tone and fluency)`
          : generateAiTranslation(language, movie.originalSynopsis);
        set((s) => ({
          movies: s.movies.map((m) =>
            m.id !== movieId
              ? m
              : {
                  ...m,
                  translations: m.translations.map((t) =>
                    t.language === language
                      ? {
                          ...t,
                          translatedText: polished,
                          method: t.method === "Manual" ? "Hybrid" : t.method ?? "AI",
                        }
                      : t,
                  ),
                },
          ),
        }));
      },

      bulkAiTranslateAndRoute: async (movieId, languages) => {
        const movie = get().movies.find((m) => m.id === movieId);
        if (!movie) return 0;
        await new Promise((r) => setTimeout(r, 1400));
        let count = 0;
        set((s) => ({
          movies: s.movies.map((m) => {
            if (m.id !== movieId) return m;
            const translations = m.translations.map((t) => {
              if (!languages.includes(t.language) || t.status === "Done") return t;
              count += 1;
              return {
                ...t,
                translatedText: generateAiTranslation(t.language, m.originalSynopsis),
                method: "AI" as const,
                status: "Review" as const,
                reviewerId: REVIEWER_ID,
                reviewOutcome: null,
                assignedDate: t.assignedDate ?? new Date().toISOString().slice(0, 10),
              };
            });
            return { ...m, translations, status: recomputeMovieStatus(translations) };
          }),
        }));
        return count;
      },

      updateTranslatedText: (movieId, language, text) => {
        set((s) => ({
          movies: s.movies.map((m) =>
            m.id !== movieId
              ? m
              : {
                  ...m,
                  translations: m.translations.map((t) =>
                    t.language === language
                      ? { ...t, translatedText: text, method: t.method === "AI" ? "Hybrid" : t.method ?? "Manual" }
                      : t,
                  ),
                },
          ),
        }));
      },

      updateTranslationStatus: (movieId, language, status, blockedReason) => {
        set((s) => ({
          movies: s.movies.map((m) => {
            if (m.id !== movieId) return m;
            const translations = m.translations.map((t) =>
              t.language === language
                ? {
                    ...t,
                    status,
                    blockedReason: status === "Blocked" ? blockedReason ?? t.blockedReason : null,
                  }
                : t,
            );
            return { ...m, translations, status: recomputeMovieStatus(translations) };
          }),
        }));
      },

      submitForReview: (movieId, language) => {
        set((s) => ({
          movies: s.movies.map((m) => {
            if (m.id !== movieId) return m;
            const translations = m.translations.map((t) =>
              t.language === language
                ? {
                    ...t,
                    status: "Review" as const,
                    blockedReason: null,
                    reviewerId: t.reviewerId ?? REVIEWER_ID,
                    reviewOutcome: null,
                  }
                : t,
            );
            return { ...m, translations, status: recomputeMovieStatus(translations) };
          }),
        }));
      },

      addComment: (movieId, language, author, authorRole, text) => {
        const newComment: Comment = {
          id: uid("comment"),
          author,
          authorRole,
          text,
          timestamp: new Date().toISOString(),
          replies: [],
        };
        set((s) => ({
          movies: s.movies.map((m) =>
            m.id !== movieId
              ? m
              : {
                  ...m,
                  translations: m.translations.map((t) =>
                    t.language === language ? { ...t, comments: [...t.comments, newComment] } : t,
                  ),
                },
          ),
        }));
      },

      addReply: (movieId, language, commentId, author, text) => {
        set((s) => ({
          movies: s.movies.map((m) =>
            m.id !== movieId
              ? m
              : {
                  ...m,
                  translations: m.translations.map((t) =>
                    t.language !== language
                      ? t
                      : {
                          ...t,
                          comments: t.comments.map((c) =>
                            c.id === commentId
                              ? {
                                  ...c,
                                  replies: [
                                    ...c.replies,
                                    { id: uid("reply"), author, text, timestamp: new Date().toISOString() },
                                  ],
                                }
                              : c,
                          ),
                        },
                  ),
                },
          ),
        }));
      },

      aiReviewNote: async (_movieId, _language) => {
        await new Promise((r) => setTimeout(r, 900));
        return generateAiReviewNote();
      },

      approveTranslation: (movieId, language) => {
        set((s) => ({
          movies: s.movies.map((m) => {
            if (m.id !== movieId) return m;
            const translations = m.translations.map((t) =>
              t.language === language
                ? { ...t, status: "Done" as const, reviewOutcome: "Approved" as const, blockedReason: null }
                : t,
            );
            return { ...m, translations, status: recomputeMovieStatus(translations) };
          }),
        }));
      },

      declineTranslation: (movieId, language, commentText) => {
        const reviewer = get().users.find((u) => u.id === REVIEWER_ID);
        set((s) => ({
          movies: s.movies.map((m) => {
            if (m.id !== movieId) return m;
            const translations = m.translations.map((t) => {
              if (t.language !== language) return t;
              const newComment: Comment = {
                id: uid("comment"),
                author: reviewer?.name ?? "Reviewer",
                authorRole: "Reviewer",
                text: commentText,
                timestamp: new Date().toISOString(),
                replies: [],
              };
              return {
                ...t,
                status: "Blocked" as const,
                blockedReason: "Needs revision — see reviewer comment",
                reviewOutcome: "Declined" as const,
                comments: [...t.comments, newComment],
              };
            });
            return { ...m, translations, status: recomputeMovieStatus(translations) };
          }),
        }));
      },

      setAbsence: (userId, period) => {
        const newPeriod: AbsencePeriod = { id: uid("absence"), ...period };
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, absencePeriods: [...(u.absencePeriods ?? []), newPeriod] } : u,
          ),
          movies: s.movies.map((m) => {
            const translations = m.translations.map((t) =>
              t.assignedTranslatorId === userId && t.status === "In progress"
                ? { ...t, status: "Blocked" as const, blockedReason: `Absent · ${period.reason}` }
                : t,
            );
            return { ...m, translations, status: recomputeMovieStatus(translations) };
          }),
        }));
      },
    }),
    { name: "synopses-store" },
  ),
);
