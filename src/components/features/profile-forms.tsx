"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { hideProfileAction, publishProfileAction, savePreferencesAction, saveAboutAction, saveLocationAction, setPhotoVisibilityAction, uploadPhotoAction, deletePhotoAction, skipPhotoAction } from "@/actions/profile";
import { initialState } from "@/actions/types";
import { FormFeedback, SubmitButton, useFormText } from "@/components/features/form-bits";
import { LocationCascade, type LocationData, type LocationValue } from "@/components/features/location-cascade";
import { Alert, Button, Field, fieldDescribedBy, Input, RadioCardGroup, Select, Textarea } from "@/components/ui";
import { appConfig } from "@/config/app";
import { CREATED_BY, EDUCATION, MARITAL, type CreatedBy, type EducationLevel, type MaritalStatus } from "@/lib/profile-options";

type Mode = "onboarding" | "edit";

export interface AboutInitial {
  displayName: string;
  createdBy: CreatedBy;
  maritalStatus: MaritalStatus | "";
  heightFeet: string;
  heightInches: string;
  educationLevel: EducationLevel | "";
  educationDetail: string;
  occupation: string;
  about: string;
  familyInfo: string;
}

export function AboutForm({ mode, initial }: { mode: Mode; initial: AboutInitial }) {
  const t = useTranslations("profile");
  const c = useTranslations("common");
  const locale = useLocale();
  const [state, action] = useActionState(saveAboutAction, initialState);
  const x = useFormText(state);
  const f = { ...initial, ...(state.fields ?? {}) } as AboutInitial;
  const err = (n: string) => x.fieldError(n);
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { useGrouping: false });
  const feet = Array.from({ length: 4 }, (_, i) => ({ value: String(i + 4), label: nf.format(i + 4) }));
  const inches = Array.from({ length: 12 }, (_, i) => ({ value: String(i), label: nf.format(i) }));
  const [aboutLen, setAboutLen] = useState(initial.about.length);
  const [rest, setRest] = useState(f.createdBy);
  void rest;
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="mode" value={mode} />
      <FormFeedback state={state} />
      <Field id="a-name" label={t("displayName")} help={t("displayNameHelp")} required error={err("displayName")}>
        <Input id="a-name" name="displayName" maxLength={40} defaultValue={f.displayName} invalid={Boolean(err("displayName"))} aria-describedby={fieldDescribedBy("a-name", { help: true, error: err("displayName") })} />
      </Field>
      <Field id="a-by" label={t("createdByLabel")} required error={err("createdBy")}>
        <Select id="a-by" name="createdBy" defaultValue={f.createdBy} onChange={(e) => setRest(e.target.value as CreatedBy)} options={CREATED_BY.map((v) => ({ value: v, label: t(`createdBy.${v}` as never) }))} />
      </Field>
      <Field id="a-marital" label={t("maritalStatus")} required error={err("maritalStatus")}>
        <Select id="a-marital" name="maritalStatus" defaultValue={f.maritalStatus} placeholder={t("selectPlaceholder")} invalid={Boolean(err("maritalStatus"))} options={MARITAL.map((v) => ({ value: v, label: t(`marital.${v}` as never) }))} aria-describedby={fieldDescribedBy("a-marital", { error: err("maritalStatus") })} />
      </Field>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 font-medium">
          {t("height")} <span className="text-text-muted text-sm font-normal">{c("optional")}</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <Select aria-label={t("heightFeet")} name="heightFeet" defaultValue={f.heightFeet} placeholder={t("heightFeet")} options={feet} invalid={Boolean(err("height"))} />
          <Select aria-label={t("heightInches")} name="heightInches" defaultValue={f.heightInches} placeholder={t("heightInches")} options={inches} invalid={Boolean(err("height"))} />
        </div>
        {err("height") ? <p className="text-danger text-sm font-medium">{err("height")}</p> : null}
      </fieldset>
      <Field id="a-edu" label={t("educationLevel")} required error={err("educationLevel")}>
        <Select id="a-edu" name="educationLevel" defaultValue={f.educationLevel} placeholder={t("selectPlaceholder")} invalid={Boolean(err("educationLevel"))} options={EDUCATION.map((v) => ({ value: v, label: t(`edu.${v}` as never) }))} aria-describedby={fieldDescribedBy("a-edu", { error: err("educationLevel") })} />
      </Field>
      <Field id="a-edud" label={t("educationDetail")} optional>
        <Input id="a-edud" name="educationDetail" maxLength={100} defaultValue={f.educationDetail} />
      </Field>
      <Field id="a-occ" label={t("occupation")} required error={err("occupation")}>
        <Input id="a-occ" name="occupation" maxLength={80} defaultValue={f.occupation} invalid={Boolean(err("occupation"))} aria-describedby={fieldDescribedBy("a-occ", { error: err("occupation") })} />
      </Field>
      <Field id="a-about" label={t("about")} help={t("aboutHelp")} required error={err("about")}>
        <Textarea id="a-about" name="about" rows={6} maxLength={1000} defaultValue={f.about} onChange={(e) => setAboutLen(e.target.value.length)} invalid={Boolean(err("about"))} aria-describedby={fieldDescribedBy("a-about", { help: true, error: err("about") })} />
        <span className="text-text-muted text-sm" aria-live="off">
          {c("characterCount", { count: aboutLen, max: 1000 })}
        </span>
      </Field>
      <Field id="a-family" label={t("familyInfo")} help={t("familyInfoHelp")} optional>
        <Textarea id="a-family" name="familyInfo" rows={3} maxLength={500} defaultValue={f.familyInfo} />
      </Field>
      <SubmitButton size="lg">{mode === "onboarding" ? c("saveContinue") : c("save")}</SubmitButton>
    </form>
  );
}

