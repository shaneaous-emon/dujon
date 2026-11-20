import { notFound } from "next/navigation";

/** Any unknown localized path renders the localized 404 (FR-PUB-010). */
export default function CatchAll() {
  notFound();
}
