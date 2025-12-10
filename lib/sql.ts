import { QueryResult, ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "./db";

type SqlParam = string | number | boolean | null | Date;

export async function query<
  T extends QueryResult = RowDataPacket[]
>(
  sql: string,
  params: SqlParam[] = []
): Promise<{ rows: T | null; error: Error | null }> {
  try {
    const [rows] = await pool.execute<T>(sql, params);
    return { rows, error: null };
  } catch (error: unknown) {
    console.error("SQL Error:", error);
    const normalizedError =
      error instanceof Error ? error : new Error("Unknown SQL error");
    return { rows: null, error: normalizedError };
  }
}
