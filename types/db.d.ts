import type { RowDataPacket } from "mysql2";

export interface BookRow extends RowDataPacket {
  book_id: number;
  title: string;
  year_published: number;
  book_status: string;
  is_digital: 0 | 1;

  author_first: string;
  author_last: string;

  category_name: string;

  branch_name: string;
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
  member_id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string | null;
  membership_start_date: string;
  membership_end_date: string | null;
  member_status: string;
}
