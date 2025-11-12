import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm transition-all duration-200",
        "placeholder:text-muted-foreground/60",
        "hover:border-primary/50 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:shadow-md",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input",
        "resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
