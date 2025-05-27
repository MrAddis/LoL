import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 20"
      aria-label="LoL Insights Logo"
      className="h-8 w-auto"
      {...props}
    >
      <text
        x="0"
        y="15"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="16"
        fontWeight="bold"
        fill="hsl(var(--primary))"
      >
        LoL
      </text>
      <text
        x="30"
        y="15"
        fontFamily="var(--font-geist-sans), sans-serif"
        fontSize="16"
        fill="hsl(var(--foreground))"
      >
        Insights
      </text>
    </svg>
  );
}
