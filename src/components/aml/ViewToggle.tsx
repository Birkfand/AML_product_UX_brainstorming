import { LayoutGrid, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "architecture" | "product";

interface Props {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}

const options: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: "architecture", label: "Architecture", icon: LayoutGrid },
  { id: "product", label: "Product", icon: UserRound },
];

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {options.map((o) => {
        const Icon = o.icon;
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all",
              active
                ? "bg-state-active/15 text-state-active shadow-[0_0_18px_-6px_var(--state-active)]"
                : "text-white/60 hover:text-white/90 hover:bg-white/[0.04]",
            )}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
