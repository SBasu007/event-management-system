"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-auto bg-[#4338ca] text-white">
      <div className="mx-auto flex w-[min(1120px,92%)] flex-col items-center justify-between gap-1 py-3 text-center text-sm font-medium sm:flex-row sm:text-left">
        <p>© 2026 EventZen. All Rights Reserved.</p>
        <p>Managed by SoumyadeepBasu</p>
      </div>
    </footer>
  );
}