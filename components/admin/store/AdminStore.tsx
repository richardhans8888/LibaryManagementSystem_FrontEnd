"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type BookStatus = "Available" | "Reserved" | "Borrowed";
export type MemberStatus = "Active" | "Suspended" | "Expired";

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  format: "Physical" | "Digital";
  branch: string;
  stock: number;
  status: BookStatus;
}

export interface BorrowRequest {
  id: number;
  user: string;
  bookId: number;
  branch: string;
  digital: boolean;
  requestedAt: number;
  status: "Pending" | "Cancelled" | "Approved" | "AwaitingPickup" | "Borrowed";
  pickupDeadline?: number;
}

export interface Loan {
  id: number;
  user: string;
  bookId: number;
  branch: string;
  borrowedAt: number;
  dueAt: number;
  status: "Borrowed" | "Overdue" | "Returned";
  returnedAt?: number;
}

export interface Branch {
  id: number;
  name: string;
  location: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  type: "Standard" | "Premium";
  status: MemberStatus;
}

interface AdminState {
  books: Book[];
  requests: BorrowRequest[];
  loans: Loan[];
  branches: Branch[];
  members: Member[];
  addBook(b: Omit<Book, "id">): void;
  editBook(id: number, patch: Partial<Book>): void;
  setBookStatus(id: number, status: BookStatus): void;
  addBranch(b: Omit<Branch, "id">): void;
  editBranch(id: number, patch: Partial<Branch>): void;
  approveRequest(id: number): void;
  cancelRequest(id: number): void;
  markPickedUp(id: number): void;
  markReturned(loanId: number): void;
}

const AdminCtx = createContext<AdminState | null>(null);

function now() {
  return Date.now();
}

const initial: AdminState = {
  books: [
    { id: 1, title: "Clean Code", author: "Robert C. Martin", category: "Technology", format: "Physical", branch: "Central", stock: 3, status: "Available" },
    { id: 2, title: "Atomic Habits", author: "James Clear", category: "Self-Help", format: "Physical", branch: "Central", stock: 2, status: "Available" },
    { id: 3, title: "Sapiens", author: "Yuval Noah Harari", category: "History", format: "Digital", branch: "East", stock: 999, status: "Available" },
  ],
  requests: [
    { id: 100, user: "Jane Doe", bookId: 1, branch: "Central", digital: false, requestedAt: now() - 60_000, status: "Pending" },
    { id: 101, user: "John Smith", bookId: 3, branch: "East", digital: true, requestedAt: now() - 120_000, status: "Pending" },
  ],
  loans: [],
  branches: [
    { id: 1, name: "Central", location: "Downtown" },
    { id: 2, name: "East", location: "Eastwood" },
    { id: 3, name: "West", location: "Glen Park" },
  ],
  members: [
    { id: 1, name: "Jane Doe", email: "jane@example.com", type: "Premium", status: "Active" },
    { id: 2, name: "John Smith", email: "john@example.com", type: "Standard", status: "Active" },
  ],
  addBook: () => {},
  editBook: () => {},
  setBookStatus: () => {},
  addBranch: () => {},
  editBranch: () => {},
  approveRequest: () => {},
  cancelRequest: () => {},
  markPickedUp: () => {},
  markReturned: () => {},
};

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>(initial.books);
  const [requests, setRequests] = useState<BorrowRequest[]>(initial.requests);
  const [loans, setLoans] = useState<Loan[]>(initial.loans);
  const [branches, setBranches] = useState<Branch[]>(initial.branches);
  const [members] = useState<Member[]>(initial.members);

  useEffect(() => {
    const id = setInterval(() => {
      setRequests((curr) => {
        const updated = curr.map((r) => {
          if (r.status === "AwaitingPickup" && r.pickupDeadline && now() > r.pickupDeadline) {
            return { ...r, status: "Cancelled" };
          }
          return r;
        });
        const cancelledIds = curr
          .filter((r) => r.status === "AwaitingPickup" && r.pickupDeadline && now() > r.pickupDeadline)
          .map((r) => r.bookId);
        if (cancelledIds.length) {
          setBooks((bs) => bs.map((b) => (cancelledIds.includes(b.id) ? { ...b, status: "Available" } : b)));
        }
        return updated;
      });
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  const addBook = (b: Omit<Book, "id">) => {
    setBooks((curr) => [{ ...b, id: Math.max(0, ...curr.map((x) => x.id)) + 1 }, ...curr]);
  };
  const editBook = (id: number, patch: Partial<Book>) => {
    setBooks((curr) => curr.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };
  const setBookStatus = (id: number, status: BookStatus) => {
    setBooks((curr) => curr.map((b) => (b.id === id ? { ...b, status } : b)));
  };
  const addBranch = (b: Omit<Branch, "id">) => {
    setBranches((curr) => [{ ...b, id: Math.max(0, ...curr.map((x) => x.id)) + 1 }, ...curr]);
  };
  const editBranch = (id: number, patch: Partial<Branch>) => {
    setBranches((curr) => curr.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };
  const approveRequest = (id: number) => {
    setRequests((curr) => curr.map((r) => {
      if (r.id !== id) return r;
      const book = books.find((b) => b.id === r.bookId);
      if (!book) return r;
      if (r.digital || book.format === "Digital") {
        const loan: Loan = {
          id: Math.floor(Math.random() * 1e6),
          user: r.user,
          bookId: r.bookId,
          branch: r.branch,
          borrowedAt: now(),
          dueAt: now() + 7 * 24 * 3600 * 1000,
          status: "Borrowed",
        };
        setLoans((ls) => [loan, ...ls]);
        setBooks((bs) => bs.map((b) => (b.id === r.bookId ? { ...b, status: "Borrowed" } : b)));
        return { ...r, status: "Borrowed" };
      }
      setBooks((bs) => bs.map((b) => (b.id === r.bookId ? { ...b, status: "Reserved" } : b)));
      return { ...r, status: "Approved", pickupDeadline: now() + 3 * 3600 * 1000 };
    }));
  };
  const cancelRequest = (id: number) => {
    setRequests((curr) => curr.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r)));
    const req = requests.find((r) => r.id === id);
    if (req) setBooks((bs) => bs.map((b) => (b.id === req.bookId ? { ...b, status: "Available" } : b)));
  };
  const markPickedUp = (id: number) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const loan: Loan = {
      id: Math.floor(Math.random() * 1e6),
      user: req.user,
      bookId: req.bookId,
      branch: req.branch,
      borrowedAt: now(),
      dueAt: now() + 7 * 24 * 3600 * 1000,
      status: "Borrowed",
    };
    setLoans((ls) => [loan, ...ls]);
    setBooks((bs) => bs.map((b) => (b.id === req.bookId ? { ...b, status: "Borrowed" } : b)));
    setRequests((curr) => curr.map((r) => (r.id === id ? { ...r, status: "Borrowed" } : r)));
  };
  const markReturned = (loanId: number) => {
    setLoans((ls) => ls.map((l) => (l.id === loanId ? { ...l, status: "Returned", returnedAt: now() } : l)));
    const loan = loans.find((l) => l.id === loanId);
    if (loan) setBooks((bs) => bs.map((b) => (b.id === loan.bookId ? { ...b, status: "Available" } : b)));
  };

  const value: AdminState = {
    books,
    requests,
    loans,
    branches,
    members,
    addBook,
    editBook,
    setBookStatus,
    addBranch,
    editBranch,
    approveRequest,
    cancelRequest,
    markPickedUp,
    markReturned,
  };

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
