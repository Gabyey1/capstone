"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewHomeownerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    contactNumber: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/homeowners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create homeowner.");
        setLoading(false);
        return;
      }

      router.push("/admin/homeowners");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Administrator
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Add Homeowner
          </h1>

          <p className="mt-2 text-gray-600">
            Create a homeowner profile and login account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow"
        >
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

            <div>
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

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Temporary Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />

              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 characters.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/homeowners")}
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Homeowner"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}