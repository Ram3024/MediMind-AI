"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heart, Activity, Droplets, Footprints, Flame,
  Brain, ShoppingBag, Video, Bell, TrendingUp,
  TrendingDown, ArrowRight, Calendar, Clock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { healthMetrics, weeklyData, doctors, notifications, mockUser } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { useAppointmentStore } from "@/store/appointmentStore";

// =============================================
// METRIC CARD COMPONENT
// =============================================
function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendPositive,
  color,
  progress,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  trend: string;
  trendPositive?: boolean;
  color: string;
  progress?: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="metric-card"
      style={{ borderTop: `2px solid ${color}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: trendPositive ? "#22c55e" : trendPositive === false ? "#ef4444" : "#94a3b8" }}
        >
          {trendPositive ? <TrendingUp size={12} /> : trendPositive === false ? <TrendingDown size={12} /> : null}
          {trend}
        </div>
      </div>
      <div className="text-2xl font-display font-black mb-0.5" style={{ color }}>
        {value}
        <span className="text-sm font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>{unit}</span>
      </div>
      <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</div>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      )}
    </motion.div>
  );
}

// =============================================
// QUICK ACTION BUTTON
// =============================================
function QuickAction({
  icon: Icon,
  label,
  href,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <Link href={href}>
        <div className="glass-card p-4 flex flex-col items-center gap-3 cursor-pointer text-center group">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <Icon size={22} style={{ color }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>{label}</span>
        </div>
      </Link>
    </motion.div>
  );
}

// =============================================
// CUSTOM TOOLTIP FOR CHARTS
// =============================================
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: "var(--color-primary)" }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// =============================================
// DASHBOARD PAGE
// =============================================
export default function DashboardPage() {
  const metrics = healthMetrics;
  const { appointments, cancelAppointment } = useAppointmentStore();
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-black">
              Good Morning, <span className="gradient-text">{mockUser.name.split(" ")[0]}! 👋</span>
            </h1>
            <p className="mt-1" style={{ color: "var(--color-text-muted)" }}>
              Here&apos;s your health summary for today, {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/chat">
              <button className="btn-primary flex items-center gap-2 text-sm">
                <Brain size={16} /> Ask AI
              </button>
            </Link>
            <Link href="/doctors">
              <button className="btn-ghost flex items-center gap-2 text-sm">
                <Video size={16} /> Book Consultation
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* AI Health Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 rounded-2xl flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(217,70,239,0.1))",
          border: "1px solid rgba(20,184,166,0.3)",
        }}
      >
        <div className="ai-orb flex-shrink-0" style={{ width: 40, height: 40 }} />
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">💡 AI Health Tip of the Day</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            You&apos;ve been drinking less water lately. Aim for 2.5L today — hydration improves focus, energy, and immunity!
            <Link href="/chat" className="ml-2 text-primary-400 underline">Ask AI for tips →</Link>
          </p>
        </div>
      </motion.div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Heart}
          label="Heart Rate"
          value={metrics.heartRate.current}
          unit="bpm"
          trend={metrics.heartRate.trend}
          trendPositive={undefined}
          color="#ef4444"
          delay={0.1}
        />
        <MetricCard
          icon={Footprints}
          label="Daily Steps"
          value={metrics.steps.current.toLocaleString()}
          unit="/ 10K"
          trend={metrics.steps.trend}
          trendPositive={true}
          color="#14b8a6"
          progress={(metrics.steps.current / metrics.steps.goal) * 100}
          delay={0.15}
        />
        <MetricCard
          icon={Droplets}
          label="Water Intake"
          value={metrics.water.current}
          unit={`/ ${metrics.water.goal}L`}
          trend={metrics.water.trend}
          trendPositive={true}
          color="#3b82f6"
          progress={(metrics.water.current / metrics.water.goal) * 100}
          delay={0.2}
        />
        <MetricCard
          icon={Flame}
          label="Calories Burned"
          value={metrics.calories.burned}
          unit="kcal"
          trend={metrics.calories.trend}
          trendPositive={true}
          color="#f59e0b"
          delay={0.25}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Steps Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Weekly Activity</h3>
            <Link href="/health-tracker">
              <span className="text-xs text-primary-400 flex items-center gap-1 cursor-pointer">
                View all <ArrowRight size={12} />
              </span>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="steps" stroke="#14b8a6" fill="url(#stepsGrad)" strokeWidth={2} name="Steps" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sleep Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="chart-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Sleep Pattern</h3>
            <Link href="/health-tracker">
              <span className="text-xs text-primary-400 flex items-center gap-1 cursor-pointer">
                View all <ArrowRight size={12} />
              </span>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sleep" fill="#d946ef" radius={[4, 4, 0, 0]} name="Sleep (hrs)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Actions + Upcoming Appointments Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={Brain} label="AI Chat" href="/chat" color="#14b8a6" delay={0.45} />
            <QuickAction icon={Activity} label="Check Symptoms" href="/symptom-checker" color="#d946ef" delay={0.5} />
            <QuickAction icon={ShoppingBag} label="Order Meds" href="/medicines" color="#3b82f6" delay={0.55} />
            <QuickAction icon={Video} label="See Doctor" href="/doctors" color="#f59e0b" delay={0.6} />
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Upcoming Appointments</h3>
            <Link href="/doctors">
              <span className="text-xs text-primary-400 flex items-center gap-1 cursor-pointer">
                Book New <ArrowRight size={12} />
              </span>
            </Link>
          </div>
          <div className="space-y-3">
            {appointments.filter(a => a.status === "Scheduled").map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
              >
                <div className="text-3xl">{apt.doctorAvatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{apt.doctorName}</div>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{apt.specialty}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs mb-1" style={{ color: "var(--color-primary)" }}>
                    <Calendar size={11} /> {apt.date}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <Clock size={11} /> {apt.time}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setAppointmentToCancel(apt.id)}
                    className="py-1.5 px-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer animate-hover"
                  >
                    Cancel
                  </button>
                  <Link href={`/doctors`}>
                    <button className="btn-primary text-xs px-3 py-1.5 cursor-pointer">Join</button>
                  </Link>
                </div>
              </div>
            ))}
            <div
              className="flex items-center gap-4 p-3 rounded-xl border-dashed"
              style={{ border: "1px dashed var(--glass-border)" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(20,184,166,0.1)" }}>
                <Calendar size={18} style={{ color: "var(--color-primary)" }} />
              </div>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>No more appointments today</span>
              <Link href="/doctors" className="ml-auto">
                <button className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>Book Now →</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">Recent Activity</h3>
          <span className="badge badge-primary text-xs">Today</span>
        </div>
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: "var(--glass-bg)" }}
              >
                {n.type === "medicine" ? "💊" : n.type === "appointment" ? "📅" : n.type === "order" ? "🚚" : n.type === "health" ? "🏃" : "💡"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{n.message}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{n.time}</p>
              </div>
              {n.unread && (
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--color-primary)" }} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Custom Cancel Appointment Modal */}
      <AnimatePresence>
        {appointmentToCancel && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-sm text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl">📅</div>
              <h3 className="font-bold text-lg text-white">Cancel Appointment?</h3>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Are you sure you want to cancel this consultation appointment? The doctor will be notified.</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAppointmentToCancel(null)}
                  className="btn-ghost flex-1 py-2 text-xs border border-white/5 rounded-xl cursor-pointer"
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => {
                    cancelAppointment(appointmentToCancel);
                    setAppointmentToCancel(null);
                  }}
                  className="btn-primary flex-1 py-2 text-xs bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
