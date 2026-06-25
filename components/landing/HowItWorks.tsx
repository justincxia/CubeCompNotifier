const steps = [
  {
    number: "01",
    title: "Enter your location",
    description:
      "Tell us your city and country. We geocode it to precise coordinates so distance calculations are accurate.",
  },
  {
    number: "02",
    title: "Choose your radius",
    description:
      "Pick how far you're willing to travel — 25, 50, 100, 250 miles, or anywhere in the world.",
  },
  {
    number: "03",
    title: "Verify your phone",
    description:
      "We send a one-time code to confirm your number. No spam. No account passwords.",
  },
  {
    number: "04",
    title: "Receive instant alerts",
    description:
      "The moment a new WCA competition is announced within your radius, you get an SMS with all the details.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Set up in under 2 minutes. Cancel anytime via SMS.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(100%_-_16px)] w-full h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              )}

              <div className="flex flex-col gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-mono font-bold text-indigo-400">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
