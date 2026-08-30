import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentMethod = "GCASH" | "MAYA";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAmount(amount: number | string) {
  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function homeownerName(homeowner: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) {
  return `${homeowner.firstName} ${
    homeowner.middleName
      ? `${homeowner.middleName} `
      : ""
  }${homeowner.lastName}`;
}

function statusClasses(status: ReservationStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";

    case "COMPLETED":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function statusDot(status: ReservationStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500";

    case "CONFIRMED":
      return "bg-emerald-500";

    case "CANCELLED":
      return "bg-red-500";

    case "COMPLETED":
      return "bg-blue-500";

    default:
      return "bg-slate-500";
  }
}

function paymentStatusClasses(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "bg-amber-50 text-amber-700";

    case "FAILED":
      return "bg-red-50 text-red-700";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600";

    case "REFUNDED":
      return "bg-purple-50 text-purple-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function Icon({
  name,
}: {
  name:
    | "menu"
    | "home"
    | "users"
    | "calendar"
    | "receipt"
    | "credit"
    | "building"
    | "plus"
    | "arrow"
    | "clock"
    | "check"
    | "pending"
    | "close"
    | "chart"
    | "money"
    | "trend"
    | "refresh";
}) {
  const common = "h-5 w-5 shrink-0";

  switch (name) {
    case "menu":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case "home":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "users":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "calendar":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );

    case "receipt":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-4-2V2Z" />
          <path d="M8 7h8M8 11h8M8 15h5" />
        </svg>
      );

    case "credit":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20M6 15h4" />
        </svg>
      );

    case "building":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 21h18M5 21V5l7-3 7 3v16" />
          <path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" />
        </svg>
      );

    case "plus":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "arrow":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "clock":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "check":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "pending":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "close":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case "chart":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 19V5M4 19h16" />
          <path d="m7 15 3-4 3 2 5-7" />
        </svg>
      );

    case "money":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M7 10h.01M17 14h.01" />
        </svg>
      );

    case "trend":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 17l6-6 4 4 7-8" />
          <path d="M15 7h5v5" />
        </svg>
      );

    case "refresh":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" />
          <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
        </svg>
      );

    default:
      return null;
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/login");
  }

  /*
   * ---------------------------------------------------------
   * Main dashboard data
   * ---------------------------------------------------------
   */

  const [
    homeowners,
    activeHomeowners,
    paidDues,
    unpaidDues,
    overdueDues,
    partialDues,
    totalDueAggregate,
    totalPaidDueAggregate,
    totalBalanceAggregate,
    pendingPayments,
    paidPayments,
    failedPayments,
    cancelledPayments,
    refundedPayments,
    totalPaymentAggregate,
    gcashPayments,
    mayaPayments,
    reservations,
    pendingReservations,
    confirmedReservations,
    completedReservations,
    cancelledReservations,
    activeFacilities,
    totalFacilities,
    recentReservations,
    facilityReservationGroups,
  ] = await Promise.all([
    prisma.homeowner.count(),

    prisma.homeowner.count({
      where: {
        user: {
          status: "ACTIVE",
        },
      },
    }),

    prisma.due.count({
      where: {
        status: "PAID",
      },
    }),

    prisma.due.count({
      where: {
        status: "UNPAID",
      },
    }),

    prisma.due.count({
      where: {
        status: "OVERDUE",
      },
    }),

    prisma.due.count({
      where: {
        status: "PARTIAL",
      },
    }),

    prisma.due.aggregate({
      _sum: {
        amount: true,
      },
    }),

    prisma.due.aggregate({
      _sum: {
        amountPaid: true,
      },
    }),

    prisma.due.aggregate({
      _sum: {
        balance: true,
      },
    }),

    prisma.payment.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.payment.count({
      where: {
        status: "PAID",
      },
    }),

    prisma.payment.count({
      where: {
        status: "FAILED",
      },
    }),

    prisma.payment.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.payment.count({
      where: {
        status: "REFUNDED",
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.payment.count({
      where: {
        status: "PAID",
        method: "GCASH",
      },
    }),

    prisma.payment.count({
      where: {
        status: "PAID",
        method: "MAYA",
      },
    }),

    prisma.reservation.count(),

    prisma.reservation.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.reservation.count({
      where: {
        status: "CONFIRMED",
      },
    }),

    prisma.reservation.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.reservation.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.facility.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.facility.count(),

    prisma.reservation.findMany({
      take: 6,
      orderBy: [
        {
          reservationDate: "desc",
        },
        {
          startTime: "desc",
        },
        {
          id: "desc",
        },
      ],
      include: {
        homeowner: true,
        facility: true,
      },
    }),

    prisma.reservation.groupBy({
      by: ["facilityId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    }),
  ]);

  /*
   * ---------------------------------------------------------
   * Financial analytics
   * ---------------------------------------------------------
   */

  const totalDueAmount = Number(
    totalDueAggregate._sum.amount ?? 0
  );

  const totalPaidDueAmount = Number(
    totalPaidDueAggregate._sum.amountPaid ?? 0
  );

  const totalOutstandingBalance = Number(
    totalBalanceAggregate._sum.balance ?? 0
  );

  const totalCollectedPayments = Number(
    totalPaymentAggregate._sum.amount ?? 0
  );

  const collectionRate =
    totalDueAmount > 0
      ? Math.min(
          100,
          (totalPaidDueAmount / totalDueAmount) * 100
        )
      : 0;

  /*
   * ---------------------------------------------------------
   * Payment analytics
   * ---------------------------------------------------------
   */

  const totalPayments =
    pendingPayments +
    paidPayments +
    failedPayments +
    cancelledPayments +
    refundedPayments;

  const successfulPaymentRate =
    totalPayments > 0
      ? (paidPayments / totalPayments) * 100
      : 0;

  const gcashShare =
    paidPayments > 0
      ? (gcashPayments / paidPayments) * 100
      : 0;

  const mayaShare =
    paidPayments > 0
      ? (mayaPayments / paidPayments) * 100
      : 0;

  /*
   * ---------------------------------------------------------
   * Reservation analytics
   * ---------------------------------------------------------
   */

  const reservationStatusTotal =
    pendingReservations +
    confirmedReservations +
    completedReservations +
    cancelledReservations;

  const reservationApprovalRate =
    reservationStatusTotal > 0
      ? ((confirmedReservations +
          completedReservations) /
          reservationStatusTotal) *
        100
      : 0;

  const reservationCompletionRate =
    reservationStatusTotal > 0
      ? (completedReservations /
          reservationStatusTotal) *
        100
      : 0;

  /*
   * ---------------------------------------------------------
   * Facility analytics
   * ---------------------------------------------------------
   */

  const facilities =
    await prisma.facility.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });

  const facilityAnalytics = facilities
    .map((facility) => {
      const group =
        facilityReservationGroups.find(
          (item) =>
            item.facilityId === facility.id
        );

      return {
        id: facility.id,
        name: facility.name,
        status: facility.status,
        reservations:
          group?._count.id ?? 0,
      };
    })
    .sort(
      (a, b) =>
        b.reservations - a.reservations
    );

  const maxFacilityReservations =
    Math.max(
      ...facilityAnalytics.map(
        (facility) =>
          facility.reservations
      ),
      1
    );

  /*
   * ---------------------------------------------------------
   * Recent payment activity
   *
   * We only retrieve PAID payments so the dashboard's
   * financial activity represents confirmed payments.
   * ---------------------------------------------------------
   */

  const recentPaidPayments =
    await prisma.payment.findMany({
      where: {
        status: "PAID",
      },
      take: 6,
      orderBy: {
        paidAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        method: true,
        paidAt: true,
        createdAt: true,
      },
    });

  /*
   * ---------------------------------------------------------
   * Monthly payment analytics
   *
   * We use the current year and display January through
   * December. Only PAID payments are included.
   * ---------------------------------------------------------
   */

  const currentYear =
    new Date().getFullYear();

  const yearStart = new Date(
    currentYear,
    0,
    1
  );

  const nextYearStart = new Date(
    currentYear + 1,
    0,
    1
  );

  const yearPayments =
    await prisma.payment.findMany({
      where: {
        status: "PAID",
        paidAt: {
          gte: yearStart,
          lt: nextYearStart,
        },
      },
      select: {
        amount: true,
        paidAt: true,
      },
    });

  const monthlyCollections = Array.from(
    { length: 12 },
    (_, monthIndex) => {
      const amount =
        yearPayments.reduce(
          (total, payment) => {
            if (!payment.paidAt) {
              return total;
            }

            const paymentDate =
              new Date(payment.paidAt);

            if (
              paymentDate.getMonth() !==
              monthIndex
            ) {
              return total;
            }

            return (
              total +
              Number(payment.amount)
            );
          },
          0
        );

      return {
        month: new Date(
          currentYear,
          monthIndex,
          1
        ).toLocaleDateString("en-PH", {
          month: "short",
        }),
        amount,
      };
    }
  );

  const maxMonthlyCollection =
    Math.max(
      ...monthlyCollections.map(
        (item) => item.amount
      ),
      1
    );

  /*
   * ---------------------------------------------------------
   * Initial dashboard percentages
   * ---------------------------------------------------------
   */

  const pendingDueRate =
    homeowners > 0
      ? ((unpaidDues + overdueDues) /
          Math.max(
            paidDues +
              unpaidDues +
              overdueDues +
              partialDues,
            1
          )) *
        100
      : 0;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <label
            htmlFor="admin-sidebar-toggle"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-900 text-white"
          >
            <Icon name="menu" />
          </label>

          <div>
            <p className="text-sm font-bold text-slate-900">
              Community Portal
            </p>

            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
          A
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <input
        id="admin-sidebar-toggle"
        type="checkbox"
        className="peer hidden"
      />

      {/* Mobile overlay */}
      <label
        htmlFor="admin-sidebar-toggle"
        className="pointer-events-none fixed inset-0 z-40 bg-slate-950/40 opacity-0 transition peer-checked:pointer-events-auto peer-checked:opacity-100 lg:hidden"
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 peer-checked:translate-x-0 lg:translate-x-0 lg:shadow-none">
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">
              Community Portal
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-400">
              Administration
            </p>
          </div>

          <label
            htmlFor="admin-sidebar-toggle"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <Icon name="close" />
          </label>
        </div>

        <div className="px-4 py-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Main Menu
          </p>

          <nav className="mt-3 space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700"
            >
              <Icon name="home" />
              Dashboard
            </Link>

            <Link
              href="/admin/homeowners"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="users" />
              Homeowners
            </Link>

            <Link
              href="/admin/dues"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="receipt" />
              Monthly Dues
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="credit" />
              Payments

              {pendingPayments > 0 && (
                <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-bold text-red-700">
                  {pendingPayments}
                </span>
              )}
            </Link>

            <Link
              href="/admin/reservation"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="calendar" />
              Reservations

              {pendingReservations > 0 && (
                <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                  {pendingReservations}
                </span>
              )}
            </Link>

            <Link
              href="/admin/facilities"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="building" />
              Facilities
            </Link>
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-400">
              Signed in as
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-900">
              {session.user.email}
            </p>

            <p className="mt-1 text-xs text-indigo-600">
              Administrator
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Header */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-100 sm:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Administrator
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Admin Dashboard
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Manage homeowners, dues, payments,
                  facilities, reservations, and monitor
                  community performance from one place.
                </p>
              </div>

              <Link
                href="/admin/reservation"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                <Icon name="calendar" />
                Review Reservations
              </Link>
            </div>
          </section>

          {/* Main statistics */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/admin/homeowners"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name="users" />
                </div>

                <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600">
                  View →
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Homeowners
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {homeowners}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {activeHomeowners} active homeowners
              </p>
            </Link>

            <Link
              href="/admin/dues"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="check" />
                </div>

                <span className="text-xs font-semibold text-slate-400 group-hover:text-emerald-600">
                  View →
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Paid Dues
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {paidDues}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {collectionRate.toFixed(1)}% collection rate
              </p>
            </Link>

            <Link
              href="/admin/payments"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon name="credit" />
                </div>

                <span className="text-xs font-semibold text-slate-400 group-hover:text-rose-600">
                  Review →
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Pending Payments
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {pendingPayments}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Awaiting administrator review
              </p>
            </Link>

            <Link
              href="/admin/reservation"
              className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                  <Icon name="calendar" />
                </div>

                <span className="text-xs font-semibold text-indigo-600">
                  Manage →
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Reservations
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {reservations}
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-semibold text-amber-600">
                  {pendingReservations} pending
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span className="text-emerald-600">
                  {confirmedReservations} confirmed
                </span>
              </div>
            </Link>
          </section>

          {/* =================================================
              DATA ANALYTICS
              ================================================= */}
          <section className="mt-8">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Icon name="chart" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Data Analytics
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Visual overview of community financial
                    and operational performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Financial summary */}
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Dues
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {formatAmount(
                        totalDueAmount
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name="receipt" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      Collection progress
                    </span>

                    <span className="font-bold text-indigo-600">
                      {collectionRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${collectionRate}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Amount Collected
                    </p>

                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                      {formatAmount(
                        totalPaidDueAmount
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="money" />
                  </div>
                </div>

                <p className="mt-5 text-xs text-slate-400">
                  Confirmed amount recorded against
                  monthly dues.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Outstanding Balance
                    </p>

                    <p className="mt-2 text-2xl font-bold text-rose-600">
                      {formatAmount(
                        totalOutstandingBalance
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Icon name="trend" />
                  </div>
                </div>

                <p className="mt-5 text-xs text-slate-400">
                  Remaining balance across all recorded
                  dues.
                </p>
              </div>
            </div>

            {/* Dues + Payments */}
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              {/* Dues status */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="receipt" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Monthly Dues Analysis
                    </h3>

                    <p className="text-xs text-slate-500">
                      Current dues distribution
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Paid
                      </span>

                      <span className="font-bold text-emerald-600">
                        {paidDues}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width:
                            paidDues +
                              unpaidDues +
                              overdueDues +
                              partialDues >
                            0
                              ? `${
                                  (paidDues /
                                    (paidDues +
                                      unpaidDues +
                                      overdueDues +
                                      partialDues)) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Partial
                      </span>

                      <span className="font-bold text-blue-600">
                        {partialDues}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width:
                            paidDues +
                              unpaidDues +
                              overdueDues +
                              partialDues >
                            0
                              ? `${
                                  (partialDues /
                                    (paidDues +
                                      unpaidDues +
                                      overdueDues +
                                      partialDues)) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Unpaid
                      </span>

                      <span className="font-bold text-amber-600">
                        {unpaidDues}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{
                          width:
                            paidDues +
                              unpaidDues +
                              overdueDues +
                              partialDues >
                            0
                              ? `${
                                  (unpaidDues /
                                    (paidDues +
                                      unpaidDues +
                                      overdueDues +
                                      partialDues)) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Overdue
                      </span>

                      <span className="font-bold text-red-600">
                        {overdueDues}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width:
                            paidDues +
                              unpaidDues +
                              overdueDues +
                              partialDues >
                            0
                              ? `${
                                  (overdueDues /
                                    (paidDues +
                                      unpaidDues +
                                      overdueDues +
                                      partialDues)) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Unpaid / overdue rate
                    </span>

                    <span className="font-bold text-slate-950">
                      {Math.min(
                        100,
                        pendingDueRate
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment analysis */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Icon name="credit" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Payment Analysis
                    </h3>

                    <p className="text-xs text-slate-500">
                      Payment status and method distribution
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-700">
                      Paid
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                      {paidPayments}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-medium text-amber-700">
                      Pending
                    </p>

                    <p className="mt-1 text-2xl font-bold text-amber-700">
                      {pendingPayments}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-red-50 p-4">
                    <p className="text-xs font-medium text-red-700">
                      Failed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-700">
                      {failedPayments}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-xs font-medium text-slate-600">
                      Other
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-700">
                      {cancelledPayments +
                        refundedPayments}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Successful payment rate
                    </span>

                    <span className="font-bold text-emerald-600">
                      {successfulPaymentRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          successfulPaymentRate
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        GCash
                      </span>

                      <span className="font-bold text-slate-950">
                        {gcashPayments}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${gcashShare}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      {gcashShare.toFixed(1)}% of paid
                      payments
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Maya
                      </span>

                      <span className="font-bold text-slate-950">
                        {mayaPayments}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${mayaShare}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      {mayaShare.toFixed(1)}% of paid
                      payments
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly collections */}
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon name="trend" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Monthly Collection Trend
                      </h3>

                      <p className="text-xs text-slate-500">
                        Confirmed payments collected during{" "}
                        {currentYear}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                  {formatAmount(
                    totalCollectedPayments
                  )}{" "}
                  total collected
                </div>
              </div>

              <div className="mt-8 overflow-x-auto">
                <div className="flex min-w-[720px] items-end gap-3">
                  {monthlyCollections.map(
                    (item) => {
                      const height =
                        item.amount > 0
                          ? Math.max(
                              8,
                              (item.amount /
                                maxMonthlyCollection) *
                                180
                            )
                          : 6;

                      return (
                        <div
                          key={item.month}
                          className="flex min-w-12 flex-1 flex-col items-center justify-end"
                        >
                          <p className="mb-2 text-[10px] font-semibold text-slate-500">
                            {item.amount > 0
                              ? formatAmount(
                                  item.amount
                                )
                              : "₱0"}
                          </p>

                          <div
                            className="w-full max-w-12 rounded-t-xl bg-indigo-500 transition hover:bg-indigo-600"
                            style={{
                              height: `${height}px`,
                            }}
                            title={`${item.month}: ${formatAmount(
                              item.amount
                            )}`}
                          />

                          <p className="mt-3 text-xs font-semibold text-slate-500">
                            {item.month}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Reservation + Facility analytics */}
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              {/* Reservation analytics */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon name="calendar" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Reservation Analysis
                    </h3>

                    <p className="text-xs text-slate-500">
                      Current reservation distribution
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Pending
                      </span>

                      <span className="font-bold text-amber-600">
                        {pendingReservations}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{
                          width:
                            reservations > 0
                              ? `${
                                  (pendingReservations /
                                    reservations) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Confirmed
                      </span>

                      <span className="font-bold text-emerald-600">
                        {confirmedReservations}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width:
                            reservations > 0
                              ? `${
                                  (confirmedReservations /
                                    reservations) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Completed
                      </span>

                      <span className="font-bold text-blue-600">
                        {completedReservations}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width:
                            reservations > 0
                              ? `${
                                  (completedReservations /
                                    reservations) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Cancelled
                      </span>

                      <span className="font-bold text-red-600">
                        {cancelledReservations}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width:
                            reservations > 0
                              ? `${
                                  (cancelledReservations /
                                    reservations) *
                                  100
                                }%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-indigo-50 p-4">
                    <p className="text-xs font-medium text-indigo-600">
                      Approval / active rate
                    </p>

                    <p className="mt-1 text-2xl font-bold text-indigo-700">
                      {Math.min(
                        100,
                        reservationApprovalRate
                      ).toFixed(1)}
                      %
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs font-medium text-blue-600">
                      Completion rate
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-700">
                      {Math.min(
                        100,
                        reservationCompletionRate
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Facility usage */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Icon name="building" />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-950">
                        Facility Usage
                      </h3>

                      <p className="text-xs text-slate-500">
                        Reservations by facility
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {activeFacilities} active
                  </span>
                </div>

                {facilityAnalytics.length ===
                0 ? (
                  <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                    <p className="text-sm text-slate-500">
                      No facilities found.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-5">
                    {facilityAnalytics
                      .slice(0, 6)
                      .map((facility) => (
                        <div
                          key={facility.id}
                        >
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {facility.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                {facility.status}
                              </p>
                            </div>

                            <span className="shrink-0 text-sm font-bold text-slate-950">
                              {facility.reservations}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-violet-500"
                              style={{
                                width: `${
                                  (facility.reservations /
                                    maxFacilityReservations) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Total facilities
                    </span>

                    <span className="font-bold text-slate-950">
                      {totalFacilities}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Active facilities
                    </span>

                    <span className="text-xs font-semibold text-emerald-600">
                      {activeFacilities}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent reservations */}
          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Recent Reservations
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  The latest facility reservations submitted
                  by homeowners.
                </p>
              </div>

              <Link
                href="/admin/reservation"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                View all
                <Icon name="arrow" />
              </Link>
            </div>

            {recentReservations.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Icon name="calendar" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No reservations yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  New homeowner reservations will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReservations.map(
                  (reservation) => (
                    <div
                      key={reservation.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon name="calendar" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="truncate font-semibold text-slate-950">
                              {
                                reservation
                                  .facility.name
                              }
                            </p>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                                reservation.status
                              )}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusDot(
                                  reservation.status
                                )}`}
                              />

                              {
                                reservation.status
                              }
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {homeownerName(
                              reservation.homeowner
                            )}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span>
                              {formatDate(
                                reservation.reservationDate
                              )}
                            </span>

                            <span>•</span>

                            <span>
                              {formatTime(
                                reservation.startTime
                              )}{" "}
                              –{" "}
                              {formatTime(
                                reservation.endTime
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-sm font-bold text-slate-950">
                          {formatAmount(
                            Number(
                              reservation.amount
                            )
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Reservation fee
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* Recent paid payments */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Recent Confirmed Payments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest payments currently recorded as paid.
                </p>
              </div>

              <Link
                href="/admin/payments"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                View payments
                <Icon name="arrow" />
              </Link>
            </div>

            {recentPaidPayments.length ===
            0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Icon name="credit" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No confirmed payments yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Paid transactions will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPaidPayments.map(
                  (payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Icon name="check" />
                        </div>

                        <div>
                          <p className="font-bold text-slate-950">
                            {formatAmount(
                              Number(
                                payment.amount
                              )
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {payment.method}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentStatusClasses(
                            "PAID"
                          )}`}
                        >
                          PAID
                        </span>

                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(
                            payment.paidAt ??
                              payment.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* Management */}
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Access and manage the different parts of the
                system.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/admin/homeowners"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name="users" />
                </div>

                <h3 className="mt-5 font-bold text-slate-950">
                  Homeowners
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View registered homeowners, add new
                  homeowners, and update homeowner information.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-indigo-600">
                  Open Homeowners
                  <Icon name="arrow" />
                </div>
              </Link>

              <Link
                href="/admin/dues"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="receipt" />
                </div>

                <h3 className="mt-5 font-bold text-slate-950">
                  Monthly Dues
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create and review monthly dues assigned to
                  homeowners.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-emerald-600">
                  Open Dues
                  <Icon name="arrow" />
                </div>
              </Link>

              <Link
                href="/admin/payments"
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Icon name="credit" />
                </div>

                <h3 className="mt-5 font-bold text-slate-950">
                  Payments
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Record homeowner payments and review payment
                  history.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-rose-600">
                  Open Payments
                  <Icon name="arrow" />
                </div>
              </Link>

              <Link
                href="/admin/reservation"
                className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Icon name="calendar" />
                </div>

                <h3 className="mt-5 font-bold text-slate-950">
                  Reservations
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review requests and approve or update
                  reservation status.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-indigo-600">
                  Open Reservations
                  <Icon name="arrow" />
                </div>
              </Link>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Common administrator actions.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/homeowners/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Icon name="plus" />
                  Add Homeowner
                </Link>

                <Link
                  href="/admin/reservation"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Icon name="calendar" />
                  Manage Reservations
                </Link>

                <Link
                  href="/admin/payments"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Icon name="credit" />
                  Review Payments
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}