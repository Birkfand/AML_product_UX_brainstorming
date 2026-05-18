import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  act: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: "neutral" | "alert";
  className?: string;
}

/**
 * Page-of-a-storybook frame used by Act 1 and Act 3.
 * Cream paper-feel header strip with the act label, body holds the scene.
 */
export default function StoryCard({ act, title, subtitle, children, tone = "neutral", className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-popover/70 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur",
        tone === "alert" ? "border-state-alert/40" : "border-white/10",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-baseline justify-between border-b px-4 py-2",
          tone === "alert"
            ? "border-state-alert/30 bg-state-alert/5"
            : "border-white/10 bg-white/[0.03]",
        )}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-state-active/80">
            {act}
          </span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {subtitle && (
          <span className="hidden text-[11px] text-white/50 md:inline">{subtitle}</span>
        )}
      </header>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}
