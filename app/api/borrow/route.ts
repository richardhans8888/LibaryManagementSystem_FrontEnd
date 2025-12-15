import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/sql";
import type { ResultSetHeader } from "mysql2";
import type { BookRow } from "@/types/db";

type Pickup = {
  id: number;
  book_id: number;
  member_id: number;
  request_time: number;
  pickup_deadline: number;
};

const globalState = globalThis as unknown as { __pickups?: Pickup[] };
const pickups = globalState.__pickups ?? [];
if (!globalState.__pickups) globalState.__pickups = pickups;

async function parseMemberFromCookie() {
  const store = cookies();
  const cookie = (await store).get("member_session")?.value;
  if (!cookie) return null;
  try {
    const decoded = Buffer.from(cookie, "base64").toString("utf-8");
    return JSON.parse(decoded) as { member_id: number; email: string };
  } catch {
    return null;
  }
}

async function resolveMemberId(bodyMemberId?: number | null) {
  const member = await parseMemberFromCookie();
  if (member?.member_id) return member.member_id;
  if (bodyMemberId && !Number.isNaN(bodyMemberId)) return bodyMemberId;
  return null;
}

async function cleanupExpired() {
  const now = Date.now();
  const expired = pickups.filter((p) => p.pickup_deadline < now);
  if (expired.length === 0) return;
  expired.forEach((p) => {
    // best-effort: mark book available again
    query<ResultSetHeader>(
      `UPDATE book SET book_status = 'available' WHERE book_id = ?;`,
      [p.book_id]
    ).catch(() => {});
  });
  const active = pickups.filter((p) => p.pickup_deadline >= now);
  pickups.length = 0;
  pickups.push(...active);
}

async function hasActiveHoldOrLoan(bookId: number) {
  try {
    const { rows: pickupRows } = await query<ResultSetHeader>(
      `SELECT 1 FROM pickup WHERE book_id = ? LIMIT 1;`,
      [bookId]
    );
    if (pickupRows && (pickupRows as unknown as any[]).length > 0) return true;
  } catch {}
  try {
    const { rows: borrowRows } = await query<ResultSetHeader>(
      `SELECT 1 FROM borrowing WHERE book_id = ? AND return_date IS NULL LIMIT 1;`,
      [bookId]
    );
    if (borrowRows && (borrowRows as unknown as any[]).length > 0) return true;
  } catch {}
  return pickups.some((p) => p.book_id === bookId);
}

export async function GET(req: Request) {
  await cleanupExpired();
  const url = new URL(req.url);
  const rawBookId = url.searchParams.get("book_id");
  const book_id = rawBookId ? Number(rawBookId) : null;
  const active = book_id ? pickups.filter((p) => p.book_id === book_id) : pickups;
  return NextResponse.json({ success: true, pickups: active });
}

export async function POST(req: Request) {
  await cleanupExpired();
  const body = await req.json();
  const rawBookId = body.book_id;
  const book_id = Number(rawBookId);
  const member_id = await resolveMemberId(body.member_id);

  if (!member_id) {
    return NextResponse.json(
      { success: false, error: "Login required" },
      { status: 401 }
    );
  }
  if (!book_id || Number.isNaN(book_id)) {
    return NextResponse.json(
      { success: false, error: "Invalid book_id" },
      { status: 400 }
    );
  }

  const bookSql = `
    SELECT 
      b.book_id,
      b.title,
      b.year_published,
      b.book_status,
      b.img_link,
      b.author_id,
      b.category_id,
      b.branch_id,
      a.first_name AS author_first,
      a.last_name AS author_last,
      c.category_name,
      br.branch_name
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    JOIN category c ON b.category_id = c.category_id
    JOIN branch br ON b.branch_id = br.branch_id
    WHERE b.book_id = ?
    LIMIT 1;
  `;

  const { rows: bookRows } = await query<BookRow[]>(bookSql, [book_id]);
  const book = bookRows?.[0];

  if (!book) {
    return NextResponse.json(
      { success: false, error: "Book not found or unavailable" },
      { status: 404 }
    );
  }

  if (book.book_status !== "available") {
    const locked = await hasActiveHoldOrLoan(book_id);
    if (locked) {
      return NextResponse.json(
        { success: false, error: `Book is currently ${book.book_status}` },
        { status: 400 }
      );
    }
    // recover stale state
    await query<ResultSetHeader>(
      `UPDATE book SET book_status = 'available' WHERE book_id = ?;`,
      [book_id]
    ).catch(() => {});
  }

  const now = Date.now();
  const pickup_deadline = now + 3 * 60 * 60 * 1000;

  // Mark as borrowed to hold the copy (best-effort)
  await query<ResultSetHeader>(
    `UPDATE book SET book_status = 'borrowed' WHERE book_id = ?;`,
    [book_id]
  ).catch(() => {});

  // Best-effort insert into pickup table if it exists
  await query<ResultSetHeader>(
    `
    INSERT INTO pickup (book_id, member_id, request_time, pickup_time)
    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR));
    `,
    [book_id, member_id]
  ).catch(() => {});

  pickups.push({
    id: Math.floor(Math.random() * 1e9),
    book_id,
    member_id,
    request_time: now,
    pickup_deadline,
  });

  return NextResponse.json({
    success: true,
    book_id,
    pickup_deadline,
    message: "Book reserved for pickup. Please collect within 3 hours.",
  });
}

