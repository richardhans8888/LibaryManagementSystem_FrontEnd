import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { CategoryRow } from "@/types/db";

// Extract numeric category ID with a fallback to the URL tail if params are missing
function extractCategoryId(
  params: { category_id?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "category_id" in params
      ? Array.isArray(params.category_id)
        ? params.category_id[0]
        : params.category_id
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
// GET /api/category/[category_id] → get a specific category
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { category_id: string | string[] } }
) {
  const categoryId = extractCategoryId(params, req.url);

  if (categoryId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid category ID" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      category_id,
      category_name,
      category_desc
    FROM category
    WHERE category_id = ?;
  `;

  const { rows, error } = await query<CategoryRow[]>(sql, [categoryId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load category" },
      { status: 500 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Category not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, category: rows[0] });
}

//
// ========================================================
// DELETE /api/category/[category_id] → delete a category
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { category_id: string | string[] } }
) {
  const categoryId = extractCategoryId(params, req.url);

  if (categoryId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid category ID" },
      { status: 400 }
    );
  }

  const sql = `
    DELETE FROM category
    WHERE category_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [categoryId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Category not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Category deleted successfully",
  });
}
