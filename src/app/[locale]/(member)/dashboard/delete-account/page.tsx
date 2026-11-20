import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DeleteAccountForm } from "@/components/features/settings-forms";
import { Alert, Card } from "@/components/ui";
import { requireUser } from "@/server/guards";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DeleteAccountPage({ params }: PageProps<"/[locale]/dashboard/delete-account">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireUser("/dashboard/delete-account");
  const t = await getTranslations("deleteAccount");
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl">{t("title")}</h1>
      <Alert tone="danger">{t("body")}</Alert>
      <Card>
        <DeleteAccountForm />
      </Card>
    </div>
  );
}
