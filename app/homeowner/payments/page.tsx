"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentMethod = "GCASH" | "MAYA";

type Payment = {
  id: number;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string | null;
  orNumber: string | null;
  paidAt: string | null;
  createdAt: string;
  due: {
    id: number;
    year: number;
    month: number;
    amount: string;
    amountPaid: string;
    balance: string;
    status: string;
  } | null;
  receipt: {
    id: number;
    receiptNumber: string;
    issuedAt: string;
  } | null;
};

type Due = {
  id: number;
  year: number;
  month: number;
  amount: string;
  amountPaid: string;
  balance: string;
  status: string;
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

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClasses(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "FAILED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function HomeownerPaymentsContent() {
  const searchParams = useSearchParams();

  const selectedDueId = searchParams.get("dueId");

  const paymentResult = searchParams.get("payment");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedDue, setSelectedDue] = useState<Due | null>(null);

  const [loading, setLoading] = useState(true);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [error, setError] = useState("");

  const [checkoutError, setCheckoutError] = useState("");

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/homeowner/payments");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load your payments."
        );
      }

      setPayments(data.payments ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your payments."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectedDue() {
    if (!selectedDueId) {
      setSelectedDue(null);
      return;
    }

    try {
      const response = await fetch("/api/homeowner/dues");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load the selected due."
        );
      }

      const dues: Due[] = data.dues ?? [];

      const due = dues.find(
        (item) =>
          String(item.id) === String(selectedDueId)
      );

      if (!due) {
        throw new Error(
          "The selected monthly due could not be found."
        );
      }

      setSelectedDue(due);
    } catch (err) {
      console.error(err);

      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Unable to load the selected due."
      );
    }
  }

  async function startCheckout() {
    if (!selectedDue) {
      setCheckoutError(
        "Please select a valid monthly due first."
      );
      return;
    }

    if (Number(selectedDue.balance) <= 0) {
      setCheckoutError(
        "This monthly due has already been fully paid."
      );
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutError("");

      const response = await fetch(
        "/api/homeowner/payments/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dueId: selectedDue.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to start payment."
        );
      }

      const checkoutUrl = data.checkout?.url;

      if (!checkoutUrl) {
        throw new Error(
          "Payment checkout URL was not returned."
        );
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      console.error(err);

      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Unable to start payment."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPayments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSelectedDue();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedDueId]);

  const totalPaid = payments
    .filter(
      (payment) =>
        payment.status === "PAID"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount),
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
              Payment History
            </h1>

            <p className="mt-2 text-gray-600">
              View your recorded payments, payment methods,
              and receipts.
            </p>
          </div>

          <Link
            href="/homeowner"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Payment result */}
        {paymentResult === "success" && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Your payment was submitted successfully.
            Payment confirmation will appear here once
            PayMongo confirms the transaction.
          </div>
        )}

        {paymentResult === "cancelled" && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
            The payment checkout was cancelled.
            No payment was marked as paid.
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Selected due payment card */}
        {selectedDue && (
          <div className="mb-6 rounded-2xl bg-white p-6 shadow">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Payment for
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {formatMonth(selectedDue.month)}{" "}
                  {selectedDue.year}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Remaining balance
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {formatAmount(selectedDue.balance)}
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:items-end">

                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={
                    checkoutLoading ||
                    Number(selectedDue.balance) <= 0
                  }
                  className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkoutLoading
                    ? "Opening Checkout..."
                    : Number(selectedDue.balance) <= 0
                    ? "Fully Paid"
                    : "Pay Now"}
                </button>

                <p className="text-xs text-gray-500">
                  Secure payment through PayMongo
                </p>
              </div>
            </div>

            {checkoutError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {checkoutError}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Payments
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {payments.length}
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
              Paid Transactions
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                payments.filter(
                  (payment) =>
                    payment.status === "PAID"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Payment history */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              My Payments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Payments associated with your homeowner account.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading your payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center">

              <h3 className="text-lg font-semibold text-gray-900">
                No payments found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your payment history will appear here once
                payments are recorded.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Due
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Method
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Reference
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Receipt
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(
                          payment.paidAt ??
                            payment.createdAt
                        )}
                      </td>

                      <td className="px-6 py-4">

                        {payment.due ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {formatMonth(
                                payment.due.month
                              )}
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              {payment.due.year}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            General Payment
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatAmount(payment.amount)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {payment.method}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.referenceNumber || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.receipt?.receiptNumber || "—"}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>

                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>

            </div>
          )}
        </div>

        {/* Back */}
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

export default function HomeownerPaymentsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl bg-white p-10 text-center shadow">
              <p className="text-sm text-gray-500">
                Loading payment history...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <HomeownerPaymentsContent />
    </Suspense>
  );
}