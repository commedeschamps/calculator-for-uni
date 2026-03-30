import { cn } from '@/lib/utils';

export default function AituMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('aitu-mark', className)}
      fill="none"
    >
      <circle cx="12" cy="12" r="2.9" fill="#3b3026" />
      <circle
        cx="12"
        cy="12"
        r="5.6"
        stroke="#3b3026"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="8 6 11 10"
        transform="rotate(18 12 12)"
      />
      <circle
        cx="12"
        cy="12"
        r="8.2"
        stroke="#3aa9de"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeDasharray="7 5 9 11 8 12"
        transform="rotate(-34 12 12)"
      />
      <circle
        cx="12"
        cy="12"
        r="10.6"
        stroke="#3b3026"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeDasharray="13 8 16 14 10 20"
        transform="rotate(36 12 12)"
      />
    </svg>
  );
}
