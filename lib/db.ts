import mysql, { Pool } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysql_pool__: Pool | undefined;
}

const pool =
  global.__mysql_pool__ ||
  mysql.createPool({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "regohoff",
    database: "sfms",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    decimalNumbers: true,
    connectTimeout: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  global.__mysql_pool__ = pool;
}

export default pool;