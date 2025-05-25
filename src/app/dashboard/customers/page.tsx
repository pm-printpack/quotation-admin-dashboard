"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useRouter } from "next/navigation";

export default function CustomerPage() {
  const pathname: string = usePathname();
  const router: AppRouterInstance = useRouter();
  
  if (/\/dashboard\/customers\/?$/.test(pathname)) {
    router.replace("/dashboard/customers/list");
    return undefined;
  }

  return undefined;
}