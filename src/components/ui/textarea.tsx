"use client";

import { forwardRef, useState, type TextareaHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { controlClasses } from "./input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** Shows a live character counter when maxLength is set. */
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, showCount = true, maxLength, defaultValue, value, onChange, id, ...props },
  ref,
) {
  const t = useTranslations("common");
  const initial = String(value ?? defaultValue ?? "");
  const [length, setLength] = useState(initial.length);
  const current = value !== undefined ? String(value).length : length;
  return (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        id={id}
        maxLength={maxLength}
        defaultValue={defaultValue}
        value={value}
        aria-invalid={invalid || undefined}
        className={cn(controlClasses, "min-h-28 resize-y", className)}
        onChange={(event) => {
          setLength(event.target.value.length);
          onChange?.(event);
        }}
        {...props}
      />
      {showCount && maxLength ? (
        <p className="text-text-muted self-end text-sm" aria-live="polite">
          {t("characterCount", { count: current, max: maxLength })}
        </p>
      ) : null}
    </div>
  );
});
