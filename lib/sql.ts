import { RowDataPacket } from "mysql2";
import pool from "./db";

type SqlParam = string | number | boolean | null | Date;

export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: SqlParam[] = []
): Promise<{ rows: T[] | null; error: Error | null }> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return { rows: rows as T[], error: null };
  } catch (error: unknown) {
    console.error("SQL Error:", error);
    const normalizedError = error instanceof Error ? error : new Error("Unknown SQL error");
    return { rows: null, error: normalizedError };
  }
}
