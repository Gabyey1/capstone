"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

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
  amount: string | number;
  amountPaid: string | number;
  balance: string | number;
  status: "UNPAID" | "PAID" | "OVERDUE" | "PARTIAL";
  homeowner: Homeowner;
};

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

export default function AdminDuesPage() {
  const [dues, setDues] = useState<Due[]>([]);
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);

  const [homeownerId, setHomeownerId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [duesResponse, homeownersResponse] =
        await Promise.all([
          fetch("/api/admin/dues"),
          fetch("/api/admin/homeowners"),
        ]);

      const duesData = await duesResponse.json();
      const homeownersData = await homeownersResponse.json();

      if (!duesResponse.ok) {
        throw new Error(
          duesData.error || "Unable to load dues."
        );
      }

      if (!homeownersResponse.ok) {
        throw new Error(
          homeownersData.error ||
            "Unable to load homeowners."
        );
      }

      setDues(duesData.dues || []);

      /*
       * The existing homeowners API currently only has POST.
       * Therefore, if it doesn't return homeowners here,
       * we will load them directly through the server page
       * in the next step.
       */
      if (Array.isArray(homeownersData.homeowners)) {
        setHomeowners(homeownersData.homeowners);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load data."
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/admin/dues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeownerId: Number(homeownerId),
          year: Number(year),
          month: Number(month),
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to create due."
        );
        setSaving(false);
        return;
      }

      setSuccess("Monthly due created successfully.");

      setHomeownerId("");
      setAmount("");

      await loadData();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatAmount(value: string | number) {
    return Number(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function getStatusClass(status: Due["status"]) {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700";

      case "OVERDUE":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>

            <p className="mt-6 text-sm font-medium text-gray-500">
              Administrator
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Monthly Dues
            </h1>

            <p className="mt-2 text-gray-600">
              Manage homeowner monthly dues.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-8 shadow">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create Monthly Due
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Assign a monthly due to a homeowner.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-4"
          >
            <div className="md:col-span-2">
              <label
                htmlFor="homeownerId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Homeowner
              </label>

              <select
                id="homeownerId"
                value={homeownerId}
                onChange={(event) =>
                  setHomeownerId(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              >
                <option value="">
                  Select homeowner
                </option>

                {homeowners.map((homeowner) => (
                  <option
                    key={homeowner.id}
                    value={homeowner.id}
                  >
                    {homeowner.firstName}{" "}
                    {homeowner.middleName
                      ? `${homeowner.middleName} `
                      : ""}
                    {homeowner.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="month"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Month
              </label>

              <select
                id="month"
                value={month}
                onChange={(event) =>
                  setMonth(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              >
                {months.map((monthName, index) => (
                  <option
                    key={monthName}
                    value={index + 1}
                  >
                    {monthName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="year"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Year
              </label>

              <input
                id="year"
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) =>
                  setYear(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Amount
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
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving || homeowners.length === 0}
                className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Due"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {homeowners.length === 0 && !loading && (
            <div className="mt-6 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              No homeowners are available yet. Add a homeowner
              first.
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Due Records
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading dues...
            </div>
          ) : dues.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No dues found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create a monthly due to get started.
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
                      Period
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Paid
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Balance
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
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
                          {due.homeowner.firstName}{" "}
                          {due.homeowner.middleName
                            ? `${due.homeowner.middleName} `
                            : ""}
                          {due.homeowner.lastName}
                        </div>

                        {due.homeowner.email && (
                          <div className="mt-1 text-sm text-gray-500">
                            {due.homeowner.email}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {months[due.month - 1]} {due.year}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₱{formatAmount(due.amount)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        ₱{formatAmount(due.amountPaid)}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₱{formatAmount(due.balance)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            due.status
                          )}`}
                        >
                          {due.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}