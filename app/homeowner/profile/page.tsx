import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomeownerProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "HOMEOWNER") {
    redirect("/admin");
  }

  const userId = Number(session.user.id);

  const homeowner = await prisma.homeowner.findUnique({
    where: {
      userId,
    },
  });

  if (!homeowner) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile
            </h1>

            <p className="mt-3 text-gray-600">
              Your homeowner profile could not be found.
            </p>

            <Link
              href="/homeowner"
              className="mt-6 inline-block text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Homeowner Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              My Profile
            </h1>

            <p className="mt-2 text-gray-600">
              View your registered homeowner information.
            </p>
          </div>

          <Link
            href="/homeowner"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow">
          <h2 className="text-xl font-bold text-gray-900">
            Personal Information
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                First Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {homeowner.firstName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Middle Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {homeowner.middleName || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Last Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {homeowner.lastName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {homeowner.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Contact Number
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {homeowner.contactNumber || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Homeowner ID
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {homeowner.id}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">
                Address
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {homeowner.address}
              </p>
            </div>
          </div>
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