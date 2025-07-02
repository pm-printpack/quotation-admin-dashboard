"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/dashboard/");
    }
  }, [pathname]);
  return undefined;
}