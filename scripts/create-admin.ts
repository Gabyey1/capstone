import "dotenv/config";
import bcrypt from "bcryptjs";
import readline from "node:readline";
import { prisma } from "../lib/prisma";

const EMAIL = "bsitlim@gmail.com";

function askPassword(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter admin password: ", (password) => {
      rl.close();
      console.log();
      resolve(password);
    });
  });
}

async function main() {
  try {
    console.log("Creating admin account...");
    console.log(`Email: ${EMAIL}`);

    const password = await askPassword();

    if (!password) {
      throw new Error("Password cannot be empty.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: EMAIL,
      },
    });

    if (existingUser) {
      console.log("An account with this email already exists.");
      console.log(`Role: ${existingUser.role}`);
      console.log(`Status: ${existingUser.status}`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
  data: {
    email: EMAIL,
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE",
    updatedAt: new Date(),
  },
});

    console.log("✅ Admin account created successfully!");
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Status: ${admin.status}`);
  } catch (error) {
    console.error("❌ Failed to create admin account.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();