import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { RoleSwitcher } from "./RoleSwitcher";

export function Header({ children }: { children?: ReactNode }) {
  return (
    <div className="flex w-full items-center justify-between bg-bg-surface px-12 py-6">
      <Link to="/" className="text-[22px] font-extrabold tracking-[1px] text-text-primary">
        SYNOPSES
      </Link>
      <div className="flex items-center gap-6">
        <RoleSwitcher />
        {children}
      </div>
    </div>
  );
}
