"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, Droplets, Footprints, Moon, Flame, Activity,
  TrendingUp, Plus, Calculator, Edit3, Save,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, BarChart, Bar, LineChart, Line,
} from "recharts";
import { healthMetrics, weeklyData } from "@/lib/mockData";
import { calculateBMI } from "@/lib/utils";

// =============================================
// CUSTOM TOOLTIP
// =============================================
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color?: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-sm">
        <p className="font-bold mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color || "var(--color-primary)" }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// =============================================
// HEALTH METRIC CARD (Editable)
// =============================================
function EditableMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  goal,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  color: string;
  goal?: number;
  delay: number;
}) {
  const [editing, setEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const progress = goal ? (currentValue / goal) * 100 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="metric-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="w-7 h-7 glass rounded-lg flex items-center justify-center"
          style={{ color: "var(--color-text-muted)" }}
        >
          {editing ? <Save size={13} /> : <Edit3 size={13} />}
        </button>
      </div>

      {editing ? (
        <input
          type="number"
          value={currentValue}
          onChange={(e) => setCurrentValue(Number(e.target.value))}
          onBlur={() => setEditing(false)}
          className="input-glass text-xl font-bold mb-1 py-1"
          style={{ color }}
          autoFocus
        />
      ) : (
        <div className="text-3xl font-display font-black mb-0.5" style={{ color }}>
          {currentValue}
          <span className="text-sm font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>{unit}</span>
        </div>
      )}

      <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>{label}</p>

      {progress !== null && goal && (
        <>
          <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ delay: delay + 0.3, duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {currentValue} / {goal} {unit} ({Math.round(progress)}%)
          </p>
        </>
      )}
    </motion.div>
  );
}

