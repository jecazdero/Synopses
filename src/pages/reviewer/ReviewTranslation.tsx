import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { toast } from "../../components/Toast";

export default function ReviewTranslation() {
  const { movieId, language: langParam } = useParams();
  const language = decodeURIComponent(langParam ?? "");
  const navigate = useNavigate();

  const movie = useStore((s) => s.movies.find((m) => m.id === movieId));
  const translation = movie?.translations.find((t) => t.language === language);
  const users = useStore((s) => s.users);
  const approveTranslation = useStore((s) => s.approveTranslation);
  const declineTranslation = useStore((s) => s.declineTranslation);
  const aiReviewNote = useStore((s) => s.aiReviewNote);

  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  if (!movie || !translation) return <Navigate to="/reviewer" replace />;

  const producerName = users.find((u) => u.id === movie.producerId)?.name ?? "—";
  const translatorName = users.find((u) => u.id === translation.assignedTranslatorId)?.name ?? "Unassigned";

  async function handleAiReview() {
    setAiLoading(true);
    const note = await aiReviewNote(movie!.id, language);
    setAiNote(note);
    setAiLoading(false);
  }

  function handleApprove() {
    approveTranslation(movie!.id, language);
    toast(`Approved. ${translatorName}'s translation is now Done.`);
    navigate("/reviewer");
  }

  function handleDecline() {
    if (!comment.trim()) {
      setCommentError(true);
      return;
    }
    declineTranslation(movie!.id, language, comment.trim());
    toast(`Declined and returned to ${translatorName} for revision.`);
    navigate("/reviewer");
  }

  return (
    <div className="min-h-full">
      <Header />
      <div className="flex flex-col gap-5 px-12 pb-10 pt-8">
        <Link to="/reviewer" className="flex items-center gap-1 text-text-secondary hover:text-text-primary">
          <Icon name="arrow_back" className="!text-sm" />
          <span className="text-[13px] font-semibold">My Review Tasks</span>
        </Link>

        <div className="flex flex-col gap-3 rounded-lg bg-bg-surface px-6 py-5">
          <h1 className="text-[22px] font-bold text-text-primary">
            {movie.title} <Icon name="arrow_forward" className="!text-lg mx-1 align-middle" /> {language}
          </h1>
          <div className="flex items-start gap-7">
            <Meta label="Director" value={movie.director} />
            <Meta label="Producer" value={producerName} />
            <Meta label="Translator" value={translatorName} />
            <Meta label="Deadline" value={formatDate(movie.deadline)} />
            <Meta label="Status" value={translation.status} />
          </div>
        </div>

        <div className="flex h-72 gap-5">
          <div className="flex h-72 flex-1 flex-col gap-2.5">
            <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              ORIGINAL SYNOPSIS (ENGLISH)
            </span>
            <div className="flex-1 overflow-y-auto rounded-lg bg-bg-surface p-4">
              <p className="text-sm leading-relaxed text-text-secondary">{movie.originalSynopsis}</p>
            </div>
          </div>
          <div className="flex h-72 flex-1 flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">
                TRANSLATION ({language.toUpperCase()})
              </span>
              <button
                onClick={handleAiReview}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded border border-border-default px-3 py-1.5 text-xs font-semibold text-text-primary disabled:opacity-60"
              >
                <Icon name="fact_check" className="!text-sm" />
                {aiLoading ? "Reviewing…" : "Review with AI"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto rounded-lg bg-bg-surface p-4">
              {translation.translatedText ? (
                <p className="text-sm leading-relaxed text-text-primary">{translation.translatedText}</p>
              ) : (
                <p className="text-sm leading-relaxed text-text-tertiary">No translation submitted yet.</p>
              )}
            </div>
            {aiNote && (
              <div className="flex items-start gap-2 rounded-lg border border-border-default bg-bg-elevated p-3">
                <Icon name="auto_awesome" className="!text-sm mt-0.5 shrink-0 text-accent-red" />
                <p className="text-xs leading-relaxed text-text-secondary">{aiNote}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">
            COMMENT (REQUIRED IF DECLINING)
          </span>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (e.target.value.trim()) setCommentError(false);
            }}
            placeholder="Explain what needs fixing, or leave a note before approving..."
            className={`h-[60px] resize-none rounded-md border bg-bg-surface p-3.5 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary ${
              commentError ? "border-status-blocked" : "border-border-default focus:border-accent-red"
            }`}
          />
          {commentError && (
            <span className="text-xs font-medium text-status-blocked">
              A comment is required to decline this translation.
            </span>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Icon name="info" className="!text-sm" />
          If declined, this task returns to {translatorName} (the assigned Translator) for revision.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex items-center gap-2 rounded border border-status-blocked px-6 py-3 text-sm font-semibold text-status-blocked"
          >
            <Icon name="close" className="!text-base" />
            Decline
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-2 rounded bg-status-done px-6 py-3 text-sm font-semibold text-text-primary"
          >
            <Icon name="check" className="!text-base" />
            Approve
          </button>
        </div>
      </div>
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
