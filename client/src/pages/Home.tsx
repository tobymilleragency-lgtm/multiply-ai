import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Hammer,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

const trustPoints = [
  "Pastor-focused diagnostic tools",
  "Evidence-based ministry insights",
  "Actionable 90-day plans",
];

const serviceHighlights = [
  "Inner Field Assessment",
  "Leadership SEND Analysis", 
  "Church Field Evaluation",
];

const serviceCards = [
  {
    title: "Soul Assessment",
    text: "Identify pastoral fatigue, hidden erosion, and the pressure you've been carrying alone.",
  },
  {
    title: "Leadership Analysis",
    text: "Assess team strain, blind spots, and where leadership clarity needs strengthening.",
  },
  {
    title: "Field Evaluation",
    text: "See where disciple-making is moving, stalling, or leaking across your church.",
  },
];

const processSteps = [
  {
    title: "Complete diagnostics",
    text: "Take three assessments that speak into one complete ministry picture.",
  },
  {
    title: "Receive insights",
    text: "Get clear findings you can use with calm and precision.",
  },
  {
    title: "Act with confidence",
    text: "Implement specific next steps for the next 90 days and beyond.",
  },
];

const proofStats = [
  { value: "3", label: "Diagnostic assessments" },
  { value: "90", label: "day action planning window" },
  { value: "8", label: "ministry roles analyzed" },
];

