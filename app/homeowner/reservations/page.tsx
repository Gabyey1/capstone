"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Reservation = {
  id: number;
  facilityId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  amount: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  facility: {
    id: number;
    name: string;
    description: string | null;
    status: string;
  };
};

function formatAmount(amount: string | number) {
  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusClasses(status: ReservationStatus) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function HomeownerReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReservations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/homeowner/reservations"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load your reservations."
        );
      }

      setReservations(data.reservations ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your reservations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReservations();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Homeowner Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              My Reservations
            </h1>

            <p className="mt-2 text-gray-600">
              View your facility reservations and their current status.
            </p>
          </div>

          <Link
            href="/homeowner"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Reservations
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {reservations.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-700">
              {
                reservations.filter(
                  (reservation) =>
                    reservation.status === "PENDING"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Confirmed
            </p>

            <p className="mt-2 text-2xl font-bold text-green-700">
              {
                reservations.filter(
                  (reservation) =>
                    reservation.status === "CONFIRMED"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Reservation History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your facility reservation records.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading your reservations...
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No reservations found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your facility reservations will appear here once
                they are created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Facility
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Time
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {reservation.facility.name}
                        </div>

                        {reservation.facility.description && (
                          <div className="mt-1 text-xs text-gray-500">
                            {reservation.facility.description}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(
                          reservation.reservationDate
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatTime(
                          reservation.startTime
                        )}{" "}
                        –{" "}
                        {formatTime(
                          reservation.endTime
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatAmount(reservation.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                            reservation.status
                          )}`}
                        >
                          {reservation.status}
                        </span>
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