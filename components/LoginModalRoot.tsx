"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoginModal from "./LoginModal";

export default function LoginModalRoot() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = params.get("login") === "1";

  const onClose = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("login");
    const query = sp.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return <LoginModal open={open} onClose={onClose} />;
}
