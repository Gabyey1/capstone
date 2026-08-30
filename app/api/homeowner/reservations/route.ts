import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const facilityFeeTypes = {
  "Basketball Court": "BASKETBALL_COURT",
  "Tennis Court": "TENNIS_COURT",
  Clubhouse: "CLUBHOUSE",
} as const;

type FacilityFeeType =
  (typeof facilityFeeTypes)[keyof typeof facilityFeeTypes];

function getFacilityFeeType(
  facilityName: string
): FacilityFeeType | null {
  const normalizedName = facilityName.trim().toLowerCase();

  if (normalizedName === "basketball court") {
    return "BASKETBALL_COURT";
  }

  if (normalizedName === "tennis court") {
    return "TENNIS_COURT";
  }

  if (normalizedName === "clubhouse") {
    return "CLUBHOUSE";
  }

  return null;
}

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

    const reservations = await prisma.reservation.findMany({
      where: {
        homeownerId: homeowner.id,
      },
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
        facility: true,
      },
    });

    return NextResponse.json({
      reservations: reservations.map((reservation) => ({
        id: reservation.id,
        facilityId: reservation.facilityId,
        reservationDate: reservation.reservationDate,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        amount: reservation.amount.toString(),
        status: reservation.status,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,

        facility: {
          id: reservation.facility.id,
          name: reservation.facility.name,
          description: reservation.facility.description,
          status: reservation.facility.status,
        },
      })),
    });
  } catch (error) {
    console.error(
      "Get homeowner reservations error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load your reservations.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const facilityId = Number(body.facilityId);

    const reservationDate =
      typeof body.reservationDate === "string"
        ? body.reservationDate.trim()
        : "";

    const startTime =
      typeof body.startTime === "string"
        ? body.startTime.trim()
        : "";

    const endTime =
      typeof body.endTime === "string"
        ? body.endTime.trim()
        : "";

    if (
      !Number.isInteger(facilityId) ||
      facilityId <= 0
    ) {
      return NextResponse.json(
        {
          error: "A valid facility is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!reservationDate) {
      return NextResponse.json(
        {
          error: "Reservation date is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        {
          error: "Start time and end time are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Convert the submitted date/time values into Date objects.
     *
     * Expected format:
     * reservationDate: YYYY-MM-DD
     * startTime: HH:mm
     * endTime: HH:mm
     */
    const startDateTime = new Date(
      `${reservationDate}T${startTime}:00`
    );

    const endDateTime = new Date(
      `${reservationDate}T${endTime}:00`
    );

    const reservationDateTime = new Date(
      `${reservationDate}T00:00:00`
    );

    if (
      Number.isNaN(startDateTime.getTime()) ||
      Number.isNaN(endDateTime.getTime()) ||
      Number.isNaN(reservationDateTime.getTime())
    ) {
      return NextResponse.json(
        {
          error: "Invalid reservation date or time.",
        },
        {
          status: 400,
        }
      );
    }

    if (endDateTime <= startDateTime) {
      return NextResponse.json(
        {
          error: "End time must be later than start time.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Prevent reservations in the past.
     */
    if (startDateTime <= new Date()) {
      return NextResponse.json(
        {
          error: "The reservation start time must be in the future.",
        },
        {
          status: 400,
        }
      );
    }

    const facility = await prisma.facility.findUnique({
      where: {
        id: facilityId,
      },
    });

    if (!facility) {
      return NextResponse.json(
        {
          error: "Facility not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (facility.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "This facility is currently unavailable for reservations.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Find the fee connected to the facility.
     */
    const feeType = getFacilityFeeType(facility.name);

    if (!feeType) {
      return NextResponse.json(
        {
          error:
            "No reservation fee is configured for this facility.",
        },
        {
          status: 400,
        }
      );
    }

    const fee = await prisma.feesetting.findUnique({
      where: {
        type: feeType,
      },
    });

    if (!fee || !fee.isActive) {
      return NextResponse.json(
        {
          error:
            "The reservation fee for this facility is currently unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    if (Number(fee.amount) <= 0) {
      return NextResponse.json(
        {
          error:
            "The reservation fee for this facility is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Check for an overlapping reservation on the same facility.
     *
     * A reservation overlaps when:
     *
     * existing start < requested end
     * AND
     * existing end > requested start
     *
     * CANCELLED reservations are ignored because they no longer
     * occupy the facility.
     */
    const overlappingReservation =
      await prisma.reservation.findFirst({
        where: {
          facilityId,
          status: {
            not: "CANCELLED",
          },

          reservationDate: {
            gte: new Date(
              `${reservationDate}T00:00:00`
            ),
            lt: new Date(
              `${reservationDate}T23:59:59.999`
            ),
          },

          startTime: {
            lt: endDateTime,
          },

          endTime: {
            gt: startDateTime,
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });

    if (overlappingReservation) {
      return NextResponse.json(
        {
          error:
            "This facility is already reserved during the selected time.",
        },
        {
          status: 409,
        }
      );
    }

    const reservation =
      await prisma.reservation.create({
        data: {
          homeownerId: homeowner.id,
          facilityId,
          reservationDate: reservationDateTime,
          startTime: startDateTime,
          endTime: endDateTime,
          amount: fee.amount,
          status: "PENDING",
          updatedAt: new Date(),
        },
        include: {
          facility: true,
        },
      });

    return NextResponse.json(
      {
        message:
          "Reservation created successfully.",

        reservation: {
          id: reservation.id,
          facilityId: reservation.facilityId,
          reservationDate:
            reservation.reservationDate,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          amount: reservation.amount.toString(),
          status: reservation.status,
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt,

          facility: {
            id: reservation.facility.id,
            name: reservation.facility.name,
            description:
              reservation.facility.description,
            status: reservation.facility.status,
          },
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create homeowner reservation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to create your reservation.",
      },
      {
        status: 500,
      }
    );
  }
}