import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  icon?: LucideIcon;
  className?: string;
}

export const LoadingSpinner = ({ size = "md", text, icon: Icon, className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Icon ? (
        <Icon className={cn("animate-spin", sizeClasses[size])} />
      ) : (
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      )}
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
};

export const FullPageLoading = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-center text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};
