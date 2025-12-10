import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { BranchRow } from "@/types/db";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

//
// ========================================================
// GET /api/branch → list all branches
// ========================================================
export async function GET() {
  const sql = `
    SELECT
      branch_id,
      branch_name,
      branch_address
    FROM branch
    ORDER BY branch_name ASC;
  `;

  const { rows, error } = await query<BranchRow[]>(sql);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load branches" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, branches: rows });
}

//
// ========================================================
// POST /api/branch → add a branch
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();
  const { branch_name, branch_address } = body;

  if (!branch_name || !branch_address) {
    return NextResponse.json(
      { success: false, error: "Branch name and address are required" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO branch (branch_name, branch_address)
    VALUES (?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    branch_name,
    branch_address,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add branch" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    branch_id: rows.insertId,
  });
}

//
// ========================================================
// PUT /api/branch → update a branch (body contains branch_id)
// ========================================================
export async function PUT(req: Request) {
  const body = await req.json();
  const { branch_id: rawBranchId, branch_name, branch_address } = body;

  const branch_id = toNumber(rawBranchId);

  if (
    branch_id === null ||
    !branch_name ||
    !branch_address
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "branch_id, branch_name, and branch_address are required",
      },
      { status: 400 }
    );
  }

  const sql = `
    UPDATE branch
    SET branch_name = ?, branch_address = ?
    WHERE branch_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    branch_name,
    branch_address,
    branch_id,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to update branch" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Branch not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    updated: rows.affectedRows,
  });
}
