import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const feeTypes = [
  "MONTHLY_DUES",
  "BASKETBALL_COURT",
  "TENNIS_COURT",
  "CLUBHOUSE",
] as const;

type FeeType = (typeof feeTypes)[number];

function isFeeType(value: unknown): value is FeeType {
  return (
    typeof value === "string" &&
    feeTypes.includes(value as FeeType)
  );
}

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

    const fees = await prisma.feesetting.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      fees: fees.map((fee) => ({
        id: fee.id,
        type: fee.type,
        amount: fee.amount.toString(),
        description: fee.description,
        isActive: fee.isActive,
        createdAt: fee.createdAt,
        updatedAt: fee.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get fee settings error:", error);

    return NextResponse.json(
      {
        error: "Unable to load fee settings.",
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

    const type = body.type;
    const amount = Number(body.amount);
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    if (!isFeeType(type)) {
      return NextResponse.json(
        {
          error: "Invalid fee type.",
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

    const fee = await prisma.feesetting.upsert({
      where: {
        type,
      },
      update: {
        amount,
        description,
        isActive,
        updatedAt: new Date(),
      },
      create: {
        type,
        amount,
        description,
        isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Fee setting saved successfully.",
      fee: {
        id: fee.id,
        type: fee.type,
        amount: fee.amount.toString(),
        description: fee.description,
        isActive: fee.isActive,
        createdAt: fee.createdAt,
        updatedAt: fee.updatedAt,
      },
    });
  } catch (error) {
    console.error("Save fee setting error:", error);

    return NextResponse.json(
      {
        error: "Unable to save fee setting.",
      },
      { status: 500 }
    );
  }
}