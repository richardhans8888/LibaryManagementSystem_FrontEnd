import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/lib/sql";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

const parseSession = async () => {
  const store = cookies();
  const raw = (await store).get("member_session")?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(decoded) as { member_id: number };
  } catch {
    return null;
  }
};

const toNumber = (v: unknown) => {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export async function POST(req: Request) {
  const session = await parseSession();
  if (!session?.member_id) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const total_month = toNumber(body.total_month);

  if (total_month === null || total_month <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid package selection" },
      { status: 400 }
    );
  }

  const { rows: pkgRows, error: pkgError } = await query<RowDataPacket[]>(
    `SELECT total_cost FROM packageFee WHERE total_month = ? LIMIT 1;`,
    [total_month]
  );
  if (pkgError) {
    return NextResponse.json(
      { success: false, error: pkgError.message },
      { status: 500 }
    );
  }
  if (!pkgRows || pkgRows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Package not found" },
      { status: 400 }
    );
  }

  const { rows: membershipRows, error: membershipError } = await query<RowDataPacket[]>(
    `
    SELECT mm.membership_id, mm.membership_start_date, mm.membership_end_date, bm.member_id AS blacklisted
    FROM memberMembership mm
    LEFT JOIN blacklistedMembers bm ON bm.member_id = mm.member_id
    WHERE mm.member_id = ?
    LIMIT 1;
    `,
    [session.member_id]
  );

  if (membershipError || !membershipRows || membershipRows.length === 0) {
    return NextResponse.json(
      { success: false, error: membershipError?.message || "Membership not found" },
      { status: 500 }
    );
  }

  const membership = membershipRows[0];
  if ((membership as any).blacklisted) {
    return NextResponse.json(
      { success: false, error: "Blacklisted accounts cannot renew" },
      { status: 403 }
    );
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = membership.membership_end_date ? new Date(membership.membership_end_date) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);

  const isExpired = endDate ? endDate < today : false;

  const newStart = isExpired ? today : membership.membership_start_date ? new Date(membership.membership_start_date) : today;
  const baseEnd = isExpired || !endDate ? today : endDate;
  const newEnd = addMonths(baseEnd, total_month);

  const { rows: updateRows, error: updateError } = await query<ResultSetHeader>(
    `
    UPDATE memberMembership
    SET membership_start_date = ?, membership_end_date = ?
    WHERE member_id = ?;
    `,
    [newStart.toISOString().slice(0, 10), newEnd.toISOString().slice(0, 10), session.member_id]
  );

  if (updateError || !updateRows) {
    return NextResponse.json(
      { success: false, error: updateError?.message || "Failed to renew membership" },
      { status: 500 }
    );
  }

  const { rows: paymentRows, error: paymentError } = await query<ResultSetHeader>(
    `
    INSERT INTO memberPayment (membership_id, total_month)
    VALUES (?, ?);
    `,
    [membership.membership_id, total_month]
  );

  if (paymentError || !paymentRows) {
    return NextResponse.json(
      { success: false, error: paymentError?.message || "Failed to record payment" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    membership_end_date: newEnd.toISOString().slice(0, 10),
    membership_start_date: newStart.toISOString().slice(0, 10),
  });
}
