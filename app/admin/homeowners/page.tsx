import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomeownersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const homeowners = await prisma.homeowner.findMany({
    orderBy: [
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Administrator
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Homeowners
            </h1>

            <p className="mt-2 text-gray-600">
              Manage registered homeowners.
            </p>
          </div>

          <Link
            href="/admin/homeowners/new"
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Homeowner
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow">
          {homeowners.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No homeowners found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Add a homeowner to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Name
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Contact Number
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Address
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {homeowners.map((homeowner) => (
                    <tr
                      key={homeowner.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {homeowner.firstName}{" "}
                          {homeowner.middleName
                            ? `${homeowner.middleName} `
                            : ""}
                          {homeowner.lastName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {homeowner.email || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {homeowner.contactNumber || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {homeowner.address}
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/homeowners/${homeowner.id}`}
                          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          View / Edit
                        </Link>
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