import mysql, { Pool } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysql_pool__: Pool | undefined;
}

const pool =
  global.__mysql_pool__ ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  });

if (process.env.NODE_ENV !== "production") {
  global.__mysql_pool__ = pool;
}

export default pool;