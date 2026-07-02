"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-2xl font-heading font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden";

    const variants = {
      primary: "bg-brand-blue text-white hover:bg-brand-blue/90 shadow-[0_4px_0_0_#1a2333] active:shadow-[0_0px_0_0_#1a2333] active:translate-y-[4px]",
      secondary: "bg-brand-accent text-white hover:bg-brand-accent/90 shadow-[0_4px_0_0_#d9534f] active:shadow-[0_0px_0_0_#d9534f] active:translate-y-[4px]",
      outline: "border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue/5",
      ghost: "text-brand-charcoal hover:bg-black/5",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        <span className={cn(isLoading && "opacity-0")}>{children as React.ReactNode}</span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
