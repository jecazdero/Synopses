import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Movie } from "../types";
import { useStore } from "../store";
import { KebabMenu, type KebabAction } from "./KebabMenu";
import { Modal } from "./Modal";
import { Icon } from "./Icon";
import { toast } from "./Toast";

/** Shared kebab menu + modals for the status-gated movie action matrix (brief §6.1/§6.2). */
export function MovieActionsMenu({
  movie,
  showViewDetails,
}: {
  movie: Movie;
  showViewDetails: boolean;
}) {
  const navigate = useNavigate();
  const deleteMovie = useStore((s) => s.deleteMovie);
  const updateMovieMeta = useStore((s) => s.updateMovieMeta);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [form, setForm] = useState({
    title: movie.title,
    director: movie.director,
    deadline: movie.deadline,
    originalSynopsis: movie.originalSynopsis,
  });

  const canEdit = movie.status !== "Done";
  const canDownloadShare = movie.status === "Done";

  const actions: KebabAction[] = [];
  if (showViewDetails) {
    actions.push({ label: "View Details", icon: "visibility", onClick: () => navigate(`/producer/movie/${movie.id}`) });
  }
  if (canEdit) {
    actions.push({ label: "Update Synopsis", icon: "edit", onClick: () => setEditOpen(true) });
  }
  if (canDownloadShare) {
    actions.push({
      label: "Download all translations",
      icon: "download",
      onClick: () => toast(`Downloading all translations for “${movie.title}”… (mocked export)`),
    });
    actions.push({ label: "Share translations via link", icon: "ios_share", onClick: () => setShareOpen(true) });
  }
  actions.push({ label: "Delete Synopsis", icon: "delete", danger: true, onClick: () => setConfirmDelete(true) });

  const shareUrl = `https://synopses.app/share/${movie.id}`;

  return (
    <>
      <KebabMenu actions={actions} />

      {confirmDelete && (
        <Modal title="Delete synopsis?" onClose={() => setConfirmDelete(false)} width="420px">
          <p className="text-sm text-text-secondary">
            This permanently removes <span className="text-text-primary font-semibold">{movie.title}</span> and all
            of its translations from Synopses. This can't be undone.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded px-5 py-2.5 text-sm font-semibold text-text-primary border border-border-default"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteMovie(movie.id);
                setConfirmDelete(false);
                toast(`Deleted “${movie.title}”.`);
                navigate("/producer");
              }}
              className="rounded bg-status-blocked px-5 py-2.5 text-sm font-semibold text-text-primary"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {editOpen && (
        <Modal title="Update Synopsis" onClose={() => setEditOpen(false)} width="560px">
          <div className="flex flex-col gap-4">
            <Field label="Movie Name">
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>
            <div className="flex gap-4">
              <Field label="Director" className="flex-1">
                <input
                  className="input"
                  value={form.director}
                  onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
                />
              </Field>
              <Field label="Translation Deadline" className="flex-1">
                <input
                  type="date"
                  className="input"
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Original Synopsis">
              <textarea
                className="input h-24 resize-none"
                value={form.originalSynopsis}
                onChange={(e) => setForm((f) => ({ ...f, originalSynopsis: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded px-5 py-2.5 text-sm font-semibold text-text-primary border border-border-default"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                updateMovieMeta(movie.id, form);
                setEditOpen(false);
                toast("Synopsis updated.");
              }}
              className="rounded bg-accent-red px-5 py-2.5 text-sm font-semibold text-text-primary"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {shareOpen && (
        <Modal title="Share translations via link" onClose={() => setShareOpen(false)} width="480px">
          <p className="mb-3 text-sm text-text-secondary">
            Anyone with this link can view all completed translations for{" "}
            <span className="text-text-primary font-semibold">{movie.title}</span>.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-2.5">
            <span className="flex-1 truncate text-[13px] text-text-secondary">{shareUrl}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl).catch(() => {});
                toast("Link copied to clipboard.");
              }}
              className="flex items-center gap-1.5 rounded bg-accent-red px-3 py-1.5 text-xs font-semibold text-text-primary"
            >
              <Icon name="content_copy" className="!text-sm" />
              Copy
            </button>
          </div>
        </Modal>
      )}
    </>
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
