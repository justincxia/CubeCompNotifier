import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Button asChild size="lg" variant="primary">
        <Link href="/register">Sign Up</Link>
      </Button>
    </div>
  );
}
