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
      bm.blacklisted_at
    FROM member m
    JOIN memberMembership mm ON m.member_id = mm.member_id
    LEFT JOIN blacklistedMembers bm ON bm.member_id = m.member_id
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

  const member = rows[0];
  if (!member.blacklisted_at && member.membership_end_date) {
    const end = new Date(member.membership_end_date);
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const expired = end < today;
    if (expired) member.blacklisted_at = null; // no-op, keep shape consistent
  }

  return NextResponse.json({ success: true, member });
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
    action,
    reason,
  } = body;

  if (!action || (action !== "blacklist" && action !== "reactivate")) {
    return NextResponse.json(
      { success: false, error: "action must be blacklist or reactivate" },
      { status: 400 }
    );
  }

  if (action === "blacklist") {
    if (!reason || !String(reason).trim()) {
      return NextResponse.json(
        { success: false, error: "Reason is required to blacklist a member" },
        { status: 400 }
      );
    }
    const { rows, error } = await query<ResultSetHeader>(
      `
      INSERT INTO blacklistedMembers (member_id, blacklisted_at, reason)
      VALUES (?, NOW(), ?)
      ON DUPLICATE KEY UPDATE blacklisted_at = VALUES(blacklisted_at), reason = VALUES(reason);
      `,
      [memberId, reason]
    );
    if (error || !rows) {
      return NextResponse.json(
        { success: false, error: error?.message || "Failed to blacklist member" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: "Member blacklisted" });
  }

  // reactivate
  const { rows, error } = await query<ResultSetHeader>(
    `DELETE FROM blacklistedMembers WHERE member_id = ?;`,
    [memberId]
  );

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: "Member reactivated" });
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
