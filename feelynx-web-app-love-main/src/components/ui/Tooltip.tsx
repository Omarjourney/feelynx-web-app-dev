import { ReactNode, useId } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export const Tooltip = ({ label, children }: TooltipProps) => {
  const tooltipId = useId();

  return (
    <span
      className="group relative inline-flex"
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      {children}
      <span
        role="tooltip"
        id={tooltipId}
        className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1 text-xs text-white shadow-lg group-focus:block group-hover:block"
      >
        {label}
      </span>
    </span>
  );
};
