import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { announceToScreenReader } from "@/utils/accessibility";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  minHeight?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

interface ToolbarButtonProps {
  command: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  command,
  icon: Icon,
  label,
  shortcut,
  isActive = false,
  disabled = false,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      document.execCommand(command, false, undefined);
    }
    announceToScreenReader(`${label} ${isActive ? 'removed' : 'applied'}`, 'polite');
  };

  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      className={cn(
        "h-8 w-8 p-0 min-h-[32px] min-w-[32px]",
        isActive && "bg-secondary"
      )}
      onClick={handleClick}
      disabled={disabled}
      ariaLabel={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      ariaPressed={isActive}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className,
  disabled = false,
  maxLength,
  minHeight = "120px",
  ariaLabel = "Rich text editor",
  ariaDescribedBy,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectionState, setSelectionState] = useState({
    bold: false,
    italic: false,
    underline: false,
    orderedList: false,
    unorderedList: false,
  });
  
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    const updateCounts = () => {
      if (editorRef.current) {
        const text = editorRef.current.textContent || '';
        setCharCount(text.length);
        setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      }
    };

    updateCounts();
  }, [value]);

  const updateSelectionState = () => {
    setSelectionState({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      orderedList: document.queryCommandState('insertOrderedList'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
    });
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange?.(content);
      updateSelectionState();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          announceToScreenReader('Bold applied', 'polite');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          announceToScreenReader('Italic applied', 'polite');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          announceToScreenReader('Underline applied', 'polite');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            document.execCommand('redo');
            announceToScreenReader('Redo action', 'polite');
          } else {
            e.preventDefault();
            document.execCommand('undo');
            announceToScreenReader('Undo action', 'polite');
          }
          break;
      }
    }

    // Handle character limit
    if (maxLength && editorRef.current) {
      const text = editorRef.current.textContent || '';
      if (text.length >= maxLength && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault();
        announceToScreenReader('Character limit reached', 'assertive');
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    if (maxLength && editorRef.current) {
      const currentText = editorRef.current.textContent || '';
      const availableSpace = maxLength - currentText.length;
      const textToInsert = text.slice(0, availableSpace);
      
      document.execCommand('insertText', false, textToInsert);
      
      if (text.length > availableSpace) {
        announceToScreenReader('Text truncated to fit character limit', 'polite');
      }
    } else {
      document.execCommand('insertText', false, text);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      announceToScreenReader('Link inserted', 'polite');
    }
  };

  const formatBlock = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateSelectionState();
  };

  const toolbarButtons = [
    { command: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B', isActive: selectionState.bold },
    { command: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I', isActive: selectionState.italic },
    { command: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U', isActive: selectionState.underline },
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: List, label: 'Bullet List', isActive: selectionState.unorderedList },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List', isActive: selectionState.orderedList },
  ];

  const alignmentButtons = [
    { command: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, label: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, label: 'Align Right' },
  ];

  const actionButtons = [
    { command: 'undo', icon: Undo, label: 'Undo', shortcut: 'Ctrl+Z' },
    { command: 'redo', icon: Redo, label: 'Redo', shortcut: 'Ctrl+Shift+Z' },
  ];

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div 
        className="border-b bg-muted/50 p-2 flex items-center gap-1 flex-wrap"
        role="toolbar"
        aria-label="Rich text formatting toolbar"
      >
        {/* Text Formatting */}
        <div className="flex items-center gap-1" role="group" aria-label="Text formatting">
          {toolbarButtons.map((button) => (
            <ToolbarButton key={button.command} {...button} disabled={disabled} />
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <div className="flex items-center gap-1" role="group" aria-label="Lists">
          {listButtons.map((button) => (
            <ToolbarButton key={button.command} {...button} disabled={disabled} />
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <div className="flex items-center gap-1" role="group" aria-label="Text alignment">
          {alignmentButtons.map((button) => (
            <ToolbarButton 
              key={button.command} 
              {...button} 
              disabled={disabled}
              onClick={() => formatBlock(button.command)}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Special Actions */}
        <div className="flex items-center gap-1" role="group" aria-label="Special actions">
          <ToolbarButton
            command="insertBlockquote"
            icon={Quote}
            label="Quote"
            disabled={disabled}
            onClick={() => formatBlock('formatBlock', 'blockquote')}
          />
          <ToolbarButton
            command="createLink"
            icon={Link}
            label="Insert Link"
            disabled={disabled}
            onClick={insertLink}
          />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* History Actions */}
        <div className="flex items-center gap-1" role="group" aria-label="History actions">
          {actionButtons.map((button) => (
            <ToolbarButton key={button.command} {...button} disabled={disabled} />
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseUp={updateSelectionState}
          onKeyUp={updateSelectionState}
          className={cn(
            "p-3 min-h-[120px] outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 prose prose-sm max-w-none",
            disabled && "opacity-50 cursor-not-allowed bg-muted"
          )}
          style={{ minHeight }}
          role="textbox"
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-multiline="true"
          aria-disabled={disabled}
          data-placeholder={placeholder}
        />
        
        {/* Placeholder */}
        {!value && !isFocused && (
          <div 
            className="absolute top-3 left-3 text-muted-foreground pointer-events-none select-none"
            aria-hidden="true"
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div 
        className="border-t bg-muted/50 px-3 py-2 text-xs text-muted-foreground flex justify-between items-center"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>
            {charCount}{maxLength ? `/${maxLength}` : ''} characters
          </span>
        </div>
        
        {maxLength && (
          <div className="text-right">
            <span className={cn(
              charCount > maxLength * 0.9 && "text-yellow-600",
              charCount >= maxLength && "text-red-600"
            )}>
              {maxLength - charCount} remaining
            </span>
          </div>
        )}
      </div>
    </div>
  );
};