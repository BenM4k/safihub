"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { FAQ_ITEMS_META, type FaqInlineLink } from "@/lib/faq-data";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export interface FaqAccordionItemData {
  id: string;
  question: string;
  answer: string;
  links?: FaqInlineLink[];
}

interface FaqAccordionProps {
  items?: FaqAccordionItemData[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function renderAnswerWithLinks(
  answer: string,
  links?: FaqInlineLink[]
): ReactNode {
  if (!links || links.length === 0) return answer;

  let nodes: ReactNode[] = [answer];
  for (const link of links) {
    if (!link.label) continue;
    nodes = nodes.flatMap((node, idx) => {
      if (typeof node !== "string") return [node];
      const matchIndex = node.indexOf(link.label);
      if (matchIndex === -1) return [node];
      const before = node.slice(0, matchIndex);
      const after = node.slice(matchIndex + link.label.length);
      return [
        before,
        <Link
          key={`${link.href}-${idx}`}
          href={link.href}
          className="text-primary font-medium underline underline-offset-4 hover:text-primary-hover transition-colors"
        >
          {link.label}
        </Link>,
        after,
      ].filter((part) => part !== "");
    });
  }

  return nodes;
}

export function FaqAccordion({
  items,
  defaultValue,
  value,
  onValueChange,
}: FaqAccordionProps = {}) {
  const t = useTranslations("faq");

  const resolvedItems: FaqAccordionItemData[] =
    items ??
    FAQ_ITEMS_META.filter((item) => item.featured).map((item) => ({
      id: item.id,
      question: t(`items.${item.id}.question`),
      answer: t(`items.${item.id}.answer`),
      links: item.links?.map((link) => ({
        label: t(`links.${link.key}`),
        href: link.href,
      })),
    }));

  const isControlled = value !== undefined;
  const resolvedDefaultValue =
    defaultValue !== undefined
      ? defaultValue
      : resolvedItems[1]?.id ?? resolvedItems[0]?.id ?? "";

  return (
    <Accordion
      type="single"
      collapsible
      {...(isControlled
        ? { value, onValueChange }
        : { defaultValue: resolvedDefaultValue })}
      className="space-y-3"
    >
      {resolvedItems.map((faq) => (
        <AccordionItem
          key={faq.id}
          value={faq.id}
          className="rounded-2xl border border-transparent border-b-border px-5 sm:px-6 py-4.5 transition-[background-color,border-color,box-shadow,padding] duration-200 ease-out data-open:bg-card data-open:border-border data-open:shadow-md data-open:py-5 sm:data-open:py-6"
        >
          <AccordionTrigger className="w-full text-left flex items-start justify-between gap-4 font-display font-bold text-base sm:text-lg text-heading hover:text-primary transition-colors cursor-pointer hover:no-underline py-0 [&>svg:last-child]:hidden group/trigger">
            <span>{faq.question}</span>
            <Plus
              className="size-5 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ease-out group-data-open/trigger:rotate-45 group-data-open/trigger:text-heading"
              aria-hidden="true"
            />
          </AccordionTrigger>
          <AccordionContent className="pt-3 text-sm sm:text-base text-muted-foreground leading-relaxed pb-0">
            {renderAnswerWithLinks(faq.answer, faq.links)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
