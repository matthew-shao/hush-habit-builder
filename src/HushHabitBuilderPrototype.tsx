import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Flame,
  Target,
  Trophy,
  Bell,
  Calendar,
  ArrowRight,
  TrendingUp,
  CircleDollarSign,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const depositHistory = [
  { week: "Feb 2", amount: 25, completed: true },
  { week: "Feb 9", amount: 25, completed: true },
  { week: "Feb 16", amount: 25, completed: true },
  { week: "Feb 23", amount: 25, completed: true },
  { week: "Mar 1", amount: 25, completed: true },
  { week: "Mar 8", amount: 25, completed: true },
  { week: "Mar 15", amount: 25, completed: false },
];

const badges = [
  { title: "First Deposit", description: "Started your investing journey", earned: true },
  { title: "4-Week Streak", description: "Stayed consistent for a full month", earned: true },
  { title: "$500 Invested", description: "Crossed your first big milestone", earned: true },
  { title: "3-Month Streak", description: "Consistency is becoming a habit", earned: false },
];

const insights = [
  "You’ve invested for 6 weeks in a row before your recent miss.",
  "Increasing your weekly deposit by $10 could help you hit your goal about 2 months earlier.",
  "Your strongest engagement is on Fridays, so Friday reminders may work best.",
];

const navItems = [
  { key: "dashboard", label: "Home", icon: Home },
  { key: "streaks", label: "Streaks", icon: Flame },
  { key: "goals", label: "Goals", icon: Target },
  { key: "milestones", label: "Milestones", icon: Trophy },
  { key: "insights", label: "Insights", icon: Bell },
];

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export default function HushHabitBuilderPrototype() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [recoveryAccepted, setRecoveryAccepted] = useState(false);

  const currentStreak = 6;
  const longestStreak = 8;
  const monthlyGoal = 150;
  const monthContributed = 100;
  const invested = 640;
  const goalTarget = 2000;
  const nextDeposit = "Fri, Mar 27";

  const goalProgress = useMemo(() => Math.round((invested / goalTarget) * 100), [invested, goalTarget]);
  const monthProgress = useMemo(() => Math.round((monthContributed / monthlyGoal) * 100), [monthContributed, monthlyGoal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="rounded-[28px] bg-slate-900 text-white p-6 md:p-8 shadow-lg">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Hush Habit Builder</p>
                <h1 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight">
                  Help users stay consistent with long-term investing.
                </h1>
                <p className="mt-3 max-w-2xl text-slate-300 text-sm md:text-base">
                  A React prototype for streaks, goals, milestone feedback, and missed-deposit recovery.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:w-[320px]">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-300">Current streak</p>
                  <p className="mt-1 text-2xl font-semibold">{currentStreak} weeks</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-300">Goal progress</p>
                  <p className="mt-1 text-2xl font-semibold">{goalProgress}%</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-300">Next deposit</p>
                  <p className="mt-1 text-2xl font-semibold">$25</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-300">Milestones earned</p>
                  <p className="mt-1 text-2xl font-semibold">3 / 4</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px,1fr]">
          <Card className="rounded-3xl border-0 shadow-sm bg-white/85 backdrop-blur h-fit">
            <CardContent className="p-3">
              <div className="space-y-1">
                {navItems.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition flex items-center gap-3 ${
                      activeTab === key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === "dashboard" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard title="Current streak" value="6 weeks" subtitle="1 miss this month" icon={Flame} />
                  <StatCard title="This month" value={`$${monthContributed} / $${monthlyGoal}`} subtitle="67% of monthly target" icon={CircleDollarSign} />
                  <StatCard title="Goal progress" value={`$${invested}`} subtitle={`Toward $${goalTarget} goal`} icon={Target} />
                  <StatCard title="Next deposit" value="$25" subtitle={nextDeposit} icon={Calendar} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-6">
                  <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                    <CardHeader>
                      <SectionHeader
                        title="Monthly consistency"
                        subtitle="Track progress toward a recurring investing habit"
                      />
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <div className="mb-2 flex justify-between text-sm text-slate-600">
                          <span>March contribution goal</span>
                          <span>{monthProgress}%</span>
                        </div>
                        <Progress value={monthProgress} className="h-3" />
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {depositHistory.map((item) => (
                          <div
                            key={item.week}
                            className={`rounded-2xl p-3 text-center text-xs border ${
                              item.completed
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            <p className="font-medium">{item.week}</p>
                            <p className="mt-1">{item.completed ? "$25" : "Missed"}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                    <CardHeader>
                      <SectionHeader
                        title="Missed deposit recovery"
                        subtitle="A gentle path back to consistency"
                      />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-sm text-slate-700 leading-6">
                          You missed your March 15 deposit. Staying consistent matters more than being perfect.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-2xl border p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">Catch up with $15 this week</p>
                            <p className="text-sm text-slate-500">Smaller amount, lower friction</p>
                          </div>
                          <Badge variant="secondary">Recommended</Badge>
                        </div>
                        <div className="rounded-2xl border p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">Reschedule full $25 deposit</p>
                            <p className="text-sm text-slate-500">Move it to your next payday</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      <Button
                        className="w-full rounded-2xl"
                        onClick={() => setRecoveryAccepted(true)}
                      >
                        {recoveryAccepted ? "Recovery plan set" : "Accept $15 catch-up plan"}
                      </Button>

                      {recoveryAccepted && (
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-emerald-900">You’re back on track</p>
                            <p className="text-sm text-emerald-700 mt-1">
                              Your catch-up deposit is scheduled for Friday. Your streak can continue if you complete the next two deposits.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "streaks" && (
              <div className="grid grid-cols-1 xl:grid-cols-[0.9fr,1.1fr] gap-6">
                <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                  <CardHeader>
                    <SectionHeader title="Streak stats" subtitle="Consistency over time" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <StatCard title="Current streak" value={`${currentStreak} weeks`} subtitle="Great momentum recently" icon={Flame} />
                    <StatCard title="Longest streak" value={`${longestStreak} weeks`} subtitle="Your personal best" icon={TrendingUp} />
                    <StatCard title="Recovery rate" value="80%" subtitle="After missed contributions" icon={RefreshCcw} />
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                  <CardHeader>
                    <SectionHeader title="Deposit timeline" subtitle="Each block represents a planned weekly deposit" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {depositHistory.map((item, index) => (
                        <div
                          key={item.week}
                          className={`rounded-2xl p-4 border ${
                            item.completed ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-900">Week {index + 1}</p>
                            <Badge variant={item.completed ? "secondary" : "outline"}>
                              {item.completed ? "Completed" : "Missed"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{item.week}</p>
                          <p className="text-lg font-semibold text-slate-900 mt-3">
                            {item.completed ? `$${item.amount}` : "$25 planned"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "goals" && (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr,0.9fr] gap-6">
                <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                  <CardHeader>
                    <SectionHeader title="Down payment goal" subtitle="Tie consistency to something meaningful" />
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="mb-2 flex justify-between text-sm text-slate-600">
                        <span>Goal completion</span>
                        <span>{goalProgress}%</span>
                      </div>
                      <Progress value={goalProgress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Target</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">$2,000</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Current</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">$640</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Projected finish</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">Nov 2026</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border p-4">
                      <p className="font-medium text-slate-900">What would move this goal faster?</p>
                      <p className="text-sm text-slate-600 mt-2 leading-6">
                        Increasing your weekly deposit from $25 to $35 could move your projected completion date up by roughly 8 weeks.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                  <CardHeader>
                    <SectionHeader title="Suggested nudges" subtitle="Examples of PM-friendly intervention ideas" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      "Try a Friday reminder because that’s when your deposits usually succeed.",
                      "Round up your weekly contribution by $5 to hit your goal sooner.",
                      "Celebrate halfway milestones to reinforce long-term behavior.",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 leading-6">
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "milestones" && (
              <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                <CardHeader>
                  <SectionHeader title="Milestones" subtitle="Reward progress without making the app feel childish" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {badges.map((badge) => (
                      <div
                        key={badge.title}
                        className={`rounded-3xl p-5 border ${
                          badge.earned ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Trophy className="h-5 w-5" />
                          <Badge variant={badge.earned ? "secondary" : "outline"}>
                            {badge.earned ? "Earned" : "In progress"}
                          </Badge>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{badge.title}</h3>
                        <p className={`mt-2 text-sm leading-6 ${badge.earned ? "text-slate-300" : "text-slate-500"}`}>
                          {badge.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "insights" && (
              <Card className="rounded-3xl border-0 shadow-sm bg-white/85">
                <CardHeader>
                  <SectionHeader title="Progress insights" subtitle="A few lightweight, user-friendly prompts" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border p-4 flex gap-3">
                      <Bell className="h-4 w-4 text-slate-500 mt-1" />
                      <p className="text-sm text-slate-700 leading-6">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
