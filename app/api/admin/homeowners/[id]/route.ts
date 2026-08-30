import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

  return {
    session,
  };
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await params;
    const homeownerId = Number(id);

    if (!Number.isInteger(homeownerId) || homeownerId <= 0) {
      return NextResponse.json(
        { error: "Invalid homeowner ID." },
        { status: 400 }
      );
    }

    const homeowner = await prisma.homeowner.findUnique({
      where: {
        id: homeownerId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!homeowner) {
      return NextResponse.json(
        { error: "Homeowner not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      homeowner: {
        id: homeowner.id,
        userId: homeowner.userId,
        firstName: homeowner.firstName,
        middleName: homeowner.middleName,
        lastName: homeowner.lastName,
        address: homeowner.address,
        contactNumber: homeowner.contactNumber,
        email: homeowner.email,
        user: homeowner.user,
      },
    });
  } catch (error) {
    console.error("Get homeowner error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve homeowner." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireAdmin();

    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await params;
    const homeownerId = Number(id);

    if (!Number.isInteger(homeownerId) || homeownerId <= 0) {
      return NextResponse.json(
        { error: "Invalid homeowner ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const middleName =
      typeof body.middleName === "string"
        ? body.middleName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    const contactNumber =
      typeof body.contactNumber === "string"
        ? body.contactNumber.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!firstName || !lastName || !address || !email) {
      return NextResponse.json(
        {
          error:
            "First name, last name, address, and email are required.",
        },
        { status: 400 }
      );
    }

    const homeowner = await prisma.homeowner.findUnique({
      where: {
        id: homeownerId,
      },
      include: {
        user: true,
      },
    });

    if (!homeowner) {
      return NextResponse.json(
        { error: "Homeowner not found." },
        { status: 404 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (
      existingUser &&
      existingUser.id !== homeowner.userId
    ) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const updatedHomeowner = await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: homeowner.userId,
          },
          data: {
            email,
            updatedAt: new Date(),
          },
        });

        return tx.homeowner.update({
          where: {
            id: homeownerId,
          },
          data: {
            firstName,
            middleName: middleName || null,
            lastName,
            address,
            contactNumber: contactNumber || null,
            email,
            updatedAt: new Date(),
          },
        });
      }
    );

    return NextResponse.json({
      message: "Homeowner updated successfully.",
      homeowner: {
        id: updatedHomeowner.id,
        firstName: updatedHomeowner.firstName,
        middleName: updatedHomeowner.middleName,
        lastName: updatedHomeowner.lastName,
        address: updatedHomeowner.address,
        contactNumber: updatedHomeowner.contactNumber,
        email: updatedHomeowner.email,
      },
    });
  } catch (error) {
    console.error("Update homeowner error:", error);

    return NextResponse.json(
      { error: "Unable to update homeowner." },
      { status: 500 }
    );
  }
}