import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Copy,
  Crosshair,
  FileSearch,
  Globe2,
  HeartHandshake,
  LayoutDashboard,
  LineChart,
  Lock,
  LogOut,
  Orbit,
  PanelsTopLeft,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import { Link, Redirect, Route, Switch, useLocation, useParams } from "wouter";
import { apiGet, apiPost } from "@/lib/api";
import { AssessmentType, assessments, getAssessment } from "@/lib/assessments";
import { isSupabaseConfigured, supabase, supabaseSetupMessage } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorState } from "@/components/ErrorState";
import { GlobeCdn } from "@/components/ui/cobe-globe-cdn";


type SessionUser = { id: string; email?: string | null } | null;
type Submission = {
  id: string;
  assessment_type: string;
  status: string;
  answers_json: Record<string, string | number>;
  output_json: Record<string, unknown> | null;
  created_at: string;
  completed_at?: string | null;
};
type CombinedReport = {
  id: string;
  output_json: Record<string, unknown>;
  created_at: string;
};
type NavUser = { id: string; email?: string | null };

type RouteMeta = {
  title: string;
  eyebrow: string;
  description: string;
};

const assessmentJourney = [
  {
    step: "01",
    title: "Begin with what your soul is carrying",
    body: "Inner Field names fatigue, hidden erosion, false strength, and the pressure you have been carrying alone.",
  },
  {
    step: "02",
    title: "Read the state of your leadership load",
    body: "SEND shows readiness, blind spots, team strain, and where leadership clarity is thinning out.",
  },
  {
    step: "03",
    title: "Read the field your church is working",
    body: "Field shows where disciple-making is moving, where it is stalling, and where friction is stealing momentum.",
  },
  {
    step: "04",
    title: "Bring the findings into one clear brief",
    body: "The combined report gathers the three assessments into field intelligence you can use with calm and precision.",
  },
];

const outcomePoints = [
  "Language for what feels off before the strain turns into damage",
  "A plain reading of disciple-making drift, bottlenecks, and field friction",
  "Clear findings a pastor can use with elders, staff, or a coach",
  "Next steps for the next ninety days and the next year",
];

const whoWeServe = [
  "Lead pastors carrying soul weight and field responsibility at the same time",
  "Church planters who need to read drift before fatigue settles in",
  "Executive pastors trying to name team friction without blame or spin",
  "Coaches and networks who need honest diagnostic language, not surface metrics",
];

const commandDeck = [
  {
    title: "Soul Assessment",
    body: "See beneath activity, beneath image, and beneath the words you use to stay functional.",
    icon: <HeartHandshake className="h-5 w-5" />,
  },
  {
    title: "Leadership Assessment",
    body: "Name blind spots, strain, and decision pressure with language a pastor can trust.",
    icon: <Crosshair className="h-5 w-5" />,
  },
  {
    title: "Field Assessment",
    body: "See where disciple-making is moving, stalling, or leaking across the church.",
    icon: <Orbit className="h-5 w-5" />,
  },
  {
    title: "Guided next move",
    body: "Once the assessments are complete, the platform does not leave the pastor with a report and no road. It names the fracture, frames the decision, and hands the pastor a specific next step he can act on this week.",
    icon: <ChevronRight className="h-5 w-5" />,
  },
];

const missionSignals = [
  {
    label: "3 Diagnostics",
    value: "3",
    helper: "Inner Field, SEND, and Field speak into one ministry picture.",
  },
  {
    label: "90 Days",
    value: "90D",
    helper:
      "The near-term window where pastors usually need the clearest next move.",
  },
  {
    label: "8 Ministry Roles",
    value: "8",
    helper: "Each agent serves one plain pastoral need inside the church.",
  },
];

const shellLabels: Record<string, string> = {
  dashboard: "Pastoral overview",
  assessments: "Diagnostic room",
  reports: "Field reports",
  combined: "Combined field report",
};

const publicNav = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/platform/assessments", label: "Diagnostics" },
  { href: "/agents", label: "Agent team" },
  { href: "/for/pastors", label: "For pastors" },
];

const plainEnglishQuestions = [
  {
    title: "Why does this exist?",
    body: "Because many pastors can feel strain, confusion, or drift before they can clearly explain it to their staff, elders, or coach. The platform exists to name what is happening in plain English before the burden grows heavier.",
  },
  {
    title: "What does it do?",
    body: "It gathers answers through guided ministry assessments, organizes the answers into clear findings, and turns them into reports that a pastor can actually use in prayer, meetings, planning, and follow-up.",
  },
  {
    title: "How does it work?",
    body: "A pastor or ministry leader answers guided questions. The system reads those answers in sequence, builds structured observations, and returns a clear summary of strengths, weak spots, bottlenecks, and next steps.",
  },
  {
    title: "How does this bring relief?",
    body: "It reduces the load of trying to hold the whole ministry picture in your head alone. Instead of guessing, pastors get language, structure, and a calmer path for the next decision.",
  },
];

const pastorReliefPoints = [
  "Less second-guessing before staff, elder, or board conversations.",
  "Less time spent trying to translate fuzzy ministry pain into useful action.",
  "Less pressure on the pastor to produce every plan, summary, and follow-up document alone.",
  "More clarity about what needs attention now, what can wait, and where the church is actually stuck.",
];

const rolePages = [
  {
    title: "Lead pastors",
    body: "For leaders carrying preaching, shepherding, vision, care, and team pressure at the same time.",
  },
  {
    title: "Executive pastors",
    body: "For leaders trying to turn broad ministry vision into a healthy operating rhythm for the whole staff.",
  },
  {
    title: "Church planters",
    body: "For leaders who need to read traction early before fatigue, overreach, or unclear structure hardens into drift.",
  },
  {
    title: "Networks and coaches",
    body: "For leaders serving multiple churches who need a repeatable way to talk about health, readiness, and disciple-making movement.",
  },
];

const agentProfiles = [
  {
    slug: "harvest-guide",
    name: "Harvest Guide",
    title: "Outreach and witness care",
    icon: <Radar className="h-5 w-5" />,
    ministry:
      "Serves pastors who know the church has grown inward and needs honest help re-entering the field.",
    summary:
      "Harvest Guide helps a pastor name where outreach energy has faded, where witness has become passive, and what simple steps can restore faithful presence among people far from Christ.",
    outcomes: [
      "Names where outreach has gone quiet",
      "Gives simple language for witness and follow-up",
      "Helps the church move outward without pressure theater",
    ],
  },
  {
    slug: "new-believer-care",
    name: "New Believer Care",
    title: "First steps and follow-up care",
    icon: <HeartHandshake className="h-5 w-5" />,
    ministry:
      "Serves pastors who fear new believers are slipping through the cracks after first response.",
    summary:
      "New Believer Care helps a pastor read the gap between first response and real formation. It gives shape to follow-up, belonging, scripture foundations, and pastoral care.",
    outcomes: [
      "Names where follow-up is thin or delayed",
      "Strengthens first steps for new believers",
      "Reduces drift after early response",
    ],
  },
  {
    slug: "sermon-steward",
    name: "Sermon Steward",
    title: "Sermon extension and teaching support",
    icon: <BookOpen className="h-5 w-5" />,
    ministry:
      "Serves pastors who carry the weekly burden of feeding people and extending the message across the church.",
    summary:
      "Sermon Steward helps a pastor carry one sermon into the week with less strain. It supports guides, devotionals, prayer prompts, and teaching handoffs across the ministry.",
    outcomes: [
      "Reduces sermon follow-up strain",
      "Extends one message into the week",
      "Keeps teaching language aligned across ministries",
    ],
  },
  {
    slug: "disciple-guide",
    name: "Disciple Guide",
    title: "Disciple-making conversations",
    icon: <Compass className="h-5 w-5" />,
    ministry:
      "Serves pastors who know disciple-making has stalled and needs a clearer pattern.",
    summary:
      "Disciple Guide helps a pastor build repeatable disciple-making conversations, simple group rhythms, and outward habits that ordinary believers can carry.",
    outcomes: [
      "Clarifies a repeatable disciple-making pattern",
      "Supports obedience, accountability, and mission",
      "Helps ordinary believers lead with confidence",
    ],
  },
  {
    slug: "family-discipleship",
    name: "Family Discipleship",
    title: "Children and home formation support",
    icon: <Sparkles className="h-5 w-5" />,
    ministry:
      "Serves pastors who do not want children’s ministry to drift into childcare and disconnected programming.",
    summary:
      "Family Discipleship helps pastors and teams tie children’s ministry back to formation, home habits, volunteer support, and the wider mission of the church.",
    outcomes: [
      "Keeps children’s ministry tied to formation",
      "Supports parents and volunteers with plain tools",
      "Connects home and church discipleship more clearly",
    ],
  },
  {
    slug: "leader-development",
    name: "Leader Development",
    title: "Leadership pipeline care",
    icon: <LineChart className="h-5 w-5" />,
    ministry:
      "Serves pastors who know they are carrying too much because the leadership bench is thin.",
    summary:
      "Leader Development helps a pastor read the path from disciple to leader to reproducing leader. It names where the bench is thin and where release is being delayed.",
    outcomes: [
      "Names where the bench is thin",
      "Clarifies the path from disciple to leader",
      "Supports release instead of role-filling only",
    ],
  },
  {
    slug: "prayer-care",
    name: "Prayer Care",
    title: "Intercession and spiritual burden support",
    icon: <ShieldCheck className="h-5 w-5" />,
    ministry:
      "Serves pastors who want prayer to carry real ministry weight instead of staying vague and detached.",
    summary:
      "Prayer Care helps a pastor connect intercession to real people, real needs, real places, and real next steps in the life of the church.",
    outcomes: [
      "Names where prayer has become thin or generic",
      "Connects intercession to people and mission",
      "Strengthens prayer as a ministry engine",
    ],
  },
  {
    slug: "field-planner",
    name: "Field Planner",
    title: "Next-step planning and ministry focus",
    icon: <Crosshair className="h-5 w-5" />,
    ministry:
      "Serves pastors who need to turn hard findings into an ordered plan without more noise.",
    summary:
      "Field Planner helps a pastor turn diagnostic findings into priorities, a near-term plan, and a more honest line of sight on what should happen next.",
    outcomes: [
      "Turns findings into ordered priorities",
      "Supports a usable ninety-day plan",
      "Helps staff act on what the field is showing",
    ],
  },
];

