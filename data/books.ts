export type Book = {
  id: string;
  title: string;
  author: string;
  theme: string;
  cover: string;
  description: string;
  addedAt: string;
};

export const THEMES = [
  "Fiction",
  "Nonfiction",
  "Science",
  "History",
  "Art",
  "Technology",
];

export const BOOKS: Book[] = [
  {
    id: "design-patterns",
    title: "Design Patterns",
    author: "Gamma et al.",
    theme: "Technology",
    cover:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=900&auto=format&fit=crop",
    description:
      "Classic solutions to common software design problems across OO systems.",
    addedAt: "2025-12-06",
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    author: "Ian Goodfellow",
    theme: "Science",
    cover:
      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?q=80&w=900&auto=format&fit=crop",
    description:
      "Foundations and modern techniques of neural networks and representation learning.",
    addedAt: "2025-12-03",
  },
  {
    id: "ancient-history",
    title: "Ancient History",
    author: "Mary Beard",
    theme: "History",
    cover:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop",
    description:
      "A broad overview of early civilizations and their enduring influence.",
    addedAt: "2025-12-08",
  },
  {
    id: "modern-art",
    title: "Modern Art",
    author: "Sarah Whitfield",
    theme: "Art",
    cover:
      "https://images.unsplash.com/photo-1495462911434-be47104d70fa?q=80&w=900&auto=format&fit=crop",
    description:
      "Movements and artists shaping contemporary visual culture.",
    addedAt: "2025-11-30",
  },
  {
    id: "quantum-physics",
    title: "Quantum Physics",
    author: "Leonard Susskind",
    theme: "Science",
    cover:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=900&auto=format&fit=crop",
    description:
      "Concepts and math behind the quantum realm and its applications.",
    addedAt: "2025-12-07",
  },
  {
    id: "clean-code",
    title: "Clean Code",
    author: "Robert C. Martin",
    theme: "Technology",
    cover:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=900&auto=format&fit=crop",
    description:
      "Principles and practices for writing readable, maintainable software.",
    addedAt: "2025-12-01",
  },
  {
    id: "fiction-one",
    title: "The Silent Library",
    author: "A. Writer",
    theme: "Fiction",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=900&auto=format&fit=crop",
    description:
      "A mystery set in a university library with secrets in the stacks.",
    addedAt: "2025-12-05",
  },
  {
    id: "nonfiction-one",
    title: "The Information",
    author: "James Gleick",
    theme: "Nonfiction",
    cover:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop",
    description:
      "A history of information theory and its impact on modern life.",
    addedAt: "2025-11-28",
  },
  {
    id: "history-two",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    theme: "History",
    cover:
      "https://images.unsplash.com/photo-1528209712924-8b4b12dd5fcb?q=80&w=900&auto=format&fit=crop",
    description:
      "A narrative of humankind from ancient origins to the present.",
    addedAt: "2025-12-02",
  },
  {
    id: "art-two",
    title: "Ways of Seeing",
    author: "John Berger",
    theme: "Art",
    cover:
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=900&auto=format&fit=crop",
    description:
      "A provocative look at images, art, and visual culture.",
    addedAt: "2025-11-26",
  },
  {
    id: "tech-two",
    title: "Refactoring",
    author: "Martin Fowler",
    theme: "Technology",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop",
    description:
      "Improving the design of existing code through systematic changes.",
    addedAt: "2025-12-04",
  },
  {
    id: "science-two",
    title: "Brief History of Time",
    author: "Stephen Hawking",
    theme: "Science",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop",
    description:
      "Cosmology explained for general audiences with clarity and insight.",
    addedAt: "2025-12-09",
  },
];
