import { ReactNode } from 'react';
import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const Tooltip = ({ children, content, side = 'top' }: TooltipProps) => {
  return (
    <TooltipProvider>
      <TooltipPrimitive>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="glass-card border border-white/20 bg-white/10 backdrop-blur-md text-white max-w-xs"
        >
          <p className="text-sm leading-relaxed">{content}</p>
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
};
