import { NextResponse } from "next/server";
import { query } from "@/lib/sql";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function cleanup(member_id: number | null, membership_id: number | null) {
  if (membership_id !== null) {
    await query<ResultSetHeader>(
      `DELETE FROM memberMembership WHERE membership_id = ?;`,
      [membership_id]
    ).catch(() => {});
  }
  if (member_id !== null) {
    await query<ResultSetHeader>(
      `DELETE FROM member WHERE member_id = ?;`,
      [member_id]
    ).catch(() => {});
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    first_name,
    last_name,
    address,
    phone_number,
    email,
    password,
    total_month: rawTotalMonth,
  } = body;

  const total_month = toNumber(rawTotalMonth);

  if (!first_name || !last_name || !email || !password || total_month === null || total_month <= 0) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { rows: existingRows, error: existingError } = await query<RowDataPacket[]>(
    `SELECT member_id FROM member WHERE email = ? LIMIT 1;`,
    [email]
  );

  if (existingError) {
    return NextResponse.json(
      { success: false, error: existingError.message },
      { status: 500 }
    );
  }

  if (existingRows && existingRows.length > 0) {
    return NextResponse.json(
      { success: false, error: "Email already registered" },
      { status: 400 }
    );
  }

  const { rows: packageRows, error: packageError } = await query<RowDataPacket[]>(
    `SELECT total_cost FROM packageFee WHERE total_month = ? LIMIT 1;`,
    [total_month]
  );

  if (packageError) {
    return NextResponse.json(
      { success: false, error: packageError.message },
      { status: 500 }
    );
  }

  if (!packageRows || packageRows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Selected package not found" },
      { status: 400 }
    );
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + total_month);

  let member_id: number | null = null;
  let membership_id: number | null = null;

  const insertMemberSql = `
    INSERT INTO member (
      first_name,
      last_name,
      address,
      phone_number,
      email,
      password
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  const { rows: memberRows, error: memberError } = await query<ResultSetHeader>(insertMemberSql, [
    first_name,
    last_name,
    address ?? null,
    phone_number ?? null,
    email,
    password,
  ]);

  if (memberError || !memberRows || memberRows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: memberError?.message || "Failed to create member" },
      { status: 500 }
    );
  }

  member_id = memberRows.insertId;

  const insertMembershipSql = `
    INSERT INTO memberMembership (
      member_id,
      membership_start_date,
      membership_end_date
    )
    VALUES (?, ?, ?);
  `;

  const { rows: membershipRows, error: membershipError } = await query<ResultSetHeader>(insertMembershipSql, [
    member_id,
    formatDate(startDate),
    formatDate(endDate),
  ]);

  if (membershipError || !membershipRows || membershipRows.affectedRows !== 1) {
    await cleanup(member_id, null);
    return NextResponse.json(
      { success: false, error: membershipError?.message || "Failed to create membership" },
      { status: 500 }
    );
  }

  membership_id = membershipRows.insertId;

  const insertPaymentSql = `
    INSERT INTO memberPayment (
      membership_id,
      total_month
    )
    VALUES (?, ?);
  `;

  const { rows: paymentRows, error: paymentError } = await query<ResultSetHeader>(insertPaymentSql, [
    membership_id,
    total_month,
  ]);

  if (paymentError || !paymentRows || paymentRows.affectedRows !== 1) {
    await cleanup(member_id, membership_id);
    return NextResponse.json(
      { success: false, error: paymentError?.message || "Failed to create payment record" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    member_id,
    membership_id,
    payment_id: paymentRows.insertId,
  });
}
