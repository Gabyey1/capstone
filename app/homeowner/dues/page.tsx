"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DueStatus =
  | "UNPAID"
  | "PAID"
  | "OVERDUE"
  | "PARTIAL";

type Due = {
  id: number;
  homeownerId: number;
  year: number;
  month: number;
  amount: string;
  amountPaid: string;
  balance: string;
  status: DueStatus;
  createdAt: string;
  updatedAt: string;
};

function formatAmount(amount: string | number) {
  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatMonth(month: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[month - 1] ?? "Unknown";
}

function statusClasses(status: DueStatus) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "PARTIAL":
      return "bg-yellow-100 text-yellow-700";

    case "OVERDUE":
      return "bg-red-100 text-red-700";

    case "UNPAID":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function HomeownerDuesPage() {
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingDueId, setPayingDueId] = useState<number | null>(null);

  async function loadDues() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/homeowner/dues");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load your dues."
        );
      }

      setDues(data.dues ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your dues."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDues();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  async function handlePay(dueId: number) {
    try {
      setError("");
      setPayingDueId(dueId);

      const response = await fetch(
        "/api/homeowner/payments/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dueId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create payment checkout."
        );
      }

      const checkoutUrl = data?.checkout?.url;

      if (!checkoutUrl) {
        throw new Error(
          "Payment checkout URL was not returned."
        );
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment."
      );

      setPayingDueId(null);
    }
  }

  const totalBalance = dues.reduce(
    (total, due) => total + Number(due.balance),
    0
  );

  const totalPaid = dues.reduce(
    (total, due) => total + Number(due.amountPaid),
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Homeowner Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              My Monthly Dues
            </h1>

            <p className="mt-2 text-gray-600">
              View your monthly dues, payments, and remaining balances.
            </p>
          </div>

          <Link
            href="/homeowner"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Dues
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatAmount(
                dues.reduce(
                  (total, due) => total + Number(due.amount),
                  0
                )
              )}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Paid
            </p>

            <p className="mt-2 text-2xl font-bold text-green-700">
              {formatAmount(totalPaid)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Remaining Balance
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatAmount(totalBalance)}
            </p>
          </div>
        </div>

        {/* Dues */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Monthly Due History
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your monthly association dues.
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                {dues.length}{" "}
                {dues.length === 1
                  ? "Due"
                  : "Dues"}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading your dues...
            </div>
          ) : dues.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No dues found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your monthly dues will appear here once they are
                created by the administrator.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Month
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Due Amount
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Amount Paid
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Balance
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {dues.map((due) => (
                    <tr
                      key={due.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {formatMonth(due.month)}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {due.year}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatAmount(due.amount)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatAmount(due.amountPaid)}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatAmount(due.balance)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                            due.status
                          )}`}
                        >
                          {due.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {Number(due.balance) > 0 ? (
                          <button
                            type="button"
                            onClick={() => handlePay(due.id)}
                            disabled={payingDueId === due.id}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {payingDueId === due.id
                              ? "Processing..."
                              : "Pay"}
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-green-700">
                            Fully Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/homeowner"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}