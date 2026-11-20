"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resendVerificationAction } from "@/actions/auth";
import { initialState } from "@/actions/types";
import { FormFeedback, SubmitButton } from "@/components/features/form-bits";

export function ResendVerification({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("auth.verify");
  const [state, action] = useActionState(async () => resendVerificationAction(), initialState);
  return (
    <form action={action} className="flex flex-col gap-3">
      <FormFeedback state={state} />
      <SubmitButton variant={compact ? "secondary" : "primary"} size="md">
        {t("resend")}
      </SubmitButton>
    </form>
  );
}
