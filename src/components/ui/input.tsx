import * as React from "react";

import { cn } from "@/lib/utils";
import { isArabicText } from "@/lib/arabicUtils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [isArabic, setIsArabic] = React.useState(false);

  React.useEffect(() => {
    if (props.value && typeof props.value === 'string') {
      setIsArabic(isArabicText(props.value));
    } else if (props.placeholder && typeof props.placeholder === 'string') {
      // Fallback: detect from placeholder to apply RTL when field is empty
      setIsArabic(isArabicText(props.placeholder));
    } else {
      setIsArabic(false);
    }
  }, [props.value, props.placeholder]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          isArabic && "arabic-text-serif font-arabic-serif",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
