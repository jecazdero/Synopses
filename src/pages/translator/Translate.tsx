import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { StatusDot, type BadgeStatus } from "../../components/StatusBadge";
import { toast } from "../../components/Toast";
import type { TranslationStatus } from "../../types";

const STATUS_OPTIONS: TranslationStatus[] = ["To do", "In progress", "Blocked", "Review", "Done"];

export default function Translate() {
  const { movieId, language: langParam } = useParams();
  const language = decodeURIComponent(langParam ?? "");
  const navigate = useNavigate();
  const movie = useStore((s) => s.movies.find((m) => m.id === movieId));
  const translation = movie?.translations.find((t) => t.language === language);
  const currentUser = useStore((s) => s.users.find((u) => u.id === s.currentUserId));

  const updateTranslationStatus = useStore((s) => s.updateTranslationStatus);
  const updateTranslatedText = useStore((s) => s.updateTranslatedText);
  const aiTranslateLanguage = useStore((s) => s.aiTranslateLanguage);
  const polishWithAi = useStore((s) => s.polishWithAi);
  const submitForReview = useStore((s) => s.submitForReview);
  const addReply = useStore((s) => s.addReply);

  const [aiLoading, setAiLoading] = useState(false);
  const [polishLoading, setPolishLoading] = useState(false);
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  if (!movie || !translation || !currentUser) return <Navigate to="/translator" replace />;

  async function handleAiTranslate() {
    setAiLoading(true);
    await aiTranslateLanguage(movie!.id, language);
    setAiLoading(false);
    toast("AI translation drafted below — edit as needed.");
  }

  async function handlePolish() {
    setPolishLoading(true);
    await polishWithAi(movie!.id, language);
    setPolishLoading(false);
    toast("Polished with AI.");
  }

  function handleSaveDraft() {
    toast("Draft saved.");
  }

  function handleSubmitForReview() {
    submitForReview(movie!.id, language);
    toast("Submitted for review.");
    navigate("/translator");
  }

  return (
    <div className="min-h-full">
      <Header />
      <div className="flex flex-col gap-5 px-12 pb-6 pt-8">
        <Link to="/translator" className="flex items-center gap-1 text-text-secondary hover:text-text-primary">
          <Icon name="arrow_back" className="!text-sm" />
          <span className="text-[13px] font-semibold">My Translations</span>
        </Link>

        <div className="flex items-start justify-between rounded-lg bg-bg-surface px-6 py-5">
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[22px] font-bold text-text-primary">
              {movie.title} <Icon name="arrow_forward" className="!text-lg mx-1 align-middle" /> {language}
            </h1>
            <div className="flex items-start gap-6">
              <Meta label="Director" value={movie.director} />
              <Meta label="Deadline" value={formatDate(movie.deadline)} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">STATUS</span>
                <StatusSelector
                  status={translation.status}
                  blockedReason={translation.blockedReason}
                  onChange={(status, reason) => {
                    updateTranslationStatus(movie!.id, language, status, reason);
                    if (status === "Blocked") toast("Marked as Blocked.");
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">DAYS ON THIS TASK</span>
            <span className="text-xl font-bold text-text-primary">{translation.daysSpent} days</span>
          </div>
        </div>

        <div className="flex h-80 gap-5">
          <div className="flex h-80 flex-1 flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">
                ORIGINAL SYNOPSIS (ENGLISH)
              </span>
              <button
                onClick={handleAiTranslate}
                disabled={aiLoading}
                className="flex items-center gap-2 rounded bg-accent-red px-3.5 py-2 text-[13px] font-semibold text-text-primary disabled:opacity-60"
              >
                <Icon name="auto_awesome" className="!text-base" />
                {aiLoading ? "Translating…" : "Translate with AI"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto rounded-lg bg-bg-surface p-4">
              <p className="text-sm leading-relaxed text-text-secondary">{movie.originalSynopsis}</p>
            </div>
          </div>
          <div className="flex h-80 flex-1 flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">
                YOUR TRANSLATION ({language.toUpperCase()})
              </span>
              <button
                onClick={handlePolish}
                disabled={polishLoading}
                className="flex items-center gap-2 rounded border border-border-default px-3.5 py-2 text-[13px] font-semibold text-text-primary disabled:opacity-60"
              >
                <Icon name="auto_fix_high" className="!text-base" />
                {polishLoading ? "Polishing…" : "Polish with AI"}
              </button>
            </div>
            <textarea
              value={translation.translatedText}
              onChange={(e) => updateTranslatedText(movie!.id, language, e.target.value)}
              placeholder="Write your translation here, or use Translate with AI to get a first draft…"
              className="flex-1 resize-none rounded-lg border border-border-default bg-bg-surface p-4 text-sm leading-relaxed text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-red"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg bg-bg-surface px-5 py-4">
          <div className="flex items-center gap-2">
            <Icon name="chat_bubble_outline" className="!text-base text-text-secondary" />
            <span className="text-sm font-semibold text-text-primary">Reviewer Comments — {movie.title}</span>
          </div>
          {translation.comments.length === 0 && (
            <p className="text-[13px] text-text-tertiary">No reviewer comments yet.</p>
          )}
          {translation.comments.map((c) => (
            <div key={c.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-semibold text-text-primary">
                  {c.author} ({c.authorRole})
                </span>
                <span className="text-xs text-text-tertiary">{formatDateTime(c.timestamp)}</span>
              </div>
              <p className="text-[13px] text-text-secondary">{c.text}</p>

              {c.replies.map((r) => (
                <div key={r.id} className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-border-default pl-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">{r.author}</span>
                    <span className="text-xs text-text-tertiary">{formatDateTime(r.timestamp)}</span>
                  </div>
                  <p className="text-[13px] text-text-secondary">{r.text}</p>
                </div>
              ))}

              {replyOpenFor === c.id ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    autoFocus
                    className="input flex-1"
                    placeholder="Write a reply…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && replyText.trim()) {
                        addReply(movie!.id, language, c.id, currentUser.name, replyText.trim());
                        setReplyText("");
                        setReplyOpenFor(null);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!replyText.trim()) return;
                      addReply(movie!.id, language, c.id, currentUser.name, replyText.trim());
                      setReplyText("");
                      setReplyOpenFor(null);
                    }}
                    className="rounded bg-accent-red px-3 py-2 text-xs font-semibold text-text-primary"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyOpenFor(c.id);
                    setReplyText("");
                  }}
                  className="flex w-fit items-center gap-1 text-xs font-semibold text-accent-red"
                >
                  <Icon name="reply" className="!text-sm" />
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              className="rounded border border-border-default px-6 py-3 text-sm font-semibold text-text-primary"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmitForReview}
              className="flex items-center gap-2 rounded bg-accent-red px-6 py-3 text-sm font-semibold text-text-primary"
            >
              <Icon name="send" className="!text-base" />
              Submit for Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusSelector({
  status,
  blockedReason,
  onChange,
}: {
  status: TranslationStatus;
  blockedReason: string | null;
  onChange: (status: TranslationStatus, reason?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pendingReason, setPendingReason] = useState("");
  const [awaitingReason, setAwaitingReason] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-6 rounded-md border border-border-default bg-bg-elevated py-1.5 pl-2.5 pr-2"
      >
        <span className="flex items-center gap-1.5">
          <StatusDot status={status as BadgeStatus} />
          <span className="text-[13px] font-medium text-text-primary">{status}</span>
        </span>
        <Icon name="expand_more" className="!text-base text-text-tertiary" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-40 w-[200px] rounded-lg border border-border-default bg-bg-elevated p-1.5 shadow-2xl">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                if (s === "Blocked") {
                  setAwaitingReason(true);
                  setPendingReason("");
                } else {
                  onChange(s);
                  setOpen(false);
                  setAwaitingReason(false);
                }
              }}
              className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[13px] font-medium text-text-primary hover:bg-bg-surface"
            >
              <StatusDot status={s as BadgeStatus} />
              {s}
            </button>
          ))}

          {awaitingReason && (
            <div className="mt-1 flex flex-col gap-1.5 border-t border-border-default p-2">
              <span className="text-[9px] font-semibold tracking-wide text-text-tertiary">
                REASON (REQUIRED IF BLOCKED)
              </span>
              <input
                autoFocus
                className="input"
                placeholder="e.g. Incomplete synopsis, Absent · Sick leave"
                value={pendingReason}
                onChange={(e) => setPendingReason(e.target.value)}
              />
              <button
                disabled={!pendingReason.trim()}
                onClick={() => {
                  onChange("Blocked", pendingReason.trim());
                  setOpen(false);
                  setAwaitingReason(false);
                }}
                className="rounded bg-accent-red px-3 py-1.5 text-xs font-semibold text-text-primary disabled:opacity-50"
              >
                Set Blocked
              </button>
            </div>
          )}
        </div>
      )}

      {status === "Blocked" && blockedReason && !open && (
        <div className="absolute left-0 top-[calc(100%+4px)] w-max text-[11px] font-medium text-status-blocked">
          {blockedReason}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">{label.toUpperCase()}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
