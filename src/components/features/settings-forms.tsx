"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { changePasswordAction, deleteAccountAction, saveSettingsAction } from "@/actions/account";
import { initialState } from "@/actions/types";
import { FormFeedback, SubmitButton, useFormText } from "@/components/features/form-bits";
import { Checkbox, Field, fieldDescribedBy, Input, PasswordInput } from "@/components/ui";

export function SettingsForm({ email, mobile, notifyReceived, notifyAccepted }: { email: string; mobile: string; notifyReceived: boolean; notifyAccepted: boolean }) {
  const t = useTranslations("settings");
  const c = useTranslations("common");
  const [state, action] = useActionState(saveSettingsAction, initialState);
  const x = useFormText(state);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      <Field id="s-email" label={t("email")} help={t("emailReadOnly")}>
        <Input id="s-email" value={email} readOnly aria-describedby="s-email-help" />
      </Field>
      <Field id="s-mobile" label={t("mobile")} optional error={x.fieldError("mobile")}>
        <Input id="s-mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" defaultValue={state.fields?.mobile ?? mobile} invalid={Boolean(x.fieldError("mobile"))} aria-describedby={fieldDescribedBy("s-mobile", { error: x.fieldError("mobile") })} />
      </Field>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-medium">{t("notifications")}</legend>
        <Checkbox id="s-n1" name="notifyReceived" defaultChecked={notifyReceived} label={t("notify.received")} />
        <Checkbox id="s-n2" name="notifyAccepted" defaultChecked={notifyAccepted} label={t("notify.accepted")} />
      </fieldset>
      <SubmitButton>{c("save")}</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const t = useTranslations("settings");
  const [state, action] = useActionState(changePasswordAction, initialState);
  const x = useFormText(state);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      <Field id="pw-cur" label={t("currentPassword")} required error={x.fieldError("currentPassword")}>
        <PasswordInput id="pw-cur" name="currentPassword" autoComplete="current-password" invalid={Boolean(x.fieldError("currentPassword"))} aria-describedby={fieldDescribedBy("pw-cur", { error: x.fieldError("currentPassword") })} />
      </Field>
      <Field id="pw-new" label={t("newPassword")} required error={x.fieldError("newPassword")}>
        <PasswordInput id="pw-new" name="newPassword" autoComplete="new-password" invalid={Boolean(x.fieldError("newPassword"))} aria-describedby={fieldDescribedBy("pw-new", { error: x.fieldError("newPassword") })} />
      </Field>
      <Field id="pw-conf" label={t("confirmPassword")} required error={x.fieldError("confirm")}>
        <PasswordInput id="pw-conf" name="confirm" autoComplete="new-password" invalid={Boolean(x.fieldError("confirm"))} aria-describedby={fieldDescribedBy("pw-conf", { error: x.fieldError("confirm") })} />
      </Field>
      <SubmitButton variant="secondary">{t("password")}</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const t = useTranslations("deleteAccount");
  const [state, action] = useActionState(deleteAccountAction, initialState);
  const x = useFormText(state);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      <Field id="d-pw" label={t("password")} required error={x.fieldError("password")}>
        <PasswordInput id="d-pw" name="password" autoComplete="current-password" invalid={Boolean(x.fieldError("password"))} aria-describedby={fieldDescribedBy("d-pw", { error: x.fieldError("password") })} />
      </Field>
      <Field id="d-word" label={t("typeToConfirm")} required error={x.fieldError("confirmWord")}>
        <Input id="d-word" name="confirmWord" autoComplete="off" invalid={Boolean(x.fieldError("confirmWord"))} aria-describedby={fieldDescribedBy("d-word", { error: x.fieldError("confirmWord") })} />
      </Field>
      <SubmitButton variant="danger" size="lg">
        {t("submit")}
      </SubmitButton>
    </form>
  );
}
