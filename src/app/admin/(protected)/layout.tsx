import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-warm-white">
      <AdminSidebar adminName={admin.name} />
      <div className="flex-1 min-w-0">
        <AdminMobileNav />
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
