interface ProgressBarProps {
  value: number; // 0-100
  height?: number;
  className?: string;
  color?: 'green' | 'blue';
}

const FILL_COLOR = {
  green: 'var(--color-green-500)',
  blue: 'var(--color-blue-500)',
};

export function ProgressBar({ value, height = 8, className = '', color = 'green' }: ProgressBarProps) {
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
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: FILL_COLOR[color] }}
      />
    </div>
  );
}
