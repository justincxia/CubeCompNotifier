import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">CubeComp Notifier</span>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Sign Up</Link>
          </Button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center">
        <div className="w-[100px] flex flex-col items-center gap-4">
          <Button asChild variant="primary" size="lg" className="w-full">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
