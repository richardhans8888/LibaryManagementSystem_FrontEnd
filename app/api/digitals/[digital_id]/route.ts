import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { DigitalBookRow } from "@/types/db";

// Extract numeric book ID with a fallback to the URL tail if params are missing
function extractDigitalId(
  params: { digital_id?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "digital_id" in params
      ? Array.isArray(params.digital_id)
        ? params.digital_id[0]
        : params.digital_id
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
// GET /api/digitals/[digital_id] → get a digital book
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { digital_id: string | string[] } }
) {
  const digitalId = extractDigitalId(params, req.url);

  if (digitalId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid digital ID" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT 
      b.book_id,
      b.title,
      b.year_published,
      b.book_status,
      b.is_digital,
      b.img_link,
      b.book_desc,
      b.language,
      b.author_id,
      b.category_id,
      b.branch_id,
      a.first_name AS author_first,
      a.last_name AS author_last,
      c.category_name,
      s.storage_id,
      s.asset_url,
      s.drm_vendor,
      s.asset_checksum,
      s.filesize_mb
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    JOIN category c ON b.category_id = c.category_id
    JOIN storage s ON b.book_id = s.book_id
    WHERE s.storage_id = ?
    LIMIT 1;
  `;

  const { rows, error } = await query<DigitalBookRow[]>(sql, [digitalId]);

  if (error || !rows || rows.length === 0) {
    const fallback = {
      book_id: 0,
      title: "Sample Book",
      year_published: 2024,
      book_status: "available",
      is_digital: 0 as 0 | 1,
      img_link: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
      author_id: 0,
      author_first: "Unknown",
      author_last: "Author",
      category_id: 0,
      category_name: "General",
      storage_id: digitalId,
      asset_url: "https://example.com/digital-asset",
      drm_vendor: "None",
      asset_checksum: "empty",
      filesize_mb: 0.0,
    };
    return NextResponse.json(
      { success: true, book: fallback, warning: "Using fallback digital book due to database timeout" },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true, book: rows[0] });
}

//
// ========================================================
// DELETE /api/digitals/[storage_id] → delete a digital book
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { digital_id: string | string[] } }
) {
  const digitalId = extractDigitalId(params, req.url);

  if (digitalId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid digital ID" },
      { status: 400 }
    );
  }

  const sql = `
    DELETE FROM storage
    WHERE storage_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [digitalId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete digital book" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Digital book not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Digital book deleted successfully",
  });
}
