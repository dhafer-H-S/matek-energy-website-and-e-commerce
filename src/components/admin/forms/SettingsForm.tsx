"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import {
  saveSettings,
  type SettingsState,
} from "@/app/(admin)/admin/(dashboard)/settings/actions";
import {
  FormSection,
  TextField,
  SubmitButton,
} from "@/components/admin/form/fields";
import { LangTabs, TranslatedField } from "@/components/admin/form/LangFields";
import type { Settings } from "@/lib/db/schema";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState<SettingsState, FormData>(
    saveSettings,
    {},
  );
  const social = settings.social ?? {};

  return (
    <form action={action} className="flex flex-col gap-6">
      <FormSection
        title="Tracking & Pixels"
        description="Paste your Meta Pixel ID to inject it across the entire site. Leave blank to disable."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Meta Pixel ID"
            name="metaPixelId"
            placeholder="e.g. 123456789012345"
            defaultValue={settings.metaPixelId ?? undefined}
          />
          <TextField
            label="Google Analytics ID"
            name="gaMeasurementId"
            placeholder="G-XXXXXXX"
            defaultValue={settings.gaMeasurementId ?? undefined}
          />
          <TextField
            label="Google Tag Manager ID"
            name="gtmId"
            placeholder="GTM-XXXXXXX"
            defaultValue={settings.gtmId ?? undefined}
          />
        </div>
      </FormSection>

      <FormSection title="Contact Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Contact email"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail ?? undefined}
          />
          <TextField
            label="Contact phone"
            name="contactPhone"
            defaultValue={settings.contactPhone ?? undefined}
          />
          <TextField
            label="WhatsApp number"
            name="whatsapp"
            placeholder="+905338697973"
            defaultValue={settings.whatsapp ?? undefined}
          />
        </div>
        <LangTabs hint="Write the address and opening hours in English and Turkish. Save once for both languages. Empty Turkish fields use the English version.">
          <TranslatedField label="Opening hours" name="openingHours" values={{ en: settings.openingHours, tr: settings.openingHoursTr }} />
          <TranslatedField label="Address" name="addressText" type="textarea" rows={3} values={{ en: settings.addressText, tr: settings.addressTextTr }} />
        </LangTabs>
      </FormSection>

      <FormSection title="Social Media">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Facebook" name="facebook" defaultValue={social.facebook} />
          <TextField label="Instagram" name="instagram" defaultValue={social.instagram} />
          <TextField label="LinkedIn" name="linkedin" defaultValue={social.linkedin} />
          <TextField label="YouTube" name="youtube" defaultValue={social.youtube} />
          <TextField label="X (Twitter)" name="twitter" defaultValue={social.twitter} />
          <TextField label="TikTok" name="tiktok" defaultValue={social.tiktok} />
        </div>
      </FormSection>

      <FormSection
        title="Orders & Payment"
        description="Shown to customers at checkout. Bank details appear when they choose bank transfer."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Order notification email" name="orderEmail" type="email" defaultValue={settings.orderEmail ?? undefined} />
          <TextField label="Bank name" name="bankName" defaultValue={settings.bankName ?? undefined} />
          <TextField label="Account holder" name="bankAccountHolder" defaultValue={settings.bankAccountHolder ?? undefined} />
          <TextField label="IBAN" name="bankIban" defaultValue={settings.bankIban ?? undefined} />
        </div>
        <LangTabs hint="Enter payment instructions in English and Turkish. The checkout and order confirmation use the visitor's language; empty Turkish notes use English. Bank details above are shared.">
          <TranslatedField label="Payment notes" name="bankNotes" type="textarea" rows={2} values={{ en: settings.bankNotes, tr: settings.bankNotesTr }} />
        </LangTabs>
      </FormSection>

      <div className="flex items-center gap-4">
        <SubmitButton>Save settings</SubmitButton>
        {state.ok ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Saved
          </span>
        ) : null}
        {state.error ? (
          <span className="text-sm text-red-500">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
