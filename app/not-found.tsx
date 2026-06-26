import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-4">404 — Page not found</p>
        <Link href="/" className="text-sm text-black underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
