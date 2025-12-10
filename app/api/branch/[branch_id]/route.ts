import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { BranchRow } from "@/types/db";

// Extract numeric branch ID with a fallback to the URL tail if params are missing
function extractBranchId(
  params: { branch_id?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "branch_id" in params
      ? Array.isArray(params.branch_id)
        ? params.branch_id[0]
        : params.branch_id
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
// GET /api/branch/[branch_id] → get a specific branch
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { branch_id: string | string[] } }
) {
  const branchId = extractBranchId(params, req.url);

  if (branchId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid branch id" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      branch_id,
      branch_name,
      branch_address
    FROM branch
    WHERE branch_id = ?;
  `;

  const { rows, error } = await query<BranchRow[]>(sql, [branchId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load branch" },
      { status: 500 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Branch not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, branch: rows[0] });
}

//
// ========================================================
// DELETE /api/branch/[branch_id] → delete a branch
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { branch_id: string | string[] } }
) {
  const branchId = extractBranchId(params, req.url);

  if (branchId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid branch ID" },
      { status: 400 }
    );
  }

  const sql = `
    DELETE FROM branch
    WHERE branch_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [branchId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete branch" },
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
    message: "Branch deleted successfully",
  });
}
