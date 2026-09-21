interface ProgressBarProps {
  value: number; // 0-100
  height?: number;
  className?: string;
}

export function ProgressBar({ value, height = 8, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full rounded-full bg-[var(--color-grey-100)] overflow-hidden ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-[var(--color-green-500)] transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
