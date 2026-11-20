"use client";

import type { ReactNode } from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  question: ReactNode;
  answer: ReactNode;
}

/** Keyboard-operable accordion (FR-PUB-005). */
export function Accordion({ items, headingLevel = 3 }: { items: AccordionItem[]; headingLevel?: 2 | 3 | 4 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <RadixAccordion.Root type="multiple" className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((item) => (
        <RadixAccordion.Item key={item.id} value={item.id}>
          <RadixAccordion.Header asChild>
            <Heading className="text-base">
              <RadixAccordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-start font-semibold">
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
                />
              </RadixAccordion.Trigger>
            </Heading>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="px-5 pb-5 text-text-muted">{item.answer}</RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
