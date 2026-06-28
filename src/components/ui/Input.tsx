import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-2xl border-2 bg-white px-4 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-charcoal/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error
            ? "border-red-500 focus-visible:border-red-500"
            : "border-brand-charcoal/20 focus-visible:border-brand-indigo",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
