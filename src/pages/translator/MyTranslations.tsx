import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { StatusBadge, StatusLegend } from "../../components/StatusBadge";
import { Modal } from "../../components/Modal";
import { toast } from "../../components/Toast";

export default function MyTranslations() {
  const movies = useStore((s) => s.movies);
  const currentUserId = useStore((s) => s.currentUserId);
  const currentUser = useStore((s) => s.users.find((u) => u.id === s.currentUserId));
  const setAbsence = useStore((s) => s.setAbsence);
  const navigate = useNavigate();
  const [absenceOpen, setAbsenceOpen] = useState(false);

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
          <StatusLegend statuses={["To do", "In progress", "Blocked", "Review", "Done"]} />
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

          {rows.length === 0 && (
            <div className="rounded-b-lg bg-bg-surface px-6 py-10 text-center text-sm text-text-tertiary">
              No translations assigned to you yet.
            </div>
          )}

          {rows.map((r, i) => (
            <div
              key={`${r.movieId}-${r.language}`}
              onClick={() => navigate(`/translator/${r.movieId}/${encodeURIComponent(r.language)}`)}
              className={`group flex cursor-pointer items-center gap-3.5 px-6 py-4 hover:bg-bg-elevated ${
                i % 2 === 1 ? "bg-bg-elevated" : "bg-bg-surface"
              } ${i === rows.length - 1 ? "rounded-b-lg" : ""}`}
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
              <div className="flex w-[255px] flex-col gap-0.5">
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

function SetAbsenceModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (reason: "Sick leave" | "PTO", startDate: string, endDate: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [reason, setReason] = useState<"Sick leave" | "PTO">("Sick leave");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const valid = startDate && endDate && startDate <= endDate;

  return (
    <Modal title="Set Absence" onClose={onClose} width="420px">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">REASON</span>
          <div className="inline-flex gap-0.5 rounded-full bg-bg-surface p-0.5">
            {(["Sick leave", "PTO"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${
                  reason === r ? "bg-accent-red text-text-primary" : "text-text-secondary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">START DATE</span>
            <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">END DATE</span>
            <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <p className="flex items-start gap-1.5 text-xs text-text-tertiary">
          <Icon name="info" className="!text-sm shrink-0" />
          Any of your in-progress translations will automatically move to Blocked with this reason.
        </p>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button onClick={onClose} className="rounded border border-border-default px-5 py-2.5 text-sm font-semibold text-text-primary">
          Cancel
        </button>
        <button
          disabled={!valid}
          onClick={() => onSubmit(reason, startDate, endDate)}
          className="rounded bg-accent-red px-5 py-2.5 text-sm font-semibold text-text-primary disabled:opacity-50"
        >
          Set Absence
        </button>
      </div>
    </Modal>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-xs font-semibold tracking-wide text-text-tertiary ${className}`}>{children}</div>;
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
