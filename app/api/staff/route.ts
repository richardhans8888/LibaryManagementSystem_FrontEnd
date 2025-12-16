import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { StaffRow } from "@/types/db";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

//
// ========================================================
// GET /api/staff → list all staff with branch info
// ========================================================
export async function GET() {
  const sql = `
    SELECT
      s.staff_id,
      s.first_name,
      s.last_name,
      s.staff_role,
      s.phone_number,
      s.email,
      s.branch_id,
      b.branch_name
    FROM staff s
    LEFT JOIN branch b ON s.branch_id = b.branch_id
    ORDER BY s.last_name ASC, s.first_name ASC;
  `;

  const { rows, error } = await query<StaffRow[]>(sql);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load staff" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, staff: rows });
}

//
// ========================================================
// POST /api/staff → add a staff member
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();
  const {
    first_name,
    last_name,
    staff_role,
    phone_number,
    email,
    branch_id: rawBranchId,
  } = body;

  const branch_id = toNumber(rawBranchId);

  if (!first_name || !last_name || !staff_role || branch_id === null) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO staff (
      first_name,
      last_name,
      staff_role,
      phone_number,
      email,
      branch_id
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    first_name,
    last_name,
    staff_role,
    phone_number ?? null,
    email ?? null,
    branch_id,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add staff" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    staff_id: rows.insertId,
  });
}

//
// ========================================================
// PUT /api/staff → update a staff member
// ========================================================
export async function PUT(req: Request) {
  const body = await req.json();
  const {
    staff_id: rawStaffId,
    first_name,
    last_name,
    staff_role,
    phone_number,
    email,
    branch_id: rawBranchId,
  } = body;

  const staff_id = toNumber(rawStaffId);
  const branch_id = toNumber(rawBranchId);

  if (
    staff_id === null ||
    branch_id === null ||
    !first_name ||
    !last_name ||
    !staff_role
  ) {
    return NextResponse.json(
      { success: false, error: "staff_id, name, role, and branch_id are required" },
      { status: 400 }
    );
  }

  const sql = `
    UPDATE staff
    SET first_name = ?, last_name = ?, staff_role = ?, phone_number = ?, email = ?, branch_id = ?
    WHERE staff_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    first_name,
    last_name,
    staff_role,
    phone_number ?? null,
    email ?? null,
    branch_id,
    staff_id,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to update staff" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Staff not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    updated: rows.affectedRows,
  });
}
