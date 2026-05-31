import type { Metadata } from "next"

import { LEGAL } from "@/lib/legal"
import { LegalShell, Section } from "@/components/legal/legal-shell"

export const metadata: Metadata = {
  title: "Delete Your Account",
  description: "How to delete your Savings Tracker account and all associated data.",
}

export default function DeleteAccountPage() {
  return (
    <LegalShell title="Delete Your Account" updated={LEGAL.lastUpdated}>
      <p>
        You can permanently delete your {LEGAL.appName} account and all of its data at any
        time. Deletion is irreversible. Below are two ways to do it — from inside the app, or
        by email if you can&rsquo;t access the app.
      </p>

      <Section heading="From the app (recommended)">
        <ol className="ml-5 list-decimal space-y-1">
          <li>Open {LEGAL.appName} and sign in.</li>
          <li>Tap your profile menu (top-right) and choose <strong>Delete account</strong>.</li>
          <li>
            We email a confirmation link to the address on your account. Open that email and
            tap the link to confirm.
          </li>
          <li>
            Once confirmed, your account and all associated data are permanently deleted and
            you&rsquo;re signed out.
          </li>
        </ol>
      </Section>

      <Section heading="Can't access the app?">
        <p>
          Email{" "}
          <a
            href={`mailto:${LEGAL.contactEmail}`}
            className="text-orange-500 underline underline-offset-2"
          >
            {LEGAL.contactEmail}
          </a>{" "}
          from the email address tied to your account and ask us to delete it. We verify the
          request and remove your account within <strong>30 days</strong>.
        </p>
      </Section>

      <Section heading="What we delete">
        <ul className="ml-5 list-disc space-y-1">
          <li>your profile (name, email, country, and currency);</li>
          <li>all of your savings goals;</li>
          <li>all of your deposit records;</li>
          <li>your sign-in sessions and connected sign-in providers.</li>
        </ul>
      </Section>

      <Section heading="What we may retain">
        <p>
          We retain only anonymized or aggregated data that can no longer identify you, and any
          records we are required to keep by law. Everything else listed above is permanently
          removed.
        </p>
      </Section>

      <Section heading="Questions">
        <p>
          For anything about deleting your account or data, contact us at{" "}
          <a
            href={`mailto:${LEGAL.contactEmail}`}
            className="text-orange-500 underline underline-offset-2"
          >
            {LEGAL.contactEmail}
          </a>
          .
        </p>
      </Section>
    </LegalShell>
  )
}
