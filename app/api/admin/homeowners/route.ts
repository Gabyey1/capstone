import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

    const homeowners = await prisma.homeowner.findMany({
      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
      ],
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
      },
    });

    return NextResponse.json({
      homeowners,
    });
  } catch (error) {
    console.error("Get homeowners error:", error);

    return NextResponse.json(
      {
        error: "Unable to load homeowners.",
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

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      !firstName ||
      !lastName ||
      !address ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "First name, last name, address, email, and password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const homeowner = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: "HOMEOWNER",
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        });

        return tx.homeowner.create({
          data: {
            userId: user.id,
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

    return NextResponse.json(
      {
        message: "Homeowner created successfully.",
        homeowner: {
          id: homeowner.id,
          firstName: homeowner.firstName,
          middleName: homeowner.middleName,
          lastName: homeowner.lastName,
          email: homeowner.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create homeowner error:", error);

    return NextResponse.json(
      {
        error: "Unable to create homeowner.",
      },
      { status: 500 }
    );
  }
}