import { Bell, Globe, Lock, RefreshCw, ShieldCheck, Smartphone } from "lucide-react";

const features = [
  {
    icon: Bell,
    title: "Instant SMS Notifications",
    description:
      "Receive a text the moment a new competition is announced. No app required — just your phone number.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description:
      "Track competitions in any country. Set radius to 'Anywhere' and follow every WCA event worldwide.",
  },
  {
    icon: RefreshCw,
    title: "Checked Every 15 Minutes",
    description:
      "Our cron job polls the WCA database continuously so you're always among the first to know.",
  },
  {
    icon: ShieldCheck,
    title: "No Duplicate Alerts",
    description:
      "Each competition triggers exactly one notification per user. Our deduplication logic ensures clean inboxes.",
  },
  {
    icon: Lock,
    title: "Phone Verification",
    description:
      "A one-time code confirms your number before we start sending alerts. Unsubscribe via the dashboard anytime.",
  },
  {
    icon: Smartphone,
    title: "No Account Needed",
    description:
      "Sign up with just a phone number. Manage your preferences through a simple dashboard — no passwords.",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 border-t border-zinc-900">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Built for the cubing community. Free to use.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:bg-zinc-900/60 hover:border-zinc-700"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-colors">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
