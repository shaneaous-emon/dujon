"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import type { FormState } from "@/actions/types";
import { Alert, Button, type ButtonProps } from "@/components/ui";

export function SubmitButton({ children, ...props }: Omit<ButtonProps, "type" | "loading">) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  );
}

/** Translates error codes returned by server actions. */
export function useFormText(state: FormState) {
  const te = useTranslations("errors");
  const tn = useTranslations("notices");
  const values = state.values ?? {};
  return {
    /** message for a field error code, or undefined */
    fieldError(name: string): string | undefined {
      const code = state.errors?.[name];
      if (!code) return undefined;
      return te(code as never, values as never);
    },
    formError: state.formError ? te(state.formError as never, { ...values, requestId: "-" } as never) : undefined,
    notice: state.notice ? tn(state.notice as never) : undefined,
    errorCount: Object.values(state.errors ?? {}).filter(Boolean).length,
  };
}

/** Form-level error / success banner (live regions) plus a summary count of field errors. */
export function FormFeedback({ state }: { state: FormState }) {
  const text = useFormText(state);
  const te = useTranslations("errors");
  return (
    <>
      {text.formError ? (
        <Alert tone="danger" live>
          {text.formError}
        </Alert>
      ) : null}
      {!text.formError && text.errorCount > 0 ? (
        <Alert tone="danger" live>
          {te("formSummary", { count: text.errorCount })}
        </Alert>
      ) : null}
      {text.notice && state.ok ? (
        <Alert tone="success" live>
          {text.notice}
        </Alert>
      ) : null}
    </>
  );
}
