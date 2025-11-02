import { PropsWithChildren } from 'react';
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipProps {
  label: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ label, side = 'top', children }: PropsWithChildren<TooltipProps>) => (
  <TooltipProvider delayDuration={100} disableHoverableContent>
    <RadixTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-xs rounded-2xl border border-white/10 bg-background/90 px-3 py-2 text-sm text-foreground shadow-lg"
      >
        {label}
      </TooltipContent>
    </RadixTooltip>
  </TooltipProvider>
);
