import mysql, { Pool } from "mysql2/promise";

declare global {
  var __mysql_pool__: Pool | undefined;
}

const pool =
  global.__mysql_pool__ ||
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    decimalNumbers: true
  });

if (process.env.NODE_ENV !== "production") {
  global.__mysql_pool__ = pool;
}

export default pool;
