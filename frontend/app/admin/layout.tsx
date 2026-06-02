"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { useAuthStore } from "@/components/auth-store-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, _hasHydrated } = useAuthStore((state) => state);
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user || user.role !== "ROLE_ADMIN") {
      router.push("/");
    }
  }, [user, _hasHydrated, router]);

  if (!_hasHydrated || !user || user.role !== "ROLE_ADMIN") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full relative flex min-h-screen">
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <AdminSidebar />
      </div>
      <main className="md:pl-72 flex-1 w-full bg-muted/30">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
