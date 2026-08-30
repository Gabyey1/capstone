import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();

    console.log("✅ Database connection successful!");

    const result = await prisma.$queryRaw`SELECT DATABASE() AS databaseName`;

    console.log("Connected database:", result);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();