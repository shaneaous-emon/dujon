import Link from "next/link";
import "./globals.css";

/**
 * Fallback for requests that never reach a locale segment. Bilingual on purpose
 * because the locale is unknown here (FR-PUB-010).
 */
export default function GlobalNotFound() {
  return (
    <html lang="bn">
      <body>
        <main className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-2xl">
            <span lang="bn">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</span>
            {" / "}
            <span lang="en">Page not found</span>
          </h1>
          <p className="mt-6">
            <Link className="text-accent underline" href="/">
              <span lang="bn">হোম পেজ</span>
              {" / "}
              <span lang="en">Home</span>
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
