"use client";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps } from "class-variance-authority";
import { Button as ShadButton, buttonVariants } from "../atoms/button";
import { Spinner } from "../atoms/spinner";
import { cn } from "cn";

export const Button = ({
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <ShadButton
      className={cn("relative", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="invisible">{children}</span>
          <Spinner className="absolute top-1/2 left-1/2 -translate-1/2" />
        </>
      ) : (
        children
      )}
    </ShadButton>
  );
};

export interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}
