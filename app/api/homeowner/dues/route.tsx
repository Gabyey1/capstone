import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.user.role !== "HOMEOWNER") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid user session.",
        },
        {
          status: 401,
        }
      );
    }

    const homeowner = await prisma.homeowner.findUnique({
      where: {
        userId,
      },
    });

    if (!homeowner) {
      return NextResponse.json(
        {
          error: "Homeowner profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const dues = await prisma.due.findMany({
      where: {
        homeownerId: homeowner.id,
      },
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
        createdAt: due.createdAt,
        updatedAt: due.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get homeowner dues error:", error);

    return NextResponse.json(
      {
        error: "Unable to load your dues.",
      },
      {
        status: 500,
      }
    );
  }
}