//
// ========================================================
// DELETE /api/borrow → cancel pickup
// body: { book_id }
// ========================================================
export async function DELETE(req: Request) {
  await cleanupExpired();
  const body = await req.json();
  const rawBookId = body.book_id;
  const book_id = Number(rawBookId);
  const member_id = await resolveMemberId(body.member_id);

  if (!member_id) {
    return NextResponse.json(
      { success: false, error: "Login required" },
      { status: 401 }
    );
  }
  if (!book_id || Number.isNaN(book_id)) {
    return NextResponse.json(
      { success: false, error: "Invalid book_id" },
      { status: 400 }
    );
  }
  const remaining = pickups.filter((p) => !(p.book_id === book_id && p.member_id === member_id));
  const removed = pickups.length - remaining.length;
  pickups.length = 0;
  pickups.push(...remaining);
  await query<ResultSetHeader>(
    `DELETE FROM pickup WHERE book_id = ? AND member_id = ?;`,
    [book_id, member_id]
  ).catch(() => {});
  await query<ResultSetHeader>(
    `UPDATE book SET book_status = 'available' WHERE book_id = ?;`,
    [book_id]
  ).catch(() => {});

  return NextResponse.json({ success: true, cancelled: removed > 0 });
}
//
// ========================================================
// PUT /api/borrow → mark pickup as collected and create borrowing
// body: { book_id }
// ========================================================
export async function PUT(req: Request) {
  await cleanupExpired();
  const body = await req.json();
  const rawBookId = body.book_id;
  const book_id = Number(rawBookId);
  const member_id = await resolveMemberId(body.member_id);

  if (!member_id) {
    return NextResponse.json(
      { success: false, error: "Login required" },
      { status: 401 }
    );
  }
  if (!book_id || Number.isNaN(book_id)) {
    return NextResponse.json(
      { success: false, error: "Invalid book_id" },
      { status: 400 }
    );
  }

  const pickup = pickups.find((p) => p.book_id === book_id && p.member_id === member_id);
  if (!pickup) {
    return NextResponse.json(
      { success: false, error: "No active pickup for this book" },
      { status: 404 }
    );
  }

  // remove from in-memory queue
  const remaining = pickups.filter((p) => !(p.book_id === book_id && p.member_id === member_id));
  pickups.length = 0;
  pickups.push(...remaining);

  // delete from pickup table (best-effort)
  await query<ResultSetHeader>(
    `DELETE FROM pickup WHERE book_id = ? AND member_id = ?;`,
    [book_id, member_id]
  ).catch(() => {});

  // insert into borrowings table
  await query<ResultSetHeader>(
    `
    INSERT INTO borrowing (book_id, member_id, borrowed_at, due_date)
    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));
    `,
    [book_id, member_id]
  ).catch(() => {});

  // ensure book remains marked borrowed
  await query<ResultSetHeader>(
    `UPDATE book SET book_status = 'borrowed' WHERE book_id = ?;`,
    [book_id]
  ).catch(() => {});

  return NextResponse.json({
    success: true,
    book_id,
    message: "Book checked out. Due in 7 days.",
  });
}
