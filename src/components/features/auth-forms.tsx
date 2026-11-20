"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { forgotPasswordAction, loginAction, registerAction, resetPasswordAction } from "@/actions/auth";
import { initialState } from "@/actions/types";
import { DobField } from "@/components/features/dob-field";
import { FormFeedback, SubmitButton, useFormText } from "@/components/features/form-bits";
import { Alert, Checkbox, Field, fieldDescribedBy, Input, PasswordInput, RadioCardGroup } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export function RegisterForm({ currentYear, next }: { currentYear: number; next?: string }) {
  const t = useTranslations("auth.register");
  const nav = useTranslations("nav");
  const fo = useTranslations("footer");
  const [state, action] = useActionState(registerAction, initialState);
  const x = useFormText(state);
  const f = state.fields ?? {};
  const err = (n: string) => x.fieldError(n);
  const e = (id: string, n: string) => fieldDescribedBy(id, { error: err(n) });
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field id="r-name" label={t("fullName")} help={t("fullNameHelp")} required error={err("fullName")}>
        <Input id="r-name" name="fullName" autoComplete="name" defaultValue={f.fullName ?? ""} invalid={Boolean(err("fullName"))} aria-describedby={fieldDescribedBy("r-name", { help: true, error: err("fullName") })} maxLength={80} />
      </Field>
      <Field id="r-email" label={t("email")} required error={err("email")}>
        <Input id="r-email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={f.email ?? ""} invalid={Boolean(err("email"))} aria-describedby={e("r-email", "email")} />
      </Field>
      <Field id="r-mobile" label={t("mobile")} help={t("mobileHelp")} required error={err("mobile")}>
        <Input id="r-mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" defaultValue={f.mobile ?? ""} invalid={Boolean(err("mobile"))} aria-describedby={fieldDescribedBy("r-mobile", { help: true, error: err("mobile") })} />
      </Field>
      <Field id="r-password" label={t("password")} help={t("passwordHelp")} required error={err("password")}>
        <PasswordInput id="r-password" name="password" autoComplete="new-password" invalid={Boolean(err("password"))} aria-describedby={fieldDescribedBy("r-password", { help: true, error: err("password") })} />
      </Field>
      <RadioCardGroup
        name="gender"
        legend={t("gender")}
        defaultValue={f.gender}
        invalid={Boolean(err("gender"))}
        options={[
          { value: "male", label: t("male") },
          { value: "female", label: t("female") },
        ]}
      />
      {err("gender") ? <p className="text-danger -mt-3 text-sm font-medium">{err("gender")}</p> : null}
      <DobField currentYear={currentYear} error={err("dob")} initial={{ day: f.dobDay, month: f.dobMonth, year: f.dobYear }} />
      <div>
        <Checkbox
          id="r-agree"
          name="agree"
          invalid={Boolean(err("agree"))}
          label={t.rich("agree", {
            terms: () => (
              <Link href="/terms" target="_blank" className="text-accent underline">
                {fo("terms")}
              </Link>
            ),
            privacy: () => (
              <Link href="/privacy" target="_blank" className="text-accent underline">
                {fo("privacy")}
              </Link>
            ),
          })}
        />
        {err("agree") ? <p className="text-danger mt-1 text-sm font-medium">{err("agree")}</p> : null}
      </div>
      <SubmitButton size="lg">{t("submit")}</SubmitButton>
      <p className="text-text-muted text-center text-sm">
        {t("haveAccount")}{" "}
        <Link href={next ? { pathname: "/login", query: { next } } : "/login"} className="text-accent font-semibold underline">
          {nav("login")}
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({ next, resetDone }: { next?: string; resetDone?: boolean }) {
  const t = useTranslations("auth.login");
  const nav = useTranslations("nav");
  const [state, action] = useActionState(loginAction, initialState);
  const x = useFormText(state);
  const f = state.fields ?? {};
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {resetDone ? <Alert tone="success">{t("resetDone")}</Alert> : null}
      <FormFeedback state={state} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field id="l-email" label={t("email")} required error={x.fieldError("email")}>
        <Input id="l-email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={f.email ?? ""} invalid={Boolean(x.fieldError("email"))} aria-describedby={fieldDescribedBy("l-email", { error: x.fieldError("email") })} />
      </Field>
      <Field id="l-password" label={t("password")} required error={x.fieldError("password")}>
        <PasswordInput id="l-password" name="password" autoComplete="current-password" invalid={Boolean(x.fieldError("password"))} aria-describedby={fieldDescribedBy("l-password", { error: x.fieldError("password") })} />
      </Field>
      <SubmitButton size="lg">{t("submit")}</SubmitButton>
      <div className="flex flex-col items-center gap-2 text-sm">
        <Link href="/forgot-password" className="text-accent font-semibold underline">
          {t("forgot")}
        </Link>
        <p className="text-text-muted">
          {t("noAccount")}{" "}
          <Link href={next ? { pathname: "/register", query: { next } } : "/register"} className="text-accent font-semibold underline">
            {nav("register")}
          </Link>
        </p>
      </div>
    </form>
  );
}

export function ForgotForm() {
  const t = useTranslations("auth.forgot");
  const [state, action] = useActionState(forgotPasswordAction, initialState);
  const x = useFormText(state);
  if (state.ok)
    return (
      <Alert tone="success" live>
        {t("sent")}
      </Alert>
    );
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      <Field id="f-email" label={t("email")} required error={x.fieldError("email")}>
        <Input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={state.fields?.email ?? ""} invalid={Boolean(x.fieldError("email"))} aria-describedby={fieldDescribedBy("f-email", { error: x.fieldError("email") })} />
      </Field>
      <SubmitButton size="lg">{t("submit")}</SubmitButton>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const t = useTranslations("auth.reset");
  const [state, action] = useActionState(resetPasswordAction, initialState);
  const x = useFormText(state);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormFeedback state={state} />
      <input type="hidden" name="token" value={token} />
      <Field id="p-password" label={t("password")} required error={x.fieldError("password")}>
        <PasswordInput id="p-password" name="password" autoComplete="new-password" invalid={Boolean(x.fieldError("password"))} aria-describedby={fieldDescribedBy("p-password", { error: x.fieldError("password") })} />
      </Field>
      <Field id="p-confirm" label={t("confirm")} required error={x.fieldError("confirm")}>
        <PasswordInput id="p-confirm" name="confirm" autoComplete="new-password" invalid={Boolean(x.fieldError("confirm"))} aria-describedby={fieldDescribedBy("p-confirm", { error: x.fieldError("confirm") })} />
      </Field>
      <SubmitButton size="lg">{t("submit")}</SubmitButton>
    </form>
  );
}
