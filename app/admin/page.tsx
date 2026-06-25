import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin — CubeComp Notifier",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="border-b border-zinc-900 px-4 h-14 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          CubeComp Notifier
        </Link>
      </div>

      <div className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}