const faqItems = [
  {
    q: "What does Multiply.ai assess?",
    a: "We help pastors identify soul fatigue, leadership blind spots, and field friction that's stalling disciple-making.",
  },
  {
    q: "Who is this for?",
    a: "Lead pastors, church planters, executive pastors, and ministry leaders who need honest diagnostic language.",
  },
  {
    q: "What makes this different?",
    a: "We combine theological depth with practical clarity, giving you language for what feels off before strain turns into damage.",
  },
];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  location: "",
  projectType: "",
  timeline: "",
  details: "",
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      // For now, just show a success message since we're converting from construction to ministry platform
      setForm(initialForm);
      setStatus({
        type: "success",
        message:
          "Thank you for your interest in Multiply.ai. Assessment tools are coming soon.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed";
      setStatus({
        type: "error",
        message: `Could not process request: ${message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#111827_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
          <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="container relative py-16 sm:py-20 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
              <div className="max-w-3xl">
                <Badge className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] text-blue-100 uppercase shadow-[0_0_0_1px_rgba(59,130,246,0.12)]">
                  Ministry-Focused • Evidence-Based
                </Badge>

                <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl">
                  Diagnostic tools for pastors who need clarity.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                  Multiply.ai helps pastors assess ministry health through diagnostic tools 
                  for inner field, leadership, and church field analysis. Get language for what 
                  feels off before strain turns into damage.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full bg-blue-500 px-6 text-base font-semibold text-white hover:bg-blue-400"
                  >
                    <a href="#assessment-form">
                      Start assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-base font-semibold text-slate-100 hover:bg-white/10"
                  >
                    <a href="/platform/assessments">
                      View diagnostics
                    </a>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <ShieldCheck className="h-4 w-4 text-blue-300" />
                    Pastoral-focused insights
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <Award className="h-4 w-4 text-blue-300" />
                    Evidence-based analysis
                  </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {trustPoints.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                    >
                      <CheckCircle2 className="h-5 w-5 text-blue-300" />
                      <p className="mt-3 text-sm leading-6 text-slate-200">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-blue-500/10 blur-2xl" />
                <div className="relative rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-blue-950/50 backdrop-blur-xl">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/90 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          Multiply.ai Platform
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-white">
                          Built for pastoral clarity.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-200">
                        <Compass className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-4">
                        <p className="text-sm text-slate-400">Primary focus</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          Pastoral health assessment
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Tools that help pastors name what they're carrying and 
                          where ministry momentum is stalling.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-4">
                        <p className="text-sm text-slate-400">Why pastors use it</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          Clear language. No guessing.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          You get specific insights you can use with elders, staff, 
                          or a coach instead of vague concerns.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-blue-200" />
                        <p className="text-sm font-semibold tracking-[0.16em] text-blue-100 uppercase">
                          Core services
                        </p>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {serviceHighlights.map((service) => (
                          <div
                            key={service}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200"
                          >
                            <span>{service}</span>
                            <ArrowRight className="h-4 w-4 text-blue-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-950">
          <div className="container py-16 sm:py-20">
            <div className="grid gap-6 md:grid-cols-3">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <p className="text-3xl font-semibold text-white sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-900/60">
          <div className="container py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[0.18em] text-slate-200 uppercase">
                Services
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Work built for people who need the job handled right.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                We do not sell fluff. We take on practical projects that need
                sharp execution, good communication, and a finished result you
                can stand behind.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {serviceCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-black/20"
                >
                  <div className="inline-flex rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3 text-blue-200">
                    <Hammer className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-950">
          <div className="container py-16 sm:py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[0.18em] text-slate-200 uppercase">
                  Process
                </Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Straight process. Less friction. Better jobs.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  The goal is simple: reduce confusion, tighten execution, and
                  keep your project moving without the usual contractor circus.
                </p>
              </div>

              <div className="grid gap-4">
                {processSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-sm font-semibold text-blue-200">
                        0{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-blue-300" />
                          <h3 className="text-lg font-semibold text-white">
                            {step.title}
                          </h3>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-900/60">
          <div className="container py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[0.18em] text-slate-200 uppercase">
                Why Alpha
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Built for owners who care about follow-through.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-blue-400/20 bg-blue-500/10 p-8">
                <p className="text-sm font-semibold tracking-[0.18em] text-blue-100 uppercase">
                  What you get
                </p>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-100">
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-200" />
                    Real communication instead of silence when the job gets hard.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-200" />
                    A contractor mindset centered on accountability and clean handoff.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-200" />
                    A team that values execution, not excuses.
                  </li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
                <p className="text-sm font-semibold tracking-[0.18em] text-slate-200 uppercase">
                  Good fit clients
                </p>
                <p className="mt-5 text-base leading-8 text-slate-300">
                  Homeowners, property managers, and business owners who want a
                  strong operator on the job. If you want speed, clarity, and a
                  result that looks professional when it is done, this is the
                  lane.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    Residential
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    Commercial
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    Renovation
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    Recovery work
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="assessment-form" className="border-b border-white/10 bg-slate-950 scroll-mt-10">
          <div className="container py-16 sm:py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <Badge className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1 text-xs tracking-[0.18em] text-blue-100 uppercase">
                  Get started
                </Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Request early access to assessment tools.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  Share your context and needs. We'll notify you when diagnostic 
                  tools are available and how they can serve your ministry.
                </p>
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-slate-300">
                  <p className="font-semibold text-white">Best requests include:</p>
                  <ul className="mt-4 space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-300" />
                      Your ministry context and role
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-300" />
                      Current ministry challenges
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-300" />
                      What you'd like to understand better
                    </li>
                  </ul>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Name
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Your name"
                      className="h-11 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Phone
                    </label>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Best number"
                      className="h-11 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Optional email"
                      className="h-11 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Location
                    </label>
                    <Input
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="City or state"
                      className="h-11 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Ministry role
                    </label>
                    <Input
                      value={form.projectType}
                      onChange={(e) => updateField("projectType", e.target.value)}
                      placeholder="Lead pastor, planter, etc."
                      className="h-11 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Church size
                    </label>
                    <Input
                      value={form.timeline}
                      onChange={(e) => updateField("timeline", e.target.value)}
                      placeholder="Small, medium, large"
                      className="h-11 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Ministry context
                    </label>
                    <Textarea
                      value={form.details}
                      onChange={(e) => updateField("details", e.target.value)}
                      placeholder="Tell us about your ministry context, current challenges, and what you'd like to understand better."
                      className="min-h-36 border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                {status.message ? (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                      status.type === "success"
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                        : "border-red-400/20 bg-red-500/10 text-red-100"
                    }`}
                  >
                    {status.message}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 rounded-full bg-blue-500 px-6 text-base font-semibold text-white hover:bg-blue-400 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending request
                      </>
                    ) : (
                      <>
                        Request early access
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-slate-950">
          <div className="container py-16 sm:py-20 lg:py-24">
            <div className="max-w-2xl">
              <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs tracking-[0.18em] text-slate-200 uppercase">
                FAQ
              </Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Fast answers before you reach out.
              </h2>
            </div>

            <div className="mt-10 grid gap-4">
              {faqItems.map((item) => (
                <div
                  key={item.q}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="text-lg font-semibold text-white">{item.q}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]">
          <div className="container py-16 sm:py-20 lg:py-24">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 sm:p-10 lg:p-12">
              <div className="max-w-3xl">
                <Badge className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1 text-xs tracking-[0.18em] text-blue-100 uppercase">
                  Ready when you are
                </Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  If the job matters, bring in a contractor who acts like it.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                  Tell us what you need. We will walk the scope, give you a real
                  next step, and move the job forward without the usual mess.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-blue-500 px-6 text-base font-semibold text-white hover:bg-blue-400"
                >
                  <a href="#estimate-form">
                    Request an estimate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-base font-semibold text-slate-100 hover:bg-white/10"
                >
                  <a href="tel:+16205551234">
                    <Phone className="mr-2 h-4 w-4" />
                    Talk through your project
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
