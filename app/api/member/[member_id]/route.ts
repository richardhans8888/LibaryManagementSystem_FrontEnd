import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { MemberRow } from "@/types/db";

const allowedStatuses = new Set(["active", "expired", "blacklist"]);

// Extract numeric member ID with a fallback to the URL tail if params are missing
function extractMemberId(
  params: { member_id?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "member_id" in params
      ? Array.isArray(params.member_id)
        ? params.member_id[0]
        : params.member_id
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
// GET /api/member/[member_id] → get a specific member
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { member_id: string | string[] } }
) {
  const memberId = extractMemberId(params, req.url);

  if (memberId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid member id" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      m.member_id,
      m.first_name,
      m.last_name,
      m.address,
      m.phone_number,
      m.email,
      mm.membership_start_date,
      mm.membership_end_date,
      mm.member_status
    FROM member m
    JOIN memberMembership mm ON m.member_id = mm.member_id
    WHERE m.member_id = ?;
  `;

  const { rows, error } = await query<MemberRow[]>(sql, [memberId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load member" },
      { status: 500 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Member not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, member: rows[0] });
}

//
// ========================================================
// PUT /api/member/[member_id] → update a member
// ========================================================
export async function PUT(
  req: Request,
  { params }: { params: { member_id: string | string[] } }
) {
  const memberId = extractMemberId(params, req.url);

  if (memberId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid member id" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const {
    first_name,
    last_name,
    address,
    phone_number,
    email,
    password,
    membership_start_date,
    membership_end_date,
    member_status,
  } = body;

  if (
    first_name === undefined &&
    last_name === undefined &&
    address === undefined &&
    phone_number === undefined &&
    email === undefined &&
    password === undefined &&
    membership_start_date === undefined &&
    membership_end_date === undefined &&
    member_status === undefined
  ) {
    return NextResponse.json(
      { success: false, error: "Nothing to update" },
      { status: 400 }
    );
  }

  if (member_status && !allowedStatuses.has(member_status)) {
    return NextResponse.json(
      { success: false, error: "Invalid member status" },
      { status: 400 }
    );
  }

  const updateMemberSql = `
    UPDATE member
    SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      address = COALESCE(?, address),
      phone_number = COALESCE(?, phone_number),
      email = COALESCE(?, email),
      password = COALESCE(?, password)
    WHERE member_id = ?;
  `;

  const { rows: memberRows, error: memberError } = await query<ResultSetHeader>(updateMemberSql, [
    first_name ?? null,
    last_name ?? null,
    address ?? null,
    phone_number ?? null,
    email ?? null,
    password ?? null,
    memberId,
  ]);

  if (memberError) {
    return NextResponse.json(
      { success: false, error: memberError.message },
      { status: 500 }
    );
  }

  if (!memberRows) {
    return NextResponse.json(
      { success: false, error: "Failed to update member" },
      { status: 500 }
    );
  }

  if (memberRows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Member not found" },
      { status: 404 }
    );
  }

  if (
    membership_start_date !== undefined ||
    membership_end_date !== undefined ||
    member_status !== undefined
  ) {
    const updateMembershipSql = `
      UPDATE memberMembership
      SET
        membership_start_date = COALESCE(?, membership_start_date),
        membership_end_date = COALESCE(?, membership_end_date),
        member_status = COALESCE(?, member_status)
      WHERE member_id = ?;
    `;

    const { rows: membershipRows, error: membershipError } = await query<ResultSetHeader>(updateMembershipSql, [
      membership_start_date ?? null,
      membership_end_date ?? null,
      member_status ?? null,
      memberId,
    ]);

    if (membershipError) {
      return NextResponse.json(
        { success: false, error: membershipError.message },
        { status: 500 }
      );
    }

    if (!membershipRows || membershipRows.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update membership" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true, message: "Member updated successfully" });
}

//
// ========================================================
// DELETE /api/member/[member_id] → delete a member
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { member_id: string | string[] } }
) {
  const memberId = extractMemberId(params, req.url);

  if (memberId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid member id" },
      { status: 400 }
    );
  }

  const deleteMembershipSql = `
    DELETE FROM memberMembership
    WHERE member_id = ?;
  `;
  const { error: membershipError } = await query<ResultSetHeader>(deleteMembershipSql, [memberId]);
  if (membershipError) {
    return NextResponse.json(
      { success: false, error: membershipError.message },
      { status: 500 }
    );
  }

  const deleteMemberSql = `
    DELETE FROM member
    WHERE member_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(deleteMemberSql, [memberId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete member" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Member not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Member deleted successfully",
  });
}
