const STEPS = [
  {
    number: "1",
    title: "Pick your field",
    description:
      "Tap a category tile. WhatsApp opens with your interest pre-filled. No forms, no sign-up. Just tap and send.",
  },
  {
    number: "2",
    title: "A real conversation",
    description:
      "I'll reply with honest, scam-free guidance for your field: which countries are realistic, what it actually costs, and what red flags to watch for.",
  },
] as const;

const PLAYBOOK_ITEMS = [
  "Which destinations are realistic for your field",
  "Step-by-step document checklist",
  "Realistic costs: visa fees, flights, relocation",
  "Current visa route overview",
  "Scam red flags to watch for",
  "Legitimate contacts and official programme links",
];

export default function HowItWorks() {
  return (
    <section style={{ backgroundColor: "#FFFFFF" }} className="px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: "#C9A84C" }} />
            <span
              className="font-display text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#C9A84C" }}
            >
              Simple process
            </span>
          </div>
          <h2
            className="font-display font-bold uppercase leading-tight"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#2C2C2C" }}
          >
            How it works.
          </h2>
          <p
            className="font-body text-sm mt-2 max-w-lg"
            style={{ color: "#6B6B6B" }}
          >
            No confusing forms. Start with a free WhatsApp conversation.
          </p>
        </div>

        {/* Steps 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex flex-col gap-4 p-6 rounded-2xl"
              style={{
                backgroundColor: "#F8F5F0",
                border: "1.5px solid #EDE8E0",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full font-display font-bold text-lg shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#1B4D3E",
                  color: "#F8F5F0",
                }}
              >
                {step.number}
              </div>
              <div>
                <h3
                  className="font-display font-bold uppercase text-base tracking-wide mb-2"
                  style={{ color: "#2C2C2C" }}
                >
                  {step.title}
                </h3>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: "#6B6B6B" }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Step 3 — Featured */}
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{ backgroundColor: "#1B4D3E" }}
        >
          {/* Number — sits above both columns */}
          <div
            className="flex items-center justify-center rounded-full font-display font-bold text-lg shrink-0 mb-6"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#C9A84C",
              color: "#FFFFFF",
            }}
          >
            3
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Left — title + description + price */}
            <div className="flex flex-col gap-4 md:w-72 shrink-0">
              <h3
                className="font-display font-bold uppercase leading-tight"
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                  color: "#F8F5F0",
                }}
              >
                Work Abroad Playbook
              </h3>
              <p
                className="font-body text-sm leading-relaxed"
                style={{ color: "rgba(248,245,240,0.7)" }}
              >
                Researched, up to date, and built around the questions scam recruiters hope you never ask.
              </p>
              <p
                className="font-body text-sm leading-relaxed text-center"
                style={{ color: "#FFFFFF" }}
              >
                One payment. No monthly fees, no hidden costs.
              </p>
              <div
                className="inline-flex items-baseline gap-1 px-4 py-2 rounded-full self-start"
                style={{ backgroundColor: "#ff751f" }}
              >
                <span
                  className="font-display font-bold text-xl"
                  style={{ color: "#FFFFFF" }}
                >
                  R199
                </span>
                <span
                  className="font-body text-xs"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  once-off
                </span>
              </div>
            </div>

            {/* Right — what's inside */}
            <div className="flex-1">
              <p
                className="font-display font-bold uppercase text-xs tracking-[0.15em] mb-4"
                style={{ color: "#C9A84C" }}
              >
                What&apos;s inside
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLAYBOOK_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div
                      className="mt-1.5 shrink-0 rounded-full"
                      style={{
                        width: "6px",
                        height: "6px",
                        backgroundColor: "#C9A84C",
                      }}
                    />
                    <span
                      className="font-body text-sm leading-relaxed"
                      style={{ color: "rgba(248,245,240,0.85)" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Featured item — assessment */}
              <div
                className="mt-5 flex items-start gap-4 rounded-xl px-5 py-4"
                style={{
                  backgroundColor: "rgba(201,168,76,0.12)",
                  border: "1.5px solid rgba(201,168,76,0.4)",
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center rounded-full font-display font-bold text-base"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#C9A84C",
                    color: "#1B4D3E",
                  }}
                >
                  ✓
                </div>
                <div>
                  <p
                    className="font-display font-bold uppercase text-xs tracking-[0.1em] mb-1 whitespace-nowrap"
                    style={{ color: "#C9A84C" }}
                  >
                    Sets Us Apart
                  </p>
                  <p
                    className="font-body text-sm font-semibold leading-snug mb-1"
                    style={{ color: "rgba(248,245,240,0.95)" }}
                  >
                    Personalised Eligibility Check
                  </p>
                  <p
                    className="font-body text-sm leading-relaxed"
                    style={{ color: "rgba(248,245,240,0.7)" }}
                  >
                    We review your background and tell you which countries are realistic for your profile — before you spend a cent on applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
