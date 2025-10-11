import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Type,
  Eye,
  Edit3
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  showPreview?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your text...",
  disabled = false,
  className = "",
  maxLength,
  showPreview = true,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatCommands = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertText("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic", 
      action: () => insertText("*", "*"),
    },
    {
      icon: Underline,
      label: "Underline",
      action: () => insertText("<u>", "</u>"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertText("> "),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertText("- "),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertText("1. "),
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertText("[", "](url)"),
    },
  ];

  const renderPreview = (text: string) => {
    // Simple markdown-like rendering
    let rendered = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');

    // Wrap consecutive list items
    rendered = rendered.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

    return rendered;
  };

  const characterCount = value.length;
  const isOverLimit = maxLength ? characterCount > maxLength : false;

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            {formatCommands.map((command, index) => {
              const Icon = command.icon;
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={command.action}
                      disabled={disabled || isPreviewMode}
                      className="h-8 w-8 p-0"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{command.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          {maxLength && (
            <Badge variant={isOverLimit ? "destructive" : "secondary"} className="text-xs">
              {characterCount}/{maxLength}
            </Badge>
          )}
          
          {showPreview && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPreviewMode ? "Edit" : "Preview"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {isPreviewMode ? (
          <div 
            className="p-3 min-h-[100px] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[100px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={maxLength}
          />
        )}
      </div>

      {/* Footer */}
      {!isPreviewMode && (
        <div className="p-2 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Supports: **bold**, *italic*, [links](url), > quotes, - lists
          </p>
        </div>
      )}
    </div>
  );
};