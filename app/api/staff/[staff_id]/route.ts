import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { StaffRow } from "@/types/db";

// Extract numeric staff ID with a fallback to the URL tail if params are missing
function extractStaffId(
  params: { staff_id?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "staff_id" in params
      ? Array.isArray(params.staff_id)
        ? params.staff_id[0]
        : params.staff_id
      : undefined;

  const fromParams = raw !== undefined ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isNaN(fromParams)) return fromParams;

  if (url) {
    const maybeId = url.split("/").filter(Boolean).pop() ?? "";
    const fromUrl = Number.parseInt(maybeId, 10);
    if (!Number.isNaN(fromUrl)) return fromUrl;
  }

  return null;
}

//
// ========================================================
// GET /api/staff/[staff_id] → get a specific staff
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { staff_id: string | string[] } }
) {
  const staffId = extractStaffId(params, req.url);

  if (staffId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid staff ID" },
      { status: 400 }
    );
  }

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
    WHERE s.staff_id = ?;
  `;

  const { rows, error } = await query<StaffRow[]>(sql, [staffId]);

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

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Staff not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, staff: rows[0] });
}

//
// ========================================================
// DELETE /api/staff/[staff_id] → delete a staff member
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { staff_id: string | string[] } }
) {
  const staffId = extractStaffId(params, req.url);

  if (staffId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid staff ID" },
      { status: 400 }
    );
  }

  const { rows: borrowRows, error: borrowError } = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM borrowing WHERE staff_id = ?;`,
    [staffId]
  );

  if (borrowError) {
    return NextResponse.json(
      { success: false, error: borrowError.message },
      { status: 500 }
    );
  }

  const borrowingCount =
    borrowRows && borrowRows.length > 0
      ? Number((borrowRows[0] as Record<string, unknown>).cnt ?? 0)
      : 0;

  if (borrowingCount > 0) {
    return NextResponse.json(
      { success: false, error: "Cannot delete staff while borrowings reference them" },
      { status: 400 }
    );
  }

  const sql = `
    DELETE FROM staff
    WHERE staff_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [staffId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete staff" },
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
    message: "Staff deleted successfully",
  });
}
