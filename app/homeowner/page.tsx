"use client";

import { useEffect, useMemo, useState } from "react";

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

type Facility = {
  id: number;
  name: string;
  description: string | null;
  status: string;
};

type DueStatus =
  | "UNPAID"
  | "PAID"
  | "OVERDUE"
  | "PARTIAL";

type Due = {
  id: number;
  homeownerId: number;
  year: number;
  month: number;
  amount: string;
  amountPaid: string;
  balance: string;
  status: DueStatus;
  createdAt: string;
  updatedAt: string;
};

type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentMethod = "GCASH" | "MAYA";

type Payment = {
  id: number;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber: string | null;
  orNumber: string | null;
  paidAt: string | null;
  createdAt: string;
  due: {
    id: number;
    year: number;
    month: number;
    amount: string;
    amountPaid: string;
    balance: string;
    status: DueStatus;
  } | null;
  receipt: {
    id: number;
    receiptNumber: string;
    issuedAt: string;
  } | null;
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

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString(
    "en-PH",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function statusClasses(status: ReservationStatus) {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

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
    case "CONFIRMED":
      return "bg-emerald-500";

    case "PENDING":
      return "bg-amber-500";

    case "CANCELLED":
      return "bg-red-500";

    case "COMPLETED":
      return "bg-blue-500";

    default:
      return "bg-slate-500";
  }
}

function dueStatusClasses(status: DueStatus) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    case "PARTIAL":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    case "OVERDUE":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";

    case "UNPAID":
      return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";

    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function paymentStatusClasses(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    case "FAILED":
      return "bg-red-50 text-red-700 ring-1 ring-red-200";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

    case "REFUNDED":
      return "bg-purple-50 text-purple-700 ring-1 ring-purple-200";

    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function facilityIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("basketball")) {
    return "🏀";
  }

  if (normalized.includes("tennis")) {
    return "🎾";
  }

  if (normalized.includes("clubhouse")) {
    return "🏠";
  }

  return "🏢";
}

function Icon({
  name,
}: {
  name:
    | "menu"
    | "home"
    | "calendar"
    | "building"
    | "plus"
    | "arrow"
    | "clock"
    | "check"
    | "close"
    | "refresh"
    | "history"
    | "wallet"
    | "credit";
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
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
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

    case "calendar":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="17"
            rx="2"
          />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
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
          <path d="M3 21h18" />
          <path d="M5 21V5l7-3 7 3v16" />
          <path d="M9 9h1" />
          <path d="M14 9h1" />
          <path d="M9 13h1" />
          <path d="M14 13h1" />
          <path d="M10 21v-4h4v4" />
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
          <path d="M12 5v14" />
          <path d="M5 12h14" />
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

    case "close":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
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
          <path d="M20 11a8 8 0 0 0-14.9-3" />
          <path d="M4 4v5h5" />
          <path d="M4 13a8 8 0 0 0 14.9 3" />
          <path d="M20 20v-5h-5" />
        </svg>
      );

    case "history":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "wallet":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7V5a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v2" />
          <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
          <path d="M16 13h5" />
          <circle cx="16" cy="13" r=".5" fill="currentColor" />
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
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </svg>
      );

    default:
      return null;
  }
}

