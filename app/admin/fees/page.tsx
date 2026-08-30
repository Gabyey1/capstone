"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FeeType =
  | "MONTHLY_DUES"
  | "BASKETBALL_COURT"
  | "TENNIS_COURT"
  | "CLUBHOUSE";

type FeeSetting = {
  id: number;
  type: FeeType;
  amount: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const feeInformation: Record<
  FeeType,
  {
    name: string;
    description: string;
  }
> = {
  MONTHLY_DUES: {
    name: "Monthly Dues",
    description: "Regular monthly homeowner dues.",
  },

  BASKETBALL_COURT: {
    name: "Basketball Court",
    description: "Fee for reserving the basketball court.",
  },

  TENNIS_COURT: {
    name: "Tennis Court",
    description: "Fee for reserving the tennis court.",
  },

  CLUBHOUSE: {
    name: "Clubhouse",
    description: "Fee for reserving the clubhouse.",
  },
};

const feeTypes: FeeType[] = [
  "MONTHLY_DUES",
  "BASKETBALL_COURT",
  "TENNIS_COURT",
  "CLUBHOUSE",
];

export default function AdminFeesPage() {
  const [fees, setFees] = useState<
    Partial<Record<FeeType, FeeSetting>>
  >({});

  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] =
    useState<FeeType | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadFees() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/fees");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load fee settings."
        );
      }

      const feeMap: Partial<
        Record<FeeType, FeeSetting>
      > = {};

      for (const fee of data.fees ?? []) {
        feeMap[fee.type as FeeType] = fee;
      }

      setFees(feeMap);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load fee settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFees();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updateLocalFee(
    type: FeeType,
    field: "amount" | "description" | "isActive",
    value: string | boolean
  ) {
    setFees((current) => {
      const existing = current[type];

      return {
        ...current,
        [type]: {
          id: existing?.id ?? 0,
          type,
          amount:
            field === "amount"
              ? String(value)
              : existing?.amount ?? "",
          description:
            field === "description"
              ? String(value)
              : existing?.description ?? "",
          isActive:
            field === "isActive"
              ? Boolean(value)
              : existing?.isActive ?? true,
          createdAt: existing?.createdAt ?? "",
          updatedAt: existing?.updatedAt ?? "",
        },
      };
    });
  }

  async function saveFee(type: FeeType) {
    const fee = fees[type];

    if (!fee) {
      setError("Please enter a fee amount.");
      return;
    }

    const amount = Number(fee.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError(
        `${feeInformation[type].name} amount must be greater than 0.`
      );
      return;
    }

    try {
      setSavingType(type);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount,
          description: fee.description,
          isActive: fee.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save fee setting."
        );
      }

      setSuccess(
        `${feeInformation[type].name} fee saved successfully.`
      );

      await loadFees();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save fee setting."
      );
    } finally {
      setSavingType(null);
    }
  }

  function formatAmount(amount: string) {
    if (!amount) {
      return "0.00";
    }

    return Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
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
            Fee Settings
          </h1>

          <p className="mt-2 text-gray-600">
            Manage the fees used for monthly dues and
            facility reservations.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              Loading fee settings...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {feeTypes.map((type) => {
              const fee = fees[type];

              return (
                <div
                  key={type}
                  className="rounded-2xl bg-white p-8 shadow"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {feeInformation[type].name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {feeInformation[type].description}
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${type}-amount`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Amount
                      </label>

                      <div className="flex">
                        <span className="flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-4 text-gray-600">
                          ₱
                        </span>

                        <input
                          id={`${type}-amount`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={fee?.amount ?? ""}
                          onChange={(event) =>
                            updateLocalFee(
                              type,
                              "amount",
                              event.target.value
                            )
                          }
                          placeholder="0.00"
                          className="w-full rounded-r-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                        />
                      </div>

                      {fee?.amount && (
                        <p className="mt-2 text-sm text-gray-500">
                          Current value: ₱
                          {formatAmount(fee.amount)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`${type}-description`}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>

                      <input
                        id={`${type}-description`}
                        type="text"
                        value={fee?.description ?? ""}
                        onChange={(event) =>
                          updateLocalFee(
                            type,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Enter description"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={fee?.isActive ?? true}
                        onChange={(event) =>
                          updateLocalFee(
                            type,
                            "isActive",
                            event.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        Active
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => void saveFee(type)}
                      disabled={savingType === type}
                      className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingType === type
                        ? "Saving..."
                        : "Save Fee"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}