import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageSectionProps = {
  id: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headingClassName?: string;
  containerClassName?: string;
};

export function PageSection({
  id,
  title,
  description,
  actions,
  children,
  className,
  headingClassName,
  containerClassName,
}: PageSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn('flex flex-col gap-6', className)}
    >
      {(title || description || actions) && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
          <div className={cn('space-y-2', containerClassName)}>
            {title && (
              <h2
                id={title ? `${id}-title` : undefined}
                className={cn('text-2xl font-semibold text-white sm:text-3xl lg:text-4xl', headingClassName)}
              >
                {title}
              </h2>
            )}
            {description && <p className="text-sm sm:text-base text-white/70">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-3 text-sm sm:text-base">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
