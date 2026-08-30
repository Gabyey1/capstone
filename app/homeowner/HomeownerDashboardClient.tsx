"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = {
  firstName: string;
  email: string;
  totalBalance: number;
  totalPaid: number;
  latestDueAmount: number;
  latestDueBalance: number;
  latestDueLabel: string;
};

export default function HomeownerDashboardClient({
  firstName,
  email,
  totalBalance,
  totalPaid,
  latestDueAmount,
  latestDueBalance,
  latestDueLabel,
}: Props) {
  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  function formatAmount(amount: number) {
    return amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Homeowner Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Welcome, {firstName}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/homeowner/profile"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              My Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="text-sm text-gray-500">{email}</p>

          {/* Financial Summary */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Outstanding Balance
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                ₱{formatAmount(totalBalance)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Total unpaid balance
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Total Paid
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                ₱{formatAmount(totalPaid)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Payments credited to your dues
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Latest Monthly Due
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                ₱{formatAmount(latestDueAmount)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {latestDueLabel}
              </p>

              {latestDueAmount > 0 && (
  <p className="mt-2 text-sm font-medium text-gray-700">
    Remaining: ₱{formatAmount(latestDueBalance)}
  </p>
)}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Link
                href="/homeowner/dues"
                className="rounded-xl border border-gray-200 p-5 transition hover:border-gray-400 hover:bg-gray-50"
              >
                <p className="text-sm text-gray-500">
                  Monthly Dues
                </p>

                <p className="mt-2 text-lg font-semibold text-gray-900">
                  View Dues →
                </p>
              </Link>

              <Link
                href="/homeowner/payments"
                className="rounded-xl border border-gray-200 p-5 transition hover:border-gray-400 hover:bg-gray-50"
              >
                <p className="text-sm text-gray-500">
                  Payments
                </p>

                <p className="mt-2 text-lg font-semibold text-gray-900">
                  Payment History →
                </p>
              </Link>

              <Link
                href="/homeowner/reservations"
                className="rounded-xl border border-gray-200 p-5 transition hover:border-gray-400 hover:bg-gray-50"
              >
                <p className="text-sm text-gray-500">
                  Reservations
                </p>

                <p className="mt-2 text-lg font-semibold text-gray-900">
                  My Reservations →
                </p>
              </Link>
            </div>
          </div>

          {/* Profile */}
          <div className="mt-4">
            <Link
              href="/homeowner/profile"
              className="block rounded-xl border border-gray-200 p-5 transition hover:border-gray-400 hover:bg-gray-50"
            >
              <p className="text-sm text-gray-500">
                Account
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                View My Profile →
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}