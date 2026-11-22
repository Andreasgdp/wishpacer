import React from 'react';
import { LegalLayout } from './LegalLayout';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalLayout
      activePage="privacy"
      badge="LEGAL // GDPR_ART_13_14"
      title="Privacy Policy"
      subtitle="Plain-English disclosure of what data WishPacer processes, why, who handles it, and how you can export or erase it."
      lastUpdated="2026-11-22"
    >
      {/* 1. Data Controller */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          1. Who We Are (Data Controller)
        </h2>
        <p>
          This Privacy Policy applies to the hosted WishPacer web application at{' '}
          <span className="font-mono text-xs">wishpacer.com</span>.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-[#21262D] font-mono text-xs space-y-1">
          <p>
            <span className="text-slate-500 dark:text-[#8B949E]">Controller:</span> [PMV Business
            Name — Pending Registration] (Andreas Petersen)
          </p>
          <p>
            <span className="text-slate-500 dark:text-[#8B949E]">CVR Number:</span> [CVR-XXXXXXXX —
            Pending Registration]
          </p>
          <p>
            <span className="text-slate-500 dark:text-[#8B949E]">Jurisdiction:</span> Denmark (EU)
          </p>
          <p>
            <span className="text-slate-500 dark:text-[#8B949E]">Privacy Contact:</span>{' '}
            <a
              href="mailto:contact@wishpacer.com"
              className="text-emerald-700 dark:text-emerald-400 underline"
            >
              contact@wishpacer.com
            </a>
          </p>
          <p>
            <span className="text-slate-500 dark:text-[#8B949E]">Security Reports:</span>{' '}
            <a
              href="mailto:security@wishpacer.com"
              className="text-emerald-700 dark:text-emerald-400 underline"
            >
              security@wishpacer.com
            </a>
          </p>
        </div>
      </section>

      {/* 2. Data Collected & Legal Basis */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          2. What Data We Collect &amp; Legal Basis
        </h2>
        <p>
          WishPacer operates in two modes so you only share personal data if you choose cloud
          synchronization:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Free Local-Only Mode &amp; Demo:</strong> Your savings plans, wishlist items,
            and currency settings are stored strictly in your browser&apos;s{' '}
            <code className="font-mono text-xs">localStorage</code> /{' '}
            <code className="font-mono text-xs">sessionStorage</code>. No account is created and no
            plan data is transmitted to our database.
          </li>
          <li>
            <strong>Cloud Sync Accounts (Paid Hosting Tier):</strong> If you create an account to
            sync across devices, we process your email address, authentication identifier (Clerk
            User ID), currency preferences, and the savings plans / wishlist items you choose to
            save. <em>Legal basis:</em> Performance of a contract (GDPR Art. 6(1)(b)).
          </li>
          <li>
            <strong>Billing &amp; Subscription Records:</strong> If you subscribe to Cloud Sync, our
            Merchant of Record (Polar.sh) collects payment details, billing address, and tax/VAT
            information. We only receive your subscription status and customer reference ID—never
            your card number. <em>Legal basis:</em> Contract (Art. 6(1)(b)) and legal obligation
            under Danish bookkeeping law (Art. 6(1)(c)).
          </li>
          <li>
            <strong>Cookieless Traffic &amp; Performance Telemetry:</strong> We use Vercel Analytics
            and Vercel Speed Insights to measure aggregate page loads and Core Web Vitals without
            cookies or cross-site tracking. <em>Legal basis:</em> Legitimate interest in operating a
            reliable service (GDPR Art. 6(1)(f)).
          </li>
        </ul>
      </section>

      {/* 3. Sub-processors */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          3. Sub-Processors (Third-Party Services)
        </h2>
        <p>
          We do not sell your data or run third-party ad networks. Only the infrastructure providers
          listed below process data on our behalf:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#21262D] font-mono text-[11px] uppercase text-slate-500 dark:text-[#8B949E]">
                <th className="py-2 pr-4">Provider</th>
                <th className="py-2 pr-4">Purpose</th>
                <th className="py-2">Applies To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-[#21262D]">
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-[#111714] dark:text-[#E6EDF3]">
                  Vercel Inc.
                </td>
                <td className="py-2.5 pr-4">
                  Web hosting, serverless API functions, cookieless analytics &amp; Speed Insights
                </td>
                <td className="py-2.5 font-mono">All visitors</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-[#111714] dark:text-[#E6EDF3]">
                  Clerk, Inc.
                </td>
                <td className="py-2.5 pr-4">User authentication &amp; session management</td>
                <td className="py-2.5 font-mono">Cloud Sync accounts</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-[#111714] dark:text-[#E6EDF3]">
                  Turso (ChiselStrike, Inc.)
                </td>
                <td className="py-2.5 pr-4">
                  Encrypted cloud database storage for plans &amp; wishlists
                </td>
                <td className="py-2.5 font-mono">Cloud Sync accounts</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-[#111714] dark:text-[#E6EDF3]">
                  Polar Software, Inc. (Polar.sh)
                </td>
                <td className="py-2.5 pr-4">
                  Merchant of Record, payment processing, VAT/sales tax &amp; customer portal
                </td>
                <td className="py-2.5 font-mono">Paid subscribers</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#8B949E]">
          Web fonts (Inter and JetBrains Mono) are self-hosted directly from our application bundle
          so your browser does not send requests to external font CDNs.
        </p>
      </section>

      {/* 4. Data Retention */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          4. How Long We Keep Your Data
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account &amp; App Data:</strong> Retained until you delete your account. Using{' '}
            <strong>Delete Account &amp; Erase All Data</strong> in Global Settings immediately
            purges your database rows and authentication account. Deletion requests sent to{' '}
            <a
              href="mailto:contact@wishpacer.com"
              className="text-emerald-700 dark:text-emerald-400 underline"
            >
              contact@wishpacer.com
            </a>{' '}
            are completed within 30 days.
          </li>
          <li>
            <strong>Billing &amp; Accounting Records:</strong> Payment invoices and transaction
            records are retained for <strong>5 years</strong> from the end of the financial year as
            required by the Danish Bookkeeping Act (<em>Bogføringsloven</em>). This statutory
            requirement takes precedence over erasure requests for historical invoices.
          </li>
        </ul>
      </section>

      {/* 5. Cookies & Local Storage */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          5. Cookies &amp; Browser Storage
        </h2>
        <p>
          We only use <strong>strictly necessary cookies</strong> for authentication and session
          security when you sign in to a Cloud Sync account, plus browser{' '}
          <code className="font-mono text-xs">localStorage</code> /{' '}
          <code className="font-mono text-xs">sessionStorage</code> to save your theme preference
          and local plans. We do not use advertising, behavioral profiling, or third-party tracking
          cookies.
        </p>
      </section>

      {/* 6. Your GDPR Rights */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#111714] dark:text-[#E6EDF3]">
          6. Your Rights Under GDPR
        </h2>
        <p>Under the EU General Data Protection Regulation, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Access &amp; Data Portability:</strong> Export all your plans and wishlists at
            any time in JSON format via the in-app Export tool, or request a full copy by email.
          </li>
          <li>
            <strong>Rectification &amp; Erasure:</strong> Edit your data directly in the app or
            permanently delete your account via Global Settings or by emailing{' '}
            <a
              href="mailto:contact@wishpacer.com"
              className="text-emerald-700 dark:text-emerald-400 underline"
            >
              contact@wishpacer.com
            </a>
            .
          </li>
          <li>
            <strong>Restriction &amp; Objection:</strong> Contact us if you wish to restrict or
            object to processing based on legitimate interest.
          </li>
          <li>
            <strong>Lodge a Complaint:</strong> You have the right to file a complaint with the
            Danish Data Protection Agency (<strong>Datatilsynet</strong>) at{' '}
            <a
              href="https://www.datatilsynet.dk"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 dark:text-emerald-400 underline"
            >
              datatilsynet.dk
            </a>
            .
          </li>
        </ul>
      </section>
    </LegalLayout>
  );
};
