import mysql, { Pool } from "mysql2/promise";

// Reuse a single pool across hot reloads in dev to avoid creating new connections.
const globalForPool = globalThis as unknown as { pool?: Pool };

const pool =
  globalForPool.pool ??
  mysql.createPool({
    host: process.env.MYSQL_HOST!,
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    port: Number(process.env.MYSQL_PORT!),
    database: process.env.MYSQL_DATABASE!,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: false
    }
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pool = pool;
}

export default pool;
