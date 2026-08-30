"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Homeowner = {
  id: number;
  userId: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string;
  contactNumber: string | null;
  email: string | null;
};

export default function HomeownerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [homeowner, setHomeowner] = useState<Homeowner | null>(
    null
  );

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    contactNumber: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadHomeowner() {
      try {
        const response = await fetch(
          `/api/admin/homeowners/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error || "Unable to load homeowner."
          );
          setLoading(false);
          return;
        }

        const homeownerData = data.homeowner as Homeowner;

        setHomeowner(homeownerData);

        setForm({
          firstName: homeownerData.firstName || "",
          middleName: homeownerData.middleName || "",
          lastName: homeownerData.lastName || "",
          address: homeownerData.address || "",
          contactNumber:
            homeownerData.contactNumber || "",
          email: homeownerData.email || "",
        });

        setLoading(false);
      } catch {
        setError("Unable to load homeowner.");
        setLoading(false);
      }
    }

    loadHomeowner();
  }, [id]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/homeowners/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to update homeowner."
        );
        setSaving(false);
        return;
      }

      setHomeowner(data.homeowner);
      setSuccess("Homeowner details updated successfully.");
      setSaving(false);

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow">
            <p className="text-gray-600">
              Loading homeowner...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !homeowner) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow">
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>

            <Link
              href="/admin/homeowners"
              className="mt-6 inline-block text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              ← Back to Homeowners
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/admin/homeowners"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Homeowners
          </Link>

          <p className="mt-6 text-sm font-medium text-gray-500">
            Administrator
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Homeowner Details
          </h1>

          <p className="mt-2 text-gray-600">
            View and update homeowner information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow"
        >
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Homeowner ID: {homeowner?.id}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                First Name
              </label>

              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label
                htmlFor="middleName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Middle Name
              </label>

              <input
                id="middleName"
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>

              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label
                htmlFor="contactNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Contact Number
              </label>

              <input
                id="contactNumber"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Address
              </label>

              <input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

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

          <div className="mt-8 flex gap-3">
            <Link
              href="/admin/homeowners"
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}