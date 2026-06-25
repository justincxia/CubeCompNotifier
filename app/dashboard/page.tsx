import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard — CubeComp Notifier",
};

export default function DashboardPage() {
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

      <div className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <DashboardClient />
          </div>
        </div>
      </div>
    </div>
  );
}
