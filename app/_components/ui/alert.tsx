import type { HTMLAttributes } from "react";
import { cn } from "cn";

type AlertProps = HTMLAttributes<HTMLDivElement>;

function Alert({ className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "relative w-full rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Alert };
