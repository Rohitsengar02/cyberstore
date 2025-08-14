"use client"

import MobileNav from "@/components/mobile-nav";
import { usePathname } from "next/navigation";

export default function MobileNavWrapper() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return <MobileNav />;
}
