import { memo } from "react";
const StepDivider = memo(function StepDivider() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 25 70"
      preserveAspectRatio="xMidYMid meet"
      className="block h-full w-5 shrink-0 text-zinc-300 md:w-12"
    >
      <path
        d="M1 1L23.6667 35L1 69"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

export { StepDivider };