export default function HomeownerDashboardPage() {
  const [reservations, setReservations] = useState<
    Reservation[]
  >([]);

  const [facilities, setFacilities] = useState<
    Facility[]
  >([]);

  const [dues, setDues] = useState<Due[]>([]);

  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingFacilities, setLoadingFacilities] =
    useState(true);

  const [loadingDues, setLoadingDues] =
    useState(true);

  const [loadingPayments, setLoadingPayments] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [creating, setCreating] = useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [facilityId, setFacilityId] =
    useState("");

  const [reservationDate, setReservationDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  async function loadReservations(
    showLoading = true
  ) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await fetch(
        "/api/homeowner/reservations",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let data: {
        reservations?: Reservation[];
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The reservations server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load your reservations."
        );
      }

      setReservations(
        Array.isArray(data.reservations)
          ? data.reservations
          : []
      );
    } catch (err) {
      console.error(
        "Load homeowner reservations error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your reservations."
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  async function loadFacilities() {
    try {
      setLoadingFacilities(true);

      const response = await fetch(
        "/api/homeowner/facilities",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let data: {
        facilities?: Facility[];
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The facilities server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load available facilities."
        );
      }

      setFacilities(
        Array.isArray(data.facilities)
          ? data.facilities
          : []
      );
    } catch (err) {
      console.error(
        "Load homeowner facilities error:",
        err
      );

      setFacilities([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load available facilities."
      );
    } finally {
      setLoadingFacilities(false);
    }
  }

  async function loadDues() {
    try {
      setLoadingDues(true);

      const response = await fetch(
        "/api/homeowner/dues",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let data: {
        dues?: Due[];
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The dues server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load your dues."
        );
      }

      setDues(
        Array.isArray(data.dues)
          ? data.dues
          : []
      );
    } catch (err) {
      console.error(
        "Load homeowner dues error:",
        err
      );

      setDues([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your dues."
      );
    } finally {
      setLoadingDues(false);
    }
  }

  async function loadPayments() {
    try {
      setLoadingPayments(true);

      const response = await fetch(
        "/api/homeowner/payments",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      let data: {
        payments?: Payment[];
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The payments server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load your payments."
        );
      }

      setPayments(
        Array.isArray(data.payments)
          ? data.payments
          : []
      );
    } catch (err) {
      console.error(
        "Load homeowner payments error:",
        err
      );

      setPayments([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your payments."
      );
    } finally {
      setLoadingPayments(false);
    }
  }

  async function payOnline(dueId: number) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/homeowner/payments/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dueId,
          }),
        }
      );

      let data: {
        error?: string;
        checkout?: {
          id?: string;
          url?: string;
        };
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The payment server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create the online payment."
        );
      }

      const checkoutUrl =
        data.checkout?.url;

      if (!checkoutUrl) {
        throw new Error(
          "PayMongo did not return a checkout URL."
        );
      }

      /*
       * Redirect the homeowner to the PayMongo
       * hosted checkout page.
       *
       * IMPORTANT:
       * We use location.assign() instead of assigning
       * directly to window.location.href so the React
       * immutability lint rule is satisfied.
       */
      window.location.assign(checkoutUrl);
    } catch (err) {
      console.error(
        "Create PayMongo checkout error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start the online payment."
      );
    }
  }

  async function refreshDashboard() {
    try {
      setRefreshing(true);
      setError("");
      setSuccess("");

      await Promise.all([
        loadReservations(false),
        loadFacilities(),
        loadDues(),
        loadPayments(),
      ]);

      setSuccess(
        "Dashboard refreshed successfully."
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReservations();
      void loadFacilities();
      void loadDues();
      void loadPayments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function resetForm() {
    setFacilityId("");
    setReservationDate("");
    setStartTime("");
    setEndTime("");
  }

  function openCreateForm(
    selectedFacilityId?: number
  ) {
    setError("");
    setSuccess("");

    resetForm();

    if (selectedFacilityId) {
      setFacilityId(
        String(selectedFacilityId)
      );
    }

    setShowCreateForm(true);
    setSidebarOpen(false);
  }

  function closeCreateForm() {
    if (creating) {
      return;
    }

    setShowCreateForm(false);
    setError("");
    resetForm();
  }

  function scrollToReservations() {
    document
      .getElementById("reservations")
      ?.scrollIntoView({
        behavior: "smooth",
      });

    setSidebarOpen(false);
  }

  function scrollToDues() {
    document
      .getElementById("dues")
      ?.scrollIntoView({
        behavior: "smooth",
      });

    setSidebarOpen(false);
  }

  function scrollToPayments() {
    document
      .getElementById("payments")
      ?.scrollIntoView({
        behavior: "smooth",
      });

    setSidebarOpen(false);
  }

  function scrollToFacilities() {
    document
      .getElementById("facilities")
      ?.scrollIntoView({
        behavior: "smooth",
      });

    setSidebarOpen(false);
  }

  async function createReservation(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!facilityId) {
      setError("Please select a facility.");
      return;
    }

    if (!reservationDate) {
      setError(
        "Please select a reservation date."
      );
      return;
    }

    if (!startTime || !endTime) {
      setError(
        "Please select a start time and end time."
      );
      return;
    }

    if (endTime <= startTime) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        "/api/homeowner/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            facilityId: Number(facilityId),
            reservationDate,
            startTime,
            endTime,
          }),
        }
      );

      let data: {
        error?: string;
        reservation?: Reservation;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The reservation server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create your reservation."
        );
      }

      setSuccess(
        "Reservation created successfully. It is now pending approval."
      );

      setShowCreateForm(false);

      resetForm();

      await loadReservations(false);
    } catch (err) {
      console.error(
        "Create homeowner reservation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your reservation."
      );
    } finally {
      setCreating(false);
    }
  }

  const totalReservations =
    reservations.length;

  const pendingReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          reservation.status === "PENDING"
      ).length,
    [reservations]
  );

  const upcomingReservation = useMemo(() => {
    const now = new Date();

    return (
      reservations
        .filter(
          (reservation) =>
            reservation.status !== "CANCELLED" &&
            new Date(
              reservation.startTime
            ).getTime() > now.getTime()
        )
        .sort(
          (a, b) =>
            new Date(
              a.startTime
            ).getTime() -
            new Date(
              b.startTime
            ).getTime()
        )[0] ?? null
    );
  }, [reservations]);

  const recentReservations = useMemo(
    () => reservations.slice(0, 5),
    [reservations]
  );

  const activeFacilities = useMemo(
    () =>
      facilities.filter(
        (facility) =>
          facility.status === "ACTIVE"
      ),
    [facilities]
  );

  const totalDueAmount = useMemo(
    () =>
      dues.reduce(
        (total, due) =>
          total + Number(due.amount),
        0
      ),
    [dues]
  );

  const totalPaidAmount = useMemo(
    () =>
      dues.reduce(
        (total, due) =>
          total + Number(due.amountPaid),
        0
      ),
    [dues]
  );

  const totalBalance = useMemo(
    () =>
      dues.reduce(
        (total, due) =>
          total + Number(due.balance),
        0
      ),
    [dues]
  );

  const pendingPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status === "PENDING"
      ).length,
    [payments]
  );

  const successfulPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status === "PAID"
      ).length,
    [payments]
  );

  const recentDues = useMemo(
    () => dues.slice(0, 5),
    [dues]
  );

  const recentPayments = useMemo(
    () => payments.slice(0, 5),
    [payments]
  );

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() =>
            setSidebarOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"
          aria-label="Open navigation"
        >
          <Icon name="menu" />
        </button>

        <div className="text-center">
          <p className="text-sm font-bold text-slate-950">
            Community Portal
          </p>

          <p className="text-xs text-slate-500">
            Homeowner
          </p>
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={refreshing}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
          aria-label="Refresh dashboard"
        >
          <span
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          >
            <Icon name="refresh" />
          </span>
        </button>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">
              Community Portal
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-400">
              Homeowner Area
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Navigation
          </p>

          <nav className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });

                setSidebarOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-left text-sm font-semibold text-indigo-700"
            >
              <Icon name="home" />
              Dashboard
            </button>

            <button
              type="button"
              onClick={scrollToPayments}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="credit" />
              Payments

              {pendingPayments > 0 && (
                <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                  {pendingPayments}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={scrollToReservations}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="calendar" />
              My Reservations

              {pendingReservations > 0 && (
                <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                  {pendingReservations}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={scrollToDues}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="wallet" />
              Monthly Dues
            </button>

            <button
              type="button"
              onClick={scrollToFacilities}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Icon name="building" />
              Facilities
            </button>
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() =>
              openCreateForm()
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Icon name="plus" />
            Create Reservation
          </button>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account Summary
            </p>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Due Balance
              </span>

              <span className="font-bold text-red-600">
                {formatAmount(totalBalance)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Payments
              </span>

              <span className="font-bold text-emerald-700">
                {successfulPayments}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Reservations
              </span>

              <span className="font-bold text-slate-900">
                {totalReservations}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        <header className="hidden h-20 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
          <div>
            <p className="text-sm font-semibold text-slate-400">
              Homeowner Portal
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-950">
              Dashboard
            </h1>
          </div>

          <button
            type="button"
            onClick={refreshDashboard}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              <Icon name="refresh" />
            </span>

            Refresh
          </button>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Hero */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-medium text-indigo-100">
                  Homeowner Portal
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back!
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Manage your community facility
                  reservations, monthly dues, and
                  online payments from your dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    openCreateForm()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  <Icon name="plus" />
                  Create Reservation
                </button>

                <button
                  type="button"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-60"
                >
                  <span
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  >
                    <Icon name="refresh" />
                  </span>

                  Refresh
                </button>
              </div>
            </div>
          </section>

          {/* Alerts */}
          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <div className="flex-1">
                {error}
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="font-bold text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

              <div className="flex-1">
                {success}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="font-bold text-emerald-500 hover:text-emerald-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Dashboard Statistics */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Icon name="wallet" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Current Balance
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {formatAmount(totalBalance)}
              </p>

              <p className="mt-2 text-xs text-red-600">
                Remaining dues balance
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Icon name="calendar" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Total Reservations
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {totalReservations}
              </p>

              <p className="mt-2 text-xs text-indigo-600">
                All reservation records
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Icon name="clock" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Pending Payments
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {pendingPayments}
              </p>

              <p className="mt-2 text-xs text-amber-600">
                Waiting for processing
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Icon name="check" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Paid Payments
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {successfulPayments}
              </p>

              <p className="mt-2 text-xs text-emerald-600">
                Successful transactions
              </p>
            </div>
          </section>

          {/* Upcoming Reservation */}
          <section className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-950">
                Upcoming Reservation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your next scheduled facility
                reservation.
              </p>
            </div>

            {upcomingReservation ? (
              <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-3xl">
                        {facilityIcon(
                          upcomingReservation
                            .facility.name
                        )}
                      </span>

                      <h3 className="text-2xl font-bold">
                        {
                          upcomingReservation
                            .facility.name
                        }
                      </h3>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses(
                          upcomingReservation.status
                        )}`}
                      >
                        {
                          upcomingReservation.status
                        }
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {formatLongDate(
                        upcomingReservation
                          .reservationDate
                      )}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-200">
                      <span className="flex items-center gap-2">
                        <Icon name="clock" />

                        {formatTime(
                          upcomingReservation.startTime
                        )}{" "}
                        –{" "}
                        {formatTime(
                          upcomingReservation.endTime
                        )}
                      </span>

                      <span>
                        {formatAmount(
                          upcomingReservation.amount
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      scrollToReservations
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-indigo-50"
                  >
                    View Reservations
                    <Icon name="arrow" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <Icon name="calendar" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  No upcoming reservations
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  You don&apos;t have a future
                  reservation yet. Create one when
                  you need to use a community
                  facility.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    openCreateForm()
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  <Icon name="plus" />
                  Create Reservation
                </button>
              </div>
            )}
          </section>

          {/* Payments */}
          <section
            id="payments"
            className="mt-8 scroll-mt-20"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-950">
                My Payments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View your payment transactions and
                payment status.
              </p>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Pending Payments
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {pendingPayments}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Paid Payments
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {successfulPayments}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loadingPayments ? (
                <div className="p-10 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading your payments...
                  </p>
                </div>
              ) : recentPayments.length ===
                0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon name="credit" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    No payments found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Your payment transactions will
                    appear here after a payment is
                    recorded.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentPayments.map(
                    (payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Icon name="credit" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="font-bold text-slate-950">
                                {formatAmount(
                                  payment.amount
                                )}
                              </h3>

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentStatusClasses(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                              {payment.method}
                              {" • "}
                              {formatDate(
                                payment.createdAt
                              )}
                            </p>

                            {payment.due && (
                              <p className="mt-1 text-xs text-slate-400">
                                {formatMonth(
                                  payment.due.year,
                                  payment.due.month
                                )}
                              </p>
                            )}

                            {payment.referenceNumber && (
                              <p className="mt-1 text-xs text-slate-400">
                                Reference:{" "}
                                {
                                  payment.referenceNumber
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {payment.receipt && (
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-slate-400">
                              Receipt
                            </p>

                            <p className="mt-1 font-bold text-slate-950">
                              {
                                payment.receipt
                                  .receiptNumber
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Dues */}
          <section
            id="dues"
            className="mt-8 scroll-mt-20"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-950">
                My Monthly Dues
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View your monthly dues and
                outstanding balance.
              </p>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total Dues
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {formatAmount(
                    totalDueAmount
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total Paid
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {formatAmount(
                    totalPaidAmount
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Remaining Balance
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatAmount(totalBalance)}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loadingDues ? (
                <div className="p-10 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading your dues...
                  </p>
                </div>
              ) : recentDues.length ===
                0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon name="wallet" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    No monthly dues found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Your monthly dues will appear
                    here once they are generated.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentDues.map((due) => (
                    <div
                      key={due.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-bold text-slate-950">
                            {formatMonth(
                              due.year,
                              due.month
                            )}
                          </h3>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${dueStatusClasses(
                              due.status
                            )}`}
                          >
                            {due.status}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-1 text-sm text-slate-500 sm:grid-cols-3 sm:gap-4">
                          <span>
                            Due:{" "}
                            <strong className="text-slate-700">
                              {formatAmount(
                                due.amount
                              )}
                            </strong>
                          </span>

                          <span>
                            Paid:{" "}
                            <strong className="text-emerald-700">
                              {formatAmount(
                                due.amountPaid
                              )}
                            </strong>
                          </span>

                          <span>
                            Balance:{" "}
                            <strong className="text-red-600">
                              {formatAmount(
                                due.balance
                              )}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {Number(due.balance) > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            payOnline(due.id)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                        >
                          <Icon name="credit" />
                          Pay Online
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {dues.length > 5 && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Showing your 5 most recent dues.
              </p>
            )}
          </section>

          {/* Facilities */}
          <section
            id="facilities"
            className="mt-8 scroll-mt-20"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-950">
                Available Facilities
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose a facility and create a
                reservation.
              </p>
            </div>

            {loadingFacilities ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="h-12 w-12 rounded-xl bg-slate-200" />

                    <div className="mt-5 h-5 w-32 rounded bg-slate-200" />

                    <div className="mt-3 h-4 w-full rounded bg-slate-200" />

                    <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : activeFacilities.length ===
              0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Icon name="building" />
                </div>

                <h3 className="mt-4 font-bold text-slate-950">
                  No facilities available
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  There are currently no active
                  facilities available for
                  reservation.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activeFacilities.map(
                  (facility) => (
                    <div
                      key={facility.id}
                      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                          {facilityIcon(
                            facility.name
                          )}
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200">
                          Available
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-950">
                        {facility.name}
                      </h3>

                      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                        {facility.description ||
                          "Community facility available for homeowner reservations."}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          openCreateForm(
                            facility.id
                          )
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                      >
                        Reserve this facility
                        <Icon name="arrow" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* Reservation History */}
          <section
            id="reservations"
            className="mt-8 scroll-mt-20"
          >
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  My Reservations
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  View your reservation history and
                  current status.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  openCreateForm()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <Icon name="plus" />
                New Reservation
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-10 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading your reservations...
                  </p>
                </div>
              ) : recentReservations.length ===
                0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon name="calendar" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    No reservations found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Your facility reservations
                    will appear here after you
                    create one.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      openCreateForm()
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    <Icon name="plus" />
                    Create Reservation
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentReservations.map(
                    (reservation) => (
                      <div
                        key={reservation.id}
                        className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                            {facilityIcon(
                              reservation
                                .facility.name
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="font-bold text-slate-950">
                                {
                                  reservation
                                    .facility.name
                                }
                              </h3>

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

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                              <span>
                                {formatDate(
                                  reservation.reservationDate
                                )}
                              </span>

                              <span className="text-slate-300">
                                •
                              </span>

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

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <div className="text-right">
                            <p className="text-xs text-slate-400">
                              Reservation fee
                            </p>

                            <p className="mt-1 font-bold text-slate-950">
                              {formatAmount(
                                reservation.amount
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {reservations.length > 5 && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Showing your 5 most recent
                reservations.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Create Reservation Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-modal-title"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Facility Booking
                </p>

                <h2
                  id="reservation-modal-title"
                  className="mt-2 text-2xl font-bold text-slate-950"
                >
                  Create Reservation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a facility, date, and
                  time.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateForm}
                disabled={creating}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="close" />
              </button>
            </div>

            <form
              onSubmit={createReservation}
              className="p-6 sm:p-7"
            >
              <div className="grid gap-5">
                {/* Facility */}
                <div>
                  <label
                    htmlFor="facilityId"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Facility
                  </label>

                  <select
                    id="facilityId"
                    value={facilityId}
                    onChange={(event) =>
                      setFacilityId(
                        event.target.value
                      )
                    }
                    disabled={
                      creating ||
                      loadingFacilities
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  >
                    <option value="">
                      Select a facility
                    </option>

                    {activeFacilities.map(
                      (facility) => (
                        <option
                          key={facility.id}
                          value={facility.id}
                        >
                          {facility.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="reservationDate"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Reservation Date
                  </label>

                  <input
                    id="reservationDate"
                    type="date"
                    value={reservationDate}
                    onChange={(event) =>
                      setReservationDate(
                        event.target.value
                      )
                    }
                    disabled={creating}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  />
                </div>

                {/* Time */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="startTime"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Start Time
                    </label>

                    <input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(event) =>
                        setStartTime(
                          event.target.value
                        )
                      }
                      disabled={creating}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endTime"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      End Time
                    </label>

                    <input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(event) =>
                        setEndTime(
                          event.target.value
                        )
                      }
                      disabled={creating}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <Icon name="clock" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-indigo-900">
                        Reservation information
                      </p>

                      <p className="mt-1 text-xs leading-5 text-indigo-700">
                        Your reservation will be
                        submitted for approval. The
                        system will automatically
                        check the selected facility
                        for scheduling conflicts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    loadingFacilities ||
                    activeFacilities.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Icon name="plus" />
                      Create Reservation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}