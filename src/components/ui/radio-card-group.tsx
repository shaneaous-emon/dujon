import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface RadioCardOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface RadioCardGroupProps {
  name: string;
  legend: ReactNode;
  options: RadioCardOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  columns?: 1 | 2 | 3;
  className?: string;
}

/** Large tappable radio cards (gender, photo visibility, managed-by). */
export function RadioCardGroup({
  name,
  legend,
  options,
  value,
  defaultValue,
  onValueChange,
  invalid,
  describedBy,
  columns = 2,
  className,
}: RadioCardGroupProps) {
  return (
    <fieldset
      className={cn("flex flex-col gap-2", className)}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
    >
      <legend className="mb-1 font-medium">{legend}</legend>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "border-border bg-surface flex min-h-14 cursor-pointer flex-col justify-center rounded-md border px-4 py-3",
                "has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:outline-accent has-focus-visible:outline-2",
              )}
            >
              <span className="flex items-center gap-3">
                <input
                  id={id}
                  type="radio"
                  name={name}
                  value={option.value}
                  className="accent-accent size-5"
                  {...(value !== undefined ? { checked: value === option.value } : {})}
                  defaultChecked={defaultValue === option.value}
                  onChange={() => onValueChange?.(option.value)}
                />
                <span className="font-medium">{option.label}</span>
              </span>
              {option.description ? (
                <span className="text-text-muted ms-8 mt-1 text-sm">{option.description}</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
