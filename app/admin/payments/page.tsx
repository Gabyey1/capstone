"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Homeowner = {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
};

type Due = {
  id: number;
  homeownerId: number;
  year: number;
  month: number;
  amount: string;
  amountPaid: string;
  balance: string;
  status: "UNPAID" | "PAID" | "OVERDUE" | "PARTIAL";
  homeowner: Homeowner;
};

type Payment = {
  id: number;
  homeownerId: number;
  dueId: number | null;
  amount: string;
  method: "GCASH" | "MAYA";
  status:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  referenceNumber: string | null;
  orNumber: string | null;
  paidAt: string | null;
  createdAt: string;
  homeowner: Homeowner;
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

const monthNames = [
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

function homeownerName(homeowner: Homeowner) {
  return `${homeowner.firstName} ${
    homeowner.middleName ? `${homeowner.middleName} ` : ""
  }${homeowner.lastName}`;
}

function formatAmount(amount: string | number) {
  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentsPage() {
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [homeownerId, setHomeownerId] = useState("");
  const [dueId, setDueId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"GCASH" | "MAYA">("GCASH");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        homeownersResponse,
        duesResponse,
        paymentsResponse,
      ] = await Promise.all([
        fetch("/api/admin/homeowners"),
        fetch("/api/admin/dues"),
        fetch("/api/admin/payments"),
      ]);

      if (
        !homeownersResponse.ok ||
        !duesResponse.ok ||
        !paymentsResponse.ok
      ) {
        throw new Error(
          "Unable to load payment information."
        );
      }

      const homeownersData =
        await homeownersResponse.json();

      const duesData =
        await duesResponse.json();

      const paymentsData =
        await paymentsResponse.json();

      setHomeowners(homeownersData.homeowners ?? []);
      setDues(duesData.dues ?? []);
      setPayments(paymentsData.payments ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  /*
   * Show ALL dues belonging to the selected homeowner.
   *
   * We no longer filter using balance > 0 here.
   * Fully paid dues will simply be disabled in the dropdown.
   */
  const homeownerDues = dues.filter(
    (due) =>
      String(due.homeownerId) === homeownerId
  );

  const selectedDue = dues.find(
    (due) => String(due.id) === dueId
  );

  function handleHomeownerChange(
    value: string
  ) {
    setHomeownerId(value);

    // Reset due and amount when homeowner changes.
    setDueId("");
    setAmount("");
  }

  function handleDueChange(value: string) {
    setDueId(value);

    const due = dues.find(
      (item) => String(item.id) === value
    );

    /*
     * Automatically place the remaining balance
     * into the amount field.
     *
     * The user can still edit it manually.
     */
    if (due && Number(due.balance) > 0) {
      setAmount(due.balance);
    } else {
      setAmount("");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!homeownerId) {
      setError("Please select a homeowner.");
      return;
    }

    if (!dueId) {
      setError("Please select a monthly due.");
      return;
    }

    if (!selectedDue) {
      setError("Selected due could not be found.");
      return;
    }

    if (Number(selectedDue.balance) <= 0) {
      setError(
        "This monthly due has already been fully paid."
      );
      return;
    }

    const paymentAmount = Number(amount);

    if (
      !amount ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (
      paymentAmount >
      Number(selectedDue.balance)
    ) {
      setError(
        `Payment cannot be greater than the remaining balance of ${formatAmount(
          selectedDue.balance
        )}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/admin/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            homeownerId: Number(homeownerId),
            dueId: Number(dueId),
            amount: paymentAmount,
            method,
            referenceNumber:
              referenceNumber.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to record payment."
        );
      }

      setSuccess(
        "Payment recorded successfully."
      );

      setHomeownerId("");
      setDueId("");
      setAmount("");
      setMethod("GCASH");
      setReferenceNumber("");

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to record payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Administrator
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Payments
            </h1>

            <p className="mt-2 text-gray-600">
              Record and manage homeowner payments.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        {/* RECORD PAYMENT */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Record Payment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Record a payment against an outstanding monthly due.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >

            {/* HOMEOWNER */}
            <div>
              <label
                htmlFor="homeowner"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Homeowner
              </label>

              <select
                id="homeowner"
                value={homeownerId}
                onChange={(event) =>
                  handleHomeownerChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                disabled={loading || submitting}
              >
                <option value="">
                  Select homeowner
                </option>

                {homeowners.map((homeowner) => (
                  <option
                    key={homeowner.id}
                    value={homeowner.id}
                  >
                    {homeownerName(homeowner)}
                  </option>
                ))}
              </select>
            </div>

            {/* MONTHLY DUE */}
            <div>
              <label
                htmlFor="due"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Monthly Due
              </label>

              <select
                id="due"
                value={dueId}
                onChange={(event) =>
                  handleDueChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                disabled={
                  !homeownerId ||
                  loading ||
                  submitting
                }
              >
                <option value="">
                  {!homeownerId
                    ? "Select homeowner first"
                    : homeownerDues.length === 0
                    ? "No dues found"
                    : "Select monthly due"}
                </option>

                {homeownerDues.map((due) => {
                  const fullyPaid =
                    Number(due.balance) <= 0;

                  return (
                    <option
                      key={due.id}
                      value={due.id}
                      disabled={fullyPaid}
                    >
                      {monthNames[due.month - 1]}{" "}
                      {due.year} —{" "}
                      {fullyPaid
                        ? "Fully Paid"
                        : `Balance ${formatAmount(
                            due.balance
                          )}`}
                    </option>
                  );
                })}
              </select>

              {homeownerId &&
                homeownerDues.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    This homeowner has no monthly dues.
                  </p>
                )}
            </div>

            {/* PAYMENT AMOUNT */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Payment Amount
              </label>

              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                disabled={submitting}
              />

              {selectedDue && (
                <p className="mt-2 text-xs text-gray-500">
                  Remaining balance:{" "}
                  <span className="font-semibold text-gray-900">
                    {formatAmount(
                      selectedDue.balance
                    )}
                  </span>
                </p>
              )}
            </div>

            {/* PAYMENT METHOD */}
            <div>
              <label
                htmlFor="method"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Payment Method
              </label>

              <select
                id="method"
                value={method}
                onChange={(event) =>
                  setMethod(
                    event.target.value as
                      | "GCASH"
                      | "MAYA"
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                disabled={submitting}
              >
                <option value="GCASH">
                  GCash
                </option>

                <option value="MAYA">
                  Maya
                </option>
              </select>
            </div>

            {/* REFERENCE NUMBER */}
            <div className="md:col-span-2">
              <label
                htmlFor="referenceNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Reference Number
                <span className="ml-1 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <input
                id="referenceNumber"
                type="text"
                value={referenceNumber}
                onChange={(event) =>
                  setReferenceNumber(
                    event.target.value
                  )
                }
                placeholder="Enter payment reference number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                disabled={submitting}
              />
            </div>

            {/* SUBMIT */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={
                  submitting ||
                  loading ||
                  !homeownerId ||
                  !dueId
                }
                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Recording Payment..."
                  : "Record Payment"}
              </button>
            </div>
          </form>
        </div>

        {/* PAYMENT HISTORY */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Previously recorded payments.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No payments found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Recorded payments will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Homeowner
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
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Reference
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {homeownerName(
                            payment.homeowner
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          {payment.homeowner.email ||
                            "No email"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.due
                          ? `${monthNames[
                              payment.due.month - 1
                            ]} ${
                              payment.due.year
                            }`
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatAmount(
                          payment.amount
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.method}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            payment.status ===
                            "PAID"
                              ? "bg-green-100 text-green-700"
                              : payment.status ===
                                "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.referenceNumber ||
                          "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.paidAt
                          ? new Date(
                              payment.paidAt
                            ).toLocaleDateString(
                              "en-PH"
                            )
                          : new Date(
                              payment.createdAt
                            ).toLocaleDateString(
                              "en-PH"
                            )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* BACK */}
        <div className="mt-6">
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}