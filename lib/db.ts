import mysql, { Pool } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysql_pool__: Pool | undefined;
}

function createPool() {
  if (process.env.DATABASE_URL) {
    // Production (Railway / Vercel)
    return mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }

  // Local development (your MySQL on localhost)
  return mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "sfms",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  });
}

const pool = global.__mysql_pool__ ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global.__mysql_pool__ = pool;
}

export default pool;