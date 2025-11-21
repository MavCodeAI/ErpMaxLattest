import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const GlobalSearch = () => {
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Add a small delay to ensure the element is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleResultClick = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Trigger */}
      <Button
        variant="outline"
        className="flex items-center gap-2 w-full sm:w-64 justify-between text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(true)}
        aria-label="Open global search"
        aria-expanded={isOpen}
        aria-controls="global-search-modal"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search...</span>
        </div>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-search-title"
          id="global-search-modal"
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-2xl mx-4 bg-background border rounded-lg shadow-lg z-10">
            {/* Search Input */}
            <div className="flex items-center gap-2 p-4 border-b">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search across all modules..."
                className="flex-1 bg-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search input"
                role="searchbox"
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto" role="listbox">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="px-4 py-3 hover:bg-muted cursor-pointer border-b last:border-b-0 focus:bg-muted focus:outline-none"
                        onClick={() => handleResultClick(result.url)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleResultClick(result.url);
                          }
                        }}
                        tabIndex={0}
                        role="option"
                        aria-selected="false"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{result.title}</h3>
                          <Badge variant="secondary">{result.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  </div>
                )
              ) : (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground">Start typing to search across all modules</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Press <kbd className="px-2 py-1 rounded border bg-muted text-xs">ESC</kbd> to close
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
