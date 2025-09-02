// app/plan-builder/payment-info/page.tsx
import Link from "next/link";
import { ShieldCheck, CreditCard, Sparkles } from "lucide-react";
import { getPriceRupees } from "@/lib/pricing"; // reads PLANINSTA_PRICE_RUPEES on the server

export default function PaymentInfoPage() {
  // Server component: safe to read non-public env via lib helper
  const rupees = getPriceRupees();                 // e.g., 999
  const AMOUNT_DISPLAY = `₹${rupees}`;             // "₹999"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header / banner */}
        <div
          className="px-8 py-10 text-white text-center rounded-b-3xl
                     bg-gradient-to-r from-[#FF7A00] to-[#F0435C]"
        >
          <h1 className="text-3xl font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7" />
            Complete Your Payment
          </h1>
          <p className="mt-2 text-sm/relaxed opacity-90">
            Unlock full access to the plan builder instantly after payment.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-6 text-center">
          <p className="text-base text-gray-600 dark:text-gray-300">
            Please pay <span className="font-semibold">{AMOUNT_DISPLAY}</span> to continue.
          </p>

          {/* Features / bullets */}
          <ul className="text-left space-y-3 text-sm text-gray-600 dark:text-gray-300 mx-auto max-w-sm">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              Secure payment handled by Razorpay
            </li>
            <li className="flex items-start gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
              Instant confirmation & auto-redirect
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 shrink-0" />
              Continue editing or generating plans immediately
            </li>
          </ul>

          {/* CTA */}
          {/* Amount is now sourced server-side; no query string needed */}
          <Link
            href="/plan-builder/payment"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition"
          >
            Get Started
            <CreditCard className="w-4 h-4" />
          </Link>

          {/* Small print */}
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4">
            By proceeding, you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
