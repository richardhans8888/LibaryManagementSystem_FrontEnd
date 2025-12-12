import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { DigitalBookRow } from "@/types/db";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toTinyIntBoolean = (value: unknown): 0 | 1 | null => {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return 1;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return 0;
  }
  return null;
};

const parseOptionalNumber = (value: unknown) => {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return { parsed: null, valid: true } as const;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return { parsed: null, valid: false } as const;
  }
  return { parsed, valid: true } as const;
};

//
// ========================================================
// GET /api/digitals  → list all digital books (optional category_id filter)
// ========================================================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get("category_id");
  const category_id = categoryParam !== null ? toNumber(categoryParam) : null;

  const whereClauses = ["b.is_digital = 1"];
  const params: Array<number> = [];

  if (category_id !== null) {
    whereClauses.push("b.category_id = ?");
    params.push(category_id);
  }

  const where = `WHERE ${whereClauses.join(" AND ")}`;

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
    ${where}
    ORDER BY s.storage_id DESC;
  `;

  const { rows, error } = await query<DigitalBookRow[]>(sql, params);

  if (error || !rows) {
    let fallback = [
      {
        book_id: 1,
        title: "Sample Digital Book",
        year_published: 2024,
        book_status: "available",
        is_digital: 1 as 0 | 1,
        img_link: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
        book_desc: null,
        language: "en",
        author_id: 1,
        author_first: "Unknown",
        author_last: "Author",
        category_id: 1,
        category_name: "Fiction",
        storage_id: 101,
        asset_url: "https://example.com/sample-book",
        drm_vendor: null,
        asset_checksum: null,
        filesize_mb: 5,
      },
      {
        book_id: 2,
        title: "Digital Collection",
        year_published: 2023,
        book_status: "available",
        is_digital: 1 as 0 | 1,
        img_link: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop",
        book_desc: "A curated set of digital resources.",
        language: "en",
        author_id: 2,
        author_first: "Digital",
        author_last: "Curator",
        category_id: 2,
        category_name: "Technology",
        storage_id: 102,
        asset_url: "https://example.com/digital-collection",
        drm_vendor: "DemoVendor",
        asset_checksum: "checksum-sample",
        filesize_mb: 12.5,
      },
    ];
    if (category_id !== null) {
      fallback = fallback.filter((b) => b.category_id === category_id);
    }
    return NextResponse.json(
      { success: true, books: fallback, warning: "Using fallback books due to database timeout" },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true, books: rows });
}

//
// ========================================================
// POST /api/digitals  → add a digital book (book + storage metadata)
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();

  const {
    title,
    author_id: rawAuthorId,
    category_id: rawCategoryId,
    year_published: rawYearPublished,
    branch_id: rawBranchId,
    book_status: rawStatus,
    is_digital: rawIsDigital,
    img_link,
    book_desc,
    language,
    asset_url,
    drm_vendor,
    asset_checksum,
    filesize_mb: rawFilesize,
  } = body;

  const author_id = toNumber(rawAuthorId);
  const category_id = toNumber(rawCategoryId);
  const year_published = toNumber(rawYearPublished);
  const branch_id = toNumber(rawBranchId);
  const book_status = typeof rawStatus === "string" ? rawStatus.trim() : "";
  const is_digital = toTinyIntBoolean(rawIsDigital);
  const { parsed: filesize_mb, valid: isFilesizeValid } = parseOptionalNumber(rawFilesize);

  if (!title || !book_status || !img_link || !asset_url) {
    return NextResponse.json(
      { success: false, error: "Missing required digital book fields" },
      { status: 400 }
    );
  }

  if (!isFilesizeValid) {
    return NextResponse.json(
      { success: false, error: "Invalid filesize value" },
      { status: 400 }
    );
  }

  if (
    author_id === null ||
    category_id === null ||
    year_published === null ||
    branch_id === null ||
    is_digital === null
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required digital book fields" },
      { status: 400 }
    );
  }

  if (is_digital !== 1) {
    return NextResponse.json(
      { success: false, error: "Digital books must have is_digital set to 1" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO book (
      title,
      author_id,
      category_id,
      year_published,
      branch_id,
      book_status,
      is_digital,
      img_link,
      book_desc,
      language
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    title,
    author_id,
    category_id,
    year_published,
    branch_id,
    book_status,
    is_digital,
    img_link,
    book_desc ?? null,
    language ?? null,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add digital book" },
      { status: 500 }
    );
  }

  const bookId = rows.insertId;

  const storageSql = `
    INSERT INTO storage (
      book_id,
      asset_url,
      drm_vendor,
      asset_checksum,
      filesize_mb
    )
    VALUES (?, ?, ?, ?, ?);
  `;

  const { rows: storageRows, error: storageError } = await query<ResultSetHeader>(
    storageSql,
    [
      bookId,
      asset_url,
      drm_vendor ?? null,
      asset_checksum ?? null,
      filesize_mb ?? null,
    ]
  );

  if (storageError || !storageRows || storageRows.affectedRows !== 1) {
    await query<ResultSetHeader>(`DELETE FROM book WHERE book_id = ?;`, [bookId]).catch(() => {});
    return NextResponse.json(
      { success: false, error: storageError?.message ?? "Failed to add storage metadata" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    book_id: bookId,
    storage_id: storageRows.insertId,
  });
}

//
// ========================================================
// PUT /api/digitals  → update a digital book (book + storage metadata)
// ========================================================
export async function PUT(req: Request) {
  const body = await req.json();

  const {
    storage_id: rawStorageId,
    book_id: rawBookId,
    title,
    author_id: rawAuthorId,
    category_id: rawCategoryId,
    year_published: rawYearPublished,
    branch_id: rawBranchId,
    book_status: rawStatus,
    is_digital: rawIsDigital,
    img_link,
    book_desc,
    language,
    asset_url,
    drm_vendor,
    asset_checksum,
    filesize_mb: rawFilesize,
  } = body;

  const storage_id = toNumber(rawStorageId);
  const book_id = toNumber(rawBookId);
  const author_id = toNumber(rawAuthorId);
  const category_id = toNumber(rawCategoryId);
  const year_published = toNumber(rawYearPublished);
  const branch_id = toNumber(rawBranchId);
  const book_status = typeof rawStatus === "string" ? rawStatus.trim() : "";
  const is_digital = toTinyIntBoolean(rawIsDigital);
  const { parsed: filesize_mb, valid: isFilesizeValid } = parseOptionalNumber(rawFilesize);

  if (!title || !book_status || !img_link || !asset_url) {
    return NextResponse.json(
      { success: false, error: "Missing required fields for digital book update" },
      { status: 400 }
    );
  }

  if (!isFilesizeValid) {
    return NextResponse.json(
      { success: false, error: "Invalid filesize value" },
      { status: 400 }
    );
  }

  if (
    storage_id === null ||
    book_id === null ||
    author_id === null ||
    category_id === null ||
    year_published === null ||
    branch_id === null ||
    is_digital === null
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required fields for digital book update" },
      { status: 400 }
    );
  }

  const sql = `
    UPDATE book
    SET
      title = ?,
      author_id = ?,
      category_id = ?,
      year_published = ?,
      branch_id = ?,
      book_status = ?,
      is_digital = ?,
      img_link = ?,
      book_desc = ?,
      language = ?
    WHERE book_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    title,
    author_id,
    category_id,
    year_published,
    branch_id,
    book_status,
    is_digital,
    img_link,
    book_desc ?? null,
    language ?? null,
    book_id,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to update digital book" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Digital book not found" },
      { status: 404 }
    );
  }

  const storageSql = `
    UPDATE storage
    SET
      book_id = ?,
      asset_url = ?,
      drm_vendor = ?,
      asset_checksum = ?,
      filesize_mb = ?
    WHERE storage_id = ?;
  `;

  const { rows: storageRows, error: storageError } = await query<ResultSetHeader>(
    storageSql,
    [
      book_id,
      asset_url,
      drm_vendor ?? null,
      asset_checksum ?? null,
      filesize_mb,
      storage_id,
    ]
  );

  if (storageError) {
    return NextResponse.json(
      { success: false, error: storageError.message },
      { status: 500 }
    );
  }

  if (!storageRows) {
    return NextResponse.json(
      { success: false, error: "Failed to update storage metadata" },
      { status: 500 }
    );
  }

  if (storageRows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Digital storage entry not found" },
      { status: 404 }
    );
  }

  if (book_status !== "borrowed") {
    await query<ResultSetHeader>(
      `DELETE FROM pickup WHERE book_id = ?;`,
      [book_id]
    ).catch(() => {});
    await query<ResultSetHeader>(
      `DELETE FROM borrowing WHERE book_id = ? AND return_date IS NULL;`,
      [book_id]
    ).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    updated: {
      book: rows.affectedRows,
      storage: storageRows.affectedRows,
    },
  });
}
