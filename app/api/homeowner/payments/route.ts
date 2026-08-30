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

    const payments = await prisma.payment.findMany({
      where: {
        homeownerId: homeowner.id,
      },
      orderBy: [
        {
          paidAt: "desc",
        },
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      include: {
        due: true,
        receipt: true,
      },
    });

    return NextResponse.json({
      payments: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status,
        referenceNumber: payment.referenceNumber,
        orNumber: payment.orNumber,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,

        due: payment.due
          ? {
              id: payment.due.id,
              year: payment.due.year,
              month: payment.due.month,
              amount: payment.due.amount.toString(),
              amountPaid: payment.due.amountPaid.toString(),
              balance: payment.due.balance.toString(),
              status: payment.due.status,
            }
          : null,

        receipt: payment.receipt
          ? {
              id: payment.receipt.id,
              receiptNumber: payment.receipt.receiptNumber,
              issuedAt: payment.receipt.issuedAt,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Get homeowner payments error:", error);

    return NextResponse.json(
      {
        error: "Unable to load your payments.",
      },
      {
        status: 500,
      }
    );
  }
}