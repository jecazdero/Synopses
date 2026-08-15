import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export interface KebabAction {
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
}

export function KebabMenu({ actions }: { actions: KebabAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex size-7 items-center justify-center rounded text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
        aria-label="Actions"
      >
        <Icon name="more_vert" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-[calc(100%+4px)] z-50 w-60 rounded-lg border border-border-default bg-bg-elevated p-1.5 shadow-2xl"
        >
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                setOpen(false);
                a.onClick();
              }}
              className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-[13px] font-medium hover:bg-bg-surface ${
                a.danger ? "text-status-blocked" : "text-text-primary"
              }`}
            >
              <Icon name={a.icon} className="!text-base" />
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
