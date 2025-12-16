import type { RowDataPacket } from "mysql2";

export interface BookRow extends RowDataPacket {
  book_id: number;
  title: string;
  year_published: number;
  book_status: string;
  img_link: string;
  book_desc?: string | null;
  language?: string | null;

  category_id: number;
  category_name: string;

  branch_id: number;
  branch_name: string;
}

export interface BookAuthorRow extends RowDataPacket {
  book_id: number;
  author_id: number;
  first_name: string;
  last_name: string;
}

export interface AuthorRow extends RowDataPacket {
  author_id: number;
  first_name: string;
  last_name: string;
}

export interface BranchRow extends RowDataPacket {
  branch_id: number;
  branch_name: string;
  branch_address: string;
}

export interface CategoryRow extends RowDataPacket {
  category_id: number;
  category_name: string;
  category_desc: string | null;
}

export interface MemberRow extends RowDataPacket {
  membership_id?: number;
  member_id: number;
  first_name: string;
  last_name: string;
  address: string | null;
  phone_number: string | null;
  email: string | null;
   password: string | null;
  membership_start_date: string;
  membership_end_date: string | null;
  blacklisted_at?: string | null;
}

export interface StaffRow extends RowDataPacket {
  staff_id: number;
  first_name: string;
  last_name: string;
  staff_role: string;
  phone_number: string | null;
  email: string | null;
  branch_id: number;
  branch_name: string | null;
}

export interface PackageFeeRow extends RowDataPacket {
  total_month: number;
  total_cost: number;
}
