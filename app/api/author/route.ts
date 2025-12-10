import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { AuthorRow } from "@/types/db";
import type { ResultSetHeader } from "mysql2";

//
// ========================================================
// GET /api/author → list all authors
// ========================================================
export async function GET() {
  const sql = `
    SELECT
      author_id,
      first_name,
      last_name
    FROM author
    ORDER BY last_name ASC, first_name ASC;
  `;

  const { rows, error } = await query<AuthorRow[]>(sql);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load authors" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, authors: rows });
}

//
// ========================================================
// POST /api/author → add an author
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();
  const { first_name, last_name } = body;

  if (!first_name || !last_name) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO author (first_name, last_name)
    VALUES (?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    first_name,
    last_name,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add author" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    author_id: rows.insertId,
  });
}
