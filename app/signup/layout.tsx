"use client";
import { SignupProvider } from "@/components/signup/SignupStore";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <SignupProvider>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
        <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>
      </div>
    </SignupProvider>
  );
}
