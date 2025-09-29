import * as React from "react";

import { cn } from "@/lib/utils";
import { isArabicText } from "@/lib/arabicUtils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  const [isArabic, setIsArabic] = React.useState(false);

  React.useEffect(() => {
    if (props.value && typeof props.value === 'string') {
      setIsArabic(isArabicText(props.value));
    } else if (props.placeholder && typeof props.placeholder === 'string') {
      setIsArabic(isArabicText(props.placeholder));
    } else {
      setIsArabic(false);
    }
  }, [props.value, props.placeholder]);

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isArabic && "arabic-text-serif font-arabic-serif",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
