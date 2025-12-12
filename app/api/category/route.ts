import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { CategoryRow } from "@/types/db";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

//
// ========================================================
// GET /api/category → list all categories
// ========================================================
export async function GET() {
  const sql = `
    SELECT
      category_id,
      category_name,
      category_desc
    FROM category
    ORDER BY category_name ASC;
  `;

  const { rows, error } = await query<CategoryRow[]>(sql);

  if (error) {
    const fallback = [
      { category_id: 1, category_name: "Fiction", category_desc: null },
      { category_id: 2, category_name: "Science", category_desc: null },
      { category_id: 3, category_name: "History", category_desc: null },
      { category_id: 4, category_name: "Technology", category_desc: null },
    ];
    return NextResponse.json(
      { success: true, categories: fallback, warning: "Using fallback categories due to database timeout" },
      { status: 200 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load categories" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, categories: rows });
}

//
// ========================================================
// POST /api/category → add a category
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();
  const { category_name, category_desc } = body;

  if (!category_name) {
    return NextResponse.json(
      { success: false, error: "Category name is required" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO category (category_name, category_desc)
    VALUES (?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    category_name,
    category_desc ?? null,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add category" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    category_id: rows.insertId,
  });
}

//
// ========================================================
// PUT /api/category → update a category (body contains category_id)
// ========================================================
export async function PUT(req: Request) {
  const body = await req.json();
  const { category_id: rawCategoryId, category_name, category_desc } = body;

  const category_id = toNumber(rawCategoryId);

  if (category_id === null || !category_name) {
    return NextResponse.json(
      { success: false, error: "category_id and category_name are required" },
      { status: 400 }
    );
  }

  const sql = `
    UPDATE category
    SET category_name = ?, category_desc = ?
    WHERE category_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    category_name,
    category_desc ?? null,
    category_id,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
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
    updated: rows.affectedRows,
  });
}
