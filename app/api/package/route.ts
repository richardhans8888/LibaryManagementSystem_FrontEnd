import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PackageFeeRow } from "@/types/db";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

//
// ========================================================
// GET /api/package → list all membership packages
// ========================================================
export async function GET() {
  const sql = `
    SELECT total_month, total_cost
    FROM packageFee
    ORDER BY total_month ASC;
  `;

  const { rows, error } = await query<PackageFeeRow[]>(sql);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load packages" },
      { status: 500 }
    );
  }

  const normalized = rows.map((p) => ({
    total_month: Number(p.total_month),
    total_cost: Number(p.total_cost),
  }));

  return NextResponse.json({ success: true, packages: normalized });
}

//
// ========================================================
// POST /api/package → add a membership package
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();
  const total_month = toNumber(body.total_month);
  const total_cost = toNumber(body.total_cost);

  if (total_month === null || total_cost === null) {
    return NextResponse.json(
      { success: false, error: "total_month and total_cost are required" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO packageFee (total_month, total_cost)
    VALUES (?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    total_month,
    total_cost,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add package" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    total_month,
  });
}

//
// ========================================================
// PUT /api/package → update a membership package
// ========================================================
export async function PUT(req: Request) {
  const body = await req.json();
  const total_month = toNumber(body.total_month);
  const new_total_month = body.new_total_month !== undefined ? toNumber(body.new_total_month) : total_month;
  const total_cost = toNumber(body.total_cost);

  if (total_month === null || new_total_month === null || total_cost === null) {
    return NextResponse.json(
      { success: false, error: "total_month and total_cost are required" },
      { status: 400 }
    );
  }

  if (new_total_month !== total_month) {
    const { rows: usageRows, error: usageError } = await query<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM memberPayment WHERE total_month = ?;`,
      [total_month]
    );

    if (usageError) {
      return NextResponse.json(
        { success: false, error: usageError.message },
        { status: 500 }
      );
    }

    const usageCount =
      usageRows && usageRows.length > 0
        ? Number((usageRows[0] as Record<string, unknown>).cnt ?? 0)
        : 0;

    if (usageCount > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot change duration for a package that is used by payments" },
        { status: 400 }
      );
    }
  }

  const sql = `
    UPDATE packageFee
    SET total_month = ?, total_cost = ?
    WHERE total_month = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    new_total_month,
    total_cost,
    total_month,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to update package" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Package not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    updated: rows.affectedRows,
  });
}
