import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-12 px-4">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">CubeComp Notifier</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500">
            Unofficial WCA competition alert service
          </span>
        </div>
        <nav className="flex items-center gap-6 text-xs text-zinc-500">
          <Link href="/register" className="hover:text-white transition-colors">
            Get Started
          </Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <a
            href="https://www.worldcubeassociation.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            WCA Website
          </a>
          <a
            href="https://github.com/robiningelbrecht/wca-rest-api"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            API Source
          </a>
        </nav>
      </div>
    </footer>
  );
}
