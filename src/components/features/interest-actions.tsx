"use client";

import { useActionState, useState } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { acceptInterestAction, declineInterestAction, expressInterestAction, withdrawInterestAction } from "@/actions/social";
import { initialState, type FormState } from "@/actions/types";
import { FormFeedback } from "@/components/features/form-bits";
import { Alert, Button, Dialog } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export type InterestUi =
  | { kind: "none" }
  | { kind: "sent"; interestId: number }
  | { kind: "received"; interestId: number }
  | { kind: "connected"; interestId: number }
  | { kind: "declined"; retryAfter: string };

function Pending({ children, ...p }: { children: React.ReactNode } & React.ComponentProps<typeof Button>) {
  return <Button {...p}>{children}</Button>;
}

/** Interest controls for one member, following the state machine in docs/05. */
export function InterestActions({
  publicId,
  name,
  state,
  canSend,
  emailVerified,
  retryLabel,
}: {
  publicId: string;
  name: string;
  state: InterestUi;
  canSend: boolean;
  emailVerified: boolean;
  retryLabel?: string;
}) {
  const t = useTranslations("interests");
  const tc = useTranslations("common");
  const ts = useTranslations("search");
  const [open, setOpen] = useState(false);
  const [express, expressAction, expressing] = useActionState(async (): Promise<FormState> => {
    const r = await expressInterestAction(publicId);
    if (r.ok) setOpen(false);
    return r;
  }, initialState);
  const [accept, acceptAction, accepting] = useActionState(async (): Promise<FormState> => (state.kind === "received" ? acceptInterestAction(state.interestId) : initialState), initialState);
  const [decline, declineAction, declining] = useActionState(async (): Promise<FormState> => (state.kind === "received" ? declineInterestAction(state.interestId) : initialState), initialState);
  const [withdraw, withdrawAction, withdrawing] = useActionState(async (): Promise<FormState> => (state.kind === "sent" ? withdrawInterestAction(state.interestId) : initialState), initialState);

  if (state.kind === "connected")
    return (
      <div className="flex flex-col gap-3">
        <Alert tone="success">{t("connected")}</Alert>
      </div>
    );

  if (state.kind === "received")
    return (
      <div className="flex flex-col gap-3">
        <p className="font-medium">{t("received", { name })}</p>
        <FormFeedback state={accept} />
        <FormFeedback state={decline} />
        <p className="text-text-muted text-sm">{t("acceptConfirm")}</p>
        <div className="flex gap-3">
          <form action={acceptAction} className="flex-1">
            <Pending type="submit" loading={accepting} fullWidth disabled={!emailVerified}>
              {t("accept")}
            </Pending>
          </form>
          <form action={declineAction} className="flex-1">
            <Pending type="submit" variant="secondary" loading={declining} fullWidth>
              {t("decline")}
            </Pending>
          </form>
        </div>
        {!emailVerified ? <p className="text-warning text-sm">{t("verifyFirst")}</p> : null}
      </div>
    );

  if (state.kind === "sent")
    return (
      <div className="flex flex-col gap-3">
        <FormFeedback state={withdraw} />
        <Alert tone="info">{t("sent")}</Alert>
        <form action={withdrawAction}>
          <Pending type="submit" variant="secondary" loading={withdrawing} fullWidth>
            {t("withdraw")}
          </Pending>
        </form>
      </div>
    );

  if (state.kind === "declined")
    return (
      <div className="flex flex-col gap-2">
        <Alert tone="warning" title={t("notAccepted")}>
          {retryLabel ? t("tryAgainAfter", { date: retryLabel }) : null}
        </Alert>
      </div>
    );

  // none
  if (!canSend)
    return (
      <div className="flex flex-col gap-3">
        <p className="text-text-muted">{t("publishFirst")}</p>
        <Link href="/onboarding/about" className="text-accent font-semibold underline">
          {ts("publishFirstCta")}
        </Link>
      </div>
    );
  return (
    <div className="flex flex-col gap-3">
      {!emailVerified ? <p className="text-warning text-sm">{t("verifyFirst")}</p> : null}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t("confirm.title")}
        description={t("confirm.body", { name })}
        trigger={
          <Button size="lg" fullWidth disabled={!emailVerified}>
            <Heart aria-hidden="true" className="size-5" />
            {t("express")}
          </Button>
        }
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {tc("cancel")}
            </Button>
            <form action={expressAction}>
              <Button type="submit" loading={expressing}>
                {t("confirm.send")}
              </Button>
            </form>
          </div>
        }
      >
        <FormFeedback state={express} />
      </Dialog>
    </div>
  );
}
