import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export type FlowStep = 'login' | 'plan' | 'go-live';

const FLOW_STEPS: Array<{ id: FlowStep; label: string }> = [
  { id: 'login', label: 'Log in' },
  { id: 'plan', label: 'Choose plan' },
  { id: 'go-live', label: 'Go live' },
];

interface FlowBreadcrumbProps {
  currentStep: FlowStep;
  className?: string;
}

export const FlowBreadcrumb = ({ currentStep, className }: FlowBreadcrumbProps) => (
  <Breadcrumb className={className}>
    <BreadcrumbList>
      {FLOW_STEPS.map((step, index) => (
        <BreadcrumbItem
          key={step.id}
          className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground"
        >
          {step.id === currentStep ? (
            <BreadcrumbPage className="rounded-full bg-primary/20 px-3 py-1 text-primary-foreground">
              {step.label}
            </BreadcrumbPage>
          ) : (
            <span className="rounded-full bg-background/60 px-3 py-1">{step.label}</span>
          )}
          {index < FLOW_STEPS.length - 1 && (
            <BreadcrumbSeparator className="text-muted-foreground" />
          )}
        </BreadcrumbItem>
      ))}
    </BreadcrumbList>
  </Breadcrumb>
);

export default FlowBreadcrumb;
