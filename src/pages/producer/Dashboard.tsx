import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { Header } from "../../components/Header";
import { Icon } from "../../components/Icon";
import { StatusBadge, StatusLegend } from "../../components/StatusBadge";
import { ProgressBar } from "../../components/ProgressBar";
import { MovieActionsMenu } from "../../components/MovieActionsMenu";

export default function Dashboard() {
  const movies = useStore((s) => s.movies);
  const navigate = useNavigate();

  return (
    <div className="min-h-full">
      <Header>
        <button
          onClick={() => navigate("/producer/create")}
          className="flex items-center gap-2 rounded bg-accent-red px-6 py-3 text-[15px] font-semibold text-text-primary hover:brightness-110"
        >
          <Icon name="add" className="!text-lg" />
          Create
        </button>
      </Header>

      <div className="flex flex-col gap-6 px-12 py-10">
        <div className="flex h-10 items-center justify-between">
          <h1 className="text-[28px] font-bold text-text-primary">All Movies</h1>
          <StatusLegend statuses={["To do", "In progress", "Blocked", "Done"]} />
        </div>

        <div className="flex flex-col gap-px rounded-lg bg-border-default">
          <div className="flex items-center gap-4 rounded-t-lg bg-bg-elevated px-6 py-3.5">
            <div className="flex-1 text-xs font-semibold tracking-wide text-text-tertiary">MOVIE</div>
            <div className="w-[150px] text-xs font-semibold tracking-wide text-text-tertiary">DEADLINE</div>
            <div className="w-[170px] text-xs font-semibold tracking-wide text-text-tertiary">DIRECTOR</div>
            <div className="w-[150px] text-xs font-semibold tracking-wide text-text-tertiary">STATUS</div>
            <div className="w-[280px] text-xs font-semibold tracking-wide text-text-tertiary">
              TRANSLATION PROGRESS
            </div>
            <div className="w-[100px] text-right text-xs font-semibold tracking-wide text-text-tertiary">
              ACTIONS
            </div>
          </div>

          {movies.length === 0 && (
            <div className="rounded-b-lg bg-bg-surface px-6 py-10 text-center text-sm text-text-tertiary">
              No movies yet — click Create to add your first synopsis.
            </div>
          )}

          {movies.map((movie, i) => {
            const done = movie.translations.filter((t) => t.status === "Done").length;
            const total = movie.translations.length;
            return (
              <div
                key={movie.id}
                onClick={() => navigate(`/producer/movie/${movie.id}`)}
                className={`group flex cursor-pointer items-center gap-4 px-6 py-[18px] hover:bg-bg-elevated ${
                  i % 2 === 0 ? "bg-bg-surface" : "bg-bg-elevated"
                } ${i === movies.length - 1 ? "rounded-b-lg" : ""}`}
              >
                <div className="flex-1 truncate">
                  <span className="text-[15px] font-semibold text-text-primary group-hover:text-accent-red group-hover:underline">
                    {movie.title}
                  </span>
                </div>
                <div className="w-[150px] text-[13px] text-text-secondary">{formatDate(movie.deadline)}</div>
                <div className="w-[170px] text-[13px] text-text-secondary">{movie.director}</div>
                <div className="w-[150px]">
                  <StatusBadge status={movie.status} />
                </div>
                <div className="w-[280px]">
                  <ProgressBar done={done} total={total} status={movie.status} />
                </div>
                <div className="flex w-[100px] justify-end" onClick={(e) => e.stopPropagation()}>
                  <MovieActionsMenu movie={movie} showViewDetails />
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
