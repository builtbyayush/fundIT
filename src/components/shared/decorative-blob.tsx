import { cn } from "@/lib/utils";

interface DecorativeBlobProps {
  className?: string;
}

export function DecorativeBlob({ className }: DecorativeBlobProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <svg
        className="absolute -left-20 -top-24 h-72 w-72 text-pastel-lavender"
        viewBox="0 0 280 280"
        fill="none"
      >
        <circle cx="140" cy="140" r="140" fill="currentColor" />
      </svg>
      <svg
        className="absolute -right-16 top-1/4 h-56 w-56 text-pastel-peach"
        viewBox="0 0 220 220"
        fill="none"
      >
        <ellipse cx="110" cy="110" rx="110" ry="90" fill="currentColor" />
      </svg>
      <svg
        className="absolute -bottom-10 left-1/3 h-40 w-40 text-pastel-mint"
        viewBox="0 0 160 160"
        fill="none"
      >
        <circle cx="80" cy="80" r="80" fill="currentColor" />
      </svg>
    </div>
  );
}