export function LocationForm({ mode, data, initial }: { mode: Mode; data: LocationData; initial: LocationValue }) {
  const c = useTranslations("common");
  const [state, action] = useActionState(saveLocationAction, initialState);
  const x = useFormText(state);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="mode" value={mode} />
      <FormFeedback state={state} />
      <LocationCascade data={data} initial={initial} required stacked errors={{ divisionId: x.fieldError("divisionId"), districtId: x.fieldError("districtId") }} />
      <SubmitButton size="lg">{mode === "onboarding" ? c("saveContinue") : c("save")}</SubmitButton>
    </form>
  );
}

export function PhotoForm({ mode, current, visibility }: { mode: Mode; current: { name: string; hasPhoto: boolean; url: string | null }; visibility: "members" | "connections" }) {
  const t = useTranslations("photo");
  const c = useTranslations("common");
  const [state, action] = useActionState(uploadPhotoAction, initialState);
  const [vis, visAction] = useActionState(setPhotoVisibilityAction, initialState);
  const [del, delAction] = useActionState(async () => deletePhotoAction(), initialState);
  const x = useFormText(state);
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? (del.ok ? null : current.url);
  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="mode" value={mode} />
        <FormFeedback state={state} />
        <FormFeedback state={del} />
        <div className="bg-surface-muted mx-auto flex aspect-[4/5] w-56 items-center justify-center overflow-hidden rounded-lg">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview / access-controlled route
            <img src={shown} alt={t("current")} className="size-full object-cover" />
          ) : (
            <span className="text-text-muted p-4 text-center text-sm">{t("none")}</span>
          )}
        </div>
        <Field id="ph-file" label={current.hasPhoto ? t("replace") : t("choose")} help={t("rules")} error={x.fieldError("photo")}>
          <input
            id="ph-file"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="border-border block w-full rounded-md border p-2"
            aria-describedby={fieldDescribedBy("ph-file", { help: true, error: x.fieldError("photo") })}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </Field>
        <Alert tone="info">{t("notReviewed")}</Alert>
        <SubmitButton size="lg">{t("upload")}</SubmitButton>
      </form>
      {current.hasPhoto && !del.ok ? (
        <form action={delAction}>
          <SubmitButton variant="danger">{t("delete")}</SubmitButton>
        </form>
      ) : null}
      <form action={visAction} className="flex flex-col gap-3">
        <FormFeedback state={vis} />
        <RadioCardGroup
          name="photoVisibility"
          legend={t("visibilityLabel")}
          columns={1}
          defaultValue={visibility}
          options={[
            { value: "members", label: t("visibility.members") },
            { value: "connections", label: t("visibility.connections") },
          ]}
        />
        <SubmitButton variant="secondary">{c("save")}</SubmitButton>
      </form>
      {mode === "onboarding" ? (
        <form action={skipPhotoAction}>
          <Button type="submit" variant="ghost">
            {c("skip")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function PreferencesForm({ mode, data, initial }: { mode: Mode; data: LocationData; initial: { ageMin: number; ageMax: number } & LocationValue }) {
  const t = useTranslations("preferences");
  const c = useTranslations("common");
  const s = useTranslations("search");
  const locale = useLocale();
  const [state, action] = useActionState(savePreferencesAction, initialState);
  const x = useFormText(state);
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { useGrouping: false });
  const ages = Array.from({ length: appConfig.searchAgeMaxBound - appConfig.searchAgeMinBound + 1 }, (_, i) => {
    const v = appConfig.searchAgeMinBound + i;
    return { value: String(v), label: nf.format(v) };
  });
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="mode" value={mode} />
      <FormFeedback state={state} />
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 font-medium">{t("ageRange")}</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field id="pf-min" label={t("ageFrom")}>
            <Select id="pf-min" name="ageMin" defaultValue={String(initial.ageMin)} options={ages} invalid={Boolean(x.fieldError("ageMin"))} />
          </Field>
          <Field id="pf-max" label={t("ageTo")}>
            <Select id="pf-max" name="ageMax" defaultValue={String(initial.ageMax)} options={ages} />
          </Field>
        </div>
        {x.fieldError("ageMin") ? <p className="text-danger text-sm font-medium">{x.fieldError("ageMin")}</p> : null}
      </fieldset>
      <div>
        <h2 className="mb-1 text-lg">{t("area")}</h2>
        <p className="text-text-muted mb-3 text-sm">{t("areaHelp")}</p>
        <LocationCascade data={data} initial={initial} stacked placeholders={{ division: s("anyArea"), district: s("anyArea"), upazila: s("anyArea") }} />
      </div>
      <p className="text-text-muted text-sm">{t("note")}</p>
      <SubmitButton size="lg">{mode === "onboarding" ? c("saveContinue") : c("save")}</SubmitButton>
    </form>
  );
}

export function PublishForm({ from, status, disabled }: { from: "onboarding" | "dashboard"; status: "draft" | "published" | "hidden" | "suspended"; disabled: boolean }) {
  const t = useTranslations("profile");
  const [state, action] = useActionState(publishProfileAction, initialState);
  const [hide, hideAction] = useActionState(async () => hideProfileAction(), initialState);
  return (
    <div className="flex flex-col gap-3">
      <FormFeedback state={state} />
      <FormFeedback state={hide} />
      {status === "suspended" ? <Alert tone="danger">{t("suspendedNote")}</Alert> : null}
      {status !== "suspended" && (status !== "published" || hide.ok) ? (
        <form action={action}>
          <input type="hidden" name="from" value={from} />
          <SubmitButton size="lg" fullWidth disabled={disabled}>
            {status === "hidden" || hide.ok ? t("republish") : t("publish")}
          </SubmitButton>
        </form>
      ) : null}
      {status === "published" && !hide.ok ? (
        <>
          <p className="text-text-muted text-sm">{t("hideHelp")}</p>
          <form action={hideAction}>
            <SubmitButton variant="secondary">{t("hide")}</SubmitButton>
          </form>
        </>
      ) : null}
    </div>
  );
}
