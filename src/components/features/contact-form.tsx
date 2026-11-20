"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { contactAction } from "@/actions/account";
import { FormFeedback, SubmitButton, useFormText } from "@/components/features/form-bits";
import { Alert, Field, fieldDescribedBy, Input, Select, Textarea } from "@/components/ui";
import { initialState } from "@/actions/types";
import { CONTACT_SUBJECTS } from "@/lib/profile-options";

export function ContactForm({ defaultName = "", defaultEmail = "" }: { defaultName?: string; defaultEmail?: string }) {
  const t = useTranslations("contactPage");
  const [state, action] = useActionState(contactAction, initialState);
  const x = useFormText(state);
  const f = state.fields ?? {};

  if (state.ok) {
    return (
      <Alert tone="success" live>
        {t("success")}
      </Alert>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      <Field id="c-name" label={t("name")} required error={x.fieldError("name")}>
        <Input id="c-name" name="name" autoComplete="name" defaultValue={f.name ?? defaultName} invalid={Boolean(x.fieldError("name"))} aria-describedby={fieldDescribedBy("c-name", { error: x.fieldError("name") })} maxLength={80} />
      </Field>
      <Field id="c-email" label={t("email")} required error={x.fieldError("email")}>
        <Input id="c-email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={f.email ?? defaultEmail} invalid={Boolean(x.fieldError("email"))} aria-describedby={fieldDescribedBy("c-email", { error: x.fieldError("email") })} />
      </Field>
      <Field id="c-mobile" label={t("mobile")} optional error={x.fieldError("mobile")}>
        <Input id="c-mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" defaultValue={f.mobile ?? ""} invalid={Boolean(x.fieldError("mobile"))} aria-describedby={fieldDescribedBy("c-mobile", { error: x.fieldError("mobile") })} />
      </Field>
      <Field id="c-subject" label={t("subjectLabel")} required error={x.fieldError("subject")}>
        <Select id="c-subject" name="subject" defaultValue={f.subject ?? "general"} options={CONTACT_SUBJECTS.map((s) => ({ value: s, label: t(`subject.${s}` as never) }))} />
      </Field>
      <Field id="c-message" label={t("message")} required error={x.fieldError("message")}>
        <Textarea id="c-message" name="message" maxLength={2000} defaultValue={f.message ?? ""} invalid={Boolean(x.fieldError("message"))} aria-describedby={fieldDescribedBy("c-message", { error: x.fieldError("message") })} />
      </Field>
      {/* honeypot: hidden from people, tempting for bots */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-0 overflow-hidden">
        <label>
          {"Website"}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="text-text-muted text-sm">{t("privacy")}</p>
      <SubmitButton size="lg">{t("submit")}</SubmitButton>
    </form>
  );
}
