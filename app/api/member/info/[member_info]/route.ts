import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

interface MemberInfoRow extends RowDataPacket {
  member_id: number;
  member_name: string;
  membership_start_date: string;
  membership_end_date: string | null;
  member_status: string;
}

const extractMemberId = (
  params: { member_info?: string | string[] } | undefined,
  url?: string
) => {
  const raw =
    params && "member_info" in params
      ? Array.isArray(params.member_info)
        ? params.member_info[0]
        : params.member_info
      : undefined;

  const fromParams = raw !== undefined ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isNaN(fromParams)) return fromParams;

  if (url) {
    const tail = url.split("/").filter(Boolean).pop() ?? "";
    const fromUrl = Number.parseInt(tail, 10);
    if (!Number.isNaN(fromUrl)) return fromUrl;
  }

  return null;
};

//
// ========================================================
// GET /api/member/info/[member_info] → member profile info
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { member_info: string | string[] } }
) {
  const memberId = extractMemberId(params, req.url);

  if (memberId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid member id (info)" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      member_id,
      CONCAT(first_name, ' ', last_name) AS member_name,
      membership_start_date,
      membership_end_date,
      member_status
    FROM activeMembers
    WHERE member_id = ?
      AND member_status IN ('active', 'suspended')
    LIMIT 1;
  `;

  const { rows, error } = await query<MemberInfoRow[]>(sql, [memberId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load member info" },
      { status: 500 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "No information found for this member" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, member_info: rows });
}
