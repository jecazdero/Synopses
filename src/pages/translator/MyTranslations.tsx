import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { StatusBadge, StatusLegend } from "../../components/StatusBadge";
import type { LegendFilter } from "../../components/StatusBadge";
import { SetAbsenceModal } from "../../components/SetAbsenceModal";
import { toast } from "../../components/Toast";

const TRANSLATION_STATUSES = ["To do", "In progress", "Blocked", "Review", "Done"] as const;

export default function MyTranslations() {
  const movies = useStore((s) => s.movies);
  const currentUserId = useStore((s) => s.currentUserId);
  const currentUser = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const setAbsence = useStore((s) => s.setAbsence);
  const navigate = useNavigate();
  const [absenceOpen, setAbsenceOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LegendFilter>("All");

  const rows = useMemo(() => {
    const out: { movieId: string; movieTitle: string; director: string; deadline: string; language: string; status: import("../../types").TranslationStatus; blockedReason: string | null; comments: number }[] = [];
    for (const movie of movies) {
      for (const t of movie.translations) {
        if (t.assignedTranslatorId === currentUserId) {
          out.push({
            movieId: movie.id,
            movieTitle: movie.title,
            director: movie.director,
            deadline: movie.deadline,
            language: t.language,
            status: t.status,
            blockedReason: t.blockedReason,
            comments: t.comments.length,
          });
        }
      }
    }
    return out;
  }, [movies, currentUserId]);

  const filteredRows = useMemo(
    () => (statusFilter === "All" ? rows : rows.filter((r) => r.status === statusFilter)),
    [rows, statusFilter],
  );

  return (
    <div className="min-h-full">
      <Header>
        <button
          onClick={() => setAbsenceOpen(true)}
          className="flex items-center gap-2 rounded border border-border-default px-5 py-3 text-sm font-semibold text-text-primary"
        >
          <Icon name="event_busy" className="!text-base" />
          Set Absence
        </button>
      </Header>

      <div className="flex flex-col gap-6 px-12 py-10">
        <div className="flex h-10 items-center justify-between">
          <h1 className="text-[28px] font-bold text-text-primary">My Translations</h1>
          <StatusLegend
            statuses={[...TRANSLATION_STATUSES]}
            active={statusFilter}
            onChange={setStatusFilter}
            showAll
          />
        </div>

        <div className="flex flex-col gap-px rounded-lg bg-border-default">
          <div className="flex items-center gap-3.5 rounded-t-lg bg-bg-elevated px-6 py-3.5">
            <Th className="w-[280px]">Movie</Th>
            <Th className="w-[160px]">Language</Th>
            <Th className="w-[195px]">Director</Th>
            <Th className="w-[160px]">Deadline</Th>
            <Th className="w-[255px]">Status</Th>
            <Th className="w-[170px]">Comments</Th>
          </div>

          {filteredRows.length === 0 && (
            <div className="rounded-b-lg bg-bg-surface px-6 py-10 text-center text-sm text-text-tertiary">
              {rows.length === 0
                ? "No translations assigned to you yet."
                : `No translations with status "${statusFilter}".`}
            </div>
          )}

          {filteredRows.map((r, i) => (
            <div
              key={`${r.movieId}-${r.language}`}
              onClick={() => navigate(`/translator/${r.movieId}/${encodeURIComponent(r.language)}`)}
              className={`group flex cursor-pointer items-center gap-3.5 px-6 py-4 hover:bg-bg-elevated ${
                i % 2 === 1 ? "bg-bg-elevated" : "bg-bg-surface"
              } ${i === filteredRows.length - 1 ? "rounded-b-lg" : ""}`}
            >
              <div className="flex w-[280px] items-center gap-1.5">
                <span className="text-sm font-semibold text-text-primary group-hover:text-accent-red group-hover:underline">
                  {r.movieTitle}
                </span>
                <Icon
                  name="arrow_forward"
                  className="!text-sm text-accent-red opacity-0 group-hover:opacity-100"
                />
              </div>
              <div className="w-[160px] text-[13px] text-text-secondary">{r.language}</div>
              <div className="w-[195px] text-[13px] text-text-secondary">{r.director}</div>
              <div className="w-[160px] text-[13px] text-text-secondary">{formatDate(r.deadline)}</div>
              <div className="flex w-[255px] flex-col items-start gap-0.5">
                <StatusBadge status={r.status} />
                {r.status === "Blocked" && r.blockedReason && (
                  <span className="text-[11px] font-medium text-status-blocked">{r.blockedReason}</span>
                )}
              </div>
              <div className="w-[170px] text-[13px] text-text-secondary">
                {r.comments > 0 ? (
                  <span className="flex items-center gap-1.5">
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

      {absenceOpen && currentUser && (
        <SetAbsenceModal
          note="Any of your in-progress translations will automatically move to Blocked with this reason."
          onClose={() => setAbsenceOpen(false)}
          onSubmit={(reason, startDate, endDate) => {
            setAbsence(currentUserId, { reason, startDate, endDate });
            setAbsenceOpen(false);
            toast(`Absence set (${reason}). In-progress translations were moved to Blocked.`);
          }}
        />
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-xs font-semibold tracking-wide text-text-tertiary ${className}`}>{children}</div>;
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
