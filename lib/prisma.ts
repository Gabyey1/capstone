import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../prisma/generated/client";

const host = process.env.DATABASE_HOST;
const port = Number(process.env.DATABASE_PORT ?? 3306);
const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

console.log("[PRISMA CONFIG]", {
  host,
  port,
  user,
  passwordSet: Boolean(password),
  database,
});

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 1,
  connectTimeout: 10000,
  acquireTimeout: 10000,
});

const prisma = new PrismaClient({
  adapter,
});

export { prisma };