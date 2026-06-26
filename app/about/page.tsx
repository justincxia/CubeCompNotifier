import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — CubeComp Notifier",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
          CubeComp Notifier
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/about" className="text-gray-900 font-medium">About</Link>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Sign Up</Link>
          </Button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center">
        <div className="w-[500px]">
          <p className="text-lg text-black leading-relaxed">
            CubeComp Notifier sends you an SMS whenever a new World Cube Association competition is announced near you. Enter your location, pick a radius, and we handle the rest.
          </p>
        </div>
      </main>
    </div>
  );
}
