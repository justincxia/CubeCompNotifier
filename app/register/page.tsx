import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegisterForm } from "@/components/register/RegisterForm";

export const metadata = {
  title: "Sign Up — CubeComp Notifier",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-900 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          CubeComp Notifier
        </Link>
      </header>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-black mb-2">
              Get competition alerts
            </h1>
            <p className="text-sm text-gray-500">
              Sign up with your phone number to receive SMS notifications when new
              WCA competitions are announced near you.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-6">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link href="/dashboard" className="text-black hover:text-gray-600 underline">
              Manage your settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
