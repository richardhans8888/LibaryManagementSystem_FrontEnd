import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { AuthorRow } from "@/types/db";
import type { ResultSetHeader } from "mysql2";

// Extract numeric author ID with a fallback to the URL tail if params are missing
function extractAuthorId(
  params: { author_id?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "author_id" in params
      ? Array.isArray(params.author_id)
        ? params.author_id[0]
        : params.author_id
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
// GET /api/author/[author_id] → get a specific author
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { author_id: string | string[] } }
) {
  const authorId = extractAuthorId(params, req.url);

  if (authorId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid author ID" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      author_id,
      first_name,
      last_name
    FROM author
    WHERE author_id = ?;
  `;

  const { rows, error } = await query<AuthorRow[]>(sql, [authorId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load author" },
      { status: 500 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Author not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, author: rows[0] });
}

//
// ========================================================
// DELETE /api/author/[author_id] → delete an author
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { author_id: string | string[] } }
) {
  const authorId = extractAuthorId(params, req.url);

  if (authorId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid author ID" },
      { status: 400 }
    );
  }

  const sql = `
    DELETE FROM author
    WHERE author_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [authorId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete author" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Author not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Author deleted successfully",
  });
}

//
// ========================================================
// PUT /api/author/[author_id] → update an author
// ========================================================
export async function PUT(
  req: Request,
  { params }: { params: { author_id: string | string[] } }
) {
  const authorId = extractAuthorId(params, req.url);

  if (authorId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid author ID" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { first_name, last_name, biography: _biography } = body;

  if (!first_name && !last_name) {
    return NextResponse.json(
      { success: false, error: "Nothing to update" },
      { status: 400 }
    );
  }

  const sql = `
    UPDATE author
    SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name)
    WHERE author_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    first_name ?? null,
    last_name ?? null,
    authorId,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to update author" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Author not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Author updated successfully" });
}
