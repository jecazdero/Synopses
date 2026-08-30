import { useState } from "react";
import { Modal } from "./Modal";
import { Icon } from "./Icon";

export function SetAbsenceModal({
  onClose,
  onSubmit,
  note,
}: {
  onClose: () => void;
  onSubmit: (reason: "Sick leave" | "PTO", startDate: string, endDate: string) => void;
  note: string;
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
          {note}
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
