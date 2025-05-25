"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MaterialsPage() {
  const pathname: string = usePathname();
  const router: AppRouterInstance = useRouter();

  useEffect(() => {
    if (/\/dashboard\/materials\/?$/.test(pathname)) {
      router.replace("/dashboard/materials/list");
    }
  }, [pathname, router]);

  return undefined;
}