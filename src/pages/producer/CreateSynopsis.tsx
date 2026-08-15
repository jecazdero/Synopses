import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { toast } from "../../components/Toast";
import { LANGUAGES } from "../../types";

type Method = "scratch" | "gdocs" | "excel";

interface Row {
  language: string;
  method: "AI" | "Manual";
  translatorId: string | null;
}

const DEFAULT_LANGUAGES = LANGUAGES.slice(0, 8);

export default function CreateSynopsis() {
  const navigate = useNavigate();
  const createMovie = useStore((s) => s.createMovie);
  const assignTranslator = useStore((s) => s.assignTranslator);
  const users = useStore((s) => s.users);
  const translators = useMemo(() => users.filter((u) => u.role === "Translator"), [users]);

  const [method, setMethod] = useState<Method>("scratch");
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [deadline, setDeadline] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [docLink, setDocLink] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<Row[]>(
    DEFAULT_LANGUAGES.map((language) => ({ language, method: "AI", translatorId: null })),
  );
  const [openAssignFor, setOpenAssignFor] = useState<string | null>(null);
  const [addLangOpen, setAddLangOpen] = useState(false);

  const remainingLanguages = LANGUAGES.filter((l) => !rows.some((r) => r.language === l));

  function updateRow(language: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.language === language ? { ...r, ...patch } : r)));
  }

  function handleExcelPick(file: File) {
    const base = file.name.replace(/\.(xlsx|csv)$/i, "");
    setTitle((t) => t || base);
    setSynopsis(
      (s) =>
        s ||
        "Imported synopsis text would appear here — spreadsheet parsing is stubbed for this prototype.",
    );
    toast(`Imported “${file.name}” (mocked — parsing is stubbed).`);
  }

  function handleDocImport() {
    if (!docLink) return;
    setSynopsis(
      (s) =>
        s ||
        "Imported synopsis text would appear here — Google Docs parsing is stubbed for this prototype.",
    );
    toast("Imported from Google Docs (mocked — parsing is stubbed).");
  }

  function autoAssign() {
    const available = [...translators].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    let i = 0;
    setRows((rs) =>
      rs.map((r) => {
        if (r.method !== "Manual" || r.translatorId) return r;
        const pick = available[i % available.length];
        i += 1;
        return { ...r, translatorId: pick?.id ?? null };
      }),
    );
    toast("Auto-assigned translators by rating & availability.");
  }

  function translateAllWithAi() {
    setRows((rs) => rs.map((r) => ({ ...r, method: "AI", translatorId: null })));
  }

  const canCreate = title.trim() && director.trim() && deadline && synopsis.trim();

  function handleCreate() {
    if (!canCreate) return;
    const movieId = createMovie({
      title: title.trim(),
      director: director.trim(),
      deadline,
      originalSynopsis: synopsis.trim(),
      languages: rows.map((r) => r.language),
    });
    rows.forEach((r) => {
      if (r.method === "Manual" && r.translatorId) {
        assignTranslator(movieId, r.language, r.translatorId);
      }
    });
    toast(`“${title.trim()}” created.`);
    navigate(`/producer/movie/${movieId}`);
  }

  return (
    <div className="min-h-full">
      <Header />
      <div className="flex flex-col gap-[18px] px-12 pb-6 pt-7">
        <Link to="/producer" className="flex items-center gap-1 text-text-secondary hover:text-text-primary">
          <Icon name="arrow_back" className="!text-sm" />
          <span className="text-[13px] font-semibold">All Movies</span>
        </Link>
        <h1 className="text-[28px] font-bold text-text-primary">Create New Synopsis</h1>

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">HOW WOULD YOU LIKE TO START?</span>
          <div className="flex gap-4">
            <MethodCard
              active={method === "scratch"}
              icon="edit_note"
              title="Start from scratch"
              subtitle="Enter movie details manually"
              onClick={() => setMethod("scratch")}
            />
            <MethodCard
              active={method === "gdocs"}
              icon="description"
              title="Upload from Google Docs"
              subtitle="Import synopsis from a Doc link"
              onClick={() => setMethod("gdocs")}
            />
            <MethodCard
              active={method === "excel"}
              icon="table_chart"
              title="Upload from Excel"
              subtitle="Import a spreadsheet of movies"
              onClick={() => {
                setMethod("excel");
                fileRef.current?.click();
              }}
            />
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleExcelPick(f);
              }}
            />
          </div>
          {method === "gdocs" && (
            <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface p-2">
              <input
                value={docLink}
                onChange={(e) => setDocLink(e.target.value)}
                placeholder="Paste Google Docs link…"
                className="input"
              />
              <button
                onClick={handleDocImport}
                className="shrink-0 rounded bg-accent-red px-4 py-2.5 text-[13px] font-semibold text-text-primary"
              >
                Import
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-semibold tracking-wide text-text-tertiary">MOVIE DETAILS</span>
          <div className="flex gap-5">
            <Field label="Movie Name" className="w-[420px]">
              <input className="input" placeholder="e.g. Crimson Tide" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Director" className="w-[300px]">
              <input
                className="input"
                placeholder="Director's full name"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
              />
            </Field>
            <Field label="Translation Deadline" className="w-[240px]">
              <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
          </div>
          <Field label="Original Synopsis">
            <textarea
              className="input h-20 resize-none py-3"
              placeholder="Paste or write the original synopsis here..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex h-10 items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-bold text-text-primary">Assign Translators by Language</h2>
              <p className="text-xs text-text-secondary">Choose AI translation or assign a Translator, per language</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={autoAssign}
                className="flex items-center gap-2 rounded border border-border-default px-4 py-2.5 text-[13px] font-semibold text-text-primary"
              >
                <Icon name="smart_toy" className="!text-base" />
                Auto-assign by rating &amp; availability
              </button>
              <button
                onClick={translateAllWithAi}
                className="flex items-center gap-2 rounded bg-accent-red px-4 py-2.5 text-[13px] font-semibold text-text-primary"
              >
                <Icon name="auto_awesome" className="!text-base" />
                Translate all {rows.length} with AI
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-px rounded-lg bg-border-default">
            <div className="flex items-center gap-4 rounded-t-lg bg-bg-elevated px-6 py-3.5">
              <div className="w-[280px] text-xs font-semibold tracking-wide text-text-tertiary">Language</div>
              <div className="w-[220px] text-xs font-semibold tracking-wide text-text-tertiary">Translation Method</div>
              <div className="w-[260px] text-xs font-semibold tracking-wide text-text-tertiary">Assign Translator</div>
              <div className="text-xs font-semibold tracking-wide text-text-tertiary">Days to Complete</div>
            </div>
            {rows.map((r, i) => {
              const translatorName = translators.find((t) => t.id === r.translatorId)?.name;
              return (
                <div
                  key={r.language}
                  className={`flex items-center gap-4 bg-bg-surface px-6 py-3.5 ${
                    i === rows.length - 1 ? "rounded-b-lg" : ""
                  }`}
                >
                  <div className="w-[280px] text-sm font-semibold text-text-primary">{r.language}</div>
                  <div className="w-[220px]">
                    <div className="inline-flex gap-0.5 rounded-full bg-bg-elevated p-0.5">
                      <button
                        onClick={() => updateRow(r.language, { method: "AI", translatorId: null })}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                          r.method === "AI" ? "bg-accent-red text-text-primary" : "text-text-primary"
                        }`}
                      >
                        <Icon name="auto_awesome" className="!text-sm" />
                        AI
                      </button>
                      <button
                        onClick={() => updateRow(r.language, { method: "Manual" })}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                          r.method === "Manual" ? "bg-accent-red text-text-primary" : "text-text-primary"
                        }`}
                      >
                        <Icon name="person" className="!text-sm" />
                        Manual
                      </button>
                    </div>
                  </div>
                  <div className="relative w-[260px]">
                    {r.method === "AI" ? (
                      <span className="text-[13px] text-text-tertiary">— (AI translation)</span>
                    ) : (
                      <>
                        <button
                          onClick={() => setOpenAssignFor(openAssignFor === r.language ? null : r.language)}
                          className="flex h-8 w-[220px] items-center justify-between rounded-md border border-border-default bg-bg-elevated px-3 text-[13px]"
                        >
                          <span className={translatorName ? "text-text-primary" : "text-text-tertiary"}>
                            {translatorName ?? "Select translator..."}
                          </span>
                          <Icon name="expand_more" className="!text-base text-text-tertiary" />
                        </button>
                        {openAssignFor === r.language && (
                          <div className="absolute left-0 top-[calc(100%+4px)] z-40 w-[220px] rounded-lg border border-border-default bg-bg-elevated p-1.5 shadow-2xl">
                            {translators.map((t) => (
                              <button
                                key={t.id}
                                onClick={() => {
                                  updateRow(r.language, { translatorId: t.id });
                                  setOpenAssignFor(null);
                                }}
                                className="w-full rounded px-2.5 py-2 text-left text-[13px] text-text-primary hover:bg-bg-surface"
                              >
                                {t.name} <span className="text-text-tertiary">★{t.rating}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-[13px] text-text-secondary">{r.method === "AI" ? "Instant" : "Est. 5–7 days"}</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-tertiary">
              Showing {rows.length} of 190 languages — remaining languages default to AI translation unless assigned
            </p>
            <div className="relative">
              <button
                onClick={() => setAddLangOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded border border-border-default px-3 py-2 text-xs font-semibold text-text-primary disabled:opacity-40"
                disabled={remainingLanguages.length === 0}
              >
                <Icon name="add" className="!text-sm" />
                Add language
              </button>
              {addLangOpen && (
                <div className="absolute right-0 top-[calc(100%+4px)] z-40 max-h-64 w-56 overflow-y-auto rounded-lg border border-border-default bg-bg-elevated p-1.5 shadow-2xl">
                  {remainingLanguages.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setRows((rs) => [...rs, { language: l, method: "AI", translatorId: null }]);
                        setAddLangOpen(false);
                      }}
                      className="w-full rounded px-2.5 py-2 text-left text-[13px] text-text-primary hover:bg-bg-surface"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/producer")}
            className="rounded border border-border-default px-6 py-3 text-sm font-semibold text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="rounded bg-accent-red px-6 py-3 text-sm font-semibold text-text-primary disabled:opacity-50"
            title={canCreate ? undefined : "Fill in movie name, director, deadline, and synopsis first"}
          >
            Create Synopsis
          </button>
        </div>
      </div>
    </div>
  );
}

function MethodCard({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-[100px] flex-1 flex-col items-start gap-2 rounded-lg p-5 text-left ${
        active ? "border-2 border-accent-red bg-bg-elevated" : "border border-border-default bg-bg-surface"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon name={icon} className={active ? "!text-xl text-accent-red" : "!text-xl text-text-secondary"} />
        <span className="text-[15px] font-semibold text-text-primary">{title}</span>
      </div>
      <span className="text-xs text-text-secondary">{subtitle}</span>
    </button>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[10px] font-semibold tracking-wide text-text-tertiary">{label.toUpperCase()}</span>
      {children}
    </div>
  );
}
