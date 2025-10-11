import React, { useEffect, useCallback, useState } from "react";
import { useForm, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "date" | "password";
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  dependencies?: {
    field: Path<T>;
    value: any;
    action: "show" | "hide" | "require";
  }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
  className?: string;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
}

export interface EnhancedFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  fields: FormFieldConfig<T>[];
  defaultValues: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onAutoSave?: (data: Partial<T>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  autoSaveDelay?: number;
  showAutoSaveStatus?: boolean;
  className?: string;
  layout?: "vertical" | "horizontal" | "grid";
  gridColumns?: number;
}

export function EnhancedForm<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  onAutoSave,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  isLoading = false,
  autoSaveDelay = 2000,
  showAutoSaveStatus = true,
  className = "",
  layout = "vertical",
  gridColumns = 2,
}: EnhancedFormProps<T>) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
    mode: "onChange",
  });

  const { watch, formState } = form;
  const watchedValues = watch();

  // Auto-save functionality
  const performAutoSave = useCallback(
    async (data: Partial<T>) => {
      if (!onAutoSave || !formState.isDirty) return;

      setAutoSaveStatus("saving");
      try {
        await onAutoSave(data);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch (error) {
        setAutoSaveStatus("error");
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      }
    },
    [onAutoSave, formState.isDirty]
  );

  // Watch for changes and trigger auto-save
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    if (formState.isDirty && onAutoSave) {
      const timeout = setTimeout(() => {
        performAutoSave(watchedValues);
      }, autoSaveDelay);

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [watchedValues, performAutoSave, autoSaveDelay, formState.isDirty]);

  // Check field dependencies
  const shouldShowField = (field: FormFieldConfig<T>) => {
    if (!field.dependencies) return true;

    return field.dependencies.every((dep) => {
      const fieldValue = watchedValues[dep.field];
      const matches = fieldValue === dep.value;
      return dep.action === "show" ? matches : !matches;
    });
  };

  const isFieldRequired = (field: FormFieldConfig<T>) => {
    if (!field.dependencies) return field.required;

    const hasRequireDependency = field.dependencies.some((dep) => {
      const fieldValue = watchedValues[dep.field];
      return dep.action === "require" && fieldValue === dep.value;
    });

    return field.required || hasRequireDependency;
  };

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      toast.success("Form submitted successfully");
    } catch (error) {
      toast.error("Failed to submit form");
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case "horizontal":
        return "space-y-4";
      case "grid":
        return `grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`;
      default:
        return "space-y-4";
    }
  };

  const AutoSaveIndicator = () => {
    if (!showAutoSaveStatus) return null;

    return (
      <div className="flex items-center gap-2 text-sm">
        {autoSaveStatus === "saving" && (
          <>
            <Save className="w-4 h-4 animate-pulse text-blue-500" />
            <span className="text-blue-500">Saving...</span>
          </>
        )}
        {autoSaveStatus === "saved" && (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-500">Saved</span>
          </>
        )}
        {autoSaveStatus === "error" && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Save failed</span>
          </>
        )}
      </div>
    );
  };

  const renderField = (field: FormFieldConfig<T>) => {
    if (!shouldShowField(field)) return null;

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem className={field.className}>
            <FormLabel className="flex items-center gap-2">
              {field.label}
              {isFieldRequired(field) && <Badge variant="destructive" className="text-xs px-1">Required</Badge>}
            </FormLabel>
            <FormControl>
              <div className="relative">
                {field.prefix && (
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {field.prefix}
                  </span>
                )}
                
                {field.type === "select" ? (
                  <Select
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    disabled={field.disabled}
                  >
                    <SelectTrigger className={field.prefix ? "pl-8" : ""}>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    disabled={field.disabled}
                    className="min-h-[100px] resize-y"
                  />
                ) : (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...formField}
                    disabled={field.disabled}
                    className={field.prefix ? "pl-8" : field.suffix ? "pr-8" : ""}
                    onChange={(e) => {
                      const value = field.type === "number" ? 
                        (e.target.value === "" ? "" : Number(e.target.value)) : 
                        e.target.value;
                      formField.onChange(value);
                    }}
                    value={formField.value || ""}
                  />
                )}
                
                {field.suffix && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {field.suffix}
                  </span>
                )}
              </div>
            </FormControl>
            {field.description && <FormDescription>{field.description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className={className}>
      {showAutoSaveStatus && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Form</h3>
          <AutoSaveIndicator />
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className={getLayoutClasses()}>
            {fields.map(renderField)}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            <Button type="submit" disabled={isLoading || !formState.isValid}>
              {isLoading ? "Submitting..." : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}