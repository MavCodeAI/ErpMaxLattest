import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const SkipLinks = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed top-4 left-4 z-50 space-y-2 transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      id="skip-links"
    >
      <Button variant="outline" size="sm" asChild className="bg-background shadow-lg">
        <a href="#main-content">Skip to main content</a>
      </Button>
      <Button variant="outline" size="sm" asChild className="bg-background shadow-lg">
        <a href="#navigation">Skip to navigation</a>
      </Button>
      <Button variant="outline" size="sm" asChild className="bg-background shadow-lg">
        <a href="#filters">Skip to filters</a>
      </Button>
    </div>
  );
};
