"use client";

import type { ReactNode } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
}: {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label: string;
}) {
  return (
    <RadixTabs.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={onValueChange}
    >
      <RadixTabs.List aria-label={label} className="border-border flex gap-1 overflow-x-auto border-b">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "text-text-muted min-h-11 shrink-0 border-b-2 border-transparent px-4 font-medium",
              "data-[state=active]:border-accent data-[state=active]:text-accent",
            )}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} value={item.value} className="pt-4">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
