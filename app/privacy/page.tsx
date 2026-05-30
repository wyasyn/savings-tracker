import type { Metadata } from "next"

import { LEGAL } from "@/lib/legal"
import { LegalShell, Section } from "@/components/legal/legal-shell"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Savings Tracker collects, uses, and protects your data.",
}

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated={LEGAL.lastUpdated}>
      <p>
        This Privacy Policy explains how {LEGAL.operator} (&ldquo;we&rdquo;, &ldquo;us&rdquo;)
        collects, uses, and protects your personal data when you use {LEGAL.appName} (the
        &ldquo;Service&rdquo;). We are the data controller, and we process your data in line with{" "}
        {LEGAL.dataLaw} and applicable data-protection principles.
      </p>

      <Section heading="1. Data we collect">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Account data</strong> — your email address, and (if you sign in with Google)
            your name and profile picture from Google.
          </li>
          <li>
            <strong>Profile data</strong> — what you tell us during onboarding: your preferred name,
            country, currency, the savings channels you use, and whether you belong to a SACCO
            (including its name, if you provide it).
          </li>
          <li>
            <strong>Savings data</strong> — the goals and deposit records you create, including
            amounts, notes, channels, and dates that you enter yourself.
          </li>
          <li>
            <strong>Technical data</strong> — sign-in session information and limited device/IP
            details needed to keep your account secure and operate the Service.
          </li>
        </ul>
        <p>
          We do not collect your bank, SACCO, or mobile-money account credentials, and we never have
          access to your actual money.
        </p>
      </Section>

      <Section heading="2. How we use your data">
        <ul className="ml-5 list-disc space-y-1">
          <li>to create your account and authenticate you (passwordless sign-in);</li>
          <li>to provide the core Service — storing and displaying your goals and deposits;</li>
          <li>to show every amount in your chosen currency and tailor the experience;</li>
          <li>to keep the Service secure, prevent abuse, and fix problems;</li>
          <li>to comply with our legal obligations.</li>
        </ul>
      </Section>

      <Section heading="3. Legal basis">
        <p>
          We process your data on the basis of your <strong>consent</strong> (which you give at
          onboarding and may withdraw at any time), to <strong>perform our agreement</strong> with
          you in providing the Service, and to pursue our <strong>legitimate interests</strong> in
          operating and securing it — consistent with {LEGAL.dataLaw}.
        </p>
      </Section>

      <Section heading="4. Who we share it with">
        <p>
          We do not sell your personal data. We share it only with service providers who process it
          on our behalf and under contract, namely:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Neon</strong> — managed database hosting where your data is stored;
          </li>
          <li>
            <strong>Vercel</strong> — application hosting that serves the Service;
          </li>
          <li>
            <strong>Google</strong> — authentication, if you choose to sign in with Google;
          </li>
          <li>
            <strong>Resend</strong> — delivery of one-time sign-in codes by email.
          </li>
        </ul>
        <p>We may also disclose data where required by law or to protect our rights.</p>
      </Section>

      <Section heading="5. International transfers">
        <p>
          Some of these providers may store or process data on servers located outside{" "}
          {LEGAL.jurisdiction}. Where that happens, we take reasonable steps to ensure your data
          remains protected to a standard consistent with {LEGAL.dataLaw}.
        </p>
      </Section>

      <Section heading="6. Data retention">
        <p>
          We keep your data for as long as your account is active. If you delete a goal or deposit it
          is removed from your records, and if you delete your account we delete your personal data,
          except where we are required to retain certain information by law.
        </p>
      </Section>

      <Section heading="7. Security">
        <p>
          We use appropriate technical and organisational measures — including encrypted connections,
          passwordless authentication, and access controls that scope your data to your account — to
          protect your personal data. No system is perfectly secure, but we work to keep your data
          safe.
        </p>
      </Section>

      <Section heading="8. Your rights">
        <p>Under {LEGAL.dataLaw}, you have the right to:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>access the personal data we hold about you;</li>
          <li>correct inaccurate or incomplete data;</li>
          <li>request deletion of your data;</li>
          <li>object to or restrict certain processing;</li>
          <li>withdraw consent at any time;</li>
          <li>lodge a complaint with {LEGAL.regulator}.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a
            href={`mailto:${LEGAL.contactEmail}`}
            className="text-orange-500 underline underline-offset-2"
          >
            {LEGAL.contactEmail}
          </a>
          .
        </p>
      </Section>

      <Section heading="9. Children">
        <p>
          The Service is not intended for anyone under 18, and we do not knowingly collect data from
          children. If you believe a child has provided us data, contact us and we will delete it.
        </p>
      </Section>

      <Section heading="10. Changes and contact">
        <p>
          We may update this Policy from time to time; material changes will be notified through the
          Service or by email. For any privacy question or request, email{" "}
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
