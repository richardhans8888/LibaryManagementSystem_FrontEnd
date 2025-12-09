import { notFound } from "next/navigation";
import { BOOKS } from "@/data/books";

type Props = { params: { id: string } };

export default function BookDetail({ params }: Props) {
  const book = BOOKS.find((b) => b.id === params.id);
  if (!book) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <img src={book.cover} alt={book.title} className="h-96 w-full rounded-lg object-cover" />
        </div>
        <div>
          <div className="text-3xl font-bold">{book.title}</div>
          <div className="mt-2 text-sm text-zinc-700">{book.author}</div>
          <div className="mt-4 inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700">
            {book.theme}
          </div>
          <p className="mt-6 text-sm leading-6 text-zinc-700">{book.description}</p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">Borrow</button>
            <button className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-100">Add to list</button>
          </div>
        </div>
      </div>
    </div>
  );
}

