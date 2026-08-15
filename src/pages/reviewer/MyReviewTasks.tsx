import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { StatusBadge } from "../../components/StatusBadge";
import type { BadgeStatus } from "../../components/StatusBadge";

export default function MyReviewTasks() {
  const movies = useStore((s) => s.movies);
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  const navigate = useNavigate();

  const rows = useMemo(() => {
    const out: {
      movieId: string;
      movieTitle: string;
      director: string;
      producer: string;
      translator: string;
      language: string;
      deadline: string;
      status: BadgeStatus;
      comments: number;
    }[] = [];
    for (const movie of movies) {
      const producerName = users.find((u) => u.id === movie.producerId)?.name ?? "—";
      for (const t of movie.translations) {
        if (t.reviewerId !== currentUserId) continue;
        let status: BadgeStatus | null = null;
        if (t.status === "Review") status = "Review";
        else if (t.reviewOutcome === "Approved") status = "Approved";
        else if (t.reviewOutcome === "Declined") status = "Declined";
        if (!status) continue;
        out.push({
          movieId: movie.id,
          movieTitle: movie.title,
          director: movie.director,
          producer: producerName,
          translator: users.find((u) => u.id === t.assignedTranslatorId)?.name ?? "Unassigned",
          language: t.language,
          deadline: movie.deadline,
          status,
          comments: t.comments.length,
        });
      }
    }
    return out;
  }, [movies, users, currentUserId]);

  return (
    <div className="min-h-full">
      <Header />
      <div className="flex flex-col gap-6 px-12 py-10">
        <div className="flex h-10 items-center justify-between">
          <h1 className="text-[28px] font-bold text-text-primary">My Review Tasks</h1>
          <div className="flex items-center gap-4">
            {(["Review", "Approved", "Declined"] as BadgeStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span
                  className={`inline-block size-2 rounded-full ${
                    s === "Review" ? "bg-status-review" : s === "Approved" ? "bg-status-done" : "bg-status-blocked"
                  }`}
                />
                <span className="text-xs font-medium text-text-secondary">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-px rounded-lg bg-border-default">
          <div className="flex items-center gap-3 rounded-t-lg bg-bg-elevated px-5 py-3.5">
            <Th className="w-[220px]">Movie</Th>
            <Th className="w-[130px]">Director</Th>
            <Th className="w-[130px]">Producer</Th>
            <Th className="w-[130px]">Translator</Th>
            <Th className="w-[115px]">Language</Th>
            <Th className="w-[110px]">Deadline</Th>
            <Th className="w-[160px]">Status</Th>
            <Th className="w-[125px]">Comments</Th>
          </div>

          {rows.length === 0 && (
            <div className="rounded-b-lg bg-bg-surface px-5 py-10 text-center text-sm text-text-tertiary">
              No review tasks assigned to you yet.
            </div>
          )}

          {rows.map((r, i) => (
            <div
              key={`${r.movieId}-${r.language}`}
              onClick={() => navigate(`/reviewer/${r.movieId}/${encodeURIComponent(r.language)}`)}
              className={`group flex cursor-pointer items-center gap-3 px-5 py-4 hover:bg-bg-elevated ${
                i % 2 === 1 ? "bg-bg-elevated" : "bg-bg-surface"
              } ${i === rows.length - 1 ? "rounded-b-lg" : ""}`}
            >
              <div className="flex w-[220px] items-center gap-1.5">
                <span className="text-sm font-semibold text-text-primary group-hover:text-accent-red group-hover:underline">
                  {r.movieTitle}
                </span>
                <Icon name="arrow_forward" className="!text-sm text-accent-red opacity-0 group-hover:opacity-100" />
              </div>
              <div className="w-[130px] text-xs text-text-secondary">{r.director}</div>
              <div className="w-[130px] text-xs text-text-secondary">{r.producer}</div>
              <div className="w-[130px] text-xs text-text-secondary">{r.translator}</div>
              <div className="w-[115px] text-xs text-text-secondary">{r.language}</div>
              <div className="w-[110px] text-xs text-text-secondary">{formatDate(r.deadline)}</div>
              <div className="w-[160px]">
                <StatusBadge status={r.status} />
              </div>
              <div className="w-[125px] text-xs text-text-secondary">
                {r.comments > 0 ? (
                  <span className="flex items-center gap-1">
                    <Icon name="chat_bubble_outline" className="!text-sm" />
                    {r.comments}
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[11px] font-semibold tracking-wide text-text-tertiary ${className}`}>{children}</div>;
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}
