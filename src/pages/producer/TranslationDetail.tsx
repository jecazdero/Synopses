import { Link, Navigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { StatusBadge } from "../../components/StatusBadge";

export default function TranslationDetail() {
  const { movieId, language: langParam } = useParams();
  const language = decodeURIComponent(langParam ?? "");
  const movie = useStore((s) => s.movies.find((m) => m.id === movieId));
  const translation = movie?.translations.find((t) => t.language === language);
  const translatorName = useStore(
    (s) => s.users.find((u) => u.id === translation?.assignedTranslatorId)?.name,
  );

  if (!movie || !translation) return <Navigate to="/producer" replace />;

  return (
    <div className="min-h-full">
      <Header />
      <div className="flex flex-col gap-5 px-12 pb-10 pt-8">
        <Link
          to={`/producer/movie/${movie.id}`}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary"
        >
          <Icon name="arrow_back" className="!text-sm" />
          <span className="text-[13px] font-semibold">{movie.title}</span>
        </Link>

        <div className="flex items-start justify-between rounded-lg bg-bg-surface px-6 py-5">
          <div className="flex flex-col gap-2.5">
            <h1 className="flex items-center gap-2 text-[22px] font-bold text-text-primary">
              {movie.title}
              <Icon name="arrow_forward" className="!text-lg text-text-secondary" />
              {language}
            </h1>
            <div className="flex items-start gap-7">
              <Meta label="Director" value={movie.director} />
              <Meta label="Deadline" value={formatDate(movie.deadline)} />
              <Meta label="Assigned Translator" value={translatorName ?? "Unassigned"} />
              <Meta label="Days Spent" value={translation.daysSpent ? `${translation.daysSpent} days` : "—"} />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">STATUS</span>
                <StatusBadge status={translation.status} />
                {translation.status === "Blocked" && translation.blockedReason && (
                  <span className="text-[11px] font-medium text-status-blocked">{translation.blockedReason}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-80 gap-5">
          <div className="flex h-80 flex-1 flex-col gap-2.5">
            <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              ORIGINAL SYNOPSIS (ENGLISH)
            </span>
            <div className="flex-1 overflow-y-auto rounded-lg bg-bg-surface p-4">
              <p className="text-sm leading-relaxed text-text-secondary">{movie.originalSynopsis}</p>
            </div>
          </div>
          <div className="flex h-80 flex-1 flex-col gap-2.5">
            <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">
              TRANSLATION ({language.toUpperCase()})
            </span>
            <div className="flex-1 overflow-y-auto rounded-lg bg-bg-surface p-4">
              {translation.translatedText ? (
                <p className="text-sm leading-relaxed text-text-primary">{translation.translatedText}</p>
              ) : (
                <p className="text-sm leading-relaxed text-text-tertiary">
                  No translation yet — assign a translator or trigger AI translation from the movie page.
                </p>
              )}
            </div>
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
                <span className="text-xs text-text-tertiary">{formatDate(c.timestamp.slice(0, 10))}</span>
              </div>
              <p className="text-[13px] text-text-secondary">{c.text}</p>
              {c.replies.map((r) => (
                <div key={r.id} className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-border-default pl-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-text-primary">{r.author}</span>
                    <span className="text-xs text-text-tertiary">{formatDate(r.timestamp.slice(0, 10))}</span>
                  </div>
                  <p className="text-[13px] text-text-secondary">{r.text}</p>
                </div>
              ))}
            </div>
          ))}
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
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
