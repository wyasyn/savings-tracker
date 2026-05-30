import type { Metadata } from "next"

import { LEGAL } from "@/lib/legal"
import { LegalShell, Section } from "@/components/legal/legal-shell"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing your use of Savings Tracker.",
}

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated={LEGAL.lastUpdated}>
      <p>
        These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of {LEGAL.appName}{" "}
        (the &ldquo;Service&rdquo;), operated by {LEGAL.operator} (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;). By creating an account or using the Service, you
        agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <Section heading="1. What the Service is">
        <p>
          {LEGAL.appName} is a personal savings-tracking tool. It helps you set savings goals and
          record deposits you have made elsewhere so you can monitor your progress. The figures you
          enter are for your own tracking only.
        </p>
        <p>
          We are <strong>not</strong> a bank, SACCO, mobile-money operator, or any other financial
          institution. We do not hold, receive, transfer, invest, or have access to your money. The
          Service does not provide financial, investment, tax, or legal advice.
        </p>
      </Section>

      <Section heading="2. Eligibility">
        <p>
          You must be at least 18 years old, or the age of majority in your jurisdiction, to use the
          Service. By using it you confirm that you meet this requirement.
        </p>
      </Section>

      <Section heading="3. Your account">
        <p>
          Sign-in is passwordless: you authenticate with a Google account or a one-time code sent to
          your email. You are responsible for keeping access to that email and Google account
          secure, and for all activity under your account. Tell us promptly if you suspect
          unauthorised access.
        </p>
      </Section>

      <Section heading="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>use the Service for any unlawful purpose or in breach of these Terms;</li>
          <li>attempt to access another user&rsquo;s account or data;</li>
          <li>
            interfere with, disrupt, probe, or place undue load on the Service or its
            infrastructure;
          </li>
          <li>copy, resell, or commercially exploit the Service without our written consent.</li>
        </ul>
      </Section>

      <Section heading="5. Your data">
        <p>
          The goals, deposits, and profile details you enter remain yours. You grant us a limited
          licence to store and process this content solely to provide the Service to you. Our
          handling of your personal data is described in our{" "}
          <a href="/privacy" className="text-orange-500 underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section heading="6. Availability and changes">
        <p>
          We aim to keep the Service available but provide it on an &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis without warranties of any kind. We may modify, suspend, or
          discontinue any part of the Service, and may update these Terms; material changes will be
          notified through the Service or by email, and continued use after changes means you accept
          them.
        </p>
      </Section>

      <Section heading="7. Disclaimers and limitation of liability">
        <p>
          You are solely responsible for the accuracy of the information you record and for any
          decisions you make based on it. To the fullest extent permitted by law, {LEGAL.operator}{" "}
          shall not be liable for any indirect, incidental, or consequential loss, or for any loss
          of data, profits, or savings, arising from your use of or inability to use the Service.
        </p>
      </Section>

      <Section heading="8. Termination">
        <p>
          You may stop using the Service and delete your account at any time. We may suspend or
          terminate your access if you breach these Terms or where required by law. On termination,
          the rights granted to you here end.
        </p>
      </Section>

      <Section heading="9. Governing law">
        <p>
          These Terms are governed by the laws of {LEGAL.jurisdiction}, and you submit to the
          non-exclusive jurisdiction of its courts.
        </p>
      </Section>

      <Section heading="10. Contact">
        <p>
          Questions about these Terms? Email us at{" "}
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
