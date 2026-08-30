"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Facility = {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] =
    useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadFacilities() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/facilities"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load facilities."
        );
      }

      setFacilities(data.facilities ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load facilities."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFacilities();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Facility name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/facilities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create facility."
        );
      }

      setSuccess("Facility created successfully.");

      setName("");
      setDescription("");
      setStatus("ACTIVE");

      await loadFacilities();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create facility."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Administrator
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Facilities
            </h1>

            <p className="mt-2 text-gray-600">
              Manage facilities available for homeowner
              reservations.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Add Facility */}
        <div className="mb-8 rounded-2xl bg-white p-8 shadow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Add Facility
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a facility that homeowners can reserve.
            </p>
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

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Facility Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Basketball Court"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                disabled={saving}
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "ACTIVE"
                      | "INACTIVE"
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                disabled={saving}
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
                <span className="ml-1 font-normal text-gray-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the facility..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                disabled={saving}
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "Add Facility"}
              </button>
            </div>
          </form>
        </div>

        {/* Facility List */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Facilities
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Facilities currently registered in the system.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading facilities...
            </div>
          ) : facilities.length === 0 ? (
            <div className="p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No facilities found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Add your first facility using the form above.
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
                      Description
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {facilities.map((facility) => (
                    <tr
                      key={facility.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {facility.name}
                        </div>

                        <div className="text-xs text-gray-500">
                          ID: {facility.id}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {facility.description ||
                          "No description"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            facility.status ===
                            "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {facility.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(
                          facility.createdAt
                        ).toLocaleDateString("en-PH")}
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