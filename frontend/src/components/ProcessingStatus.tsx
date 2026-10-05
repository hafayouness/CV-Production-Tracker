import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type Step = { label: string; state: "todo" | "running" | "done" };

export default function ProcessingStatus({ steps }: { steps: Step[] }) {
  return (
    <ol className="steps">
      {steps.map((s) => (
        <li key={s.label} className={`step ${s.state}`}>
          {s.state === "done" ? (
            <CheckCircle2 size={18} />
          ) : s.state === "running" ? (
            <Loader2 size={18} className="spin" />
          ) : (
            <Circle size={18} />
          )}
          <span>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
