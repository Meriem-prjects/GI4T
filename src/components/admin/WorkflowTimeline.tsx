import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
}

interface WorkflowTimelineProps {
  currentStep: string | null;
  completedSteps: string[];
  steps: WorkflowStep[];
}

export const WorkflowTimeline = ({ currentStep, completedSteps, steps }: WorkflowTimelineProps) => {
  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (currentStep === stepId) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full bg-card border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Progression du workflow</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />
        
        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  status === 'completed' 
                    ? 'bg-green-500/10 border-green-500 text-green-500' 
                    : status === 'active'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-2">
                  <h4 className={`font-medium mb-1 ${
                    status === 'active' ? 'text-primary' : status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  
                  {status === 'active' && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
