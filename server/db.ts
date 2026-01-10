import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Please set it in your .env file.");
}

// Sanitize the DATABASE_URL to prevent ERR_INVALID_URL
const dbUrl = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: dbUrl.hostname,
  port: Number(dbUrl.port),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // remove leading '/'
  ssl: {
    rejectUnauthorized: true,
  },
});

export const db = drizzle(pool, { schema, mode: "default" });
