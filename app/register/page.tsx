import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegisterForm } from "@/components/register/RegisterForm";

export const metadata = {
  title: "Sign Up — CubeComp Notifier",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-900 px-4 h-14 flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          CubeComp Notifier
        </Link>
      </div>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Get competition alerts
            </h1>
            <p className="text-sm text-zinc-400">
              Sign up with your phone number to receive SMS notifications when new
              WCA competitions are announced near you.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">
              Manage your settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
