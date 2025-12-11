export type BookItem = {
  id: number;
  title: string;
  author: string;
  cover: string;
  addedAt: string;
};

export const BOOKS: BookItem[] = [
  {
    id: 1,
    title: "The Art of Learning",
    author: "Josh Waitzkin",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    cover: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 3,
    title: "Deep Work",
    author: "Cal Newport",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 4,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://images.unsplash.com/photo-1495462911434-be47104d70fa?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 5,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    cover: "https://images.unsplash.com/photo-1513531888-442b1d60c84b?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 6,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cover: "https://images.unsplash.com/photo-1553531888-a0a46c18d89b?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 7,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 8,
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    cover: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop",
    addedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];
