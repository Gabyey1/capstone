"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Homeowner = {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  contactNumber: string | null;
};

type Facility = {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
};

type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type Reservation = {
  id: number;
  homeownerId: number;
  facilityId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  amount: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  homeowner: Homeowner;
  facility: Facility;
};

function homeownerName(homeowner: Homeowner) {
  return `${homeowner.firstName} ${
    homeowner.middleName
      ? `${homeowner.middleName} `
      : ""
  }${homeowner.lastName}`;
}

function formatAmount(amount: string | number) {
  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusClasses(status: ReservationStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "CONFIRMED":
      return "bg-green-100 text-green-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function ReservationsPage() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function loadReservations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reservation"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load reservations."
        );
      }

      setReservations(
        data.reservations ?? []
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reservations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReservations();
    }, 0);

    return () =>
      window.clearTimeout(timer);
  }, []);

  async function updateStatus(
    reservationId: number,
    status: ReservationStatus
  ) {
    try {
      setUpdatingId(reservationId);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/admin/reservation",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: reservationId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update reservation."
        );
      }

      setSuccess(
        "Reservation status updated successfully."
      );

      await loadReservations();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update reservation."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Administrator
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Reservations
            </h1>

            <p className="mt-2 text-gray-600">
              View and manage homeowner facility reservations.
            </p>
          </div>

          <Link
            href="/admin"
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

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Reservation List
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage reservations submitted by homeowners.
                </p>
              </div>

              <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                {reservations.length}{" "}
                {reservations.length === 1
                  ? "Reservation"
                  : "Reservations"}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading reservations...
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No reservations found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Homeowner reservations will appear here.
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

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {reservations.map(
                    (reservation) => (
                      <tr
                        key={reservation.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {homeownerName(
                              reservation.homeowner
                            )}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {reservation.homeowner.email ||
                              "No email"}
                          </div>

                          {reservation.homeowner
                            .contactNumber && (
                            <div className="mt-1 text-xs text-gray-500">
                              {
                                reservation.homeowner
                                  .contactNumber
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {
                              reservation.facility
                                .name
                            }
                          </div>

                          {reservation.facility
                            .description && (
                            <div className="mt-1 max-w-xs text-xs text-gray-500">
                              {
                                reservation.facility
                                  .description
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            reservation.reservationDate
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTime(
                            reservation.startTime
                          )}{" "}
                          —{" "}
                          {formatTime(
                            reservation.endTime
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatAmount(
                            reservation.amount
                          )}
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

                        <td className="px-6 py-4">
                          <select
                            value={
                              reservation.status
                            }
                            onChange={(event) =>
                              updateStatus(
                                reservation.id,
                                event.target
                                  .value as ReservationStatus
                              )
                            }
                            disabled={
                              updatingId ===
                              reservation.id
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="PENDING">
                              Pending
                            </option>

                            <option value="CONFIRMED">
                              Confirmed
                            </option>

                            <option value="CANCELLED">
                              Cancelled
                            </option>

                            <option value="COMPLETED">
                              Completed
                            </option>
                          </select>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

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