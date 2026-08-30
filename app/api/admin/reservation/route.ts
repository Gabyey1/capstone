import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validStatuses = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

type ReservationStatus = (typeof validStatuses)[number];

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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }

    const reservations = await prisma.reservation.findMany({
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
    });

    return NextResponse.json({
      reservations: reservations.map((reservation) => ({
        id: reservation.id,
        homeownerId: reservation.homeownerId,
        facilityId: reservation.facilityId,
        reservationDate: reservation.reservationDate,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        amount: reservation.amount.toString(),
        status: reservation.status,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,

        homeowner: {
          id: reservation.homeowner.id,
          firstName: reservation.homeowner.firstName,
          middleName: reservation.homeowner.middleName,
          lastName: reservation.homeowner.lastName,
          email: reservation.homeowner.email,
          contactNumber: reservation.homeowner.contactNumber,
        },

        facility: {
          id: reservation.facility.id,
          name: reservation.facility.name,
          description: reservation.facility.description,
          status: reservation.facility.status,
        },
      })),
    });
  } catch (error) {
    console.error("Get reservations error:", error);

    return NextResponse.json(
      {
        error: "Unable to load reservations.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const reservationId = Number(body.id);
    const status = body.status as ReservationStatus;

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return NextResponse.json(
        {
          error: "A valid reservation is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid reservation status.",
        },
        {
          status: 400,
        }
      );
    }

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

    if (!reservation) {
      return NextResponse.json(
        {
          error: "Reservation not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id: reservationId,
        },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          homeowner: true,
          facility: true,
        },
      });

    return NextResponse.json({
      message: "Reservation status updated successfully.",

      reservation: {
        id: updatedReservation.id,
        homeownerId:
          updatedReservation.homeownerId,
        facilityId:
          updatedReservation.facilityId,
        reservationDate:
          updatedReservation.reservationDate,
        startTime:
          updatedReservation.startTime,
        endTime:
          updatedReservation.endTime,
        amount:
          updatedReservation.amount.toString(),
        status:
          updatedReservation.status,
        createdAt:
          updatedReservation.createdAt,
        updatedAt:
          updatedReservation.updatedAt,

        homeowner: {
          id: updatedReservation.homeowner.id,
          firstName:
            updatedReservation.homeowner.firstName,
          middleName:
            updatedReservation.homeowner.middleName,
          lastName:
            updatedReservation.homeowner.lastName,
          email:
            updatedReservation.homeowner.email,
          contactNumber:
            updatedReservation.homeowner.contactNumber,
        },

        facility: {
          id: updatedReservation.facility.id,
          name: updatedReservation.facility.name,
          description:
            updatedReservation.facility.description,
          status:
            updatedReservation.facility.status,
        },
      },
    });
  } catch (error) {
    console.error(
      "Update reservation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update reservation.",
      },
      {
        status: 500,
      }
    );
  }
}