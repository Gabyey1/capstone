import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const dues = await prisma.due.findMany({
      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
        {
          id: "desc",
        },
      ],
      include: {
        homeowner: true,
      },
    });

    return NextResponse.json({
      dues: dues.map((due) => ({
        id: due.id,
        homeownerId: due.homeownerId,
        year: due.year,
        month: due.month,
        amount: due.amount.toString(),
        amountPaid: due.amountPaid.toString(),
        balance: due.balance.toString(),
        status: due.status,
        homeowner: {
          id: due.homeowner.id,
          firstName: due.homeowner.firstName,
          middleName: due.homeowner.middleName,
          lastName: due.homeowner.lastName,
          email: due.homeowner.email,
        },
      })),
    });
  } catch (error) {
    console.error("Get dues error:", error);

    return NextResponse.json(
      {
        error: "Unable to load dues.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const homeownerId = Number(body.homeownerId);
    const year = Number(body.year);
    const month = Number(body.month);
    const amount = Number(body.amount);

    if (
      !Number.isInteger(homeownerId) ||
      homeownerId <= 0
    ) {
      return NextResponse.json(
        {
          error: "A valid homeowner is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      return NextResponse.json(
        {
          error: "A valid year is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return NextResponse.json(
        {
          error: "Month must be between 1 and 12.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "Amount must be greater than 0.",
        },
        { status: 400 }
      );
    }

    const homeowner = await prisma.homeowner.findUnique({
      where: {
        id: homeownerId,
      },
    });

    if (!homeowner) {
      return NextResponse.json(
        {
          error: "Homeowner not found.",
        },
        { status: 404 }
      );
    }

    const existingDue = await prisma.due.findUnique({
      where: {
        homeownerId_year_month: {
          homeownerId,
          year,
          month,
        },
      },
    });

    if (existingDue) {
      return NextResponse.json(
        {
          error:
            "A due for this homeowner and month already exists.",
        },
        { status: 409 }
      );
    }

    const due = await prisma.due.create({
      data: {
        homeownerId,
        year,
        month,
        amount,
        amountPaid: 0,
        balance: amount,
        status: "UNPAID",
        updatedAt: new Date(),
      },
      include: {
        homeowner: true,
      },
    });

    return NextResponse.json(
      {
        message: "Due created successfully.",
        due: {
          id: due.id,
          homeownerId: due.homeownerId,
          year: due.year,
          month: due.month,
          amount: due.amount.toString(),
          amountPaid: due.amountPaid.toString(),
          balance: due.balance.toString(),
          status: due.status,
          homeowner: {
            id: due.homeowner.id,
            firstName: due.homeowner.firstName,
            middleName: due.homeowner.middleName,
            lastName: due.homeowner.lastName,
            email: due.homeowner.email,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create due error:", error);

    return NextResponse.json(
      {
        error: "Unable to create due.",
      },
      { status: 500 }
    );
  }
}