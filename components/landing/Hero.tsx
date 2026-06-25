import Link from "next/link";
import { ArrowRight, Bell, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 overflow-hidden grid-bg">
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Pill badge */}
      <div className="relative mb-8 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        Powered by the official WCA competition data
      </div>

      {/* Headline */}
      <h1 className="relative max-w-3xl text-center text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
        <span className="gradient-text">Never miss a cubing</span>
        <br />
        <span className="gradient-text-indigo">competition again.</span>
      </h1>

      {/* Sub-headline */}
      <p className="relative mt-6 max-w-xl text-center text-lg text-zinc-400 leading-relaxed">
        Get instant SMS alerts when new World Cube Association competitions are
        announced near you. Set your location, pick your radius, and we&apos;ll
        handle the rest.
      </p>

      {/* CTA Buttons */}
      <div className="relative mt-10 flex flex-col sm:flex-row items-center gap-4">
        <Button asChild size="lg" variant="primary" className="gap-2 px-8">
          <Link href="/register">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="#how-it-works">How it Works</a>
        </Button>
      </div>

      {/* Feature pills */}
      <div className="relative mt-16 flex flex-wrap justify-center gap-3">
        {[
          { icon: Bell, text: "Instant SMS Alerts" },
          { icon: MapPin, text: "Location-Based Radius" },
          { icon: Zap, text: "Checks Every 15 Minutes" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400"
          >
            <Icon className="h-3.5 w-3.5 text-indigo-400" />
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}
