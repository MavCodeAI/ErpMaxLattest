import React, { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AccessibleButtonProps extends ButtonProps {
  loading?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ loading, children, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

export { AccessibleButton };
