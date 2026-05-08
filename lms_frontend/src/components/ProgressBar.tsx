"use client";

interface ProgressBarProps {
  progress: number; // 0 - 100
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({ progress, label, showPercent = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  const colorClass =
    clamped < 30
      ? "bg-red-500"
      : clamped < 60
      ? "bg-yellow-400"
      : clamped < 90
      ? "bg-blue-500"
      : "bg-green-500";

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-foreground/70">{label}</span>}
          {showPercent && (
            <span className="text-xs font-bold text-foreground/80">{clamped}%</span>
          )}
        </div>
      )}
      {/* Track */}
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
