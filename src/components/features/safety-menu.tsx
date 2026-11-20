"use client";

import { useActionState, useState } from "react";
import { Flag, ShieldOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { blockAction, reportAction, unblockAction } from "@/actions/social";
import { initialState } from "@/actions/types";
import { FormFeedback, SubmitButton } from "@/components/features/form-bits";
import { Alert, Button, Checkbox, Dialog, Field, RadioCardGroup, Textarea } from "@/components/ui";
import { REPORT_REASONS } from "@/lib/profile-options";
import { useRouter } from "@/i18n/navigation";

export function ReportDialog({ publicId }: { publicId: string }) {
  const t = useTranslations("report");
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(reportAction.bind(null, publicId), initialState);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={t("title")}
      trigger={
        <Button variant="ghost" className="justify-start">
          <Flag aria-hidden="true" className="size-5" />
          {t("action")}
        </Button>
      }
    >
      {state.ok ? (
        <Alert tone="success" live>
          {t("done")}
        </Alert>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <FormFeedback state={state} />
          <RadioCardGroup
            name="reason"
            legend={t("title")}
            columns={1}
            options={REPORT_REASONS.map((r) => ({ value: r, label: t(`reason.${r}` as never) }))}
          />
          <Field id="rp-details" label={t("details")} optional>
            <Textarea id="rp-details" name="details" maxLength={1000} />
          </Field>
          <Checkbox id="rp-block" name="alsoBlock" label={t("alsoBlock")} />
          <SubmitButton>{t("submit")}</SubmitButton>
        </form>
      )}
    </Dialog>
  );
}

export function BlockDialog({ publicId, name }: { publicId: string; name: string }) {
  const t = useTranslations("block");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(async () => {
    const r = await blockAction(publicId);
    if (r.ok) {
      setOpen(false);
      router.replace("/search");
    }
    return r;
  }, initialState);
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={t("action")}
      description={t("confirm", { name })}
      trigger={
        <Button variant="ghost" className="justify-start">
          <ShieldOff aria-hidden="true" className="size-5" />
          {t("action")}
        </Button>
      }
      footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {tc("cancel")}
          </Button>
          <form action={action}>
            <SubmitButton variant="danger">{t("action")}</SubmitButton>
          </form>
        </>
      }
    >
      <FormFeedback state={state} />
    </Dialog>
  );
}

export function UnblockButton({ publicId }: { publicId: string }) {
  const t = useTranslations("block");
  const [state, action] = useActionState(async () => unblockAction(publicId), initialState);
  return (
    <form action={action}>
      <SubmitButton variant="secondary">{state.ok ? t("done") : t("unblock")}</SubmitButton>
    </form>
  );
}
