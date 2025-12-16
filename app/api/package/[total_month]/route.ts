import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PackageFeeRow } from "@/types/db";

// Extract numeric total_month with a fallback to the URL tail if params are missing
function extractTotalMonth(
  params: { total_month?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "total_month" in params
      ? Array.isArray(params.total_month)
        ? params.total_month[0]
        : params.total_month
      : undefined;

  const fromParams = raw !== undefined ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isNaN(fromParams)) return fromParams;

  if (url) {
    const maybeVal = url.split("/").filter(Boolean).pop() ?? "";
    const fromUrl = Number.parseInt(maybeVal, 10);
    if (!Number.isNaN(fromUrl)) return fromUrl;
  }

  return null;
}

//
// ========================================================
// GET /api/package/[total_month] → get a specific package
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { total_month: string | string[] } }
) {
  const duration = extractTotalMonth(params, req.url);

  if (duration === null) {
    return NextResponse.json(
      { success: false, error: "Invalid package duration" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT total_month, total_cost
    FROM packageFee
    WHERE total_month = ?;
  `;

  const { rows, error } = await query<PackageFeeRow[]>(sql, [duration]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load package" },
      { status: 500 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Package not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    package: {
      total_month: Number(rows[0].total_month),
      total_cost: Number(rows[0].total_cost),
    },
  });
}

//
// ========================================================
// DELETE /api/package/[total_month] → delete a package
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { total_month: string | string[] } }
) {
  const duration = extractTotalMonth(params, req.url);

  if (duration === null) {
    return NextResponse.json(
      { success: false, error: "Invalid package duration" },
      { status: 400 }
    );
  }

  const { rows: usageRows, error: usageError } = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM memberPayment WHERE total_month = ?;`,
    [duration]
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
      { success: false, error: "Cannot delete a package that has related payments" },
      { status: 400 }
    );
  }

  const sql = `
    DELETE FROM packageFee
    WHERE total_month = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [duration]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete package" },
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
    message: "Package deleted successfully",
  });
}
