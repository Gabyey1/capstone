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

    const facilities = await prisma.facility.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      {
        facilities: facilities.map((facility) => ({
          id: facility.id,
          name: facility.name,
          description: facility.description,
          status: facility.status,
        })),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get homeowner facilities error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load available facilities.",
      },
      {
        status: 500,
      }
    );
  }
}