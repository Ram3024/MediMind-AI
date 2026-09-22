"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Edit3, Save, Phone, Mail, MapPin,
  Droplets, Activity, Heart, Shield, Bell, LogOut,
} from "lucide-react";
import { mockUser, healthMetrics } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(mockUser.name);
  const [phone, setPhone] = useState(mockUser.phone);
  const [address, setAddress] = useState(mockUser.address);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-display font-black mb-1">
          👤 <span className="gradient-text">My Profile</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>Manage your health profile and account settings</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Avatar & Quick Stats */}
        <div className="space-y-4">
          {/* Avatar Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 text-center">
            <div className="avatar-ring inline-block mb-4">
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-5xl">
                {mockUser.avatar}
              </div>
            </div>
            <h2 className="font-display font-bold text-xl mb-1">{mockUser.name}</h2>
            <p className="text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>{mockUser.email}</p>
            <span className="badge badge-primary">Pro Member</span>
            <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
              Member since {mockUser.memberSince}
            </p>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm"
            >
              {editing ? <><Save size={14} /> Save Changes</> : <><Edit3 size={14} /> Edit Profile</>}
            </button>
          </motion.div>

          {/* Health ID Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5"
            style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(217,70,239,0.1))" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: "var(--color-primary)" }} />
              <span className="font-bold text-sm">Health ID</span>
            </div>
            <div className="text-lg font-display font-black gradient-text mb-1">MID-2024-001</div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Verified Healthcare ID</p>
          </motion.div>

          {/* Quick Health Stats */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-bold text-sm mb-3">Health Summary</h3>
            <div className="space-y-2">
              {[
                { icon: Heart, label: "Heart Rate", value: `${healthMetrics.heartRate.current} bpm`, color: "#ef4444" },
                { icon: Activity, label: "BMI", value: `${healthMetrics.bmi.value} (${healthMetrics.bmi.category})`, color: "#22c55e" },
                { icon: Droplets, label: "Blood Group", value: mockUser.bloodGroup, color: "#ef4444" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs flex-1" style={{ color: "var(--color-text-muted)" }}>{label}</span>
                  <span className="text-xs font-bold">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: Profile Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Personal Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
            <h3 className="font-bold mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: name, icon: User, onChange: setName },
                { label: "Phone", value: phone, icon: Phone, onChange: setPhone },
              ].map(({ label, value, icon: Icon, onChange }) => (
                <div key={label}>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>
                    {label}
                  </label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => editing && onChange(e.target.value)}
                      readOnly={!editing}
                      className="input-glass pl-9 text-sm"
                      style={{ background: editing ? "var(--glass-bg)" : "transparent" }}
                    />
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                  <input type="text" value={mockUser.email} readOnly className="input-glass pl-9 text-sm" style={{ background: "transparent" }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Age / Gender</label>
                <input type="text" value={`${mockUser.age} years • ${mockUser.gender}`} readOnly className="input-glass text-sm" style={{ background: "transparent" }} />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Address</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3" style={{ color: "var(--color-text-muted)" }} />
                <textarea
                  value={address}
                  onChange={(e) => editing && setAddress(e.target.value)}
                  readOnly={!editing}
                  className="input-glass pl-9 text-sm resize-none"
                  rows={2}
                  style={{ background: editing ? "var(--glass-bg)" : "transparent" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Medical Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="font-bold mb-4">Medical Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Blood Group", value: mockUser.bloodGroup },
                { label: "Height", value: `${mockUser.height} cm` },
                { label: "Weight", value: `${mockUser.weight} kg` },
                { label: "BMI", value: `${healthMetrics.bmi.value} (${healthMetrics.bmi.category})` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>{label}</label>
                  <input type="text" value={value} readOnly className="input-glass text-sm" style={{ background: "transparent" }} />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--color-text-muted)" }}>Existing Conditions</label>
              <div className="flex flex-wrap gap-2">
                {mockUser.conditions.map((c) => (
                  <span key={c} className="badge badge-warning">{c}</span>
                ))}
                {editing && (
                  <button className="badge badge-primary cursor-pointer">+ Add</button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--color-text-muted)" }}>Allergies</label>
              <div className="flex flex-wrap gap-2">
                {mockUser.allergies.map((a) => (
                  <span key={a} className="badge badge-danger">{a}</span>
                ))}
                {editing && (
                  <button className="badge badge-primary cursor-pointer">+ Add</button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
            <h3 className="font-bold mb-4">Account</h3>
            <div className="space-y-2">
              {[
                { icon: Bell, label: "Notification Preferences", action: () => {} },
                { icon: Shield, label: "Privacy Settings", action: () => {} },
                { icon: Activity, label: "Health Reports", action: () => {} },
              ].map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all hover:bg-white/5"
                >
                  <Icon size={16} style={{ color: "var(--color-primary)" }} />
                  <span className="flex-1 text-left">{label}</span>
                  <span style={{ color: "var(--color-text-muted)" }}>›</span>
                </button>
              ))}
              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all hover:bg-red-500/10"
                style={{ color: "#ef4444" }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
