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
    <RadixAccordion.Root
      type="multiple"
      className="divide-border border-border bg-surface shadow-card divide-y overflow-hidden rounded-2xl border"
    >
      {items.map((item) => (
        <RadixAccordion.Item key={item.id} value={item.id} className="transition-colors data-[state=open]:bg-[#fdfaf6]">
          <RadixAccordion.Header asChild>
            <Heading className="text-base sm:text-lg">
              <RadixAccordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 px-6 py-4 text-start font-semibold transition-colors hover:text-accent">
                <span>{item.question}</span>
                <span className="bg-surface-muted text-accent group-data-[state=open]:bg-accent inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 group-data-[state=open]:text-white">
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
                </span>
              </RadixAccordion.Trigger>
            </Heading>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="text-text-muted px-6 pb-5 leading-relaxed">{item.answer}</RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
