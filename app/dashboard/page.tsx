import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard — CubeComp Notifier",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 px-6 h-14 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          CubeComp Notifier
        </Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-gray-200 p-6">
            <DashboardClient />
          </div>
        </div>
      </div>
    </div>
  );
}
