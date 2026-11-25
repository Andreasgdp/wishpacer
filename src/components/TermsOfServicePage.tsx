import React from 'react';
import { LegalLayout } from './LegalLayout';

export const TermsOfServicePage: React.FC = () => {
  return (
    <LegalLayout
      activePage="terms"
      badge="LEGAL // HOSTED_SERVICE_TERMS"
      title="Terms of Service"
      subtitle="Terms governing your use of the hosted WishPacer web service at wishpacer.com."
      lastUpdated="2026-11-25"
    >
      {/* 1. Scope: Hosted Service vs Open Source Code */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          1. Hosted Service vs. Open-Source License
        </h2>
        <p>
          These Terms of Service apply exclusively to the hosted WishPacer web service operated at{' '}
          <span className="font-mono text-xs">wishpacer.com</span> by <strong>BHelpful</strong>{' '}
          (CVR: <span className="font-mono text-xs tabular-nums">46951182</span>, Denmark).
        </p>
        <p>
          The WishPacer source code is separately licensed under the{' '}
          <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong> on{' '}
          <a
            href="https://github.com/Andreasgdp/wishpacer"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 dark:text-emerald-400 underline"
          >
            GitHub
          </a>
          . You are free to inspect, modify, and self-host the code under the AGPL-3.0 license.
          However, the AGPL-3.0 license grants rights only to the source code—not to the WishPacer
          name, logo, or <span className="font-mono text-xs">wishpacer.com</span> domain branding.
        </p>
      </section>

      {/* 2. The Service & As-Is Disclaimer */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          2. The Service (&ldquo;As-Is&rdquo;)
        </h2>
        <p>
          WishPacer is a personal wishlist prioritization and savings pacing calculator. You may use
          the core tool free of charge in local-only browser mode, or subscribe to our optional paid
          Cloud Sync tier for managed hosting, multi-device synchronization, and to support ongoing
          development.
        </p>
        <p>
          The hosted service is provided <strong>&ldquo;as-is&rdquo;</strong> and{' '}
          <strong>&ldquo;as-available&rdquo;</strong> without warranties of any kind, including
          implied warranties of merchantability, fitness for a particular purpose, or uninterrupted
          uptime. You are encouraged to periodically back up your plans using the built-in JSON
          Export feature.
        </p>
      </section>

      {/* 3. Not Financial Advice */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          3. Not Financial Advice
        </h2>
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 text-xs leading-relaxed">
          All savings timelines, priority waterfalls, emergency buffer calculations, and High-Yield
          Savings Account (HYSA) compounding projections displayed in WishPacer are for{' '}
          <strong>informational and personal planning purposes only</strong>. WishPacer does not
          provide financial, investment, tax, or legal advice, and does not connect to or move money
          in your bank accounts.
        </div>
      </section>

      {/* 4. Payments, Cancellation & 14-Day Refund Policy */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          4. Payments, Cancellation &amp; 14-Day Refunds
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Merchant of Record:</strong> Paid Cloud Sync subscriptions are processed and
            billed by <strong>Polar Software, Inc. (Polar.sh)</strong> acting as our Merchant of
            Record. Polar.sh handles payment processing, applicable VAT/sales tax, and receipts.
          </li>
          <li>
            <strong>Easy Cancellation:</strong> You can cancel your subscription at any time with
            one click via the self-serve Customer Portal linked in Global Settings. Upon
            cancellation, access continues until the end of your current billing period, after which
            cloud sync pauses while your local data and JSON export remain available.
          </li>
          <li>
            <strong>14-Day Right of Withdrawal / Refund Policy:</strong> In accordance with EU and
            Danish consumer protection law (<em>Forbrugeraftaleloven</em>), you may request a full,
            no-questions-asked refund within <strong>14 days</strong> of your initial purchase or
            renewal by emailing{' '}
            <a
              href="mailto:support@wishpacer.com"
              className="text-emerald-700 dark:text-emerald-400 underline"
            >
              support@wishpacer.com
            </a>
            .
          </li>
        </ul>
      </section>

      {/* 5. Acceptable Use & Account Termination */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          5. Acceptable Use
        </h2>
        <p>
          You agree not to abuse the hosted infrastructure, attempt unauthorized access to other
          users&apos; data, or use the service for unlawful purposes. We reserve the right to
          suspend accounts that violate these terms or threaten service stability.
        </p>
      </section>

      {/* 6. Limitation of Liability */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          6. Limitation of Liability
        </h2>
        <p>
          To the maximum extent permitted by applicable law, WishPacer and its operator shall not be
          liable for any indirect, incidental, special, or consequential damages, or loss of data or
          profits arising from your use of the service. Our total aggregate liability for any claim
          related to the hosted service is capped at the total amount you paid us in the{' '}
          <strong>12 months</strong> preceding the claim.
        </p>
      </section>

      {/* 7. Governing Law & Contact */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          7. Governing Law &amp; Contact
        </h2>
        <p>
          These Terms are governed by the laws of <strong>Denmark</strong>, without prejudice to
          mandatory consumer protection rules in your EU country of residence. Questions regarding
          these Terms can be sent to{' '}
          <a
            href="mailto:contact@wishpacer.com"
            className="text-emerald-700 dark:text-emerald-400 underline"
          >
            contact@wishpacer.com
          </a>
          , and billing or technical support inquiries to{' '}
          <a
            href="mailto:support@wishpacer.com"
            className="text-emerald-700 dark:text-emerald-400 underline"
          >
            support@wishpacer.com
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
};
