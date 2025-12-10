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
