import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function GET() {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const facilities = await prisma.facility.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      facilities: facilities.map((facility) => ({
        id: facility.id,
        name: facility.name,
        description: facility.description,
        status: facility.status,
        createdAt: facility.createdAt,
        updatedAt: facility.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get facilities error:", error);

    return NextResponse.json(
      {
        error: "Unable to load facilities.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const status =
      body.status === "INACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    if (!name) {
      return NextResponse.json(
        {
          error: "Facility name is required.",
        },
        { status: 400 }
      );
    }

    const existingFacility =
      await prisma.facility.findUnique({
        where: {
          name,
        },
      });

    if (existingFacility) {
      return NextResponse.json(
        {
          error:
            "A facility with this name already exists.",
        },
        { status: 409 }
      );
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        description: description || null,
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Facility created successfully.",
        facility: {
          id: facility.id,
          name: facility.name,
          description: facility.description,
          status: facility.status,
          createdAt: facility.createdAt,
          updatedAt: facility.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create facility error:", error);

    return NextResponse.json(
      {
        error: "Unable to create facility.",
      },
      { status: 500 }
    );
  }
}