import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/features/language-switcher";

export default function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <div className="bg-surface-muted/60 flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <LanguageSwitcher />
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-md flex-1 px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