export function App() {
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email }
          : null
      );
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <Shell>
        <div className="container py-16">
          <Surface className="p-10 text-zinc-100">
            Getting things ready...
          </Surface>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Switch>
        <Route path="/" component={() => <Home user={user} />} />
        <Route path="/login" component={() => <Login user={user} />} />
        <Route path="/signup" component={() => <Signup user={user} />} />
        <Route path="/about" component={() => <AboutPage user={user} />} />
        <Route
          path="/why-we-exist"
          component={() => <WhyWeExistPage user={user} />}
        />
        <Route
          path="/how-it-works"
          component={() => <HowItWorksPage user={user} />}
        />
        <Route
          path="/platform/assessments"
          component={() => <PublicDiagnosticsPage user={user} />}
        />
        <Route
          path="/what-are-agents"
          component={() => <WhatAreAgentsPage user={user} />}
        />
        <Route path="/agents" component={() => <AgentsHubPage user={user} />} />
        <Route
          path="/agents/:slug"
          component={() => <AgentDetailPage user={user} />}
        />
        <Route
          path="/for/pastors"
          component={() => <PastorsPage user={user} />}
        />
        <Route path="/dashboard">
          {user ? <Overview user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route path="/assessments">
          {user ? <DiagnosticsPage user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route path="/assessments/:slug">
          {user ? <AssessmentPage user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route path="/reports/history">
          {user ? <ReportsHistory user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route path="/reports/:slug/:id">
          {user ? (
            <AssessmentReportPage user={user} />
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/combined">
          {user ? (
            <CombinedReportsPage user={user} />
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/combined/:id">
          {user ? <CombinedReportPage user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route path="/app/church-profile">
          {user ? <ChurchProfilePage user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route path="/app/agents">
          {user ? <AgentHubPage user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route path="/app/agents/:agentId">
          {user ? <AgentWorkspacePage user={user} /> : <Redirect to="/login" />}
        </Route>
        <Route>
          <NotFoundPage user={user} />
        </Route>
      </Switch>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#02030a] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,92,255,0.18),transparent_26%),radial-gradient(circle_at_15%_18%,rgba(82,234,255,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(255,180,90,0.14),transparent_24%),linear-gradient(180deg,#050711_0%,#060910_32%,#04060c_100%)]" />
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_48%,rgba(2,3,10,0.55)_100%)]" />
        <div className="absolute left-[8%] top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[4%] top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/2 h-[38rem] w-[44rem] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Header({ user }: { user: SessionUser }) {
  const [, navigate] = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#060912]/68 backdrop-blur-2xl">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-4 text-white">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_48px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(82,234,255,0.5),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(255,196,102,0.42),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))]" />
            <Globe2 className="relative h-5 w-5 text-cyan-50" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-100/70">
              Pastoral field intelligence
            </div>
            <div className="text-lg font-semibold tracking-[0.12em] text-white">
              MULTIPLY.AI
            </div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-100">
          {user ? (
            <>
              <NavLink
                href="/dashboard"
                label="Overview"
                icon={<LayoutDashboard className="h-4 w-4" />}
              />
              <NavLink
                href="/assessments"
                label="Diagnostics"
                icon={<FileSearch className="h-4 w-4" />}
              />
              <NavLink
                href="/reports/history"
                label="Reports"
                icon={<BookOpen className="h-4 w-4" />}
              />
              <NavLink
                href="/combined"
                label="Combined"
                icon={<LineChart className="h-4 w-4" />}
              />
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              {publicNav.map(item => (
                <Link key={item.href} href={item.href} className="btn-ghost">
                  {item.label}
                </Link>
              ))}
              <NavLink
                href="/login"
                label="Login"
                icon={<Lock className="h-4 w-4" />}
              />
              <Link href="/signup" className="btn-primary">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Home({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <main>
        <section className="w-full">
          <div className="hero-stage overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
            <div className="grid gap-8 xl:min-h-[48rem] xl:grid-cols-[1fr_auto_auto] xl:items-start xl:pt-8">
              {/* Left: headline + subtext + buttons */}
              <div className="relative z-10">
                <BadgePill>
                  A diagnostic for pastors carrying hidden weight, field strain,
                  and leadership isolation
                </BadgePill>
                <h1 className="mt-7 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl xl:text-[5rem] xl:leading-[0.96]">
                  You already sense something is wrong. This platform helps you name it.
                </h1>
                <p className="mt-6 max-w-2xl text-[20px] leading-[1.8] text-white">
                  MULTIPLY.AI gives pastors a clear diagnostic picture of their soul condition, leadership load, and field health — so they know what is true and what to do next.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href={user ? "/assessments" : "/signup"}
                    className="btn-primary btn-lg"
                  >
                    Begin your assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className="btn-secondary btn-lg"
                  >
                    Login
                  </Link>
                </div>
              </div>

              {/* Center: globe — no box, floats free */}
              <div className="relative hidden xl:block">
                <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="relative w-[340px]">
                  <GlobeCdn className="w-full" />
                </div>
              </div>

              {/* Right: diagnostic cards stacked */}
              <div className="hidden xl:flex xl:flex-col xl:gap-3 xl:w-[230px] xl:self-stretch">
                {assessments.map((a, i) => (
                  <Link
                    key={a.slug}
                    href={user ? `/assessments/${a.slug}` : "/signup"}
                    className="group block rounded-[1.6rem] border border-white/10 bg-[#090d16] px-5 py-5 flex-1 transition hover:bg-[#0d1322]"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">0{i + 1}</div>
                    <div className="mt-3 text-lg font-semibold text-white">{a.shortTitle}</div>
                    <div className="mt-2 text-[15px] leading-[1.6] text-zinc-100">{a.description}</div>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-100">
                      Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.18fr_0.82fr] xl:items-stretch">
              <MissionRibbon
                label="Strategic sequence"
                title="This platform does not hand you a form. It walks with you through a sequence — soul first, leadership second, field third. Each step builds on the one before it."
                body="Begin with the soul. Move to leadership strain. Then read the field. That order keeps the diagnosis honest."
                items={assessmentJourney.map(
                  item => `${item.step} ${item.title}`
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {commandDeck.map(item => (
                  <FeaturePanel
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    body={item.body}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Surface className="p-8 lg:p-10">
              <SectionIntro
                eyebrow="Mission center"
                title="Built for the weight you carry behind the pulpit and beyond it."
                description="It does not offer motivation. It offers clarity. It names what is actually happening — and clarity is the first step toward moving forward."
              />
              <div className="mt-8 grid gap-4">
                {outcomePoints.map((point, index) => (
                  <div
                    key={point}
                    className="frame-line rounded-[1.6rem] px-5 py-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-sm font-semibold text-white">
                        0{index + 1}
                      </div>
                      <p className="text-[17px] leading-[1.75] text-white">{point}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>

            <div className="grid gap-6">
              <SectionSlab
                eyebrow="Who this serves"
                title="For pastors making costly calls in real ministry conditions"
                description="This platform is for pastors, planters, and coaches who need language they can trust in prayer, counsel, staffing, and hard conversations."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {whoWeServe.map(item => (
                    <div
                      key={item}
                      className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-[17px] leading-[1.75] text-white"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </SectionSlab>

              <Surface className="overflow-hidden p-0">
                <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
                  <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-9">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                      Core diagnostics
                    </div>
                    <h2 className="mt-3 text-3xl font-semibold text-white">
                      Three assessments. One ministry picture.
                    </h2>
                    <p className="mt-4 text-[17px] leading-[1.8] text-white">
                      Each diagnostic reads one layer of ministry reality.
                      Together they form a calm and usable picture of soul
                      condition, leadership strain, and disciple-making
                      traction.
                    </p>
                  </div>
                  <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                    {assessments.map((assessment, index) => (
                      <Link
                        key={assessment.slug}
                        href={
                          user ? `/assessments/${assessment.slug}` : "/signup"
                        }
                        className="group bg-[#090d16] p-7 lg:p-8 transition hover:bg-[#0d1322]"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
                          0{index + 1}
                        </div>
                        <div className="mt-4 text-2xl font-semibold text-white">
                          {assessment.shortTitle}
                        </div>
                        <div className="mt-3 text-[17px] leading-[1.75] text-white">
                          {assessment.description}
                        </div>
                        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-50 shadow-[0_10px_30px_rgba(34,211,238,0.12)]">
                          Open diagnostic
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Surface>
            </div>
          </div>
        </section>

        <section className="w-full py-2 lg:py-4 px-4 sm:px-6 lg:px-8">
          <SectionSlab
            eyebrow="Agent team"
            title="Eight ministry roles for needs pastors face every week"
            description="Each agent serves one plain ministry need. Together they reduce friction, clarify next steps, and support the pastor without pretending to replace him."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {agentProfiles.map(agent => (
                <Link
                  key={agent.slug}
                  href={`/agents/${agent.slug}`}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3 text-cyan-100">
                    {agent.icon}
                    <div className="text-base font-semibold text-white">
                      {agent.name}
                    </div>
                  </div>
                  <div className="mt-2 text-[17px] leading-[1.75] text-white">
                    {agent.title}
                  </div>
                </Link>
              ))}
            </div>
          </SectionSlab>
        </section>

        <section className="w-full pb-20 pt-0 lg:pb-24 px-4 sm:px-6 lg:px-8">
          <SectionBanner
            eyebrow="Where to begin"
            title="Named things can be moved. Start with a clear reading."
            description="Move through the diagnostics in order. Build reports your team can use in real conversations. What is named can be addressed. What stays unnamed keeps doing harm."
            actions={
              <>
                <Link
                  href={user ? "/dashboard" : "/signup"}
                  className="btn-primary btn-lg"
                >
                  {user ? "Open your overview" : "Create your account"}
                </Link>
                <Link href="/agents" className="btn-secondary btn-lg">
                  See the ministry roles
                </Link>
              </>
            }
          />
        </section>
      </main>
      <PublicFooter user={user} />
    </>
  );
}

function Login({ user }: { user: SessionUser }) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  if (user) return <Redirect to="/dashboard" />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setError(error.message);
    navigate("/dashboard");
  }

  return (
    <AuthLayout
      title="Come back to what the field is showing"
      subtitle="Open your account to continue your diagnostics, review past reports, and pick up where you left off."
      error={error}
      asideTitle="What waits inside"
      asideItems={[
        "Saved drafts across each diagnostic.",
        "Reports written in plain language for pastors and leaders.",
        "One combined field report after all three diagnostics are complete.",
      ]}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
          />
        </Field>
        <button className="btn-primary w-full justify-center">
          Open your account
        </button>
      </form>
      <p className="mt-6 text-[17px] text-zinc-100">
        Need an account?{" "}
        <Link
          href="/signup"
          className="text-cyan-200 underline-offset-4 hover:underline"
        >
          Create one here
        </Link>
        .
      </p>
    </AuthLayout>
  );
}

function Signup({ user }: { user: SessionUser }) {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    ministryName: "",
    ministryContext: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  if (user) return <Redirect to="/dashboard" />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          role: form.role,
          ministry_name: form.ministryName,
          ministry_context: form.ministryContext,
        },
      },
    });
    if (error) return setError(error.message);
    if (!data.session) {
      setMessage("Account created. Check your email for a confirmation link, then come back and log in.");
      return;
    }
    await apiPost("/api/profile", {
      first_name: form.firstName,
      last_name: form.lastName,
      role: form.role,
      ministry_name: form.ministryName,
      ministry_context: form.ministryContext,
      email: form.email,
    });
    navigate("/dashboard");
  }

  return (
    <AuthLayout
      title="Set up a quiet place to read the field"
      subtitle="Set up your account so you can move through the diagnostics without losing your place."
      error={error}
      message={message}
      asideTitle="What happens next"
      asideItems={[
        "You land in an overview that shows what is open and what still needs attention.",
        "You can move through the diagnostics in order and know what each one is reading.",
        "Reports stay with your account for follow-up, counsel, and planning.",
      ]}
    >
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        {Object.entries({
          firstName: "First name",
          lastName: "Last name",
          email: "Email",
          password: "Password",
          role: "Role",
          ministryName: "Church or ministry",
          ministryContext: "Ministry context",
        }).map(([key, label]) => (
          <Field
            key={key}
            label={label}
            className={
              key === "email" || key === "password" || key === "ministryContext"
                ? "md:col-span-2"
                : ""
            }
          >
            <input
              type={
                key === "password"
                  ? "password"
                  : key === "email"
                    ? "email"
                    : "text"
              }
              value={(form as Record<string, string>)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="input"
            />
          </Field>
        ))}
        <button className="btn-primary md:col-span-2 justify-center">
          Create your account
        </button>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({
  title,
  subtitle,
  error,
  message,
  asideTitle,
  asideItems,
  children,
}: {
  title: string;
  subtitle: string;
  error?: string;
  message?: string;
  asideTitle: string;
  asideItems: string[];
  children: React.ReactNode;
}) {
  return (
    <>
      <Header user={null} />
      <main className="container py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <Surface className="p-8 sm:p-10">
            <BadgePill>Private access</BadgePill>
            <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-[18px] leading-[1.8] text-white">
              {subtitle}
            </p>
            {error ? <AlertBox tone="error">{error}</AlertBox> : null}
            {message ? <AlertBox tone="success">{message}</AlertBox> : null}
            <div className="mt-8">{children}</div>
          </Surface>
          <SectionSlab
            eyebrow="What is here"
            title={asideTitle}
            description="Your account holds everything you have started and finished. Nothing expires. Your place is saved. You can return whenever you are ready."
          >
            <div className="space-y-4">
              {asideItems.map(item => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/10 bg-[#0b1019] p-4 text-[17px] leading-[1.75] text-white"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-[1.9rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm font-semibold text-white">
                Diagnostic sequence
              </div>
              <div className="mt-4 space-y-3">
                {assessmentJourney.map(item => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#0e1320] text-xs font-semibold text-white">
                      {item.step}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.title}
                      </div>
                      <div className="text-[16px] leading-[1.7] text-zinc-100">
                        {item.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionSlab>
        </div>
      </main>
    </>
  );
}

function Overview({ user }: { user: NavUser }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reports, setReports] = useState<CombinedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      apiGet<{ submissions: Submission[] }>("/api/submissions"),
      apiGet<{ reports: CombinedReport[] }>("/api/combined-reports"),
    ])
      .then(([s, r]) => {
        setSubmissions(s.submissions);
        setReports(r.reports);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load overview");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorState
            title="Failed to load overview"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </>
    );
  }

  const completed = new Set(
    submissions
      .filter(s => s.status === "completed" && !isErrorOutput(s.output_json))
      .map(s => s.assessment_type as AssessmentType)
  );
  const drafts = submissions.filter(s => s.status === "draft");
  const recentSubmission = submissions[0];
  const readyForCombined = ["inner-field", "send", "field"].every(slug =>
    completed.has(slug as AssessmentType)
  );
  const progressCards = assessments.map((assessment, index) => {
    const matching = submissions.find(
      item => item.assessment_type === assessment.slug
    );
    return {
      ...assessment,
      badge: `0${index + 1}`,
      state:
        matching?.status === "draft"
          ? "Draft in progress"
          : completed.has(assessment.slug)
            ? "Report available"
            : "Not yet started",
    };
  });

  return (
    <>
      <Header user={user} />
      <PageFrame
        title="Your ministry overview"
        eyebrow="Ministry overview"
        description="This is your quiet room. See what is finished, what still needs attention, and where to go next. You do not have to carry the whole picture alone."
        shell="dashboard"
      >
        <CommandHero
          title="Here is where things stand."
          description="You can see which diagnostics are finished, which drafts are still in progress, and whether the combined report is ready to build."
          actions={
            <>
              <Link href="/assessments" className="btn-primary">
                Open diagnostics
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/reports/history" className="btn-secondary">
                Review reports
              </Link>
              <Link href="/combined" className="btn-secondary">
                Combined report
              </Link>
            </>
          }
          right={
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <SignalStat
                value={`${completed.size}/3`}
                label="Diagnostics finished"
                helper="Diagnostics that returned usable findings and are ready to review."
              />
              <SignalStat
                value={String(drafts.length)}
                label="Drafts in progress"
                helper="Work you have already started and can return to."
              />
              <SignalStat
                value={readyForCombined ? "Ready" : "Not yet"}
                label="Combined report"
                helper={readyForCombined ? "All three are complete. You can build the full picture." : "Available once all three diagnostics are finished."}
              />
            </div>
          }
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Surface className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
                  Diagnostic progress
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  What you are carrying
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-100">
                Where things stand
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {progressCards.map(assessment => (
                <JourneyCard
                  key={assessment.slug}
                  badge={assessment.badge}
                  title={assessment.shortTitle}
                  body={assessment.state}
                  href={`/assessments/${assessment.slug}`}
                />
              ))}
              <JourneyCard
                badge="04"
                title="Combined report"
                body={
                  readyForCombined
                    ? "All three are in. The full picture is ready."
                    : "Becomes available once all three diagnostics are complete."
                }
                href="/combined"
              />
            </div>
          </Surface>

          <TelemetryPanel
            eyebrow="Current reading"
            title="A quick look at where things stand"
            items={[
              {
                icon: <BarChart3 className="h-5 w-5" />,
                label: "Completed analyses",
                value: String(completed.size),
                helper: "Diagnostics with usable findings.",
              },
              {
                icon: <BookOpen className="h-5 w-5" />,
                label: "Drafts in progress",
                value: String(drafts.length),
                helper: "Saved work you can return to.",
              },
              {
                icon: <LineChart className="h-5 w-5" />,
                label: "Combined reports",
                value: String(reports.length),
                helper:
                  "Combined reports built from all three completed diagnostics.",
              },
              {
                icon: <Target className="h-5 w-5" />,
                label: "Latest activity",
                value: recentSubmission
                  ? formatShortDate(recentSubmission.created_at)
                  : "None",
                helper: recentSubmission
                  ? humanize(recentSubmission.assessment_type)
                  : "No diagnostics yet.",
              },
            ]}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionSlab
            eyebrow="Suggested next move"
            title={
              drafts[0]
                ? `Resume ${humanize(drafts[0].assessment_type)}`
                : readyForCombined
                  ? "Generate the combined field report"
                  : "Open the next diagnostic"
            }
            description={
              drafts[0]
                ? "A draft is already saved. Finish it so the reading can be completed and the picture can come into view."
                : readyForCombined
                  ? "All three diagnostics are complete. The combined report is the clearest next step if you need one plain reading of the whole field."
                  : "If you want a credible combined picture, complete all three diagnostics in order."
            }
          >
            <div className="space-y-3">
              {assessmentJourney.map(item => (
                <div
                  key={item.step}
                  className="frame-line rounded-[1.5rem] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-xs font-semibold text-white">
                      {item.step}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {item.title}
                      </div>
                      <div className="text-[16px] leading-[1.7] text-zinc-100">
                        {item.body}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionSlab>

          <SectionSlab
            eyebrow="Recent activity"
            title="Recent submissions and reports"
            description="Everything you have started or finished is here. Return to what is unfinished. Reopen what is complete. Nothing is lost."
          >
            <div className="space-y-4">
              {submissions.length ? (
                submissions
                  .slice(0, 5)
                  .map(submission => (
                    <RecordRow
                      key={submission.id}
                      title={humanize(submission.assessment_type)}
                      subtitle={
                        submission.status === "completed"
                          ? "Completed diagnostic"
                          : "Draft saved"
                      }
                      meta={formatShortDate(submission.created_at)}
                      href={
                        submission.status === "completed"
                          ? `/reports/${submission.assessment_type}/${submission.id}`
                          : `/assessments/${submission.assessment_type}`
                      }
                      cta={
                        submission.status === "completed"
                          ? "Open report"
                          : "Resume diagnostic"
                      }
                    />
                  ))
              ) : (
                <EmptyState
                  title="Nothing here yet"
                  body="When you start a diagnostic, it will appear here. Your work saves as you go. Nothing is lost if you need to step away."
                  href="/assessments"
                  cta="See diagnostics"
                />
              )}
            </div>
          </SectionSlab>
        </div>

        {/* Agent team section */}
        <div className="mt-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Ministry agents</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Your agent team</h2>
            </div>
            <Link href="/app/agents" className="btn-secondary shrink-0">Open agent hub</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agentRegistry.map((agent) => (
              <Link
                key={agent.id}
                href={`/app/agents/${agent.id}`}
                className="group block rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{agent.icon}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ background: agent.color + "20", color: agent.color }}>{agent.tier}</span>
                </div>
                <div className="mt-3 text-base font-semibold text-white">{agent.name}</div>
                <div className="mt-1 text-sm leading-[1.55] text-zinc-100">{agent.tagline}</div>
              </Link>
            ))}
          </div>
        </div>
      </PageFrame>
    </>
  );
}

function DiagnosticsPage({ user }: { user: NavUser }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ submissions: Submission[] }>("/api/submissions")
      .then(data => {
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load submissions");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorState 
            title="Failed to load diagnostics"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </>
    );
  }

  const draftsByType = new Map(
    submissions
      .filter(item => item.status === "draft")
      .map(item => [item.assessment_type, item])
  );
  const completedByType = new Map(
    submissions
      .filter(
        item => item.status === "completed" && !isErrorOutput(item.output_json)
      )
      .map(item => [item.assessment_type, item])
  );

  return (
    <>
      <Header user={user} />
      <PageFrame
        title="Your diagnostic room"
        eyebrow="Guided ministry diagnostics"
        description="Each diagnostic helps you name what is happening in one part of ministry life. This is not a performance review. It is a safe room for honest answers."
        shell="assessments"
      >
        <CommandHero
          title="Three diagnostics that work together"
          description="You can see the order, what each diagnostic reads, and where to begin. Take them one at a time."
          right={<MissionBoard />}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <SectionSlab
            eyebrow="The order"
            title="Begin with what the pastor carries, then move outward"
            description="The platform begins with the soul, moves through leadership strain, and then reads the field. That order helps you read the findings in context."
          >
            <div className="space-y-4">
              {assessmentJourney.map(item => (
                <div
                  key={item.step}
                  className="rounded-[1.5rem] border border-white/10 bg-[#0b1019] p-4"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
                    Step {item.step}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {item.title}
                  </div>
                  <div className="mt-2 text-[17px] leading-[1.75] text-white">
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          </SectionSlab>

          <div className="grid gap-6 lg:grid-cols-2">
            {assessments.map(assessment => {
              const draft = draftsByType.get(assessment.slug);
              const completed = completedByType.get(assessment.slug);
              const stateLabel = completed
                ? "Report available"
                : draft
                  ? "Draft in progress"
                  : "Not yet started";
              return (
                <Surface
                  key={assessment.slug}
                  className="flex h-full flex-col overflow-hidden p-0"
                >
                  <div className="border-b border-white/10 p-7">
                    <div className="flex items-center justify-between gap-4">
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        {assessment.shortTitle}
                      </div>
                      <div className="text-[17px] text-zinc-100">{stateLabel}</div>
                    </div>
                    <h2 className="mt-5 text-3xl font-semibold text-white">
                      {assessment.title}
                    </h2>
                    <p className="mt-4 text-[17px] leading-[1.75] text-white">
                      {assessment.description}
                    </p>
                  </div>
                  <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                    <MiniStat
                      label="Sections"
                      value={String(assessment.sections.length)}
                    />
                    <MiniStat
                      label="Questions"
                      value={String(
                        assessment.sections.flatMap(
                          section => section.questions
                        ).length
                      )}
                    />
                    <MiniStat
                      label="Report tabs"
                      value={String(assessment.resultTabs.length)}
                    />
                  </div>
                  <div className="p-7">
                    <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1019] p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100">
                        Report focus
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {assessment.resultTabs.map(tab => (
                          <span
                            key={tab}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-200"
                          >
                            {tab}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-[17px] leading-[1.75] text-white">
                      {assessment.intro}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/assessments/${assessment.slug}`}
                        className="btn-primary"
                      >
                        {draft
                          ? "Resume diagnostic"
                          : completed
                            ? "Review or retake"
                            : "Open the diagnostic"}
                      </Link>
                      {completed ? (
                        <Link href="/reports/history" className="btn-secondary">
                          See reports
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </Surface>
              );
            })}
          </div>
        </div>
      </PageFrame>
    </>
  );
}

function AssessmentPage({ user }: { user: NavUser }) {
  const { slug } = useParams<{ slug: string }>();
  const assessment = getAssessment(slug);
  const [, navigate] = useLocation();
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "questions">("intro");
  const [state, setState] = useState("");

  useEffect(() => {
    if (!assessment) return;
    void apiGet<{ submissions: Submission[] }>(
      `/api/submissions?assessmentType=${assessment.slug}`
    )
      .then(data => {
        const draft = data.submissions.find(s => s.status === "draft");
        if (draft) setAnswers(draft.answers_json || {});
      })
      .catch(() => undefined);
  }, [assessment]);

  if (!assessment) return <NotFoundPage user={user} />;

  const activeAssessment = assessment;
  const questions = activeAssessment.sections.flatMap(s => s.questions);
  const answered = questions.filter(
    q => answers[q.id] !== undefined && answers[q.id] !== ""
  ).length;
  const allAnswered = answered === questions.length;
  const section = activeAssessment.sections[sectionIndex];
  const percent = Math.round((answered / questions.length) * 100) || 0;

  async function saveDraft() {
    setState("Saving draft...");
    await apiPost("/api/assessment/draft", {
      assessmentType: activeAssessment.slug,
      answers,
    });
    setState(`Draft saved at ${new Date().toLocaleTimeString()}`);
  }

  async function submit() {
    setState("Building your report...");
    const result = await apiPost<{ id: string }>("/api/assessment/submit", {
      assessmentType: activeAssessment.slug,
      answers,
    });
    navigate(`/reports/${activeAssessment.slug}/${result.id}`);
  }

  return (
    <>
      <Header user={user} />
      <PageFrame
        title={assessment.title}
        eyebrow="Assessment workspace"
        description="Answer honestly. There is no scoring, no judgment, and no wrong direction. Move at your own pace. Save your place when you need to step away."
        shell="assessments"
      >
        {phase === "intro" ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <SectionSlab
              eyebrow={assessment.shortTitle}
              title="Here is what this diagnostic covers"
              description={assessment.intro}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <MiniStat
                  label="Sections"
                  value={String(assessment.sections.length)}
                />
                <MiniStat label="Questions" value={String(questions.length)} />
                <MiniStat
                  label="Report tabs"
                  value={String(assessment.resultTabs.length)}
                />
              </div>
              <div className="mt-8 rounded-[1.9rem] border border-white/10 bg-[#0b1019] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
                  What the report returns
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {assessment.resultTabs.map(tab => (
                    <span
                      key={tab}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-200"
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setPhase("questions")}
                  className="btn-primary"
                >
                  Start this diagnostic
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link href="/assessments" className="btn-secondary">
                  Back to all diagnostics
                </Link>
              </div>
            </SectionSlab>

            <Surface className="overflow-hidden p-0">
              <div className="border-b border-white/10 px-7 py-6 sm:px-8">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
                  A quiet room for honest answers
                </div>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  Section map and pacing
                </h2>
                <p className="mt-3 text-[17px] leading-[1.75] text-white">
                  Answer with honesty. This is not grading you. You can save
                  your place and come back later. When you submit, the report is
                  built from what you shared.
                </p>
              </div>
              <div className="space-y-px bg-white/10">
                {assessment.sections.map((sectionItem, index) => (
                  <div
                    key={sectionItem.id}
                    className="bg-[#090d16] px-7 py-5 sm:px-8"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
                      Section {index + 1}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {sectionItem.title}
                    </div>
                    <div className="mt-2 text-[17px] leading-[1.75] text-white">
                      {sectionItem.description}
                    </div>
                    <div className="mt-3 text-xs text-zinc-100">
                      {sectionItem.questions.length} questions
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
            <Surface className="h-fit overflow-hidden p-0">
              <div className="border-b border-white/10 p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
                  Current progress
                </div>
                <div className="mt-3 text-5xl font-semibold text-white">
                  {percent}%
                </div>
                <div className="mt-2 text-[17px] text-zinc-100">
                  {answered} of {questions.length} answered
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#4cc9f0,#8b5cf6,#f6bd60)]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {assessment.sections.map((sectionItem, index) => {
                    const answeredInSection = sectionItem.questions.filter(
                      question =>
                        answers[question.id] !== undefined &&
                        answers[question.id] !== ""
                    ).length;
                    return (
                      <button
                        key={sectionItem.id}
                        onClick={() => setSectionIndex(index)}
                        className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                          index === sectionIndex
                            ? "border-cyan-300/35 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(76,201,240,0.08),0_20px_60px_rgba(8,145,178,0.12)]"
                            : "border-white/10 bg-[#0b1019] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-zinc-100">
                              Section {index + 1}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white">
                              {sectionItem.title}
                            </div>
                          </div>
                          <div className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-zinc-100">
                            {answeredInSection}/{sectionItem.questions.length}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPhase("intro")}
                  className="btn-secondary mt-5 w-full justify-center"
                >
                  Back to the overview
                </button>
              </div>
            </Surface>

            <Surface className="overflow-hidden p-0">
              <div className="grid gap-0 lg:grid-cols-[1fr_240px]">
                <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
                    {assessment.shortTitle}
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    {section.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-[17px] leading-[1.75] text-white">
                    {section.description}
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
                    Current section
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white">
                    Section {sectionIndex + 1} of {assessment.sections.length}
                  </div>
                  <div className="mt-3 text-[17px] leading-[1.75] text-white">
                    Work through one section at a time. Your answers save as you go. Submit when every question is answered.
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="space-y-5">
                  {section.questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      q={question}
                      index={index}
                      value={answers[question.id]}
                      onChange={value =>
                        setAnswers(current => ({
                          ...current,
                          [question.id]: value,
                        }))
                      }
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        setSectionIndex(index => Math.max(0, index - 1))
                      }
                      className="btn-secondary"
                      disabled={sectionIndex === 0}
                    >
                      Back
                    </button>
                    <button
                      onClick={() =>
                        setSectionIndex(index =>
                          Math.min(assessment.sections.length - 1, index + 1)
                        )
                      }
                      className="btn-secondary"
                      disabled={sectionIndex === assessment.sections.length - 1}
                    >
                      Next
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={saveDraft} className="btn-secondary">
                      Save draft
                    </button>
                    <button
                      onClick={submit}
                      className="btn-primary"
                      disabled={!allAnswered}
                    >
                      Submit for report
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-[17px] text-zinc-100">
                  {state ||
                    (allAnswered
                      ? "You have answered every question. Submit when you are ready."
                      : "Answer every question to submit. You can save your place and return.")}
                </div>
              </div>
            </Surface>
          </div>
        )}
      </PageFrame>
    </>
  );
}

function ReportsHistory({ user }: { user: NavUser }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ submissions: Submission[] }>("/api/submissions")
      .then(data => {
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load reports");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorState
            title="Failed to load reports"
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header user={user} />
      <PageFrame
        title="Your report history"
        eyebrow="Field record"
        description="Everything you have started or completed is here. Findings are not a final verdict. They are a starting point for better decisions."
        shell="reports"
      >
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <SectionSlab
            eyebrow="Your saved work"
            title="What is here and what is still in progress"
            description="Your work is saved. Finished reports are ready to open. Drafts are ready to resume. Nothing expires."
          >
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <MiniStat
                label="All records"
                value={String(submissions.length)}
              />
              <MiniStat
                label="Completed"
                value={String(
                  submissions.filter(item => item.status === "completed").length
                )}
              />
              <MiniStat
                label="Drafts"
                value={String(
                  submissions.filter(item => item.status === "draft").length
                )}
              />
            </div>
          </SectionSlab>

          <div className="space-y-4">
            {submissions.length ? (
              submissions.map(submission => (
                <Surface key={submission.id} className="p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
                        {humanize(submission.assessment_type)}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {submission.status === "completed"
                          ? "Completed diagnostic"
                          : "Saved draft"}
                      </div>
                      <div className="mt-3 text-[17px] leading-[1.75] text-white">
                        Created {formatLongDate(submission.created_at)}
                        {submission.completed_at
                          ? ` • Completed ${formatLongDate(submission.completed_at)}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={
                          submission.status === "completed"
                            ? `/reports/${submission.assessment_type}/${submission.id}`
                            : `/assessments/${submission.assessment_type}`
                        }
                        className="btn-primary"
                      >
                        {submission.status === "completed"
                          ? "Open report"
                          : "Resume diagnostic"}
                      </Link>
                    </div>
                  </div>
                </Surface>
              ))
            ) : (
              <EmptyState
                title="No reports yet"
                body="Once you start or finish a diagnostic, it will appear here. Everything is saved so you can return when you are ready."
                href="/assessments"
                cta="See diagnostics"
              />
            )}
          </div>
        </div>
      </PageFrame>
    </>
  );
}

function AssessmentReportPage({ user }: { user: NavUser }) {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ submission: Submission }>(`/api/submissions/${id}`)
      .then(data => setSubmission(data.submission))
      .catch(err => setError(err.message || "Failed to load report"));
  }, [id]);

  const reportStatus = submission?.output_json?.status;
  const assessment = getAssessment(slug);

  return (
    <>
      <Header user={user} />
      <PageFrame
        title={
          assessment
            ? `${assessment.shortTitle} report`
            : `${humanize(slug)} report`
        }
        eyebrow="Assessment report"
        description="These findings are not a verdict. They are a starting point. Read them calmly. Use them in prayer, in meetings, and in your next conversation."
        shell="reports"
      >
        {error ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <ErrorState
              title="Failed to load report"
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : !submission ? (
          <Surface className="p-8 text-zinc-100">
            Pulling up your report...
          </Surface>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <SectionSlab
              eyebrow="Report state"
              title={submission.status}
              description="Here is the current state of this report. The findings below are organized so you can read them section by section."
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <MiniStat
                  label="Assessment"
                  value={
                    assessment?.shortTitle ||
                    humanize(submission.assessment_type)
                  }
                />
                <MiniStat
                  label="Created"
                  value={formatShortDate(submission.created_at)}
                />
                <MiniStat
                  label="Completed"
                  value={
                    submission.completed_at
                      ? formatShortDate(submission.completed_at)
                      : "Pending"
                  }
                />
                <MiniStat
                  label="Analysis state"
                  value={
                    typeof reportStatus === "string" ? reportStatus : "ready"
                  }
                />
              </div>
              <div className="mt-8 rounded-[1.9rem] border border-white/10 bg-[#0b1019] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100">
                    Full report data
                  </div>
                  <Link href="/reports/history" className="btn-secondary">
                    Back to history
                  </Link>
                </div>
                <div className="mt-4 whitespace-pre-wrap text-[17px] leading-[1.75] text-white">
                  {renderJson(submission.output_json)}
                </div>
              </div>
            </SectionSlab>

            <ReportCanvas
              eyebrow="Structured output"
              title="Your findings, organized for use"
              description={
                reportStatus === "queued"
                  ? "Your report is still being prepared. It will be ready shortly."
                  : reportStatus === "error"
                    ? "Something interrupted this report. The details are shown below so you know exactly what happened."
                    : "The findings are organized into readable sections. Scan them. Share them. Use them in real conversations."
              }
            >
              {renderJsonBlocks(submission.output_json || {})}
            </ReportCanvas>
          </div>
        )}
      </PageFrame>
    </>
  );
}

function CombinedReportsPage({ user }: { user: NavUser }) {
  const [reports, setReports] = useState<CombinedReport[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      apiGet<{ reports: CombinedReport[] }>("/api/combined-reports"),
      apiGet<{ submissions: Submission[] }>("/api/submissions"),
    ])
      .then(([reportData, submissionData]) => {
        setReports(reportData.reports);
        setSubmissions(submissionData.submissions);
        setInitialLoading(false);
      })
      .catch(err => {
        setLoadError(err.message || "Failed to load combined reports");
        setInitialLoading(false);
      });
  }, []);

  if (initialLoading) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Header user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorState
            title="Failed to load combined reports"
            message={loadError}
            onRetry={() => window.location.reload()}
          />
        </div>
      </>
    );
  }

  const assessmentStatuses = assessments.map(assessment => {
    const found = submissions.find(
      submission =>
        submission.assessment_type === assessment.slug &&
        submission.status === "completed" &&
        !isErrorOutput(submission.output_json)
    );
    return {
      slug: assessment.slug,
      title: assessment.shortTitle,
      ready: Boolean(found),
    };
  });
  const ready = assessmentStatuses.every(item => item.ready);

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const result = await apiPost<{ id: string }>("/api/combined-reports");
      window.location.href = `/combined/${result.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setLoading(false);
    }
  }

  return (
    <>
      <Header user={user} />
      <PageFrame
        title="Combined ministry report"
        eyebrow="Combined ministry view"
        description="When all three diagnostics are done, this is where the full picture comes together. One reading of soul condition, leadership readiness, and field movement."
        shell="combined"
      >
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <SectionSlab
            eyebrow="Readiness check"
            title="Pull the whole field picture together"
            description="The combined report gathers Inner Field, SEND, and Field into one ministry diagnosis with priorities, pressure points, and suggested next moves."
          >
            <div className="space-y-3">
              {assessmentStatuses.map(item => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-[#0b1019] px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {item.title}
                    </div>
                    <div className="text-[17px] text-zinc-100">
                      {item.ready
                        ? "Finished and ready"
                        : "Still needs to be completed"}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${item.ready ? "border border-emerald-400/25 bg-emerald-500/10 text-emerald-200" : "border border-white/10 bg-white/[0.04] text-zinc-100"}`}
                  >
                    {item.ready ? "Ready" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={generate}
                disabled={!ready || loading}
                className="btn-primary"
              >
                {loading
                  ? "Putting it together..."
                  : "Build the combined report"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/reports/history" className="btn-secondary">
                Review report history
              </Link>
            </div>
            {error ? <AlertBox tone="error">{error}</AlertBox> : null}
          </SectionSlab>

          <SectionSlab
            eyebrow="Saved reports"
            title="Saved combined reports"
            description="Each combined report stays available so you can return to it for planning, counsel, and follow-up."
          >
            <div className="space-y-4">
              {reports.length ? (
                reports.map(report => (
                  <RecordRow
                    key={report.id}
                    title="Combined ministry report"
                    subtitle="Integrated reading across all three diagnostics"
                    meta={formatLongDate(report.created_at)}
                    href={`/combined/${report.id}`}
                    cta="Open the combined report"
                  />
                ))
              ) : (
                <EmptyState
                  title="No combined reports yet"
                  body="Once all three diagnostics are finished, the full picture becomes available here. The combined report is worth the wait."
                  href="/assessments"
                  cta="Go to diagnostics"
                />
              )}
            </div>
          </SectionSlab>
        </div>
      </PageFrame>
    </>
  );
}

function CombinedReportPage({ user }: { user: NavUser }) {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<CombinedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ report: CombinedReport }>(`/api/combined-reports/${id}`)
      .then(data => setReport(data.report))
      .catch(err => setError(err.message || "Failed to load combined report"));
  }, [id]);

  return (
    <>
      <Header user={user} />
      <PageFrame
        title="Combined ministry report"
        eyebrow="Combined findings"
        description="Here is the full picture. Three assessments gathered into one. Findings are not a verdict. They are a starting point for wiser decisions."
        shell="combined"
      >
        {error ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <ErrorState
              title="Failed to load combined report"
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : !report ? (
          <Surface className="p-8 text-zinc-100">
            Pulling up your combined report...
          </Surface>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <SectionSlab
              eyebrow="Report created"
              title={formatLongDate(report.created_at)}
              description="This report gathers all three diagnostics. Read it slowly. Share it with someone you trust. Use it to make better decisions."
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <MetricTile
                  icon={<Target className="h-5 w-5" />}
                  label="Key sections"
                  value={String(countKeys(report.output_json))}
                  helper="Sections included in this combined report."
                />
                <MetricTile
                  icon={<Compass className="h-5 w-5" />}
                  label="Report type"
                  value="Combined"
                  helper="Brings together the three core diagnostics."
                />
                <MetricTile
                  icon={<Sparkles className="h-5 w-5" />}
                  label="Use case"
                  value="Counsel"
                  helper="Strategy, shepherding, and follow-up planning."
                />
              </div>
              <div className="mt-6">
                <Link href="/combined" className="btn-secondary">
                  Back
                </Link>
              </div>
            </SectionSlab>
            <ReportCanvas
              eyebrow="Structured output"
              title="Your full ministry picture"
              description="The findings are organized into sections you can read calmly and use in prayer, planning, and honest conversations."
            >
              {renderJsonBlocks(report.output_json || {})}
            </ReportCanvas>
          </div>
        )}
      </PageFrame>
    </>
  );
}

function AboutPage({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="About MULTIPLY.AI"
        title="Built to help pastors name what is happening before strain turns into damage"
        description="MULTIPLY.AI is a pastor-first diagnostic platform. It helps church leaders read what is happening inside the pastor, inside the team, and inside the disciple-making path of the church. Named things can be moved."
      >
        <PlainEnglishGrid />
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionSlab
            eyebrow="What this is"
            title="A diagnostic system. Not a replacement for prayer, scripture, or shepherding"
            description="This platform does not preach, disciple, visit people, or make spiritual decisions for a church. It helps pastors organize observations, surface patterns, and receive language for next steps."
          >
            <div className="space-y-4">
              {outcomePoints.map(point => (
                <div
                  key={point}
                  className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white"
                >
                  {point}
                </div>
              ))}
            </div>
          </SectionSlab>
          <SectionSlab
            eyebrow="Who it serves"
            title="Built for leaders carrying spiritual care and organizational load"
            description="The product is written for pastors and church leaders who may have very different levels of experience with technology or AI. The wording stays plain on purpose."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {whoWeServe.map(item => (
                <MetricTile
                  key={item}
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Primary user"
                  value="Pastor-first"
                  helper={item}
                />
              ))}
            </div>
          </SectionSlab>
        </div>
        <SectionSlab
          eyebrow="Pastoral relief"
          title="How this helps reduce the load on the pastor and staff"
          description="A pastor often carries diagnosis, communication, planning, and follow-up at the same time. MULTIPLY.AI helps by giving leaders a clearer picture and plainer words."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {pastorReliefPoints.map(item => (
              <MetricTile
                key={item}
                icon={<TimerReset className="h-5 w-5" />}
                label="Relief"
                value="Less load"
                helper={item}
              />
            ))}
          </div>
        </SectionSlab>
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

function WhyWeExistPage({ user }: { user: SessionUser }) {
  const reasons = [
    "Because pastors often feel pressure long before their church can clearly name what is wrong.",
    "Because ministry systems can look busy while disciple-making movement is quietly stalling.",
    "Because churches need better language than attendance swings, vague hunches, and exhausted guesswork.",
    "Because leaders need help deciding what to address first instead of carrying every burden at once.",
  ];
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="Why we exist"
        title="To give pastors a clear field reading before drift and fatigue grow costly"
        description="Many churches are working hard. Effort alone does not tell the full story. This platform exists to help pastors see what is really happening and respond wisely."
      >
        <PlainEnglishGrid />
        <div className="grid gap-4">
          {reasons.map((reason, index) => (
            <Surface key={reason} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <p className="text-[17px] leading-[1.8] text-white">{reason}</p>
              </div>
            </Surface>
          ))}
        </div>
        <SectionSlab
          eyebrow="Why this matters"
          title="The cost of not naming the problem early"
          description="When pastors cannot clearly explain what is happening, they often carry the whole burden alone. Staff confusion increases. Meetings drift. Energy goes to the wrong place. Named things can be moved. That is where the platform begins."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Unclear strain stays private until it becomes conflict or burnout.",
              "Churches can mistake activity for health and momentum for fruit.",
              "Teams can keep working hard while the real bottleneck remains untouched.",
              "Pastors can lose time and energy trying to describe what they sense but cannot yet articulate.",
            ].map(item => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionSlab>
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

function HowItWorksPage({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="How it works"
        title="A clear process you can follow"
        description="You answer honest questions. The platform returns clear findings. You use those findings in prayer, in conversations with your team, and in the decisions that matter most."
      >
        <PlainEnglishGrid />
        <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <SectionSlab
            eyebrow="Assessment flow"
            title="The assessments follow a clear order"
            description="It starts with the leader, then the leadership system, then the ministry field. That order helps the findings make sense."
          >
            <div className="space-y-4">
              {assessmentJourney.map(item => (
                <div
                  key={item.step}
                  className="rounded-[1.5rem] border border-white/10 bg-[#0b1019] p-5"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-100">
                    Step {item.step}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {item.title}
                  </div>
                  <div className="mt-2 text-[17px] leading-[1.75] text-white">
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          </SectionSlab>
          <SectionSlab
            eyebrow="What comes back"
            title="Findings you can actually use"
            description="The system turns your answers into readable sections. Each section is written for a pastor, not a data analyst. The findings are a starting point, not a conclusion."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {commandDeck.map(item => (
                <FeaturePanel
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  body={item.body}
                />
              ))}
              <FeaturePanel
                icon={<BookOpen className="h-5 w-5" />}
                title="Pastor-readable reports"
                body="The output is meant to be read by ministry leaders, not data specialists."
              />
              <FeaturePanel
                icon={<Compass className="h-5 w-5" />}
                title="Next-step direction"
                body="The reports point toward priorities, not just observations, so pastors know what to do next."
              />
            </div>
          </SectionSlab>
        </div>
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

const diagnosticFindings = [
  {
    slug: "inner-field",
    label: "Inner Field",
    question: "What does it actually surface?",
    findings: [
      "Where the pastor's soul is nourished and where it is running on empty",
      "Hidden shame, performance drivenness, or fear of failure shaping decisions",
      "Whether the leader's identity is rooted or tied to ministry outcomes",
      "Patterns from family of origin still active in current leadership style",
      "The gap between what the pastor projects and what he actually carries",
    ],
    readingNote: "The findings are written in pastoral language. No clinical terms. No abstract scoring. Just a calm, honest picture of what is happening beneath the surface.",
  },
  {
    slug: "send",
    label: "SEND",
    question: "What does it actually surface?",
    findings: [
      "How clearly the pastor leads from a defined sense of calling versus reaction",
      "Whether the team is aligned or operating from competing assumptions",
      "Blind spots in communication, conflict response, or decision authority",
      "The strength of the discipleship culture the pastor is modeling",
      "Readiness to develop and release leaders rather than retain them",
    ],
    readingNote: "The findings name real leadership friction in plain terms. Not a performance review. A field read on where the leadership system is healthy and where it is working against the mission.",
  },
  {
    slug: "field",
    label: "Field",
    question: "What does it actually surface?",
    findings: [
      "Where people are entering the church's orbit and where they are disappearing",
      "Whether disciple-making is reproducible or locked inside a few staff members",
      "The specific stage in the pipeline where movement stalls most often",
      "Whether the church is scattering the gospel or gathering around itself",
      "The realistic multiplication capacity of the current ministry model",
    ],
    readingNote: "The findings show the church's actual movement, not its aspirations. Many pastors find this the most clarifying of the three. It puts language to what they have been sensing but could not name.",
  },
];

function PublicDiagnosticsPage({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="Diagnostic stack"
        title="What the diagnostics actually find"
        description="Each diagnostic looks at a different layer of ministry reality. Here is what a pastor sees in the findings — before he decides whether to begin."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {diagnosticFindings.map((d) => (
            <div key={d.slug} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.34)]">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">{d.label}</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">{d.question}</h2>
              <ul className="mt-6 space-y-3">
                {d.findings.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300/60" />
                    <span className="text-[17px] leading-[1.7] text-white">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-[#0b1019] p-4 text-[16px] italic leading-[1.75] text-zinc-100">
                {d.readingNote}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {assessments.map(assessment => (
            <Surface key={assessment.slug} className="p-7">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">
                {assessment.shortTitle}
              </div>
              <div className="mt-3 text-2xl font-semibold text-white">
                {assessment.title}
              </div>
              <div className="mt-4 text-[17px] leading-[1.75] text-white">
                {assessment.intro}
              </div>
              <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">What the report returns</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {assessment.resultTabs.map(tab => (
                  <span
                    key={tab}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-100"
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <Link
                href={user ? `/assessments/${assessment.slug}` : "/signup"}
                className="btn-primary mt-6 inline-flex"
              >
                Open the diagnostic
              </Link>
            </Surface>
          ))}
        </div>
        <SectionSlab
          eyebrow="Combined reporting"
          title="The final report pulls the three views into one readable field picture"
          description="A single diagnostic can reveal something important. The combined report gives the broader ministry picture. It helps the pastor see how inner life, leadership readiness, and field movement connect."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Why it exists: so pastors are not forced to manually combine three separate reports.",
              "What it does: it organizes the strongest findings, weak spots, risks, and priorities into one summary.",
              "How it works: it waits until all three completed assessments are available, then creates an integrated report.",
              "How it gives relief: it shortens the path from insight to action for the pastor and staff.",
            ].map(item => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionSlab>
        <SectionBanner
          eyebrow="Integrated reporting"
          title="Combined reporting gathers isolated findings into one ministry brief"
          description="Once all three diagnostics are complete, MULTIPLY.AI builds a combined ministry report with pressure points, health, and next moves."
          actions={
            <>
              <Link
                href={user ? "/combined" : "/signup"}
                className="btn-primary"
              >
                {user ? "Open the combined reports" : "Create your account"}
              </Link>
              <Link href="/how-it-works" className="btn-secondary">
                See how it works
              </Link>
            </>
          }
        />
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

function WhatAreAgentsPage({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="What agents are"
        title="What these ministry agents are, how they work, and what they do not do"
        description="This page exists because many pastors have never used AI before. The word agent can sound inflated. Here is the plain version."
      >
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionSlab
            eyebrow="Plain English"
            title="An agent is a focused ministry helper with one clear job"
            description="In this platform, an agent is not a pastor and it is not a person. It is a software helper built to support one kind of ministry work, like follow-up planning, sermon support, prayer coordination, leadership planning, or outreach support."
          >
            <div className="space-y-4">
              {[
                "Why this exists: pastors and staff often carry hours of repetitive planning and writing work every week. That load is real. These tools take part of it off your plate.",
                "What it does: each agent handles one defined category of support work. It stays in its lane.",
                "How it works: you give it direction and context, and it returns structured help inside that lane. You review it and decide what to keep.",
                "How it helps: it reduces the repetitive writing, organizing, and planning work you do by hand — so you have more room for people and real ministry decisions.",
              ].map(item => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionSlab>
          <SectionSlab
            eyebrow="Important boundaries"
            title="These tools do not replace the pastor, the Bible, the Holy Spirit, or real ministry relationships"
            description="They help ministry move forward. They do not become the shepherd. They do not carry authority over doctrine, care decisions, discipline, counseling, or pastoral calling."
          >
            <div className="grid gap-4">
              {[
                "They do not replace preaching, shepherding, prayer, discernment, visitation, or church leadership.",
                "They do not decide doctrine or set the spiritual direction of the church.",
                "They do not remove the need for human review, pastoral wisdom, or accountability.",
                "They are support tools that help pastors and teams reduce load and keep ministry moving.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="frame-line rounded-[1.5rem] px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <div className="text-[17px] leading-[1.75] text-white">
                      {item}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionSlab>
        </div>
        <SectionSlab
          eyebrow="How pastors should think about them"
          title="Think of them like support roles, not a substitute shepherd"
          description="Each one handles a certain category of support work. Used rightly, they reduce repetitive load and help staff move with more clarity."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {agentProfiles.map(agent => (
              <Link
                key={agent.slug}
                href={`/agents/${agent.slug}`}
                className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white transition hover:border-white/20 hover:bg-[#0f1523]"
              >
                <div className="font-semibold text-white">{agent.name}</div>
                <div className="text-zinc-200">{agent.title}</div>
                <div className="mt-2 text-zinc-100">{agent.ministry}</div>
              </Link>
            ))}
          </div>
        </SectionSlab>
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

function AgentsHubPage({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="Ministry role team"
        title="Eight support roles with clear ministry jobs"
        description="Each role handles one kind of ministry support work. None of them replace the pastor or the real work of caring for people. They reduce the load so you have more room for what only you can do."
      >
        <SectionSlab
          eyebrow="Start here first"
          title="Read the plain explanation before you evaluate the individual roles"
          description="If the word agent is unfamiliar, start with the explanation page first. That page explains what these tools are, how they work, what they do not do, and how they reduce load for pastors and staff."
        >
          <Link href="/what-are-agents" className="btn-primary">
            Read what agents are
          </Link>
        </SectionSlab>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {agentProfiles.map(agent => (
            <Surface key={agent.slug} className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0d1220] text-cyan-100">
                {agent.icon}
              </div>
              <div className="mt-5 text-2xl font-semibold text-white">
                {agent.name}
              </div>
              <div className="mt-2 text-sm font-medium text-cyan-100">
                {agent.title}
              </div>
              <div className="mt-4 text-[17px] leading-[1.75] text-white">
                {agent.summary}
              </div>
              <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-[#0b1019] p-4 text-[17px] leading-[1.75] text-white">
                How it helps: it carries one category of planning or support work so you are not rebuilding from scratch every week.
              </div>
              <Link
                href={`/agents/${agent.slug}`}
                className="btn-secondary mt-6"
              >
                Open role
              </Link>
            </Surface>
          ))}
        </div>
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

function AgentDetailPage({ user }: { user: SessionUser }) {
  const { slug } = useParams<{ slug: string }>();
  const agent = agentProfiles.find(item => item.slug === slug);
  if (!agent) return <NotFoundPage user={user} />;
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="Ministry role profile"
        title={`${agent.name} | ${agent.title}`}
        description={agent.summary}
      >
        <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
          <SectionSlab
            eyebrow="Primary ministry job"
            title={agent.ministry}
            description="This profile explains the job of one support role inside the larger ministry support system."
          >
            <div className="grid gap-4">
              {agent.outcomes.map((item, index) => (
                <div
                  key={item}
                  className="frame-line rounded-[1.5rem] px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <div className="text-[17px] leading-[1.75] text-white">
                      {item}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionSlab>
          <SectionSlab
            eyebrow="Why this exists"
            title="How this role supports the pastor and staff"
            description="Each profile explains the job of that role, the kind of work it supports, and why it matters to the pastor and staff."
          >
            <div className="space-y-4">
              <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white">
                What it does: {agent.summary}
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white">
                How it works: you give it direction and context. It returns structured support inside its lane. You review it and decide what to use.
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white">
                What it does not do: it does not replace pastoral authority, theological judgment, or real ministry relationships.
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white">
                How it helps: it reduces the repetitive planning and writing work so you have more room for the things only you can do.
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {agentProfiles
                .filter(item => item.slug !== agent.slug)
                .slice(0, 4)
                .map(item => (
                  <Link
                    key={item.slug}
                    href={`/agents/${item.slug}`}
                    className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white transition hover:border-white/20 hover:bg-[#0f1523]"
                  >
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-zinc-200">{item.title}</div>
                  </Link>
                ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/what-are-agents" className="btn-secondary">
                What agents are
              </Link>
              <Link href="/agents" className="btn-secondary">
                Back to all roles
              </Link>
            </div>
          </SectionSlab>
        </div>
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

function PastorsPage({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <PublicPageFrame
        eyebrow="For pastors"
        title="Built for pastors making costly calls under spiritual pressure"
        description="If you are carrying more than you can name, this platform is for you. It will not fix everything. But it will tell you the truth about what is happening — and give you language to work with."
      >
        <PlainEnglishGrid />
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <SectionSlab
            eyebrow="Best-fit leaders"
            title="Who this platform is tuned for"
            description="MULTIPLY.AI is pastor-first, but it still supports staff teams, planters, and ministry coaches."
          >
            <div className="space-y-3">
              {rolePages.map(lane => (
                <div
                  key={lane.title}
                  className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white"
                >
                  <div className="font-semibold text-white">{lane.title}</div>
                  <div className="text-zinc-100">{lane.body}</div>
                </div>
              ))}
            </div>
          </SectionSlab>
          <SectionSlab
            eyebrow="What changes"
            title="What a pastor gains from the platform"
            description="Not another tool to manage. A clearer picture of what is actually happening. Language you can use in hard conversations. A starting point instead of more guesswork."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {outcomePoints.map(item => (
                <MetricTile
                  key={item}
                  icon={<Target className="h-5 w-5" />}
                  label="Outcome"
                  value="Clarity"
                  helper={item}
                />
              ))}
            </div>
          </SectionSlab>
        </div>
        <SectionSlab
          eyebrow="Relief in practice"
          title="How this reduces the weight on the pastor and staff"
          description="Pastors often know something is off before they can explain it. This platform helps name it. Once it is named, it can be addressed. That is how the weight gets lighter."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {pastorReliefPoints.map(item => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] px-5 py-4 text-[17px] leading-[1.75] text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionSlab>
      </PublicPageFrame>
      <PublicFooter user={user} />
    </>
  );
}

function PlainEnglishGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {plainEnglishQuestions.map(item => (
        <Surface key={item.title} className="p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
            Plain English
          </div>
          <div className="mt-3 text-xl font-semibold text-white">
            {item.title}
          </div>
          <div className="mt-3 text-[17px] leading-[1.75] text-white">
            {item.body}
          </div>
        </Surface>
      ))}
    </div>
  );
}

function PublicPageFrame({
  eyebrow,
  title,
  description,
  children,
}: RouteMeta & { children: ReactNode }) {
  return (
    <main className="container py-10 lg:py-12">
      <div className="shell-frame mb-8 overflow-hidden px-7 py-8 sm:px-10 sm:py-10">
        <SectionIntro
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </div>
      <div className="space-y-8">{children}</div>
    </main>
  );
}

function PublicFooter({ user }: { user: SessionUser }) {
  return (
    <footer className="container pb-10 pt-4">
      <div className="shell-frame px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
              MULTIPLY.AI
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">
              Built for pastors carrying more than they can name alone.
            </div>
            <div className="mt-3 text-[17px] leading-[1.75] text-white">
              The diagnostics help you name what is happening. The reports help you move. There is a way through.
            </div>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {publicNav.map(item => (
              <Link key={item.href} href={item.href} className="btn-ghost">
                {item.label}
              </Link>
            ))}
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="btn-primary"
            >
              {user ? "Return to your overview" : "Create your account"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NotFoundPage({ user }: { user: SessionUser }) {
  return (
    <>
      <Header user={user} />
      <main className="container py-16">
        <Surface className="p-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            404
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[18px] leading-[1.8] text-white">
            That page is not available. Use the home page, overview, or
            diagnostics to get back on track.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href={user ? "/dashboard" : "/"} className="btn-primary">
              Go back
            </Link>
            <Link
              href={user ? "/assessments" : "/platform/assessments"}
              className="btn-secondary"
            >
              Diagnostics
            </Link>
          </div>
        </Surface>
      </main>
    </>
  );
}

function PageFrame({
  title,
  eyebrow,
  description,
  children,
  shell = "dashboard",
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
  shell?: keyof typeof shellLabels;
}) {
  return (
    <main className="container py-10 lg:py-12">
      <div className="shell-frame mb-8 overflow-hidden px-7 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
              {eyebrow}
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-[18px] leading-[1.8] text-white sm:text-lg">
              {description}
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100">
            <PanelsTopLeft className="h-4 w-4 text-cyan-200" />
            {shellLabels[shell]}
          </div>
        </div>
      </div>
      {children}
    </main>
  );
}

function CommandHero({
  title,
  description,
  actions,
  right,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="shell-frame overflow-hidden px-6 py-6 sm:px-8 sm:py-8">
      <div className="grid gap-8 xl:grid-cols-[1.03fr_0.97fr] xl:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
            Overview
          </div>
          <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-[18px] leading-[1.8] text-white">
            {description}
          </p>
          {actions ? (
            <div className="mt-7 flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </div>
        <div>{right}</div>
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, description }: RouteMeta) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-4 max-w-3xl text-[17px] leading-[1.8] text-white sm:text-base">
        {description}
      </p>
    </div>
  );
}

function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_30px_120px_rgba(0,0,0,0.34)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function SectionSlab({
  eyebrow,
  title,
  description,
  children,
}: RouteMeta & { children: ReactNode }) {
  return (
    <div className="shell-frame h-full px-7 py-7 sm:px-8 sm:py-8">
      <SectionIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-8">{children}</div>
    </div>
  );
}

function SectionBanner({
  eyebrow,
  title,
  description,
  actions,
}: RouteMeta & { actions: ReactNode }) {
  return (
    <div className="shell-frame overflow-hidden px-8 py-10 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            {eyebrow}
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-[18px] leading-[1.8] text-white sm:text-lg">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">{actions}</div>
      </div>
    </div>
  );
}

function BadgePill({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
      {children}
    </div>
  );
}

function SignalStat({
  value,
  label,
  helper,
}: {
  value: string;
  label: string;
  helper: string;
}) {
  return (
    <div className="signal-tile h-full p-3 sm:p-3.5 md:border-r md:border-white/10 last:md:border-r-0">
      <div className="text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1.5 text-sm font-medium text-zinc-100">{label}</div>
      <div className="mt-1.5 text-sm leading-5 text-zinc-200">{helper}</div>
    </div>
  );
}

function FeaturePanel({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="signal-tile rounded-[1.6rem] p-6 sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0d1220] text-cyan-200">
        {icon}
      </div>
      <h3 className="mt-5 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-4 text-[17px] leading-[1.8] text-white">{body}</p>
    </div>
  );
}

function MissionRibbon({
  label,
  title,
  body,
  items,
}: {
  label: string;
  title: string;
  body: string;
  items: string[];
}) {
  return (
    <div className="shell-frame flex flex-col justify-start px-6 py-5 sm:px-7 sm:py-6">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
        {label}
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-[17px] leading-[1.75] text-white">{body}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {items.map(item => (
          <div
            key={item}
            className="rounded-full border border-cyan-300/16 bg-[#0b1019] px-5 py-3 text-sm font-medium text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          >
            {item}
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        <h3 className="text-base font-semibold text-white">
          Why sequence matters
        </h3>
        <p className="text-[17px] leading-[1.75] text-white">
          Most platforms hand a pastor a dashboard. This platform gives him an
          order. Sequence matters because it shapes what the findings can see.
        </p>
        <p className="text-[17px] leading-[1.75] text-white">
          Starting with the inner field means the pastor is not skipped. Soul
          condition shapes every decision that follows. Move past it too quickly
          and the clarity will not hold.
        </p>
        <p className="text-[17px] leading-[1.75] text-white">
          The field diagnostic comes last because it reads most clearly once the
          pastor's condition and team readiness have been named. Three passes.
          One honest picture.
        </p>
        <p className="text-xs leading-6 text-zinc-100">
          Each diagnostic builds on the one before it. Together they produce a
          ministry picture no single report could create alone.
        </p>
      </div>
    </div>
  );
}

function MissionGlobe() {
  return (
    <div className="relative mx-auto flex max-w-[36rem] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="mission-orbit absolute inset-x-12 top-10 h-24 rounded-full border border-cyan-300/15" />
      <div className="mission-orbit absolute inset-x-10 bottom-14 h-24 rounded-full border border-amber-200/15 [animation-duration:18s]" />
      <div className="globe-card relative w-full rounded-[2.4rem] border border-white/10 p-3 sm:p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_208px] lg:items-center">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="relative w-full max-w-[320px]">
              <GlobeCdn className="w-full" />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">
              How the assessments fit together
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              One ministry picture. Three diagnostic assessments.
            </h2>
            <p className="mt-3 text-[17px] leading-[1.75] text-white">
              Three diagnostic passes. One integrated ministry picture.
            </p>
            <div className="mt-5 grid gap-3">
              <MissionNode
                icon={<ScanSearch className="h-4 w-4" />}
                label="Inner Field"
                body="Assess the soul condition beneath the surface — where hidden weight and drift take hold."
              />
              <MissionNode
                icon={<Radar className="h-4 w-4" />}
                label="SEND"
                body="Assess leadership readiness, team alignment, and multiplication strength."
              />
              <MissionNode
                icon={<Globe2 className="h-4 w-4" />}
                label="Field"
                body="Assess movement health, pipeline friction, and disciple-making traction."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionNode({
  icon,
  label,
  body,
}: {
  icon: ReactNode;
  label: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
      <div className="flex items-center gap-3 text-cyan-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0d1220]">
          {icon}
        </div>
        <div className="text-sm font-semibold text-white">{label}</div>
      </div>
      <div className="mt-2 text-[17px] leading-[1.75] text-white">{body}</div>
    </div>
  );
}

function MissionBoard() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
      <SignalStat
        value="Leader"
        label="Starting lens"
        helper="Begin with soul condition before performance narratives."
      />
      <SignalStat
        value="Team"
        label="Second pass"
        helper="Measure readiness, clarity, and multiplication strength."
      />
      <SignalStat
        value="Field"
        label="Third pass"
        helper="Map system friction, movement, and leaks in the ministry path."
      />
    </div>
  );
}

function TelemetryPanel({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { icon: ReactNode; label: string; value: string; helper: string }[];
}) {
  return (
    <Surface className="p-7 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            {eyebrow}
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-100">
          Account view
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {items.map(item => (
          <MetricTile
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            helper={item.helper}
          />
        ))}
      </div>
    </Surface>
  );
}

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className="btn-ghost">
      {icon}
      {label}
    </Link>
  );
}

function JourneyCard({
  title,
  body,
  badge,
  href,
}: {
  title: string;
  body: string;
  badge?: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="h-full rounded-[1.6rem] border border-white/10 bg-[#0b1019] p-5 transition duration-200 group-hover:border-white/20 group-hover:bg-[#0f1523]">
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-100">
          {badge || title}
        </div>
        <div className="mt-3 text-xl font-semibold text-white capitalize">
          {title}
        </div>
        <div className="mt-2 text-[17px] leading-[1.75] text-white">{body}</div>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-cyan-100">
          Open
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function MetricTile({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1019] p-5">
      <div className="flex items-center gap-3 text-cyan-100">
        {icon}
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100">
          {label}
        </div>
      </div>
      <div className="mt-4 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-[16px] leading-[1.7] text-zinc-100">{helper}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0b1019] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function RecordRow({
  title,
  subtitle,
  meta,
  href,
  cta,
}: {
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-[#0b1019] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="mt-1 text-[17px] text-zinc-100">{subtitle}</div>
          <div className="mt-3 text-sm text-zinc-100">{meta}</div>
        </div>
        <Link href={href} className="btn-secondary">
          {cta}
        </Link>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Surface className="p-8">
      <div className="text-2xl font-semibold text-white">{title}</div>
      <p className="mt-4 max-w-2xl text-[17px] leading-[1.8] text-white">{body}</p>
      <Link href={href} className="btn-primary mt-6">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Surface>
  );
}

function AlertBox({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  const classes =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  return (
    <div
      className={`mt-6 rounded-[1.2rem] border px-4 py-3 text-sm ${classes}`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-zinc-100">
        {label}
      </span>
      {children}
    </label>
  );
}

function QuestionCard({
  q,
  value,
  onChange,
  index,
}: {
  q: {
    text: string;
    type: string;
    labels?: string[];
    options?: string[];
    multiline?: boolean;
    placeholder?: string;
  };
  value: string | number | undefined;
  onChange: (v: string | number) => void;
  index: number;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-[#0b1019] p-5 sm:p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-100">
        Question {index + 1}
      </div>
      <p className="mt-3 text-base leading-8 text-white">{q.text}</p>
      {q.type === "scale" ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {q.labels?.map((label, i) => {
            const selected = Number(value) === i + 1;
            return (
              <button
                key={label}
                onClick={() => onChange(i + 1)}
                className={`rounded-[1.2rem] border px-3 py-4 text-sm transition ${
                  selected
                    ? "border-cyan-300/35 bg-cyan-400/10 text-white"
                    : "border-white/10 bg-[#090d16] text-zinc-100 hover:border-white/20"
                }`}
              >
                <div className="font-semibold">{i + 1}</div>
                <div className="mt-1 text-xs text-zinc-200">{label}</div>
              </button>
            );
          })}
        </div>
      ) : null}
      {q.type === "choice" ? (
        <div className="mt-5 space-y-2">
          {q.options?.map(option => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`block w-full rounded-[1.2rem] border px-4 py-4 text-left text-sm transition ${
                value === option
                  ? "border-cyan-300/35 bg-cyan-400/10 text-white"
                  : "border-white/10 bg-[#090d16] text-zinc-100 hover:border-white/20"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      {q.type === "open" ? (
        q.multiline ? (
          <textarea
            value={String(value || "")}
            onChange={e => onChange(e.target.value)}
            placeholder={q.placeholder}
            rows={5}
            className="input mt-5 min-h-32 w-full"
          />
        ) : (
          <input
            value={String(value || "")}
            onChange={e => onChange(e.target.value)}
            placeholder={q.placeholder}
            className="input mt-5 w-full"
          />
        )
      ) : null}
    </div>
  );
}

function ReportCanvas({
  eyebrow,
  title,
  description,
  children,
}: RouteMeta & { children: ReactNode }) {
  return (
    <div className="report-shell px-6 py-6 sm:px-8 sm:py-8">
      <SectionIntro eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-8">{children}</div>
    </div>
  );
}

function renderJson(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function renderJsonBlocks(obj: Record<string, unknown>) {
  const entries = Object.entries(obj);
  if (!entries.length) {
    return (
      <div className="rounded-[1.7rem] border border-white/10 bg-[#0b1019] p-6 text-sm text-zinc-100">
        The report content is not available yet. Check back shortly or return to the diagnostics page.
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {entries.map(([key, value], index) => (
        <div
          key={key}
          className="rounded-[1.75rem] border border-white/10 bg-[#0b1019] p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
              {humanize(key)}
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-200">
              Block {index + 1}
            </div>
          </div>
          <div className="mt-4 whitespace-pre-wrap text-[17px] leading-[1.8] text-white">
            {formatOutputValue(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatOutputValue(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function humanize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isErrorOutput(output: Record<string, unknown> | null) {
  return output?.status === "error" || output?.status === "queued";
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLongDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function countKeys(value: Record<string, unknown> | null) {
  return value ? Object.keys(value).length : 0;
}
// ─── Agent Data ────────────────────────────────────────────────────

const agentRegistry = [
  {
    id: "harvest_guide",
    name: "Harvest Guide",
    tagline: "The harvest is plentiful. The workers are few. Pray — then go.",
    color: "#ef4444",
    colorName: "red",
    tier: "start",
    icon: "🌾",
    description: "The entry point of the entire pipeline. Helps the pastor diagnose where personal witness has gone quiet, rebuild outreach habits, and train their congregation to engage the lost with confidence.",
    tabs: ["Diagnosis", "CoJourner List", "Gospel Presentation", "Outreach Strategy", "Bridge Event", "Witness Training", "Social Content"],
  },
  {
    id: "new_believer_care",
    name: "New Believer Care",
    tagline: "What happens in the first 30 days shapes the next 30 years.",
    color: "#22c55e",
    colorName: "green",
    tier: "send",
    icon: "🌱",
    description: "Closes the gap between a moment of faith and a life of genuine discipleship. Walks the pastor week by week through caring for the most vulnerable and most open people in the pipeline.",
    tabs: ["30-Day Plan", "Welcome Letter", "First Steps", "Baptism Prep", "Assimilation", "Care Notes", "Family Bridge"],
  },
  {
    id: "sermon_steward",
    name: "Sermon Steward",
    tagline: "Preach once. Let the truth travel all week.",
    color: "#06b6d4",
    colorName: "cyan",
    tier: "start",
    icon: "📖",
    description: "Takes one sermon and multiplies it into ten complete ministry outputs — devotionals, small group guide, social posts, email newsletter, youth, children, bulletin insert, series outline, and prayer points.",
    tabs: ["Big Idea", "Devotionals", "Small Group", "Social Media", "Email", "Youth", "Children", "Bulletin", "Series", "Prayer"],
  },
  {
    id: "disciple_guide",
    name: "Disciple Guide",
    tagline: "Make disciples who make disciples. That\'s the whole assignment.",
    color: "#3b82f6",
    colorName: "blue",
    tier: "start",
    icon: "🧭",
    description: "Builds repeatable disciple-making conversations, simple group rhythms, and outward habits any believer can carry — and immediately pass to someone else.",
    tabs: ["Session Overview", "Meeting Guide", "TEAMS Check", "Discovery Series", "Reproducible Tool", "Accountability", "Obedience", "CoJourner Guide"],
  },
  {
    id: "family_discipleship",
    name: "Family Discipleship",
    tagline: "The most powerful classroom is the dinner table.",
    color: "#f59e0b",
    colorName: "amber",
    tier: "send",
    icon: "🏠",
    description: "Translates the Sunday sermon into age-specific children\'s lessons, equips parents to continue formation at home, and gives volunteer teams a confidence-building guide.",
    tabs: ["Pre-K", "Elementary", "Upper Elementary", "Service Flow", "Volunteer Guide", "Home Devotional", "Parent Notes", "CoJourner Moment"],
  },
  {
    id: "leader_development",
    name: "Leader Development",
    tagline: "The greatest gift a pastor can give the Church is a leader they developed and sent.",
    color: "#a855f7",
    colorName: "purple",
    tier: "send",
    icon: "⚡",
    description: "Builds a living pipeline for a real person — readiness assessment, development stages, mentoring curriculum, LAUNCH integration, deployment plan, and succession framework.",
    tabs: ["Readiness", "Pipeline", "Mentoring", "LAUNCH", "Deployment", "Succession", "Health Check"],
  },
  {
    id: "prayer_care",
    name: "Prayer Care",
    tagline: "The work of the ministry begins on your knees.",
    color: "#ec4899",
    colorName: "pink",
    tier: "start",
    icon: "🙏",
    description: "Builds a living prayer culture rooted in the pastor\'s actual ministry reality — weekly prayer guide, prayer meeting script, named intercession, unreached people groups, missionary prayer, and personal prayer plan.",
    tabs: ["Weekly Guide", "Prayer Meeting", "Named Intercession", "Unreached", "Missionary", "Prayer Room", "Personal Plan"],
  },
  {
    id: "field_planner",
    name: "Field Planner",
    tagline: "Vision without a plan is just a dream. Build the plan.",
    color: "#f97316",
    colorName: "orange",
    tier: "send",
    icon: "🗺️",
    description: "Turns diagnostic findings into a working strategic plan — church health diagnostic, MOST plan, 90-day priorities, annual calendar, multiplication roadmap, KPI dashboard, and partnership strategy.",
    tabs: ["Health Diagnostic", "MOST Plan", "90-Day Plan", "Annual Calendar", "Multiplication", "KPIs", "Partnerships"],
  },
] as const;

type AgentDef = typeof agentRegistry[number];

// ─── Per-Agent Input Config ────────────────────────────────────────

type InputFieldDef =
  | { type: "textarea"; key: string; label: string; placeholder: string; rows?: number }
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { type: "text"; key: string; label: string; placeholder: string };

const agentInputConfig: Partial<Record<string, InputFieldDef[]>> = {
  harvest_guide: [
    {
      type: "textarea",
      key: "community_and_audience",
      label: "Who are you trying to reach?",
      placeholder: "Be specific. 'Blue-collar men in their 40s who grew up in church but walked away' produces better output than 'lost people in our area.' Include age range, cultural background, what they care about, what keeps them from faith.",
      rows: 4,
    },
    {
      type: "textarea",
      key: "current_outreach_situation",
      label: "Where does your outreach stand right now?",
      placeholder: "What are you currently doing to reach people outside the church? What is working? What has stalled? When was the last real gospel conversation you had with someone outside the church?",
      rows: 4,
    },
    {
      type: "select",
      key: "witness_culture",
      label: "How would you describe your church's culture around witness?",
      options: [
        { value: "strong", label: "Strong — our people naturally invite and share" },
        { value: "scattered", label: "Scattered — a few people do it but it is not the norm" },
        { value: "weak", label: "Weak — it rarely happens and people are not equipped" },
        { value: "nonexistent", label: "Nonexistent — there is almost no outward focus at all" },
      ],
    },
    {
      type: "textarea",
      key: "specific_focus",
      label: "Anything specific you want Harvest Guide to address?",
      placeholder: "An upcoming bridge event, a specific person or group you are trying to reach, a campaign you are planning, training you want to do with your congregation — or leave blank for a full outreach activation kit.",
      rows: 3,
    },
  ],
  field_planner: [
    {
      type: "textarea",
      key: "church_vision",
      label: "What is the vision you are pursuing — in concrete terms?",
      placeholder: "Not a vision statement. What specifically are you trying to build? How many disciples, groups, leaders, plants? What does this church look like in 5 years if God does what you are believing for?",
      rows: 4,
    },
    {
      type: "select",
      key: "current_season",
      label: "What season is the church in right now?",
      options: [
        { value: "launch", label: "Launch — brand new or just restarted" },
        { value: "growth", label: "Growth — forward momentum, needs structure" },
        { value: "plateau", label: "Plateau — stuck, not growing, not declining" },
        { value: "revitalization", label: "Revitalization — declining, needs renewal" },
        { value: "multiplication", label: "Multiplication — ready to send and reproduce" },
        { value: "succession", label: "Succession — leadership transition underway" },
      ],
    },
    {
      type: "textarea",
      key: "what_has_been_tried",
      label: "What has been tried? What worked, what did not?",
      placeholder: "Previous programs, initiatives, campaigns, staff changes, building projects — what happened? What did the church learn? What has failed more than once?",
      rows: 3,
    },
    {
      type: "textarea",
      key: "specific_constraints",
      label: "Specific constraints the plan must account for",
      placeholder: "Budget limitations, staff capacity, facility constraints, community resistance, pastor bandwidth, theological culture — anything that shapes what is actually possible in this season.",
      rows: 2,
    },
  ],
  prayer_care: [
    {
      type: "textarea",
      key: "current_burdens",
      label: "What are the current prayer burdens and ministry focus?",
      placeholder: "What is the pastor currently preaching? What needs, situations, or people are on his heart most right now? What is the church facing or moving toward?",
      rows: 4,
    },
    {
      type: "textarea",
      key: "specific_names",
      label: "Specific people, missionaries, or situations to pray for",
      placeholder: "Name specific lost people from CoJourner lists, new believers in their first steps, leaders being developed, missionaries in the field, church plants, community situations. The more specific, the better the output.",
      rows: 4,
    },
    {
      type: "select",
      key: "prayer_context",
      label: "What are you building prayer for?",
      options: [
        { value: "weekly_corporate", label: "Weekly corporate prayer — Sunday or midweek gathering" },
        { value: "prayer_meeting", label: "A specific prayer meeting I need to lead" },
        { value: "missions_mobilization", label: "Missions and unreached people group prayer" },
        { value: "personal_plan", label: "A personal prayer plan for myself or a church member" },
        { value: "prayer_room", label: "A prayer room or 24-hour prayer event" },
        { value: "all", label: "All of the above — full system" },
      ],
    },
    {
      type: "select",
      key: "meeting_length",
      label: "Prayer meeting length (if building a script)",
      options: [
        { value: "30", label: "30 minutes" },
        { value: "60", label: "60 minutes" },
        { value: "90", label: "90 minutes" },
        { value: "na", label: "Not building a meeting script" },
      ],
    },
  ],
  leader_development: [
    {
      type: "textarea",
      key: "leader_description",
      label: "Tell us about this emerging leader",
      placeholder: "Who are they? How long have they been following Jesus? What have they demonstrated? Where have they struggled? What roles have they filled? Any character concerns or relational patterns the pastor has observed?",
      rows: 5,
    },
    {
      type: "textarea",
      key: "where_headed",
      label: "Where do you see them heading?",
      placeholder: "What role, context, or deployment are you developing them toward? Small group leader, ministry team lead, church planter, staff role? What is the timeline you have in mind?",
      rows: 3,
    },
    {
      type: "select",
      key: "mawl_current",
      label: "Where is your investment in this relationship right now?",
      options: [
        { value: "model", label: "Model — they watch me do it" },
        { value: "assist", label: "Assist — they help while I lead" },
        { value: "watch", label: "Watch — they lead while I observe" },
        { value: "leave", label: "Leave — they operate independently" },
        { value: "not_started", label: "Not started — no intentional investment yet" },
      ],
    },
    {
      type: "select",
      key: "launch_status",
      label: "Has this leader started the LAUNCH track?",
      options: [
        { value: "not_started", label: "Not started yet" },
        { value: "sessions_1_3", label: "Completed sessions 1-3" },
        { value: "sessions_4_6", label: "Completed sessions 4-6" },
        { value: "sessions_7_10", label: "Completed sessions 7-10 (full track done)" },
        { value: "unknown", label: "Not sure" },
      ],
    },
  ],
  family_discipleship: [
    {
      type: "textarea",
      key: "sermon_content",
      label: "Sermon notes or children\'s version seed",
      placeholder: "Paste your sermon notes directly, or paste the children\'s version handoff from Sermon Steward. Either works — the agent will extract what it needs.",
      rows: 6,
    },
    {
      type: "select",
      key: "age_groups",
      label: "Which age groups are you building for?",
      options: [
        { value: "all", label: "All three — Pre-K, Elementary, Upper Elementary" },
        { value: "prek_elementary", label: "Pre-K and Elementary only" },
        { value: "elementary_upper", label: "Elementary and Upper Elementary only" },
        { value: "prek_only", label: "Pre-K only" },
        { value: "elementary_only", label: "Elementary only (ages 6-8)" },
        { value: "upper_only", label: "Upper Elementary only (ages 9-11)" },
      ],
    },
    {
      type: "select",
      key: "volunteer_experience",
      label: "How experienced is your volunteer team?",
      options: [
        { value: "experienced", label: "Experienced — mostly veterans who know the system" },
        { value: "mixed", label: "Mixed — some veterans, some new" },
        { value: "new", label: "Mostly new volunteers, need detailed guidance" },
        { value: "solo", label: "It\'s usually just me or one other person" },
      ],
    },
    {
      type: "textarea",
      key: "ministry_context",
      label: "Anything specific about your children\'s ministry context?",
      placeholder: "Size, available resources, specific cultural or community factors, families who are new believers, anything that shapes what you need.",
      rows: 2,
    },
  ],
  disciple_guide: [
    {
      type: "text",
      key: "passage",
      label: "Bible passage or discipleship theme",
      placeholder: "e.g. Luke 15:1-32, or 'Identity in Christ', or 'How to pray'",
    },
    {
      type: "textarea",
      key: "group_context",
      label: "Who is in this discipleship relationship?",
      placeholder: "How long have you been meeting? Where are they spiritually? New believer, growing disciple, emerging leader? What is the current goal or focus area?",
      rows: 3,
    },
    {
      type: "select",
      key: "mawl_stage",
      label: "What stage of MAWL is this relationship in?",
      options: [
        { value: "model", label: "Model — they watch you do it" },
        { value: "assist", label: "Assist — they help while you lead" },
        { value: "watch", label: "Watch — they lead while you observe" },
        { value: "leave", label: "Leave — they lead independently" },
        { value: "unknown", label: "Not sure / just starting" },
      ],
    },
    {
      type: "textarea",
      key: "accountability_focus",
      label: "Any specific accountability area or obedience challenge in play?",
      placeholder: "What struggle, pattern, or sin is currently being worked through? What obedience challenge was set last time? Leave blank if starting fresh.",
      rows: 2,
    },
  ],
  sermon_steward: [
    {
      type: "textarea",
      key: "sermon_notes",
      label: "Sermon notes",
      placeholder: "Paste your sermon notes in any format — rough bullets, full outline, manuscript excerpt, or transcription. The agent works with raw material. It does not need to be polished.",
      rows: 8,
    },
    {
      type: "select",
      key: "preaching_style",
      label: "Preaching style",
      options: [
        { value: "expository", label: "Expository — one passage, all points from within it" },
        { value: "topical", label: "Topical — a theme drawn across multiple passages" },
        { value: "narrative", label: "Narrative — story-driven, following a biblical story arc" },
        { value: "mixed", label: "Mixed" },
      ],
    },
    {
      type: "text",
      key: "series_title",
      label: "Series title (optional)",
      placeholder: "Leave blank if this is a standalone message",
    },
  ],
    new_believer_care: [
    {
      type: "textarea",
      key: "new_believer_background",
      label: "Tell us about this new believer",
      placeholder: "Age, background, life situation, what they came from. 'A 34-year-old woman, raised Catholic but not practicing for 15 years, recently divorced, two kids' produces better output than 'a new believer.' Include anything significant about who they are.",
      rows: 4,
    },
    {
      type: "select",
      key: "prior_faith_background",
      label: "Prior faith background",
      options: [
        { value: "none", label: "No prior faith background" },
        { value: "churched_childhood", label: "Grew up in church, walked away" },
        { value: "nominal_christian", label: "Considered themselves Christian but not practicing" },
        { value: "other_religion", label: "Coming from another religion" },
        { value: "syncretistic", label: "Mix of beliefs / New Age / spiritual but not religious" },
        { value: "active_church", label: "Was actively attending a different church" },
      ],
    },
    {
      type: "select",
      key: "family_situation",
      label: "Family situation",
      options: [
        { value: "single_no_kids", label: "Single, no children" },
        { value: "single_with_kids", label: "Single parent" },
        { value: "married_spouse_believer", label: "Married — spouse also a believer" },
        { value: "married_spouse_not", label: "Married — spouse not a believer" },
        { value: "married_unknown", label: "Married — spouse's faith unknown" },
      ],
    },
    {
      type: "textarea",
      key: "specific_concerns",
      label: "Any specific concerns or complications?",
      placeholder: "Trauma background, addiction history, abusive past, theological confusion, syncretistic beliefs, reluctance to commit, language barriers — anything the care team should know going in.",
      rows: 3,
    },
    {
      type: "select",
      key: "follow_up_capacity",
      label: "Who will be doing the follow-up?",
      options: [
        { value: "pastor_only", label: "Pastor personally" },
        { value: "trained_volunteer", label: "Trained lay leader or volunteer" },
        { value: "small_group", label: "A small group will absorb them" },
        { value: "no_system", label: "No system yet — building from scratch" },
      ],
    },
  ],};

// ─── Per-Agent Output Tab Renderer ────────────────────────────────

function renderHarvestGuideOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const tabMap = [
    () => {
      const d = output.diagnosis as Record<string, string> | undefined;
      if (!d) return null;
      return (
        <div className="space-y-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/80 mb-2">Current state</div>
            <div className="text-2xl font-semibold text-white">{d.headline}</div>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-1.5">Honest assessment</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{d.honestAssessment}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-1.5">Primary blockage</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{d.primaryBlockage}</p>
            </div>
            {d.whatIsWorking && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-1.5">What is working</div>
                <p className="text-[17px] leading-[1.75] text-zinc-100">{d.whatIsWorking}</p>
              </div>
            )}
          </div>
          <div className="rounded-[1.2rem] border border-red-400/20 bg-red-400/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300 mb-2">Next step this week</div>
            <p className="text-[17px] leading-[1.75] text-white">{d.nextStep}</p>
          </div>
        </div>
      );
    },
    () => {
      const c = output.coJournerList as Record<string, unknown> | undefined;
      if (!c) return null;
      return (
        <div className="space-y-5">
          <p className="text-[17px] leading-[1.75] text-zinc-100">{c.instruction as string}</p>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Examples for your context</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{c.localExamples as string}</p>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Daily prayer rhythm</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{c.prayerFramework as string}</p>
          </div>
          {Array.isArray(c.conversationStarters) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Conversation starters</div>
              {(c.conversationStarters as string[]).map((s, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400/60" />
                  <span className="text-[17px] leading-[1.7] text-zinc-100">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
    () => {
      const g = output.gospelPresentation as Record<string, unknown> | undefined;
      if (!g) return null;
      const renderVersion = (label: string, v: Record<string, string> | undefined) => v ? (
        <div className="space-y-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">{label}</div>
          {([["Hook", v.hook], ["Bridge", v.bridge], ["Gospel", v.gospel], ["Response / Invitation", v.response], v.followUpQuestion ? ["Follow-up question", v.followUpQuestion] : null].filter(Boolean) as string[][]).map(([k, val]) => (
            <div key={k} className="rounded-[1rem] border border-white/8 bg-[#0d0f14] px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1.5">{k}</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{val}</p>
            </div>
          ))}
        </div>
      ) : null;
      return (
        <div className="space-y-8">
          {renderVersion("2-Minute Version", g.twoMinute as Record<string, string>)}
          {renderVersion("10-Minute Version", g.tenMinute as Record<string, string>)}
        </div>
      );
    },
    () => {
      const s = output.outreachStrategy as Record<string, unknown> | undefined;
      if (!s) return null;
      const plan = s.ninetyDayPlan as Record<string, string> | undefined;
      return (
        <div className="space-y-5">
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">Community landscape</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{s.communityMap as string}</p>
          </div>
          {Array.isArray(s.naturalConnectionPoints) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Natural connection points</div>
              {(s.naturalConnectionPoints as string[]).map((p, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-400/60" />
                  <span className="text-[17px] leading-[1.7] text-zinc-100">{p}</span>
                </div>
              ))}
            </div>
          )}
          {plan && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">90-Day activation plan</div>
              {[["Days 1–30", plan.daysOneToThirty], ["Days 31–60", plan.daysThirtyOneToSixty], ["Days 61–90", plan.daysSixtyOneToNinety]].map(([period, content]) => (
                <div key={period} className="rounded-[1rem] border border-white/8 bg-[#0d0f14] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1.5">{period}</div>
                  <p className="text-[17px] leading-[1.75] text-zinc-100">{content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
    () => {
      const b = output.bridgeEvent as Record<string, unknown> | undefined;
      if (!b) return null;
      return (
        <div className="space-y-4">
          {[["Event concept", b.concept], ["Why this fits your community", b.rationale], ["Logistics", b.logistics], ["Follow-up plan", b.followUpPlan]].map(([k, v]) => (
            <div key={k as string} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{k as string}</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </div>
          ))}
          {Array.isArray(b.volunteerRoles) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Volunteer roles</div>
              {(b.volunteerRoles as string[]).map((r, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 px-4 py-3">
                  <span className="text-[17px] leading-[1.7] text-zinc-100">{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
    () => {
      const w = output.witnessTraining as Record<string, unknown> | undefined;
      if (!w) return null;
      const story = w.threeStatementStory as Record<string, string> | undefined;
      const objections = w.objectionResponses as Array<{ objection: string; why: string; response: string }> | undefined;
      return (
        <div className="space-y-6">
          {story && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Three-statement story</div>
              {[["Framework", story.framework], ["Example", story.example], ["Common mistakes", story.commonMistakes]].map(([k, v]) => (
                <div key={k} className="rounded-[1rem] border border-white/8 bg-[#0d0f14] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1.5">{k}</div>
                  <p className="text-[17px] leading-[1.75] text-zinc-100">{v}</p>
                </div>
              ))}
            </div>
          )}
          {objections?.length ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Objection responses for your community</div>
              {objections.map((o, i) => (
                <div key={i} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-2">
                  <div className="text-[16px] font-semibold text-white">"{o.objection}"</div>
                  <p className="text-sm text-zinc-300 italic">{o.why}</p>
                  <p className="text-[17px] leading-[1.75] text-zinc-100">{o.response}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    },
    () => {
      const sc = output.socialContent as Record<string, string> | undefined;
      if (!sc) return null;
      return (
        <div className="space-y-4">
          {[["Instagram", sc.instagram], ["Facebook", sc.facebook], ["X / Twitter", sc.twitter], ["Instagram Story", sc.story]].map(([platform, content]) => (
            <div key={platform} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{platform}</div>
                <button
                  onClick={() => navigator.clipboard.writeText(content ?? "").catch(() => {})}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition"
                >
                  <Copy className="h-3 w-3" /> Copy
                </button>
              </div>
              <p className="text-[17px] leading-[1.75] text-zinc-100 whitespace-pre-wrap">{content}</p>
            </div>
          ))}
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}

function renderFieldPlannerOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const orange = "#f97316";

  function Block({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{label}</div>
        {children}
      </div>
    );
  }

  function Bullet({ text: t }: { text: string }) {
    return (
      <div className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: orange }} />
        <span className="text-[17px] leading-[1.7] text-zinc-100">{t}</span>
      </div>
    );
  }

  const tabMap = [
    // Tab 0: Health Diagnostic
    () => {
      const hd = output.healthDiagnostic as Record<string, Record<string, string>> | undefined;
      if (!hd) return null;
      const dims = [
        { key: "evangelism", label: "Evangelism" },
        { key: "discipleship", label: "Discipleship" },
        { key: "leadership", label: "Leadership" },
        { key: "multiplication", label: "Multiplication" },
      ];
      const overall = hd.overallHealth;
      return (
        <div className="space-y-5">
          {overall && (
            <div className="rounded-[1.4rem] p-6 space-y-3" style={{ background: orange + "12", border: `1px solid ${orange}30` }}>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: orange }}>Overall health</div>
              <p className="text-[17px] leading-[1.8] text-zinc-100">{overall.analysis}</p>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 shrink-0 mt-0.5">Trajectory:</span>
                <span className="text-[16px] text-zinc-100">{overall.trajectory}</span>
              </div>
              <div className="rounded-[1rem] border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300 mb-1">The honest thing</div>
                <p className="text-[16px] leading-[1.7] text-white">{overall.oneHonestThing}</p>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {dims.map(({ key, label }) => {
              const dim = hd[key];
              if (!dim) return null;
              return (
                <div key={key} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
                  <div className="text-sm font-semibold text-white">{label}</div>
                  <p className="text-[15px] leading-[1.7] text-zinc-100">{dim.analysis}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-green-300 mb-1">Strength</div>
                      <p className="text-[13px] text-zinc-100">{dim.primaryStrength}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-300 mb-1">Gap</div>
                      <p className="text-[13px] text-zinc-100">{dim.primaryGap}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
    // Tab 1: MOST Plan
    () => {
      const most = output.mostPlan as Record<string, unknown> | undefined;
      if (!most) return null;
      const strategies = most.strategies as Array<{ strategy: string; rationale: string; tactics: Array<{ action: string; owner: string; timeline: string; metric: string }> }> | undefined;
      return (
        <div className="space-y-5">
          <Block label="Mission — the unchanging reason for being">
            <p className="text-[17px] leading-[1.75] text-white font-medium">{most.mission as string}</p>
          </Block>
          <Block label="12-month objective — specific, measurable, time-bound">
            <p className="text-[17px] leading-[1.75] text-zinc-100">{most.objective as string}</p>
          </Block>
          {strategies?.map((s, i) => (
            <div key={i} className="rounded-[1.4rem] border border-white/10 bg-[#0d0f14] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0" style={{ background: orange }}>S{i+1}</div>
                <div className="text-base font-semibold text-white">{s.strategy}</div>
              </div>
              <p className="text-[15px] leading-[1.7] text-zinc-200 italic">{s.rationale}</p>
              {s.tactics?.length ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">Tactics</div>
                  {s.tactics.map((t, ti) => (
                    <div key={ti} className="rounded-[0.8rem] border border-white/8 bg-white/[0.02] px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1">
                      <p className="col-span-3 text-[15px] text-zinc-100">{t.action}</p>
                      {[["Owner", t.owner], ["By", t.timeline], ["Metric", t.metric]].map(([k, v]) => (
                        <div key={k as string} className="text-[12px]">
                          <span className="text-zinc-400">{k as string}: </span>
                          <span className="text-zinc-200">{v as string}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      );
    },
    // Tab 2: 90-Day Plan
    () => {
      const ndp = output.ninetyDayPlan as Record<string, { theme: string; actions: string[]; milestone: string }> | undefined;
      if (!ndp) return null;
      const phases = [
        { key: "daysOneToThirty", label: "Days 1–30", color: orange },
        { key: "daysThirtyOneToSixty", label: "Days 31–60", color: "#eab308" },
        { key: "daysSixtyOneToNinety", label: "Days 61–90", color: "#22c55e" },
      ];
      return (
        <div className="space-y-5">
          {phases.map(({ key, label, color }) => {
            const phase = ndp[key];
            if (!phase) return null;
            return (
              <div key={key} className="rounded-[1.4rem] border border-white/10 bg-[#0d0f14] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: color }} />
                  <div className="text-base font-semibold text-white">{label} — {phase.theme}</div>
                </div>
                <div className="space-y-2 mb-4">
                  {phase.actions?.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-[0.8rem] border border-white/8 px-4 py-2.5">
                      <span className="text-xs font-bold mt-0.5" style={{ color }}>{i+1}</span>
                      <span className="text-[16px] text-zinc-100">{a}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-[0.8rem] border px-4 py-3" style={{ borderColor: color + "30", background: color + "08" }}>
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color }}>Milestone</div>
                  <p className="text-[15px] text-zinc-100">{phase.milestone}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    // Tab 3: Annual Calendar
    () => {
      const cal = output.annualCalendar as Record<string, { theme: string; goals: string[]; keyAction: string; seasonalNote: string }> | undefined;
      if (!cal) return null;
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {(["q1","q2","q3","q4"] as const).map((q, i) => {
            const qd = cal[q];
            if (!qd) return null;
            return (
              <div key={q} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: orange }}>Q{i+1}</div>
                  <div className="text-base font-semibold text-white">{qd.theme}</div>
                </div>
                <div className="space-y-1">
                  {qd.goals?.map((g, gi) => (
                    <p key={gi} className="flex items-start gap-2 text-[15px] text-zinc-100">
                      <span className="text-zinc-400 mt-0.5">→</span>{g}
                    </p>
                  ))}
                </div>
                {[["Key action", qd.keyAction], ["Seasonal note", qd.seasonalNote]].map(([k, v]) => (
                  <div key={k as string}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-300">{k as string}</div>
                    <p className="text-[14px] text-zinc-100">{v as string}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    },
    // Tab 4: Multiplication Roadmap
    () => {
      const rm = output.multiplicationRoadmap as Record<string, { name: string; description: string; timeline: string; milestones: string[]; readinessSignals: string }> | undefined;
      if (!rm) return null;
      const phases = ["phase1","phase2","phase3","phase4"] as const;
      const colors = [orange, "#eab308", "#22c55e", "#06b6d4"];
      return (
        <div className="space-y-4">
          {phases.map((key, i) => {
            const ph = rm[key];
            if (!ph) return null;
            return (
              <div key={key} className="rounded-[1.4rem] border border-white/10 bg-[#0d0f14] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0" style={{ background: colors[i] }}>{i+1}</div>
                  <div className="text-base font-semibold text-white">{ph.name}</div>
                  <span className="ml-auto text-xs text-zinc-300">{ph.timeline}</span>
                </div>
                <p className="text-[16px] leading-[1.7] text-zinc-100 mb-3">{ph.description}</p>
                {ph.milestones?.length ? (
                  <div className="space-y-1.5 mb-3">
                    {ph.milestones.map((m, mi) => (
                      <div key={mi} className="flex items-start gap-2 text-[15px] text-zinc-100">
                        <span style={{ color: colors[i] }} className="font-bold">✓</span>{m}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="rounded-[0.8rem] border px-4 py-2.5" style={{ borderColor: colors[i] + "30", background: colors[i] + "08" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: colors[i] }}>Readiness for next phase</div>
                  <p className="text-[14px] text-zinc-100">{ph.readinessSignals}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    // Tab 5: KPIs
    () => {
      const kpis = output.kpiDashboard as Array<{ metric: string; howToMeasure: string; currentBaseline: string; target: string; reviewFrequency: string }> | undefined;
      if (!kpis) return null;
      return (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">What actually matters for multiplication — not attendance and offering as the only measures of health.</p>
          {kpis.map((kpi, i) => (
            <div key={i} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="text-base font-semibold text-white mb-3">{kpi.metric}</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
                {[["How to measure", kpi.howToMeasure], ["Current baseline", kpi.currentBaseline], ["Target", kpi.target], ["Review", kpi.reviewFrequency]].map(([k, v]) => (
                  <div key={k as string}>
                    <span className="text-zinc-400">{k as string}: </span>
                    <span className="text-zinc-100">{v as string}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    },
    // Tab 6: Partnerships
    () => {
      const ps = output.partnershipStrategy as Record<string, string[]> | undefined;
      if (!ps) return null;
      return (
        <div className="space-y-5">
          {[["Local partnerships", ps.local], ["Regional networks", ps.regional], ["Global connections", ps.global]].map(([label, items]) =>
            Array.isArray(items) ? (
              <div key={label as string} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{label as string}</div>
                {(items as string[]).map((item, i) => <Bullet key={i} text={item} />)}
              </div>
            ) : null
          )}
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}


function renderPrayerCareOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const pink = "#ec4899";

  function Block({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{label}</div>
        {children}
      </div>
    );
  }

  function Bullet({ text: t }: { text: string }) {
    return (
      <div className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: pink }} />
        <span className="text-[17px] leading-[1.7] text-zinc-100">{t}</span>
      </div>
    );
  }

  const tabMap = [
    // Tab 0: Weekly Prayer Guide
    () => {
      const wg = output.weeklyPrayerGuide as Record<string, unknown> | undefined;
      if (!wg) return null;
      const days = wg.dailyFocuses as Array<{ day: string; focus: string; prompt: string }> | undefined;
      return (
        <div className="space-y-5">
          <div className="rounded-[1.4rem] p-5" style={{ background: pink + "15", border: `1px solid ${pink}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: pink }}>Weekly theme</div>
            <div className="text-xl font-semibold text-white">{wg.theme as string}</div>
          </div>
          {Array.isArray(wg.scriptures) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(wg.scriptures as string[]).map((s, i) => (
                <div key={i} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[16px] italic text-zinc-100">{s}</p>
                </div>
              ))}
            </div>
          )}
          {days?.map((d) => (
            <div key={d.day} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: pink }}>{d.day}</div>
                <div className="text-base font-semibold text-white">{d.focus}</div>
              </div>
              <p className="text-[17px] leading-[1.8] text-zinc-100 italic">{d.prompt}</p>
            </div>
          ))}
        </div>
      );
    },
    // Tab 1: Prayer Meeting Script
    () => {
      const pm = output.prayerMeetingScript as Record<string, unknown> | undefined;
      if (!pm) return null;
      const segs = pm.segments as Array<{ type: string; focus: string; guide: string; timeAllocation: string; transitionLanguage: string }> | undefined;
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <span className="rounded-full border border-white/10 px-3 py-1">{pm.format as string}</span>
          </div>
          <Block label="Opening scripture">
            <p className="text-[17px] italic text-zinc-100">{pm.openingScripture as string}</p>
          </Block>
          <Block label="Centering call">
            <p className="text-[17px] leading-[1.8] text-zinc-100">{pm.centeringCall as string}</p>
          </Block>
          {segs?.map((seg, i) => (
            <div key={i} className="rounded-[1.4rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ background: pink + "20", color: pink }}>{seg.type}</span>
                <span className="text-base font-semibold text-white">{seg.focus}</span>
                <span className="ml-auto text-xs text-zinc-300">{seg.timeAllocation}</span>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1.5">What to pray</div>
                <p className="text-[17px] leading-[1.8] text-zinc-100">{seg.guide}</p>
              </div>
              {seg.transitionLanguage && (
                <div className="rounded-[0.8rem] border border-white/8 bg-white/[0.02] px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 mb-1">Transition</div>
                  <p className="text-[15px] italic text-zinc-200">{seg.transitionLanguage}</p>
                </div>
              )}
            </div>
          ))}
          <Block label="Closing commissioning prayer">
            <p className="text-[17px] leading-[1.8] text-zinc-100 italic">{pm.closingCommissioning as string}</p>
          </Block>
        </div>
      );
    },
    // Tab 2: Named Intercession
    () => {
      const ni = output.namedIntercession as Record<string, unknown[]> | undefined;
      if (!ni) return null;
      function PersonCard({ name, subtitle, prompt }: { name: string; subtitle: string; prompt: string }) {
        return (
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="text-base font-semibold text-white mb-0.5">{name}</div>
            <div className="text-sm text-zinc-300 mb-3">{subtitle}</div>
            <p className="text-[16px] leading-[1.75] text-zinc-100 italic">{prompt}</p>
          </div>
        );
      }
      const sections = [
        { label: "The lost — by name", key: "theLost", sub: (x: Record<string, string>) => x.relationship },
        { label: "New believers", key: "newBelievers", sub: (x: Record<string, string>) => x.currentNeeds },
        { label: "Leaders in development", key: "leaders", sub: (x: Record<string, string>) => x.currentAssignment },
        { label: "Missionaries", key: "missionaries", sub: (x: Record<string, string>) => `${x.field} — ${x.currentNeeds}` },
      ];
      return (
        <div className="space-y-6">
          {sections.map(({ label, key, sub }) => {
            const items = ni[key] as Array<Record<string, string>> | undefined;
            if (!items?.length) return null;
            return (
              <div key={key} className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: pink }}>{label}</div>
                {items.map((item, i) => (
                  <PersonCard key={i} name={item.name} subtitle={sub(item)} prompt={item.specificPrompt} />
                ))}
              </div>
            );
          })}
        </div>
      );
    },
    // Tab 3: Unreached People Group
    () => {
      const upg = output.unreachedPeopleGroup as Record<string, unknown> | undefined;
      if (!upg) return null;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-6" style={{ background: pink + "10", border: `1px solid ${pink}25` }}>
            <div className="text-2xl font-semibold text-white">{upg.name as string}</div>
            <div className="mt-1 text-sm text-zinc-300">{upg.location as string} · {upg.population as string}</div>
            <div className="mt-3 text-[16px] text-zinc-100">{upg.spiritualStatus as string}</div>
          </div>
          {Array.isArray(upg.prayerPoints) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Prayer points</div>
              {(upg.prayerPoints as string[]).map((pt, i) => <Bullet key={i} text={pt} />)}
            </div>
          )}
          <Block label="Anchoring scripture">
            <p className="text-[17px] italic text-zinc-100">{upg.anchoringScripture as string}</p>
          </Block>
          <Block label="Cultural note — making them real">
            <p className="text-[17px] leading-[1.75] text-zinc-100">{upg.culturalNote as string}</p>
          </Block>
        </div>
      );
    },
    // Tab 4: Missionary Intercession
    () => {
      const mi = output.missionaryIntercession as Record<string, unknown> | undefined;
      if (!mi) return null;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-5" style={{ background: pink + "10", border: `1px solid ${pink}25` }}>
            <div className="text-xl font-semibold text-white">{mi.name as string}</div>
            <div className="mt-1 text-sm text-zinc-300">{mi.fieldContext as string}</div>
            <div className="mt-3 text-[16px] text-zinc-100">{mi.currentNeeds as string}</div>
          </div>
          {Array.isArray(mi.prayerPoints) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Prayer points</div>
              {(mi.prayerPoints as string[]).map((pt, i) => <Bullet key={i} text={pt} />)}
            </div>
          )}
          <Block label="Anchoring scripture">
            <p className="text-[17px] italic text-zinc-100">{mi.anchoringScripture as string}</p>
          </Block>
        </div>
      );
    },
    // Tab 5: Prayer Room
    () => {
      const slots = output.prayerRoomSchedule as Array<{ timeSlot: string; focus: string; format: string; slotGuide: string }> | undefined;
      if (!slots) return null;
      return (
        <div className="space-y-3">
          {slots.map((slot, i) => (
            <div key={i} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="shrink-0 min-w-[80px] text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: pink }}>{slot.timeSlot}</div>
                <div className="text-base font-semibold text-white">{slot.focus}</div>
                <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-300">{slot.format}</span>
              </div>
              <p className="text-[16px] leading-[1.7] text-zinc-100">{slot.slotGuide}</p>
            </div>
          ))}
        </div>
      );
    },
    // Tab 6: Personal Prayer Plan
    () => {
      const pp = output.personalPrayerPlan as Record<string, unknown> | undefined;
      if (!pp) return null;
      return (
        <div className="space-y-5">
          {[["Morning rhythm", pp.morning], ["Midday rhythm", pp.midday], ["Evening rhythm", pp.evening], ["Fasting rhythm", pp.fastingRhythm], ["Praying through the Psalms", pp.psalmStructure], ["CoJourner practice", pp.coJournerPractice]].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.8] text-zinc-100">{v as string}</p>
            </Block>
          ))}
          {Array.isArray(pp.journalPrompts) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Journal prompts — moving from petition to dialogue</div>
              {(pp.journalPrompts as string[]).map((jp, i) => <Bullet key={i} text={jp} />)}
            </div>
          )}
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}


function renderLeaderDevelopmentOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const purple = "#a855f7";

  function Block({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{label}</div>
        {children}
      </div>
    );
  }

  function Bullet({ text: t }: { text: string }) {
    return (
      <div className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: purple }} />
        <span className="text-[17px] leading-[1.7] text-zinc-100">{t}</span>
      </div>
    );
  }

  const tabMap = [
    // Tab 0: Readiness Assessment
    () => {
      const ra = output.readinessAssessment as Record<string, string> | undefined;
      if (!ra) return null;
      const dims = [
        ["Faithfulness", ra.faithfulness],
        ["Anointing", ra.anointing],
        ["Character", ra.character],
        ["Relational health", ra.relationalHealth],
        ["Teachability", ra.teachability],
        ["Pipeline engagement", ra.pipelineEngagement],
      ];
      return (
        <div className="space-y-5">
          <div className="rounded-[1.4rem] p-6" style={{ background: purple + "15", border: `1px solid ${purple}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: purple }}>Overall picture</div>
            <p className="text-[17px] leading-[1.8] text-white">{ra.overallPicture}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {dims.map(([k, v]) => (
              <Block key={k as string} label={k as string}>
                <p className="text-[16px] leading-[1.7] text-zinc-100">{v as string}</p>
              </Block>
            ))}
          </div>
          {[["APEST expression", ra.apestExpression], ["Current MAWL stage", ra.currentMawlStage]].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-yellow-400/20 bg-yellow-400/[0.06] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300 mb-2">Primary concern</div>
              <p className="text-[16px] leading-[1.7] text-zinc-100">{ra.primaryConcern}</p>
            </div>
            <div className="rounded-[1.2rem] p-5" style={{ border: `1px solid ${purple}30`, background: purple + "08" }}>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: purple }}>Greatest strength</div>
              <p className="text-[16px] leading-[1.7] text-zinc-100">{ra.greatestStrength}</p>
            </div>
          </div>
        </div>
      );
    },
    // Tab 1: Development Pipeline
    () => {
      const dp = output.developmentPipeline as Record<string, unknown> | undefined;
      if (!dp) return null;
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Current stage", dp.currentStage as string], ["Next stage", dp.nextStage as string]].map(([k, v]) => (
              <div key={k} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-1">{k}</div>
                <div className="text-lg font-semibold text-white">{v}</div>
              </div>
            ))}
          </div>
          <Block label="Current stage description">
            <p className="text-[17px] leading-[1.75] text-zinc-100">{dp.currentStageDescription as string}</p>
          </Block>
          {Array.isArray(dp.graduationCriteria) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Graduation criteria — observable evidence of readiness</div>
              {(dp.graduationCriteria as string[]).map((c, i) => <Bullet key={i} text={c} />)}
            </div>
          )}
          <Block label="Realistic timeline">
            <p className="text-[17px] leading-[1.75] text-zinc-100">{dp.timeline as string}</p>
          </Block>
          {Array.isArray(dp.keyActivities) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Key activities at this stage</div>
              {(dp.keyActivities as string[]).map((a, i) => <Bullet key={i} text={a} />)}
            </div>
          )}
        </div>
      );
    },
    // Tab 2: Mentoring Curriculum
    () => {
      const sessions = output.mentoringCurriculum as Array<{ session: number; focusTopic: string; questionsToAsk: string[]; assignment: string; whatToWatchFor: string }> | undefined;
      if (!sessions) return null;
      return (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">Pastor asks — does not teach. The questions open the formation. The assignment drives it home.</p>
          {sessions.map((s) => (
            <div key={s.session} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0" style={{ background: purple }}>{s.session}</div>
                <div className="text-base font-semibold text-white">{s.focusTopic}</div>
              </div>
              {Array.isArray(s.questionsToAsk) && (
                <div className="space-y-1.5 mb-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">Questions to ask</div>
                  {s.questionsToAsk.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-[16px] text-zinc-100">
                      <span className="text-xs font-bold mt-1" style={{ color: purple }}>Q{i+1}</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              )}
              {[["Assignment", s.assignment], ["What to watch for", s.whatToWatchFor]].map(([k, v]) => (
                <div key={k} className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 mb-1">{k}</div>
                  <p className="text-[16px] leading-[1.7] text-zinc-100">{v}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    },
    // Tab 3: LAUNCH Integration
    () => {
      const li = output.launchIntegration as Record<string, unknown> | undefined;
      if (!li) return null;
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-[#0d0f14] px-5 py-4">
            <div className={`h-3 w-3 rounded-full shrink-0 ${li.readyToStart ? "bg-green-400" : "bg-yellow-400"}`} />
            <span className="text-[17px] text-zinc-100">
              {li.readyToStart ? "Ready to begin LAUNCH" : "Not yet ready — continue current formation first"}
            </span>
          </div>
          {li.readyToStart ? (
            <Block label={`Recommended start: Session ${String(li.recommendedStartSession)}`}>
              <p className="text-[16px] text-zinc-100">Begin LAUNCH at session {String(li.recommendedStartSession)}.</p>
            </Block>
          ) : null}
          {Array.isArray(li.prioritySessions) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Priority sessions for this leader</div>
              {(li.prioritySessions as string[]).map((s, i) => <Bullet key={i} text={s} />)}
            </div>
          )}
          <Block label="DEVELOP peer coaching circle">
            <p className="text-[17px] leading-[1.75] text-zinc-100">{li.developCohort as string}</p>
          </Block>
        </div>
      );
    },
    // Tab 4: Deployment Plan
    () => {
      const dep = output.deploymentPlan as Record<string, string> | undefined;
      if (!dep) return null;
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Role", dep.role], ["Context", dep.context]].map(([k, v]) => (
              <Block key={k as string} label={k as string}>
                <p className="text-[17px] text-zinc-100">{v as string}</p>
              </Block>
            ))}
          </div>
          {[["Support structure", dep.supportStructure], ["Timeline", dep.timeline], ["MAWL at deployment", dep.mawlAtDeployment]].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ))}
          <div className="grid gap-4 sm:grid-cols-3">
            {[["Days 1–30", dep.thirtyDays], ["Days 31–60", dep.sixtyDays], ["Days 61–90", dep.ninetyDays]].map(([k, v]) => (
              <div key={k as string} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: purple }}>{k as string}</div>
                <p className="text-[15px] leading-[1.7] text-zinc-100">{v as string}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[1.2rem] border border-yellow-400/20 bg-yellow-400/[0.06] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300 mb-2">If they struggle — without rescuing them</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{dep.earlyStruggleResponse}</p>
          </div>
        </div>
      );
    },
    // Tab 5: Succession Framework
    () => {
      const sf = output.successionFramework as Record<string, unknown> | undefined;
      if (!sf) return null;
      return (
        <div className="space-y-5">
          {Array.isArray(sf.whatTransfers) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">What transfers</div>
              {(sf.whatTransfers as string[]).map((r, i) => <Bullet key={i} text={r} />)}
            </div>
          )}
          {[["When to transfer", sf.whenToTransfer], ["How to transfer", sf.howToTransfer], ["Relational complexity to expect", sf.emotionalComplexity]].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ))}
        </div>
      );
    },
    // Tab 6: Health Check
    () => {
      const hc = output.leaderHealthCheck as Record<string, string[]> | undefined;
      if (!hc) return null;
      const sections = [
        ["Spiritual vitality", hc.spiritualVitality],
        ["Relational health", hc.relationalHealth],
        ["Role health", hc.roleHealth],
        ["Pipeline engagement", hc.pipelineEngagement],
      ];
      return (
        <div className="space-y-5">
          <p className="text-sm text-zinc-300">Not a performance review. A pastoral conversation framework that goes deeper than productivity.</p>
          {sections.map(([label, qs]) => Array.isArray(qs) ? (
            <div key={label as string} className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{label as string}</div>
              {(qs as string[]).map((q, i) => <Bullet key={i} text={q} />)}
            </div>
          ) : null)}
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}


function renderFamilyDiscipleshipOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const amber = "#f59e0b";

  function Block({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{label}</div>
        {children}
      </div>
    );
  }

  function Bullet({ text }: { text: string }) {
    return (
      <div className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: amber }} />
        <span className="text-[17px] leading-[1.7] text-zinc-100">{text}</span>
      </div>
    );
  }

  function ObjLesson(ol: { materials?: string; instructions?: string; connection?: string } | undefined) {
    if (!ol) return null;
    return (
      <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Object lesson</div>
        {[["Materials", ol.materials], ["Instructions", ol.instructions], ["Spiritual connection", ol.connection]].map(([k, v]) => v ? (
          <div key={k as string}>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">{k as string}: </span>
            <span className="text-[16px] text-zinc-100">{v as string}</span>
          </div>
        ) : null)}
      </div>
    );
  }

  const tabMap = [
    // Tab 0: Pre-K
    () => {
      const pk = output.preKLesson as Record<string, unknown> | undefined;
      if (!pk) return null;
      const card = pk.parentCard as Record<string, string> | undefined;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-5" style={{ background: amber + "15", border: `1px solid ${amber}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: amber }}>Big Idea</div>
            <div className="text-2xl font-semibold text-white">{pk.bigIdea as string}</div>
          </div>
          <Block label="Story — read aloud">
            <p className="text-[17px] leading-[1.85] text-zinc-100 whitespace-pre-wrap">{pk.storyScript as string}</p>
          </Block>
          {ObjLesson(pk.objectLesson as { materials?: string; instructions?: string; connection?: string } | undefined)}
          {[["Song suggestion", pk.songSuggestion], ["Discussion question", pk.discussionQuestion]].map(([k, v]) => v ? (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ) : null)}
          {card && (
            <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Parent take-home card</div>
              <p className="text-[16px] font-medium text-white">{card.bigIdea}</p>
              <p className="text-[16px] italic text-zinc-100">{card.familyPrayer}</p>
            </div>
          )}
        </div>
      );
    },
    // Tab 1: Elementary
    () => {
      const el = output.elementaryLesson as Record<string, unknown> | undefined;
      if (!el) return null;
      const th = el.parentTakeHome as Record<string, unknown> | undefined;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-5" style={{ background: amber + "15", border: `1px solid ${amber}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: amber }}>Big Idea</div>
            <div className="text-2xl font-semibold text-white">{el.bigIdea as string}</div>
          </div>
          <Block label="Story with engagement points">
            <p className="text-[17px] leading-[1.85] text-zinc-100 whitespace-pre-wrap">{el.storyWithEngagement as string}</p>
          </Block>
          {ObjLesson(el.objectLesson as { materials?: string; instructions?: string; connection?: string } | undefined)}
          {Array.isArray(el.discussionQuestions) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Discussion questions</div>
              {(el.discussionQuestions as string[]).map((q, i) => <Bullet key={i} text={q} />)}
            </div>
          )}
          {[["Memory verse", el.memoryVerse], ["Memorization method", (el as Record<string, unknown>)["memorization Method"] ?? (el as Record<string, unknown>)["memorizationMethod"]], ["Craft or game", el.craftOrGame]].map(([k, v]) => v ? (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ) : null)}
          {th && (
            <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Parent take-home</div>
              <p className="text-[16px] font-medium text-white">{th.bigIdea as string}</p>
              <p className="text-[15px] italic text-zinc-200">{th.memoryVerse as string}</p>
              {Array.isArray(th.questions) && (th.questions as string[]).map((q, i) => <Bullet key={i} text={q} />)}
              {th.challenge ? <p className="text-[16px] text-zinc-100"><strong className="text-zinc-200">Challenge:</strong> {String(th.challenge)}</p> : null}
              {th.prayerPrompt ? <p className="text-[16px] italic text-zinc-200">{String(th.prayerPrompt)}</p> : null}
            </div>
          )}
        </div>
      );
    },
    // Tab 2: Upper Elementary
    () => {
      const ue = output.upperElementaryLesson as Record<string, unknown> | undefined;
      if (!ue) return null;
      const th = ue.parentTakeHome as Record<string, unknown> | undefined;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-5" style={{ background: amber + "15", border: `1px solid ${amber}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: amber }}>Big Idea (challenge format)</div>
            <div className="text-2xl font-semibold text-white">{ue.bigIdea as string}</div>
          </div>
          <Block label="Passage engagement — inductive discovery">
            <p className="text-[17px] leading-[1.85] text-zinc-100 whitespace-pre-wrap">{ue.passageEngagement as string}</p>
          </Block>
          {Array.isArray(ue.discussionQuestions) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Discussion questions</div>
              {(ue.discussionQuestions as string[]).map((q, i) => <Bullet key={i} text={q} />)}
            </div>
          )}
          {[["Life application challenge", ue.lifeApplicationChallenge], ["Memory verse", ue.memoryVerse]].map(([k, v]) => v ? (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ) : null)}
          {ue.adultSermonConnection ? (
            <div className="rounded-[1.2rem] border p-5 space-y-2" style={{ borderColor: amber + "30" }}>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: amber }}>Bridge to the adult sermon</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{ue.adultSermonConnection as string}</p>
            </div>
          ) : null}
          {th && (
            <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Parent take-home</div>
              <p className="text-[16px] font-medium text-white">{th.bigIdea as string}</p>
              {Array.isArray(th.questions) && (th.questions as string[]).map((q, i) => <Bullet key={i} text={q} />)}
              {th.challenge ? <p className="text-[16px] text-zinc-100"><strong className="text-zinc-200">Challenge:</strong> {String(th.challenge)}</p> : null}
            </div>
          )}
        </div>
      );
    },
    // Tab 3: Service Flow
    () => {
      const flow = output.serviceFlow as Array<{ time: string; segment: string; details: string }> | undefined;
      if (!flow) return null;
      return (
        <div className="space-y-3">
          {flow.map((seg, i) => (
            <div key={i} className="flex items-start gap-4 rounded-[1.2rem] border border-white/10 bg-[#0d0f14] px-5 py-4">
              <div className="shrink-0 min-w-[56px] text-xs font-semibold uppercase tracking-[0.15em] pt-0.5" style={{ color: amber }}>{seg.time}</div>
              <div>
                <div className="text-base font-semibold text-white">{seg.segment}</div>
                <div className="mt-1 text-[16px] leading-[1.7] text-zinc-100">{seg.details}</div>
              </div>
            </div>
          ))}
        </div>
      );
    },
    // Tab 4: Volunteer Guide
    () => {
      const vg = output.volunteerGuide as Record<string, unknown> | undefined;
      if (!vg) return null;
      return (
        <div className="space-y-5">
          <div className="rounded-[1.4rem] p-5" style={{ background: amber + "15", border: `1px solid ${amber}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{ color: amber }}>Lesson objective</div>
            <p className="text-[17px] text-white">{vg.objective as string}</p>
          </div>
          {Array.isArray(vg.keyPoints) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">3 key points to communicate</div>
              {(vg.keyPoints as string[]).map((pt, i) => <Bullet key={i} text={pt} />)}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.isArray(vg.doThis) && (
              <div className="rounded-[1.2rem] border border-green-400/20 bg-green-400/[0.05] p-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-green-300">Do this</div>
                {(vg.doThis as string[]).map((d, i) => <p key={i} className="text-[16px] text-zinc-100">{d}</p>)}
              </div>
            )}
            {Array.isArray(vg.avoidThis) && (
              <div className="rounded-[1.2rem] border border-red-400/20 bg-red-400/[0.05] p-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Avoid this</div>
                {(vg.avoidThis as string[]).map((d, i) => <p key={i} className="text-[16px] text-zinc-100">{d}</p>)}
              </div>
            )}
          </div>
          {Array.isArray(vg.commonQuestions) && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Common questions children ask</div>
              {(vg.commonQuestions as Array<{ question: string; answer: string }>).map((qa, i) => (
                <div key={i} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
                  <p className="text-[16px] font-semibold text-white mb-1">"{qa.question}"</p>
                  <p className="text-[16px] text-zinc-100">{qa.answer}</p>
                </div>
              ))}
            </div>
          )}
          {vg.openingPrayer ? (
            <Block label="Opening prayer for volunteers">
              <p className="text-[17px] leading-[1.8] text-zinc-100 italic">{vg.openingPrayer as string}</p>
            </Block>
          ) : null}
        </div>
      );
    },
    // Tab 5: Home Devotional
    () => {
      const devs = output.homeDevotional as Array<{ day: string; scripture: string; question: string; activity: string; prayer: string }> | undefined;
      if (!devs) return null;
      const colors = [amber, "#f97316", "#ef4444"];
      return (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">10-15 minutes together. Works for families with no existing devotional habit.</p>
          {devs.map((d, i) => (
            <div key={d.day} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ background: colors[i] }} />
                <div className="text-base font-semibold text-white">{d.day}</div>
              </div>
              {[["Scripture", d.scripture], ["Question", d.question], ["Activity", d.activity], ["Prayer", d.prayer]].map(([k, v]) => (
                <div key={k} className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300 mb-1">{k}</div>
                  <p className={`text-[17px] leading-[1.75] text-zinc-100${k === "Prayer" ? " italic" : ""}`}>{v}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    },
    // Tab 6: Parent Notes
    () => {
      const pen = output.parentEquippingNote as Record<string, string> | undefined;
      if (!pen) return null;
      return (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">A brief gift for parents — not a homework assignment. Language and a moment to use it.</p>
          {[
            ["What their child learned", pen.whatTheyLearned],
            ["When to bring it up", pen.whenToUseIt],
            ["Question to ask", pen.questionToAsk],
            ["What to share from your own faith", pen.shareFromYourLife],
          ].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ))}
        </div>
      );
    },
    // Tab 7: CoJourner Moment
    () => {
      const cjm = output.familyCoJournerMoment as Record<string, string> | undefined;
      if (!cjm) return null;
      return (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">This is how the CoJourner lifestyle takes root in the next generation — through a family that practices it together.</p>
          <div className="rounded-[1.4rem] p-6 space-y-5" style={{ background: amber + "10", border: `1px solid ${amber}25` }}>
            {[
              ["For parents", cjm.parentPrompt],
              ["For children", cjm.childPrompt],
              ["Family prayer", cjm.familyPrayer],
              ["Family action this week", cjm.familyAction],
            ].map(([k, v]) => (
              <div key={k as string}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: amber }}>{k as string}</div>
                <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
              </div>
            ))}
          </div>
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}


function renderDiscipleGuideOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const blue = "#3b82f6";

  function Bullet({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: blue }} />
        <span className="text-[17px] leading-[1.7] text-zinc-100">{children}</span>
      </div>
    );
  }

  function Block({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{label}</div>
        {children}
      </div>
    );
  }

  const tabMap = [
    // Tab 0: Session Overview
    () => {
      const ov = output.sessionOverview as Record<string, string> | undefined;
      if (!ov) return null;
      return (
        <div className="space-y-4">
          {[["Passage", ov.passage], ["Big discovery question", ov.bigDiscoveryQuestion], ["MAWL stage", ov.mawlStage]].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ))}
        </div>
      );
    },
    // Tab 1: Meeting Guide
    () => {
      const mg = output.meetingGuide as Record<string, Record<string, string | string[]>> | undefined;
      if (!mg) return null;
      const thirds = [
        { key: "lookBack", label: "Look Back — First Third", color: "#f59e0b" },
        { key: "lookUp", label: "Look Up — Middle Third", color: blue },
        { key: "lookForward", label: "Look Forward — Final Third", color: "#22c55e" },
      ];
      return (
        <div className="space-y-6">
          {thirds.map(({ key, label, color }) => {
            const third = mg[key];
            if (!third) return null;
            return (
              <div key={key} className="rounded-[1.4rem] border p-6 space-y-4" style={{ borderColor: color + "30" }}>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: color }} />
                  <div className="text-base font-semibold text-white">{label}</div>
                  {third.timeAllocation && <span className="ml-auto text-xs text-zinc-300">{String(third.timeAllocation)}</span>}
                </div>
                {Object.entries(third).filter(([k]) => k !== "timeAllocation").map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1.5">{k.replace(/([A-Z])/g, " $1").trim()}</div>
                    {Array.isArray(v)
                      ? <div className="space-y-2">{(v as string[]).map((item, i) => <Bullet key={i}>{item as string}</Bullet>)}</div>
                      : <p className="text-[17px] leading-[1.75] text-zinc-100">{String(v)}</p>
                    }
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    },
    // Tab 2: TEAMS Check
    () => {
      const tc = output.teamsCheck as Record<string, string> | undefined;
      if (!tc) return null;
      const labels: Record<string, string> = {
        truth: "T — Truth",
        equipping: "E — Equipping",
        accountability: "A — Accountability",
        mission: "M — Mission",
        supplication: "S — Supplication",
      };
      return (
        <div className="space-y-4">
          {Object.entries(tc).map(([k, v]) => (
            <Block key={k} label={labels[k] ?? k}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v}</p>
            </Block>
          ))}
        </div>
      );
    },
    // Tab 3: Discovery Series
    () => {
      const series = output.discoverySeries as Array<{ week: number; passage: string; bigQuestion: string; attentivenessNote: string }> | undefined;
      if (!series) return null;
      return (
        <div className="space-y-4">
          {series.map((w) => (
            <div key={w.week} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0" style={{ background: blue }}>
                  {w.week}
                </div>
                <div className="text-base font-semibold text-white">{w.passage}</div>
              </div>
              <div className="mt-2">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1">Big discovery question</div>
                <p className="text-[17px] leading-[1.75] text-zinc-100">{w.bigQuestion}</p>
              </div>
              <div className="mt-3 rounded-[0.8rem] border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300 mb-1">Attentiveness note</div>
                <p className="text-[15px] leading-[1.7] text-zinc-200 italic">{w.attentivenessNote}</p>
              </div>
            </div>
          ))}
        </div>
      );
    },
    // Tab 4: Reproducible Tool
    () => {
      const rt = output.reproducibleTool as Record<string, string> | undefined;
      if (!rt) return null;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-6" style={{ background: blue + "15", border: `1px solid ${blue}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: blue }}>Tool name</div>
            <div className="text-2xl font-semibold text-white">{rt.name}</div>
            <p className="mt-2 text-[17px] leading-[1.75] text-zinc-100">{rt.concept}</p>
          </div>
          {[["How to use it", rt.howToUse], ["When to pass it on", rt.whenToPassOn], ["Pass-on instructions", rt.passOnInstructions]].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ))}
        </div>
      );
    },
    // Tab 5: Accountability Questions
    () => {
      const qs = output.accountabilityQuestions as string[] | undefined;
      if (!qs) return null;
      return (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300 mb-4">These questions go to the heart beneath the behavior. Not behavior modification — genuine repentance and lasting change.</p>
          {qs.map((q, i) => (
            <div key={i} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] mb-2" style={{ color: blue }}>Q{i + 1}</div>
              <p className="text-[17px] leading-[1.75] text-white">{q}</p>
            </div>
          ))}
        </div>
      );
    },
    // Tab 6: Obedience Challenge
    () => {
      const oc = output.obedienceChallenge as Record<string, string> | undefined;
      if (!oc) return null;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.4rem] p-6" style={{ background: blue + "15", border: `1px solid ${blue}30` }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: blue }}>The challenge</div>
            <p className="text-xl font-semibold text-white leading-snug">{oc.theChallenge}</p>
          </div>
          {[["Timing", oc.timing], ["Scripture connection", oc.scriptureConnection], ["Directionality", oc.directionality]].map(([k, v]) => (
            <Block key={k as string} label={k as string}>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </Block>
          ))}
        </div>
      );
    },
    // Tab 7: CoJourner Guide
    () => {
      const cg = output.coJournerConversationGuide as Record<string, unknown> | undefined;
      if (!cg) return null;
      return (
        <div className="space-y-5">
          <Block label="Relationship context">
            <p className="text-[17px] leading-[1.75] text-zinc-100">{cg.relationshipContext as string}</p>
          </Block>
          {[["Conversation openers", cg.conversationOpeners], ["Spiritual opening questions", cg.spiritualOpeningQuestions]].map(([label, items]) =>
            Array.isArray(items) ? (
              <div key={label as string} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{label as string}</div>
                {(items as string[]).map((item, i) => <Bullet key={i}>{item}</Bullet>)}
              </div>
            ) : null
          )}
          <Block label="Next step — toward a Discovery Bible Study">
            <p className="text-[17px] leading-[1.75] text-zinc-100">{cg.nextStepInvitation as string}</p>
          </Block>
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}


function renderSermonStewardOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const cyan = "#06b6d4";

  function CopyBtn({ content }: { content: string }) {
    return (
      <button onClick={() => navigator.clipboard.writeText(content).catch(() => {})} className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition">
        <Copy className="h-3 w-3" /> Copy
      </button>
    );
  }

  const tabMap = [
    // Tab 0: Big Idea
    () => (
      <div className="space-y-5">
        <div className="rounded-[1.4rem] border border-white/10 bg-[#0d0f14] p-7">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: cyan }}>Big Idea</div>
          <div className="flex items-start justify-between gap-4">
            <p className="text-2xl font-semibold text-white leading-snug">{output.bigIdea as string}</p>
            <CopyBtn content={output.bigIdea as string ?? ""} />
          </div>
        </div>
        <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">3-sentence summary</div>
            <CopyBtn content={output.summary as string ?? ""} />
          </div>
          <p className="text-[17px] leading-[1.8] text-zinc-100">{output.summary as string}</p>
        </div>
      </div>
    ),
    // Tab 1: Devotionals
    () => {
      const devs = output.devotionals as Array<{ day: string; title: string; scripture: string; reflection: string; prayer: string }> | undefined;
      if (!devs) return null;
      return (
        <div className="space-y-5">
          {devs.map((d) => (
            <div key={d.day} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">{d.day}</div>
                  <div className="mt-1 text-lg font-semibold text-white">{d.title}</div>
                  <div className="mt-0.5 text-sm italic text-zinc-300">{d.scripture}</div>
                </div>
                <CopyBtn content={`${d.title}
${d.scripture}

${d.reflection}

${d.prayer}`} />
              </div>
              <p className="text-[17px] leading-[1.8] text-zinc-100 mt-3">{d.reflection}</p>
              <div className="mt-4 rounded-[0.8rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1.5">Prayer</div>
                <p className="text-[16px] leading-[1.75] text-zinc-100 italic">{d.prayer}</p>
              </div>
            </div>
          ))}
        </div>
      );
    },
    // Tab 2: Small Group
    () => {
      const sg = output.smallGroupGuide as Record<string, unknown> | undefined;
      if (!sg) return null;
      return (
        <div className="space-y-5">
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">Icebreaker</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{sg.icebreaker as string}</p>
          </div>
          {(["reviewQuestions", "discussionQuestions"] as const).map((key) => {
            const label = key === "reviewQuestions" ? "Review questions" : "Discussion questions";
            const items = sg[key] as string[];
            return Array.isArray(items) ? (
              <div key={key} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{label}</div>
                {items.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: cyan }} />
                    <span className="text-[17px] leading-[1.7] text-zinc-100">{q}</span>
                  </div>
                ))}
              </div>
            ) : null;
          })}
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">Application challenge</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{sg.applicationChallenge as string}</p>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5" style={{ borderColor: cyan + "30" }}>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: cyan }}>CoJourner prayer prompt</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{sg.coJournerPrayerPrompt as string}</p>
          </div>
        </div>
      );
    },
    // Tab 3: Social Media
    () => {
      const sm = output.socialMedia as Record<string, string> | undefined;
      if (!sm) return null;
      return (
        <div className="space-y-4">
          {[["Instagram", sm.instagram], ["Facebook", sm.facebook], ["X / Twitter", sm.twitter], ["Instagram Story", sm.instagramStory]].map(([platform, content]) => (
            <div key={platform as string} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{platform as string}</div>
                <CopyBtn content={content as string ?? ""} />
              </div>
              <p className="text-[17px] leading-[1.75] text-zinc-100 whitespace-pre-wrap">{content as string}</p>
            </div>
          ))}
        </div>
      );
    },
    // Tab 4: Email
    () => {
      const em = output.emailNewsletter as Record<string, string> | undefined;
      if (!em) return null;
      return (
        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Subject line</div>
              <CopyBtn content={em.subjectLine ?? ""} />
            </div>
            <p className="text-[17px] font-medium text-white">{em.subjectLine}</p>
            {em.previewText && <p className="mt-1 text-sm text-zinc-300 italic">Preview: {em.previewText}</p>}
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Body copy</div>
              <CopyBtn content={em.body ?? ""} />
            </div>
            <p className="text-[17px] leading-[1.85] text-zinc-100 whitespace-pre-wrap">{em.body}</p>
          </div>
          {em.callToAction && (
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1">Call to action</div>
              <p className="text-[17px] text-zinc-100">{em.callToAction}</p>
            </div>
          )}
          {em.closing && (
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1">Closing</div>
              <p className="text-[17px] italic text-zinc-100">{em.closing}</p>
            </div>
          )}
        </div>
      );
    },
    // Tab 5: Youth
    () => {
      const y = output.youthVersion as Record<string, unknown> | undefined;
      if (!y) return null;
      return (
        <div className="space-y-5">
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: cyan }}>Teen Big Idea</div>
            <p className="text-xl font-semibold text-white">{y.bigIdea as string}</p>
          </div>
          {[["Opening illustration", y.openingIllustration], ["Main point", y.mainPoint], ["Weekly challenge", y.weeklyChallenge], ["Memory verse", y.memoryVerse]].map(([k, v]) => (
            <div key={k as string} className="rounded-[1rem] border border-white/8 bg-[#0d0f14] px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1.5">{k as string}</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </div>
          ))}
          {Array.isArray(y.discussionQuestions) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Discussion questions</div>
              {(y.discussionQuestions as string[]).map((q, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: cyan }} />
                  <span className="text-[17px] leading-[1.7] text-zinc-100">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
    // Tab 6: Children
    () => {
      const ch = output.childrensVersionHandoff as Record<string, string> | undefined;
      if (!ch) return null;
      return (
        <div className="space-y-4">
          <p className="text-sm text-zinc-300">This handoff feeds directly into Family Discipleship for full program development.</p>
          {[["Big Idea (8 words or fewer)", ch.bigIdea], ["Object lesson concept", ch.objectLessonConcept], ["Memory verse", ch.memoryVerse], ["Take-home point", ch.takeHomePoint]].map(([k, v]) => (
            <div key={k as string} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{k as string}</div>
                <CopyBtn content={v as string ?? ""} />
              </div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </div>
          ))}
        </div>
      );
    },
    // Tab 7: Bulletin
    () => {
      const b = output.bulletinInsert as Record<string, unknown> | undefined;
      if (!b) return null;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">{b.title as string}</h3>
            <CopyBtn content={JSON.stringify(b, null, 2)} />
          </div>
          <p className="text-sm italic text-zinc-300">{b.keyVerse as string}</p>
          {Array.isArray(b.outline) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Outline</div>
              {(b.outline as string[]).map((pt, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span className="text-xs font-bold" style={{ color: cyan }}>{i + 1}</span>
                  <span className="text-[17px] leading-[1.7] text-zinc-100">{pt}</span>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(b.fillInBlanks) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Fill-in-the-blank notes</div>
              {(b.fillInBlanks as string[]).map((item, i) => (
                <div key={i} className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[16px] text-zinc-100">{item}</p>
                </div>
              ))}
            </div>
          )}
          {[["Takeaway", b.takeaway], ["Weekly challenge", b.weeklyChallenge]].map(([k, v]) => (
            <div key={k as string} className="rounded-[1rem] border border-white/8 bg-[#0d0f14] px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1">{k as string}</div>
              <p className="text-[17px] text-zinc-100">{v as string}</p>
            </div>
          ))}
        </div>
      );
    },
    // Tab 8: Series
    () => {
      const series = output.seriesOutline as Array<{ week: number; title: string; passage: string; focus: string; arcConnection: string }> | undefined;
      if (!series) return null;
      return (
        <div className="space-y-4">
          {series.map((w) => (
            <div key={w.week} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0" style={{ background: cyan }}>W{w.week}</div>
                <div className="text-base font-semibold text-white">{w.title}</div>
                {w.week === 1 && <span className="ml-auto text-xs rounded-full px-2 py-0.5 font-semibold" style={{ background: cyan + "20", color: cyan }}>This week</span>}
              </div>
              {[["Passage", w.passage], ["Focus", w.focus], ["Series arc", w.arcConnection]].map(([k, v]) => (
                <div key={k} className="mt-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300">{k}: </span>
                  <span className="text-[16px] text-zinc-100">{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    },
    // Tab 9: Prayer
    () => {
      const pm = output.prayerAndMissions as Record<string, unknown> | undefined;
      if (!pm) return null;
      return (
        <div className="space-y-5">
          {Array.isArray(pm.prayerPoints) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Prayer points</div>
              {(pm.prayerPoints as string[]).map((pt, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: cyan }} />
                  <span className="text-[17px] leading-[1.7] text-zinc-100">{pt}</span>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">Missions connection</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{pm.missionsConnection as string}</p>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5" style={{ borderColor: cyan + "30" }}>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: cyan }}>Unreached people group to pray for this week</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{pm.unreachedPrompt as string}</p>
          </div>
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}


function renderNewBelieverCareOutput(output: Record<string, unknown>, activeTab: number): React.ReactNode {
  const green = "#22c55e";
  const tabMap = [
    // Tab 0: 30-Day Plan
    () => {
      const plan = output.thirtyDayPlan as Record<string, Record<string, string>> | undefined;
      if (!plan) return null;
      return (
        <div className="space-y-5">
          {(["week1", "week2", "week3", "week4"] as const).map((wk, i) => {
            const w = plan[wk];
            if (!w) return null;
            return (
              <div key={wk} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: green }}>W{i + 1}</div>
                  <div className="text-lg font-semibold text-white">{w.theme}</div>
                </div>
                <div className="text-sm font-medium text-zinc-300 mb-1">Scripture anchor</div>
                <p className="text-[16px] italic text-zinc-100 mb-4">{w.scripture}</p>
                {[["Care team action", w.careTeamAction], ["Check-in question", w.checkInQuestion], ["Assignment for them", w.newBelieverAssignment]].map(([k, v]) => (
                  <div key={k as string} className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1">{k as string}</div>
                    <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    },
    // Tab 1: Welcome Letter
    () => {
      const letter = output.welcomeLetter as Record<string, string> | undefined;
      if (!letter) return null;
      return (
        <div className="space-y-4">
          <div className="rounded-[1rem] border border-white/10 bg-[#0d0f14] px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">Subject line</div>
            <p className="text-[17px] text-white font-medium">{letter.subject}</p>
          </div>
          <div className="rounded-[1rem] border border-white/10 bg-[#0d0f14] px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Letter body</div>
              <button onClick={() => navigator.clipboard.writeText(letter.body ?? "").catch(() => {})} className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition">
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <p className="text-[17px] leading-[1.85] text-zinc-100 whitespace-pre-wrap">{letter.body}</p>
          </div>
        </div>
      );
    },
    // Tab 2: First Steps Curriculum
    () => {
      const curr = output.firstStepsCurriculum as { track?: string; topics?: Array<{ title: string; summary: string; keyScripture: string; discussionQuestion: string }> } | undefined;
      if (!curr) return null;
      return (
        <div className="space-y-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">{curr.track}</div>
          {curr.topics?.map((t, i) => (
            <div key={i} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="text-base font-semibold text-white mb-3">{i + 1}. {t.title}</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1">Teaching summary</div>
                  <p className="text-[16px] leading-[1.75] text-zinc-100">{t.summary}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 mb-1">Key scripture</div>
                  <p className="text-[16px] italic text-zinc-100">{t.keyScripture}</p>
                </div>
                <div className="rounded-[0.8rem] border border-green-400/20 bg-green-400/[0.05] px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-green-300 mb-1">Discussion question</div>
                  <p className="text-[16px] leading-[1.7] text-zinc-100">{t.discussionQuestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    },
    // Tab 3: Baptism Prep
    () => {
      const bap = output.baptismPrep as Record<string, unknown> | undefined;
      if (!bap) return null;
      return (
        <div className="space-y-5">
          {[["What baptism means", bap.theologySummary], ["When to have this conversation", bap.timing], ["How to write their testimony", bap.testimonyFramework], ["What to expect on the day", bap.whatToExpect]].map(([k, v]) => (
            <div key={k as string} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{k as string}</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </div>
          ))}
          {Array.isArray(bap.readinessQuestions) && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">Readiness questions</div>
              {(bap.readinessQuestions as string[]).map((q, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: green }} />
                  <span className="text-[17px] leading-[1.7] text-zinc-100">{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
    // Tab 4: Assimilation Pathway
    () => {
      const steps = output.assimilationPathway as Array<{ step: number; title: string; timing: string; action: string; goal: string }> | undefined;
      if (!steps) return null;
      return (
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.step} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0" style={{ background: green }}>{s.step}</div>
                <div className="text-base font-semibold text-white">{s.title}</div>
              </div>
              {[["When", s.timing], ["Action", s.action], ["Goal", s.goal]].map(([k, v]) => (
                <div key={k} className="mt-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-300">{k}: </span>
                  <span className="text-[16px] leading-[1.7] text-zinc-100">{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    },
    // Tab 5: Care Notes
    () => {
      const notes = output.pastoralCareNotes as Record<string, unknown> | undefined;
      if (!notes) return null;
      const renderList = (label: string, items: unknown) => Array.isArray(items) ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">{label}</div>
          {(items as string[]).map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-yellow-400/60" />
              <span className="text-[17px] leading-[1.7] text-zinc-100">{item}</span>
            </div>
          ))}
        </div>
      ) : null;
      return (
        <div className="space-y-5">
          {renderList("Common fears", notes.commonFears)}
          {renderList("Common questions", notes.commonQuestions)}
          {renderList("Common temptations", notes.commonTemptations)}
          <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">How to respond</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{notes.howToRespond as string}</p>
          </div>
          <div className="rounded-[1.2rem] border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300 mb-2">Warning signals — watch for drift</div>
            <p className="text-[17px] leading-[1.75] text-zinc-100">{notes.warningSignals as string}</p>
          </div>
        </div>
      );
    },
    // Tab 6: Family Bridge
    () => {
      const fam = output.familyDevotionalBridge as Record<string, unknown> | undefined;
      if (!fam) return null;
      if (fam.applicable === false) return (
        <div className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-6 text-zinc-100 text-[17px]">
          Not applicable for this individual's situation.
        </div>
      );
      return (
        <div className="space-y-4">
          {[["Week one daily rhythm", fam.weekOneRoutine], ["Opening dinner table question", fam.openingQuestion], ["First scripture to read together", fam.firstScripture], ["Simple family prayer", fam.familyPrayer]].map(([k, v]) => (
            <div key={k as string} className="rounded-[1.2rem] border border-white/10 bg-[#0d0f14] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 mb-2">{k as string}</div>
              <p className="text-[17px] leading-[1.75] text-zinc-100">{v as string}</p>
            </div>
          ))}
        </div>
      );
    },
  ];
  return tabMap[activeTab]?.() ?? null;
}


const agentOutputRenderers: Partial<Record<string, (output: Record<string, unknown>, activeTab: number) => React.ReactNode>> = {
  harvest_guide: renderHarvestGuideOutput,
  new_believer_care: renderNewBelieverCareOutput,
  sermon_steward: renderSermonStewardOutput,
  disciple_guide: renderDiscipleGuideOutput,
  family_discipleship: renderFamilyDiscipleshipOutput,
  leader_development: renderLeaderDevelopmentOutput,
  prayer_care: renderPrayerCareOutput,
  field_planner: renderFieldPlannerOutput,
};

// ─── Church Profile Setup Page ──────────────────────────────────────

function ChurchProfilePage({ user }: { user: SessionUser }) {
  const [form, setForm] = useState({
    church_name: "",
    weekly_attendance: "",
    community_town: "",
    community_state: "",
    community_classification: "",
    community_population: "",
    community_median_income: "",
    community_population_trend: "",
    community_distance_to_city: "",
    is_bivocational: false,
    has_childrens_ministry: false,
    has_youth_ministry: false,
    percent_under_18: "",
    percent_18_to_35: "",
    percent_35_to_55: "",
    percent_55_plus: "",
    ethnic_composition: "",
    socioeconomic_background: "",
    preaching_style: "expository",
    community_primary_industries: "",
    community_ethnic_demographics: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    apiGet<{ churchProfile: Record<string, unknown> | null }>("/api/church-profile").then((d) => {
      if (d.churchProfile) setForm((f) => ({ ...f, ...(d.churchProfile as Record<string, string | number | boolean>) }));
    });
  }, [user]);

  const [censusFilled, setCensusFilled] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { ...form };
      ["weekly_attendance", "community_population", "community_median_income", "community_distance_to_city", "percent_under_18", "percent_18_to_35", "percent_35_to_55", "percent_55_plus"].forEach((k) => {
        if (payload[k] !== "" && payload[k] !== undefined) payload[k] = Number(payload[k]);
      });
      const result = await apiPost<{ ok: boolean; censusFilled?: boolean }>("/api/church-profile", payload);
      setSaved(true);
      if (result.censusFilled) setCensusFilled(true);
      setTimeout(() => { setSaved(false); setCensusFilled(false); }, 4000);
    } catch {
      setError("Save failed. Try again.");
    }
    setSaving(false);
  }

  if (!user) return <Redirect to="/login" />;

  return (
    <>
      <Header user={user} />
      <div className="container py-10">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Church profile</div>
          <h1 className="mt-3 text-4xl font-semibold text-white">Tell us about your church and community</h1>
          <p className="mt-4 max-w-2xl text-[18px] leading-[1.75] text-zinc-100">
            This information shapes every agent output. The more accurate it is, the more specific and useful the results will be for your actual context.
          </p>
        </div>
        <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-2">
          {/* Church basics */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7">
            <h2 className="mb-5 text-xl font-semibold text-white">Church information</h2>
            <div className="space-y-4">
              <FormField label="Church name">
                <input className="field-input" value={form.church_name} onChange={(e) => setForm((f) => ({ ...f, church_name: e.target.value }))} placeholder="First Baptist Church" />
              </FormField>
              <FormField label="Weekly attendance">
                <input className="field-input" type="number" value={form.weekly_attendance} onChange={(e) => setForm((f) => ({ ...f, weekly_attendance: e.target.value }))} placeholder="75" />
              </FormField>
              <FormField label="Preaching style">
                <select className="field-input" value={form.preaching_style} onChange={(e) => setForm((f) => ({ ...f, preaching_style: e.target.value }))}>
                  <option value="expository">Expository</option>
                  <option value="topical">Topical</option>
                  <option value="narrative">Narrative</option>
                  <option value="mixed">Mixed</option>
                </select>
              </FormField>
              <FormField label="Ethnic composition of congregation">
                <input className="field-input" value={form.ethnic_composition} onChange={(e) => setForm((f) => ({ ...f, ethnic_composition: e.target.value }))} placeholder="Primarily white, growing Latino population" />
              </FormField>
              <FormField label="Socioeconomic background">
                <select className="field-input" value={form.socioeconomic_background} onChange={(e) => setForm((f) => ({ ...f, socioeconomic_background: e.target.value }))}>
                  <option value="">Select...</option>
                  <option value="low_income">Primarily low income</option>
                  <option value="working_class">Working class</option>
                  <option value="mixed">Mixed</option>
                  <option value="middle_class">Middle class</option>
                  <option value="upper_middle">Upper middle class</option>
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="% Under 18"><input className="field-input" type="number" min="0" max="100" value={form.percent_under_18} onChange={(e) => setForm((f) => ({ ...f, percent_under_18: e.target.value }))} placeholder="20" /></FormField>
                <FormField label="% Ages 18–35"><input className="field-input" type="number" min="0" max="100" value={form.percent_18_to_35} onChange={(e) => setForm((f) => ({ ...f, percent_18_to_35: e.target.value }))} placeholder="25" /></FormField>
                <FormField label="% Ages 35–55"><input className="field-input" type="number" min="0" max="100" value={form.percent_35_to_55} onChange={(e) => setForm((f) => ({ ...f, percent_35_to_55: e.target.value }))} placeholder="30" /></FormField>
                <FormField label="% Ages 55+"><input className="field-input" type="number" min="0" max="100" value={form.percent_55_plus} onChange={(e) => setForm((f) => ({ ...f, percent_55_plus: e.target.value }))} placeholder="25" /></FormField>
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-100">
                  <input type="checkbox" checked={form.is_bivocational} onChange={(e) => setForm((f) => ({ ...f, is_bivocational: e.target.checked }))} className="h-4 w-4 rounded" />
                  Bi-vocational pastor
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-100">
                  <input type="checkbox" checked={form.has_childrens_ministry} onChange={(e) => setForm((f) => ({ ...f, has_childrens_ministry: e.target.checked }))} className="h-4 w-4 rounded" />
                  Children's ministry
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-100">
                  <input type="checkbox" checked={form.has_youth_ministry} onChange={(e) => setForm((f) => ({ ...f, has_youth_ministry: e.target.checked }))} className="h-4 w-4 rounded" />
                  Youth ministry
                </label>
              </div>
            </div>
          </div>

          {/* Community data */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7">
            <h2 className="mb-5 text-xl font-semibold text-white">Community context</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Town / City"><input className="field-input" value={form.community_town} onChange={(e) => setForm((f) => ({ ...f, community_town: e.target.value }))} placeholder="Oswego" /></FormField>
                <FormField label="State"><input className="field-input" value={form.community_state} onChange={(e) => setForm((f) => ({ ...f, community_state: e.target.value }))} placeholder="KS" /></FormField>
              </div>
              <FormField label="Community classification">
                <select className="field-input" value={form.community_classification} onChange={(e) => setForm((f) => ({ ...f, community_classification: e.target.value }))}>
                  <option value="">Select...</option>
                  <option value="rural_small">Rural small town (under 2,500)</option>
                  <option value="rural_large">Rural large town (2,500–10,000)</option>
                  <option value="suburban_small">Suburban small (10,000–50,000)</option>
                  <option value="suburban_large">Suburban large (50,000–250,000)</option>
                  <option value="urban">Urban (250,000+)</option>
                </select>
              </FormField>
              <FormField label="Community population">
                <input className="field-input" type="number" value={form.community_population} onChange={(e) => setForm((f) => ({ ...f, community_population: e.target.value }))} placeholder="1700" />
              </FormField>
              <FormField label="Median household income ($)">
                <input className="field-input" type="number" value={form.community_median_income} onChange={(e) => setForm((f) => ({ ...f, community_median_income: e.target.value }))} placeholder="38000" />
              </FormField>
              <FormField label="Population trend">
                <select className="field-input" value={form.community_population_trend} onChange={(e) => setForm((f) => ({ ...f, community_population_trend: e.target.value }))}>
                  <option value="">Select...</option>
                  <option value="growing_fast">Growing fast</option>
                  <option value="growing_slow">Growing slowly</option>
                  <option value="stable">Stable</option>
                  <option value="declining_slow">Declining slowly</option>
                  <option value="declining_fast">Declining fast</option>
                </select>
              </FormField>
              <FormField label="Miles to nearest city of 50,000+">
                <input className="field-input" type="number" value={form.community_distance_to_city} onChange={(e) => setForm((f) => ({ ...f, community_distance_to_city: e.target.value }))} placeholder="45" />
              </FormField>
              <FormField label="Primary industries">
                <input className="field-input" value={form.community_primary_industries} onChange={(e) => setForm((f) => ({ ...f, community_primary_industries: e.target.value }))} placeholder="Agriculture, manufacturing, healthcare" />
              </FormField>
              <FormField label="Community ethnic demographics">
                <input className="field-input" value={form.community_ethnic_demographics} onChange={(e) => setForm((f) => ({ ...f, community_ethnic_demographics: e.target.value }))} placeholder="92% white, 6% Hispanic/Latino, 2% other" />
              </FormField>
            </div>
          </div>

          <div className="lg:col-span-2 flex items-center gap-4">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save church profile"}
            </button>
            {saved && <span className="text-sm text-green-400">Saved.</span>}
            {censusFilled && (
              <span className="text-xs text-cyan-300">
                Community data auto-filled from US Census Bureau ACS 2022 5-Year Estimates.
              </span>
            )}
            {error && <span className="text-sm text-red-400">{error}</span>}
            <Link href="/app/agents" className="btn-secondary ml-auto">Continue to agents</Link>
          </div>
        </form>
      </div>
      <PublicFooter user={user} />
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-200">{label}</span>
      {children}
    </label>
  );
}

// ─── Agent Hub (authenticated) ─────────────────────────────────────

function AgentHubPage({ user }: { user: SessionUser }) {
  if (!user) return <Redirect to="/login" />;
  return (
    <>
      <Header user={user} />
      <div className="container py-10">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Ministry agents</div>
          <h1 className="mt-3 text-4xl font-semibold text-white">Your agent team</h1>
          <p className="mt-4 max-w-2xl text-[18px] leading-[1.75] text-zinc-100">
            Each agent takes your specific ministry context and returns complete, pastor-ready outputs. Fill out the church profile first so the outputs are specific to your field.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {agentRegistry.map((agent) => (
            <Link
              key={agent.id}
              href={`/app/agents/${agent.id}`}
              className="group block rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
              style={{ borderColor: agent.color + "30" }}
            >
              <div className="text-3xl">{agent.icon}</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-lg font-semibold text-white">{agent.name}</div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ background: agent.color + "20", color: agent.color }}
                >
                  {agent.tier}
                </span>
              </div>
              <div className="mt-2 text-sm leading-[1.6] text-zinc-100">{agent.tagline}</div>
              <div className="mt-4 text-[14px] leading-[1.65] text-zinc-200">{agent.description}</div>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-medium" style={{ color: agent.color }}>
                Open agent <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/[0.02] px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium text-zinc-200">Church profile</div>
              <div className="mt-0.5 text-[15px] text-zinc-100">Agent outputs are shaped by your church and community context. Keep it accurate.</div>
            </div>
            <Link href="/app/church-profile" className="btn-secondary shrink-0">Edit church profile</Link>
          </div>
        </div>
      </div>
      <PublicFooter user={user} />
    </>
  );
}

// ─── Agent Workspace Page ──────────────────────────────────────────

function AgentWorkspacePage({ user }: { user: SessionUser }) {
  const params = useParams<{ agentId: string }>();
  const agentId = params?.agentId as string;
  const agent = agentRegistry.find((a) => a.id === agentId);

  const [activeTab, setActiveTab] = useState(0);
  const [fields, setFields] = useState<Record<string, string | boolean>>({});
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Array<{ id: string; created_at: string; output_json: Record<string, unknown> }>>([]);

  useEffect(() => {
    if (!user || !agentId) return;
    apiGet<{ outputs: Array<{ id: string; created_at: string; output_json: Record<string, unknown> }> }>(`/api/agent/outputs?agentId=${agentId}`).then((d) => {
      if (d.outputs?.length) {
        setHistory(d.outputs);
        setOutput(d.outputs[0].output_json);
      }
    });
  }, [user, agentId]);

  if (!user) return <Redirect to="/login" />;
  if (!agent) return <Redirect to="/app/agents" />;

  const inputFields = agentInputConfig[agentId];
  const hasInputConfig = inputFields && inputFields.length > 0;

  function isFormReady() {
    if (!hasInputConfig) return Object.values(fields).some((v) => String(v).trim().length > 0);
    return inputFields!.some((f) => String(fields[f.key] ?? "").trim().length > 0);
  }

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormReady()) return;
    setRunning(true);
    setError("");
    try {
      const inputData = hasInputConfig
        ? { ...fields, agentId }
        : { prompt: fields._text ?? "", agentId };

      const result = await apiPost<{ id?: string; output?: Record<string, unknown>; error?: string }>("/api/agent/run", {
        agentId: agent!.id,
        inputData,
      });
      if (result.error === "upgrade_required") {
        setError("This agent requires a higher subscription tier.");
      } else if (result.error === "limit_reached") {
        setError("You have reached your monthly limit for this agent.");
      } else if (result.output) {
        setOutput(result.output);
        setHistory((h) => [{ id: result.id ?? "", created_at: new Date().toISOString(), output_json: result.output! }, ...h]);
        setActiveTab(0);
      } else {
        setError(result.error || "Something went wrong.");
      }
    } catch {
      setError("The run failed. Try again.");
    }
    setRunning(false);
  }

  function copyOutput() {
    if (!output) return;
    const val = Object.values(output)[activeTab];
    const text = typeof val === "string" ? val : JSON.stringify(val, null, 2);
    navigator.clipboard.writeText(text).catch(() => {});
  }

  // Generic fallback renderer for agents without a custom renderer
  function renderGeneric(val: unknown): React.ReactNode {
    if (val === null || val === undefined || val === "") return <span className="text-zinc-400 italic">No output for this tab yet.</span>;
    if (typeof val === "string") return <p className="text-[17px] leading-[1.75] text-zinc-100 whitespace-pre-wrap">{val}</p>;
    if (Array.isArray(val)) return (
      <ul className="space-y-3">
        {(val as unknown[]).map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/50" />
            <span className="text-[17px] leading-[1.7] text-zinc-100">{typeof item === "string" ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    );
    if (typeof val === "object") return (
      <div className="space-y-4">
        {Object.entries(val as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">{k.replace(/_/g, " ")}</div>
            {renderGeneric(v)}
          </div>
        ))}
      </div>
    );
    return <span className="text-zinc-100">{String(val)}</span>;
  }

  const customRenderer = agentOutputRenderers[agentId];
  const tabLabels = agent.tabs;

  return (
    <>
      <Header user={user} />
      <div className="container py-8">
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <Link href="/app/agents" className="text-zinc-300 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="text-3xl">{agent.icon}</div>
          <div>
            <h1 className="text-3xl font-semibold text-white">{agent.name}</h1>
            <p className="mt-0.5 text-[16px] text-zinc-100">{agent.tagline}</p>
          </div>
          <span
            className="ml-auto rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ background: agent.color + "20", color: agent.color }}
          >
            {agent.tier} plan
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
          {/* Input panel */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-5 text-lg font-semibold text-white">Input</h2>
            <form onSubmit={handleRun} className="space-y-5">
              {hasInputConfig ? (
                inputFields!.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-200">{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        className="field-input resize-y"
                        rows={field.rows ?? 3}
                        value={(fields[field.key] as string) ?? ""}
                        onChange={(e) => setFields((f) => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === "select" ? (
                      <select
                        className="field-input"
                        value={(fields[field.key] as string) ?? ""}
                        onChange={(e) => setFields((f) => ({ ...f, [field.key]: e.target.value }))}
                      >
                        <option value="">Select...</option>
                        {field.options.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="field-input"
                        value={(fields[field.key] as string) ?? ""}
                        onChange={(e) => setFields((f) => ({ ...f, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                      />
                    )}
                  </label>
                ))
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-200">Describe what you need</span>
                  <textarea
                    className="field-input min-h-[180px] resize-y"
                    value={(fields._text as string) ?? ""}
                    onChange={(e) => setFields((f) => ({ ...f, _text: e.target.value }))}
                    placeholder={`Tell ${agent.name} what you are working on...`}
                  />
                </label>
              )}

              {error && (
                <div className="rounded-[1rem] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={running || !isFormReady()}
                style={running ? {} : { background: agent.color }}
              >
                {running ? "Running..." : `Run ${agent.name}`}
              </button>
            </form>

            {history.length > 1 && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">Previous runs</div>
                <div className="space-y-2">
                  {history.slice(1, 6).map((h) => (
                    <button
                      key={h.id}
                      onClick={() => { setOutput(h.output_json); setActiveTab(0); }}
                      className="w-full rounded-[1rem] border border-white/8 bg-white/[0.02] px-4 py-3 text-left text-sm text-zinc-100 hover:bg-white/[0.05] transition"
                    >
                      {new Date(h.created_at).toLocaleDateString()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Output panel */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Output</h2>
              {output && (
                <button onClick={copyOutput} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/[0.05] transition">
                  <Copy className="h-3.5 w-3.5" /> Copy tab
                </button>
              )}
            </div>

            {output && (
              <div className="mb-5 flex flex-wrap gap-2">
                {tabLabels.map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setActiveTab(i)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      activeTab === i
                        ? "text-white"
                        : "border border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"
                    }`}
                    style={activeTab === i ? { background: agent.color } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="min-h-[320px]">
              {running ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="mb-3 text-4xl">{agent.icon}</div>
                    <div className="text-[17px] text-zinc-100">{agent.name} is working...</div>
                  </div>
                </div>
              ) : output ? (
                <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1019] p-6">
                  {customRenderer
                    ? customRenderer(output, activeTab)
                    : renderGeneric(Object.values(output)[activeTab])}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20 text-center">
                  <div>
                    <div className="mb-3 text-4xl">{agent.icon}</div>
                    <div className="text-[17px] text-zinc-100">Fill in the input and run the agent.</div>
                    <div className="mt-2 text-sm text-zinc-300">{agent.description}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PublicFooter user={user} />
    </>
  );
}
