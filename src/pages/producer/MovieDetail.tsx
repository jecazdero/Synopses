import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { StatusBadge, type BadgeStatus } from "../../components/StatusBadge";
import { ProgressBar } from "../../components/ProgressBar";
import { MovieActionsMenu } from "../../components/MovieActionsMenu";
import { toast } from "../../components/Toast";
import type { Translation } from "../../types";

const FILTERS: ("All" | BadgeStatus)[] = ["All", "To do", "In progress", "Blocked", "Review", "Done"];

export default function MovieDetail() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const movie = useStore((s) => s.movies.find((m) => m.id === movieId));
  const users = useStore((s) => s.users);
  const translators = useMemo(() => users.filter((u) => u.role === "Translator"), [users]);
  const assignTranslator = useStore((s) => s.assignTranslator);
  const bulkAiTranslateAndRoute = useStore((s) => s.bulkAiTranslateAndRoute);
  const [filter, setFilter] = useState<"All" | BadgeStatus>("All");
  const [search, setSearch] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [openAssign, setOpenAssign] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!movie) return [];
    return movie.translations.filter((t) => {
      if (filter !== "All" && t.status !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const translatorName = translators.find((u) => u.id === t.assignedTranslatorId)?.name ?? "";
        if (!t.language.toLowerCase().includes(q) && !translatorName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [movie, filter, search, translators]);

  if (!movie) return <Navigate to="/producer" replace />;

  const done = movie.translations.filter((t) => t.status === "Done").length;
  const total = movie.translations.length;
  const counts = FILTERS.map((f) => ({
    label: f,
    count: f === "All" ? total : movie.translations.filter((t) => t.status === f).length,
  }));

  async function handleBulkAi() {
    if (!movie) return;
    setBulkLoading(true);
    const languages = movie.translations.filter((t) => t.status !== "Done").map((t) => t.language);
    const n = await bulkAiTranslateAndRoute(movie.id, languages);
    setBulkLoading(false);
    toast(n > 0 ? `AI-translated ${n} language${n === 1 ? "" : "s"} and sent for review.` : "Nothing left to translate — all languages are already done.");
  }

  async function handleAiSingle(language: string) {
    if (!movie) return;
    await bulkAiTranslateAndRoute(movie.id, [language]);
    toast(`${language} translated with AI and sent for review.`);
  }

  return (
    <div className="min-h-full">
      <Header />
      <div className="flex flex-col gap-7 px-12 py-10">
        <Link to="/producer" className="flex items-center gap-1 text-text-secondary hover:text-text-primary">
          <Icon name="arrow_back" className="!text-sm" />
          <span className="text-[13px] font-semibold">All Movies</span>
        </Link>

        <div className="flex items-start justify-between rounded-lg bg-bg-surface px-7 py-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-[26px] font-bold text-text-primary">{movie.title}</h1>
            <div className="flex w-full gap-6">
              <Meta label="Director" value={movie.director} />
              <Meta label="Deadline" value={formatDate(movie.deadline)} />
              <Meta label="Status" value={movie.status} />
              <div className="flex w-[200px] flex-col gap-1">
                <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">
                  TRANSLATION PROGRESS
                </span>
                <ProgressBar done={done} total={total} status={movie.status} />
              </div>
            </div>
            <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">ORIGINAL SYNOPSIS</span>
            <p className="w-[560px] text-[13px] text-text-secondary">{movie.originalSynopsis}</p>
          </div>
          <MovieActionsMenu movie={movie} showViewDetails={false} />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Translations by Language</h2>
          <button
            onClick={handleBulkAi}
            disabled={bulkLoading}
            className="flex items-center gap-2 rounded bg-accent-red px-5 py-3 text-[13px] font-semibold text-text-primary disabled:opacity-60"
          >
            <Icon name="auto_awesome" className="!text-base" />
            {bulkLoading ? "Translating…" : `Translate all ${total} with AI`}
          </button>
        </div>

        <div className="flex h-9 items-center justify-between">
          <div className="flex h-9 w-[280px] items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 text-text-tertiary">
            <Icon name="search" className="!text-base" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language or translator"
              className="w-full bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </div>
          <div className="flex items-center gap-2">
            {counts.map((c) => (
              <button
                key={c.label}
                onClick={() => setFilter(c.label)}
                className={`rounded-full px-3 py-2 text-xs font-semibold ${
                  filter === c.label
                    ? "bg-accent-red text-text-primary"
                    : "border border-border-default text-text-primary"
                }`}
              >
                {c.label} · {c.count}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-px rounded-lg bg-border-default">
          <div className="flex items-center gap-4 rounded-t-lg bg-bg-elevated px-6 py-3.5">
            <Th className="w-[220px]">Language</Th>
            <Th className="w-[260px]">Assigned Translator</Th>
            <Th className="w-[130px]">Assigned On</Th>
            <Th className="w-[110px]">Days Spent</Th>
            <Th className="w-[170px]">Status</Th>
            <Th className="w-[140px]">Comments</Th>
            <Th className="w-[90px] text-right">AI</Th>
          </div>

          {filtered.map((t, i) => (
            <LanguageRow
              key={t.language}
              t={t}
              alt={i % 2 === 1}
              isLast={i === filtered.length - 1}
              translators={translators}
              assignOpen={openAssign === t.language}
              onToggleAssign={() => setOpenAssign(openAssign === t.language ? null : t.language)}
              onAssign={(id) => {
                assignTranslator(movie.id, t.language, id);
                setOpenAssign(null);
              }}
              onAiTranslate={() => handleAiSingle(t.language)}
              onOpenDetail={() => navigate(`/producer/movie/${movie.id}/${encodeURIComponent(t.language)}`)}
            />
          ))}
        </div>

        <p className="pt-2 text-[13px] text-text-tertiary">
          Showing {filtered.length} of {total} languages. Synopses supports up to 190 languages in production —
          this prototype seeds {total} representative languages per movie to keep the demo fast to click through.
        </p>
      </div>
    </div>
  );
}

function LanguageRow({
  t,
  alt,
  isLast,
  translators,
  assignOpen,
  onToggleAssign,
  onAssign,
  onAiTranslate,
  onOpenDetail,
}: {
  t: Translation;
  alt: boolean;
  isLast: boolean;
  translators: { id: string; name: string }[];
  assignOpen: boolean;
  onToggleAssign: () => void;
  onAssign: (id: string | null) => void;
  onAiTranslate: () => void;
  onOpenDetail: () => void;
}) {
  const translatorName = translators.find((u) => u.id === t.assignedTranslatorId)?.name;
  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 ${alt ? "bg-bg-elevated" : "bg-bg-surface"} ${
        isLast ? "rounded-b-lg" : ""
      }`}
    >
      <button
        onClick={onOpenDetail}
        className="w-[220px] truncate text-left text-[14px] font-semibold text-text-primary hover:text-accent-red hover:underline"
      >
        {t.language}
      </button>
      <div className="relative w-[260px]">
        <button
          onClick={onToggleAssign}
          className="flex h-8 w-[220px] items-center justify-between rounded-md border border-border-default bg-bg-elevated px-3 text-[13px]"
        >
          <span className={translatorName ? "text-text-primary" : "text-text-tertiary"}>
            {translatorName ?? "Unassigned"}
          </span>
          <Icon name="expand_more" className="!text-base text-text-tertiary" />
        </button>
        {assignOpen && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-40 w-[220px] rounded-lg border border-border-default bg-bg-elevated p-1.5 shadow-2xl">
            <button
              onClick={() => onAssign(null)}
              className="w-full rounded px-2.5 py-2 text-left text-[13px] text-text-tertiary hover:bg-bg-surface"
            >
              Unassigned
            </button>
            {translators.map((tr) => (
              <button
                key={tr.id}
                onClick={() => onAssign(tr.id)}
                className="w-full rounded px-2.5 py-2 text-left text-[13px] text-text-primary hover:bg-bg-surface"
              >
                {tr.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="w-[130px] text-[13px] text-text-secondary">
        {t.assignedDate ? formatDate(t.assignedDate) : "—"}
      </div>
      <div className="w-[110px] text-[13px] text-text-secondary">{t.daysSpent ? `${t.daysSpent} days` : "—"}</div>
      <div className="flex w-[170px] flex-col gap-0.5">
        <StatusBadge status={t.status} />
        {t.status === "Blocked" && t.blockedReason && (
          <span className="text-[11px] font-medium text-status-blocked">{t.blockedReason}</span>
        )}
      </div>
      <div className="w-[140px] text-[13px] text-text-secondary">
        {t.comments.length > 0 ? (
          <span className="flex items-center gap-1">
            <Icon name="chat_bubble_outline" className="!text-sm" />
            {t.comments.length}
          </span>
        ) : (
          "—"
        )}
      </div>
      <div className="flex w-[90px] justify-end">
        {t.status !== "Done" && (
          <button
            onClick={onAiTranslate}
            title="Translate this language with AI"
            className="flex size-8 items-center justify-center rounded text-accent-red hover:bg-bg-elevated"
          >
            <Icon name="auto_awesome" className="!text-base" />
          </button>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-xs font-semibold tracking-wide text-text-tertiary ${className}`}>{children}</div>
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
