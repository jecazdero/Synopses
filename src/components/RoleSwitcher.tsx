import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { Icon } from "./Icon";

const ROLE_HOME: Record<string, string> = {
  Producer: "/producer",
  Translator: "/translator",
  Reviewer: "/reviewer",
};

export function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const currentUser = users.find((u) => u.id === currentUserId);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <span>
          {currentUser.role} · {currentUser.name}
        </span>
        <Icon name="expand_more" className="!text-base" />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-lg border border-border-default bg-bg-elevated p-1.5 shadow-2xl z-50">
          <p className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-text-tertiary">
            DEMO: SWITCH PERSONA
          </p>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setCurrentUser(u.id);
                setOpen(false);
                navigate(ROLE_HOME[u.role]);
              }}
              className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-sm hover:bg-bg-surface ${
                u.id === currentUserId ? "text-accent-red font-semibold" : "text-text-primary"
              }`}
            >
              <span>{u.name}</span>
              <span className="text-xs text-text-tertiary">{u.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
