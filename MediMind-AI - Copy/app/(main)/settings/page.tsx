"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Moon, Sun, Globe, Shield, Heart,
  Volume2, Smartphone, Clock, ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/Providers";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative w-12 h-6 rounded-full transition-all"
      style={{ background: enabled ? "var(--gradient-primary)" : "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-md"
        style={{ transform: enabled ? "translateX(26px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SettingRow({ icon: Icon, label, desc, children, color = "var(--color-primary)" }: {
  icon: React.ElementType; label: string; desc?: string; children: React.ReactNode; color?: string;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({ push: true, email: true, sms: false, medicine: true });
  const [language, setLanguage] = useState("English");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-black mb-1">⚙️ <span className="gradient-text">Settings</span></h1>
        <p style={{ color: "var(--color-text-muted)" }}>Customize your MediMind AI experience</p>
      </motion.div>

      <div className="space-y-4">
        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Moon size={16} style={{ color: "var(--color-primary)" }} /> Appearance
          </h3>
          <SettingRow icon={theme === "dark" ? Moon : Sun} label="Theme" desc={`Currently: ${theme === "dark" ? "Dark Mode" : "Light Mode"}`} color="#d946ef">
            <button onClick={toggleTheme} className="btn-ghost text-sm px-4 py-2 flex items-center gap-2">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </SettingRow>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bell size={16} style={{ color: "var(--color-primary)" }} /> Notifications
          </h3>
          <SettingRow icon={Smartphone} label="Push Notifications" desc="App notifications on your device" color="#14b8a6">
            <Toggle enabled={notifications.push} onChange={(v) => setNotifications({ ...notifications, push: v })} />
          </SettingRow>
          <SettingRow icon={Bell} label="Email Notifications" desc="Appointment reminders via email" color="#3b82f6">
            <Toggle enabled={notifications.email} onChange={(v) => setNotifications({ ...notifications, email: v })} />
          </SettingRow>
          <SettingRow icon={Clock} label="Medicine Reminders" desc="Daily medicine time alerts" color="#f59e0b">
            <Toggle enabled={notifications.medicine} onChange={(v) => setNotifications({ ...notifications, medicine: v })} />
          </SettingRow>
          <SettingRow icon={Smartphone} label="SMS Alerts" desc="Critical health alerts via SMS" color="#d946ef">
            <Toggle enabled={notifications.sms} onChange={(v) => setNotifications({ ...notifications, sms: v })} />
          </SettingRow>
        </motion.div>

        {/* Language & Accessibility */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Globe size={16} style={{ color: "var(--color-primary)" }} /> Language & Accessibility
          </h3>
          <SettingRow icon={Globe} label="Language" desc="Choose your preferred language" color="#22c55e">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-glass py-1.5 px-3 text-sm w-32"
              style={{ background: "var(--glass-bg)" }}
            >
              <option value="English">🇬🇧 English</option>
              <option value="Hindi">🇮🇳 Hindi</option>
              <option value="Both">🌐 Both</option>
            </select>
          </SettingRow>
          <SettingRow icon={Volume2} label="Voice AI" desc="Enable voice responses from AI" color="#d946ef">
            <Toggle enabled={voiceEnabled} onChange={setVoiceEnabled} />
          </SettingRow>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Shield size={16} style={{ color: "var(--color-primary)" }} /> Privacy & Security
          </h3>
          <SettingRow icon={Shield} label="Health Data Sharing" desc="Share anonymized data to improve AI" color="#ef4444">
            <Toggle enabled={dataSharing} onChange={setDataSharing} />
          </SettingRow>
          <SettingRow icon={Heart} label="Two-Factor Authentication" desc="Add extra security to your account" color="#14b8a6">
            <button className="btn-ghost text-sm px-3 py-1.5">Enable</button>
          </SettingRow>
          <SettingRow icon={Shield} label="Change Password" desc="Update your account password" color="#8b5cf6">
            <button className="flex items-center gap-1 text-sm" style={{ color: "var(--color-primary)" }}>
              Change <ChevronRight size={14} />
            </button>
          </SettingRow>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border"
          style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.03)" }}>
          <h3 className="font-bold mb-4" style={{ color: "#ef4444" }}>Danger Zone</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-red-500/10"
              style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
              onClick={() => alert("Account deactivated (demo)")}
            >
              Deactivate Account
            </button>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-red-500/10"
              style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
              onClick={() => alert("Data deletion requested (demo)")}
            >
              Delete All Data
            </button>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-muted)" }}>
        MediMind AI v1.0.0 • Made with ❤️ for your health
      </p>
    </div>
  );
}