// =============================================
// BMI CALCULATOR
// =============================================
function BMICalculator() {
  const [weight, setWeight] = useState(68);
  const [height, setHeight] = useState(174);
  const { bmi, category } = calculateBMI(weight, height);

  const getBMIColor = (category: string) => {
    const colors: Record<string, string> = {
      Underweight: "#3b82f6",
      Normal: "#22c55e",
      Overweight: "#f59e0b",
      Obese: "#ef4444",
    };
    return colors[category] || "#14b8a6";
  };

  const bmiColor = getBMIColor(category);
  const bmiPercentage = Math.min(((bmi - 10) / 30) * 100, 100);

  const radialData = [{ name: "BMI", value: bmiPercentage, fill: bmiColor }];

  return (
    <div className="glass-card p-6">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <Calculator size={18} style={{ color: "var(--color-primary)" }} /> BMI Calculator
      </h3>

      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <RadialBarChart width={140} height={140} innerRadius="60%" outerRadius="80%" data={radialData} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
          <div style={{ marginTop: -80, textAlign: "center" }}>
            <div className="text-2xl font-display font-black" style={{ color: bmiColor }}>{bmi}</div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>BMI</div>
          </div>
          <div style={{ marginTop: 60 }} />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>
              Weight: {weight} kg
            </label>
            <input
              type="range"
              min={30}
              max={150}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>
              Height: {height} cm
            </label>
            <input
              type="range"
              min={140}
              max={220}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
          <div
            className="p-3 rounded-xl text-center"
            style={{
              background: `${bmiColor}15`,
              border: `1px solid ${bmiColor}30`,
            }}
          >
            <span className="font-bold" style={{ color: bmiColor }}>{category}</span>
            <span className="text-xs ml-2" style={{ color: "var(--color-text-muted)" }}>
              {category === "Normal" ? "✓ Healthy range" : "Consult your doctor"}
            </span>
          </div>
        </div>
      </div>

      {/* BMI Scale */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
          <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden flex">
          <div className="flex-1" style={{ background: "#3b82f6" }} />
          <div className="flex-1" style={{ background: "#22c55e" }} />
          <div className="flex-1" style={{ background: "#f59e0b" }} />
          <div className="flex-1" style={{ background: "#ef4444" }} />
        </div>
        <div className="text-xs text-center mt-1" style={{ color: "var(--color-text-muted)" }}>
          &lt;18.5 | 18.5-24.9 | 25-29.9 | &gt;30
        </div>
      </div>
    </div>
  );
}

// =============================================
// HEALTH TRACKER PAGE
// =============================================
export default function HealthTrackerPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "heart" | "sleep" | "activity">("overview");

  const metrics = healthMetrics;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "heart", label: "Heart" },
    { id: "sleep", label: "Sleep" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-display font-black mb-1">
          ❤️ <span className="gradient-text">Health Tracker</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>Monitor your health metrics and wellness goals</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.id ? "var(--gradient-primary)" : "var(--glass-bg)",
              color: activeTab === tab.id ? "white" : "var(--color-text-muted)",
              border: activeTab === tab.id ? "none" : "1px solid var(--glass-border)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <EditableMetricCard icon={Heart} label="Heart Rate" value={metrics.heartRate.current} unit="bpm" color="#ef4444" delay={0} />
            <EditableMetricCard icon={Footprints} label="Steps Today" value={metrics.steps.current} unit="steps" color="#14b8a6" goal={metrics.steps.goal} delay={0.05} />
            <EditableMetricCard icon={Droplets} label="Water Intake" value={metrics.water.current} unit="L" color="#3b82f6" goal={metrics.water.goal} delay={0.1} />
            <EditableMetricCard icon={Moon} label="Sleep" value={metrics.sleep.current} unit="hrs" color="#d946ef" goal={8} delay={0.15} />
            <EditableMetricCard icon={Flame} label="Calories" value={metrics.calories.current} unit="kcal" color="#f59e0b" goal={metrics.calories.goal} delay={0.2} />
            <EditableMetricCard icon={Activity} label="Blood Pressure" value={metrics.bloodPressure.systolic} unit={`/${metrics.bloodPressure.diastolic} mmHg`} color="#8b5cf6" delay={0.25} />
            <EditableMetricCard icon={TrendingUp} label="Blood Sugar" value={metrics.bloodSugar.current} unit="mg/dL" color="#22c55e" delay={0.3} />
            <EditableMetricCard icon={Activity} label="BMI" value={metrics.bmi.value} unit="" color="#14b8a6" delay={0.35} />
          </div>

          {/* Weekly Activity Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="chart-container">
            <h3 className="font-bold mb-4">Weekly Activity Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="stepsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="caloriesArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="steps" stroke="#14b8a6" fill="url(#stepsArea)" strokeWidth={2} name="Steps" />
                <Area type="monotone" dataKey="calories" stroke="#f59e0b" fill="url(#caloriesArea)" strokeWidth={2} name="Calories" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* BMI Calculator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <BMICalculator />
          </motion.div>
        </div>
      )}

      {/* Heart Tab */}
      {activeTab === "heart" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Current", value: `${metrics.heartRate.current} bpm`, color: "#ef4444" },
              { label: "Resting", value: "65 bpm", color: "#22c55e" },
              { label: "Status", value: "Normal ✓", color: "#22c55e" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-5 text-center">
                <p className="text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>{label}</p>
                <p className="text-2xl font-display font-black" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="chart-container">
            <h3 className="font-bold mb-4">Heart Rate History (bpm)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} name="Heart Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-bold mb-3">Blood Pressure Log</h3>
            <div className="space-y-2">
              {metrics.bloodPressure.history.map((bp, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--glass-bg)" }}>
                  <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Day {i + 1}</span>
                  <span className="font-bold" style={{ color: bp.systolic < 130 ? "#22c55e" : "#f59e0b" }}>
                    {bp.systolic}/{bp.diastolic} mmHg
                  </span>
                  <span className="badge badge-success text-xs">{bp.systolic < 130 ? "Normal" : "Elevated"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sleep Tab */}
      {activeTab === "sleep" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Last Night", value: `${metrics.sleep.current} hrs`, color: "#d946ef" },
              { label: "Quality", value: metrics.sleep.quality, color: "#22c55e" },
              { label: "Goal", value: "8 hours", color: "#94a3b8" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-5 text-center">
                <p className="text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>{label}</p>
                <p className="text-2xl font-display font-black" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="chart-container">
            <h3 className="font-bold mb-4">Sleep Duration This Week</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 12]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sleep" fill="#d946ef" radius={[4, 4, 0, 0]} name="Sleep (hrs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Steps", value: metrics.steps.current.toLocaleString(), goal: "10,000", color: "#14b8a6", progress: 84 },
              { label: "Calories", value: `${metrics.calories.burned}`, goal: "500", color: "#f59e0b", progress: 84 },
              { label: "Distance", value: "5.8 km", goal: "8 km", color: "#3b82f6", progress: 72 },
              { label: "Active Min", value: "45 min", goal: "60 min", color: "#22c55e", progress: 75 },
            ].map(({ label, value, goal, color, progress }) => (
              <div key={label} className="glass-card p-5">
                <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
                <p className="text-2xl font-display font-black mb-1" style={{ color }}>{value}</p>
                <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>Goal: {goal}</p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="chart-container">
            <h3 className="font-bold mb-4">Weekly Steps & Calories</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="steps" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Steps" />
                <Bar dataKey="calories" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
