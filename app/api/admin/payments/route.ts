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

    const payments = await prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        homeowner: true,
        due: true,
        receipt: true,
      },
    });

    return NextResponse.json({
      payments: payments.map((payment) => ({
        id: payment.id,
        homeownerId: payment.homeownerId,
        dueId: payment.dueId,
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status,
        referenceNumber: payment.referenceNumber,
        orNumber: payment.orNumber,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,

        homeowner: {
          id: payment.homeowner.id,
          firstName: payment.homeowner.firstName,
          middleName: payment.homeowner.middleName,
          lastName: payment.homeowner.lastName,
          email: payment.homeowner.email,
        },

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
    console.error("Get payments error:", error);

    return NextResponse.json(
      {
        error: "Unable to load payments.",
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
    const dueId = Number(body.dueId);
    const amount = Number(body.amount);

    const method =
      body.method === "GCASH" || body.method === "MAYA"
        ? body.method
        : null;

    const referenceNumber =
      typeof body.referenceNumber === "string"
        ? body.referenceNumber.trim()
        : "";

    if (!Number.isInteger(homeownerId) || homeownerId <= 0) {
      return NextResponse.json(
        { error: "A valid homeowner is required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(dueId) || dueId <= 0) {
      return NextResponse.json(
        { error: "A valid due is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0." },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: "Payment method must be GCASH or MAYA." },
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
        { error: "Homeowner not found." },
        { status: 404 }
      );
    }

    const due = await prisma.due.findUnique({
      where: {
        id: dueId,
      },
    });

    if (!due) {
      return NextResponse.json(
        { error: "Due not found." },
        { status: 404 }
      );
    }

    if (due.homeownerId !== homeownerId) {
      return NextResponse.json(
        {
          error:
            "The selected due does not belong to this homeowner.",
        },
        { status: 400 }
      );
    }

    const currentBalance = Number(due.balance);

    if (currentBalance <= 0) {
      return NextResponse.json(
        {
          error: "This due has already been fully paid.",
        },
        { status: 400 }
      );
    }

    if (amount > currentBalance) {
      return NextResponse.json(
        {
          error: `Payment cannot be greater than the remaining balance of ${currentBalance.toFixed(
            2
          )}.`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const newAmountPaid = Number(due.amountPaid) + amount;

      const newBalance = Number(due.amount) - newAmountPaid;

      let newStatus:
        | "UNPAID"
        | "PARTIAL"
        | "PAID";

      if (newBalance <= 0) {
        newStatus = "PAID";
      } else if (newAmountPaid > 0) {
        newStatus = "PARTIAL";
      } else {
        newStatus = "UNPAID";
      }

      const payment = await tx.payment.create({
        data: {
          homeownerId,
          dueId,
          amount,
          method,
          status: "PAID",
          referenceNumber: referenceNumber || null,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const updatedDue = await tx.due.update({
        where: {
          id: dueId,
        },
        data: {
          amountPaid: newAmountPaid,
          balance: Math.max(newBalance, 0),
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      return {
        payment,
        due: updatedDue,
      };
    });

    return NextResponse.json(
      {
        message: "Payment recorded successfully.",
        payment: {
          id: result.payment.id,
          homeownerId: result.payment.homeownerId,
          dueId: result.payment.dueId,
          amount: result.payment.amount.toString(),
          method: result.payment.method,
          status: result.payment.status,
          referenceNumber: result.payment.referenceNumber,
          paidAt: result.payment.paidAt,
        },
        due: {
          id: result.due.id,
          amount: result.due.amount.toString(),
          amountPaid: result.due.amountPaid.toString(),
          balance: result.due.balance.toString(),
          status: result.due.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create payment error:", error);

    return NextResponse.json(
      {
        error: "Unable to record payment.",
      },
      { status: 500 }
    );
  }
}

/*
 * UPDATE EXISTING PAYMENT
 */
export async function PATCH(request: Request) {
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

    const paymentId = Number(body.paymentId);
    const amount = Number(body.amount);

    const method =
      body.method === "GCASH" || body.method === "MAYA"
        ? body.method
        : null;

    const referenceNumber =
      typeof body.referenceNumber === "string"
        ? body.referenceNumber.trim()
        : "";

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return NextResponse.json(
        {
          error: "A valid payment is required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "Payment amount must be greater than 0.",
        },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        {
          error: "Payment method must be GCASH or MAYA.",
        },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        due: true,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        {
          error: "Payment not found.",
        },
        { status: 404 }
      );
    }

    if (!existingPayment.dueId || !existingPayment.due) {
      return NextResponse.json(
        {
          error: "This payment is not connected to a monthly due.",
        },
        { status: 400 }
      );
    }

    const due = existingPayment.due;

    const oldAmount = Number(existingPayment.amount);

    /*
     * Remove the old payment amount from the due,
     * then apply the new payment amount.
     */
    const amountPaidWithoutThisPayment =
      Number(due.amountPaid) - oldAmount;

    if (amountPaidWithoutThisPayment < 0) {
      return NextResponse.json(
        {
          error:
            "Unable to update this payment because the due balance is inconsistent.",
        },
        { status: 400 }
      );
    }

    const availableBalance =
      Number(due.amount) - amountPaidWithoutThisPayment;

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Payment cannot be greater than the available balance of ${availableBalance.toFixed(
            2
          )}.`,
        },
        { status: 400 }
      );
    }

    const newAmountPaid =
      amountPaidWithoutThisPayment + amount;

    const newBalance =
      Number(due.amount) - newAmountPaid;

    let newDueStatus:
      | "UNPAID"
      | "PARTIAL"
      | "PAID";

    if (newBalance <= 0) {
      newDueStatus = "PAID";
    } else if (newAmountPaid > 0) {
      newDueStatus = "PARTIAL";
    } else {
      newDueStatus = "UNPAID";
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          amount,
          method,
          referenceNumber: referenceNumber || null,
          updatedAt: new Date(),
        },
      });

      const updatedDue = await tx.due.update({
        where: {
          id: due.id,
        },
        data: {
          amountPaid: newAmountPaid,
          balance: Math.max(newBalance, 0),
          status: newDueStatus,
          updatedAt: new Date(),
        },
      });

      return {
        payment: updatedPayment,
        due: updatedDue,
      };
    });

    return NextResponse.json({
      message: "Payment updated successfully.",
      payment: {
        id: result.payment.id,
        amount: result.payment.amount.toString(),
        method: result.payment.method,
        referenceNumber: result.payment.referenceNumber,
      },
      due: {
        id: result.due.id,
        amountPaid: result.due.amountPaid.toString(),
        balance: result.due.balance.toString(),
        status: result.due.status,
      },
    });
  } catch (error) {
    console.error("Update payment error:", error);

    return NextResponse.json(
      {
        error: "Unable to update payment.",
      },
      { status: 500 }
    );
  }
}