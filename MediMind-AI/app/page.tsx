"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heart, Brain, ShoppingBag, Video, Activity,
  ChevronRight, Star, Shield, Zap, Globe, Phone,
  Users, Award, ArrowRight, Sparkles,
} from "lucide-react";

// =============================================
// SPLASH SCREEN COMPONENT
// =============================================
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="splash-screen"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-6"
        >
          <div className="ai-orb mx-auto mb-4" style={{ width: 80, height: 80 }} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-display font-black gradient-text mb-2"
        >
          MediMind AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-slate-400 text-sm"
        >
          Your Intelligent Health Companion
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
          className="mt-8 h-1 w-48 mx-auto rounded-full"
          style={{ background: "var(--gradient-primary)" }}
        />
      </div>
    </motion.div>
  );
}

// =============================================
// FLOATING ORB COMPONENT
// =============================================
function FloatingOrb() {
  return (
    <motion.div
      className="ai-orb"
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ width: 120, height: 120 }}
    />
  );
}

// =============================================
// FEATURE CARD
// =============================================
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
  href: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Link href={href}>
        <div className="glass-card p-6 cursor-pointer group h-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <Icon size={28} style={{ color }} />
          </div>
          <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </p>
          <div className="flex items-center gap-1 mt-4 text-sm font-semibold" style={{ color }}>
            Explore <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// =============================================
// STAT CARD
// =============================================
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-display font-black gradient-text mb-1">{number}</div>
      <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</div>
    </div>
  );
}

// =============================================
// MAIN LANDING PAGE
// =============================================
export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  const features = [
    {
      icon: Brain,
      title: "AI Health Assistant",
      description: "Analyze symptoms, get diagnosis insights and personalized health recommendations powered by AI.",
      color: "#14b8a6",
      href: "/chat",
      delay: 0,
    },
    {
      icon: Activity,
      title: "Symptom Checker",
      description: "Advanced AI symptom analysis with severity assessment and specialist recommendations.",
      color: "#d946ef",
      href: "/symptom-checker",
      delay: 0.1,
    },
    {
      icon: ShoppingBag,
      title: "Medicine Store",
      description: "Order medicines online with prescription upload, fast delivery, and real-time tracking.",
      color: "#3b82f6",
      href: "/medicines",
      delay: 0.2,
    },
    {
      icon: Video,
      title: "Video Consultation",
      description: "Consult with certified doctors via HD video call. Book appointments in seconds.",
      color: "#f59e0b",
      href: "/doctors",
      delay: 0.3,
    },
    {
      icon: Heart,
      title: "Health Tracker",
      description: "Monitor vitals, track fitness goals, and visualize health trends with smart analytics.",
      color: "#ef4444",
      href: "/health-tracker",
      delay: 0.4,
    },
    {
      icon: Shield,
      title: "Emergency SOS",
      description: "One-tap emergency alerts, nearby hospital finder, and 24/7 critical care guidance.",
      color: "#dc2626",
      href: "/chat",
      delay: 0.5,
    },
  ];

  const testimonials = [
    {
      name: "Anjali Sharma",
      role: "Patient",
      text: "MediMind AI helped me identify my symptoms before my doctor visit. The AI analysis was incredibly accurate!",
      rating: 5,
      avatar: "👩",
    },
    {
      name: "Dr. Rohit Verma",
      role: "Cardiologist",
      text: "Excellent platform for patients. The symptom checker is well-designed and the consultation interface is smooth.",
      rating: 5,
      avatar: "👨‍⚕️",
    },
    {
      name: "Priya Mehta",
      role: "Health Enthusiast",
      text: "The health tracker is amazing! I love seeing my progress charts. The AI coach keeps me motivated daily.",
      rating: 5,
      avatar: "👩‍💼",
    },
  ];

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Background */}
          <div className="animated-bg" />

          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="ai-orb" style={{ width: 32, height: 32 }} />
                <span className="font-display font-bold text-xl gradient-text">MediMind AI</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                {["Features", "Doctors", "Medicines", "About"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <button className="btn-ghost text-sm px-4 py-2">Login</button>
                </Link>
                <Link href="/register">
                  <button className="btn-primary text-sm px-4 py-2">Get Started</button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="min-h-screen flex items-center justify-center px-6 pt-20">
            <div className="max-w-7xl mx-auto w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left - Text Content */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="badge badge-primary mb-4 inline-flex gap-2">
                      <Sparkles size={12} />
                      AI-Powered Healthcare
                    </span>
                    <h1 className="text-5xl lg:text-7xl font-display font-black leading-tight mb-6">
                      Your Smart
                      <br />
                      <span className="gradient-text">Health AI</span>
                      <br />
                      Companion
                    </h1>
                    <p className="text-lg mb-8 max-w-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      Analyze symptoms instantly, consult top doctors via video, order medicines,
                      and track your health — all powered by advanced AI. Available in Hindi & English.
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Link href="/dashboard">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-primary flex items-center gap-2 text-base px-6 py-3"
                        >
                          <Zap size={18} /> Start Health Check
                        </motion.button>
                      </Link>
                      <Link href="/chat">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-ghost flex items-center gap-2 text-base px-6 py-3"
                        >
                          <Brain size={18} /> Chat with AI
                        </motion.button>
                      </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-10 flex items-center gap-6">
                      <div className="flex -space-x-2">
                        {["👨‍⚕️", "👩‍⚕️", "🧑‍⚕️", "👩"].map((emoji, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full glass flex items-center justify-center text-lg border-2"
                            style={{ borderColor: "var(--color-bg)" }}
                          >
                            {emoji}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                          Trusted by <strong style={{ color: "var(--color-text)" }}>48,000+</strong> users
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right - Visual */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <FloatingOrb />

                  {/* Floating cards around the orb */}
                  <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
                    {[
                      { icon: "❤️", label: "Heart Rate", value: "72 bpm", color: "#ef4444" },
                      { icon: "🩺", label: "AI Analysis", value: "Real-time", color: "#14b8a6" },
                      { icon: "💊", label: "Medicines", value: "1800+ Items", color: "#3b82f6" },
                      { icon: "👨‍⚕️", label: "Doctors", value: "234 Online", color: "#d946ef" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="glass-card p-4"
                      >
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.label}</div>
                        <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card p-8 mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                <StatCard number="48K+" label="Active Users" />
                <StatCard number="234" label="Specialist Doctors" />
                <StatCard number="1,847" label="Medicines Available" />
                <StatCard number="4.9★" label="App Rating" />
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <span className="badge badge-accent mb-4 inline-block">Everything You Need</span>
                <h2 className="text-4xl lg:text-5xl font-display font-black mb-4">
                  Complete Healthcare
                  <br />
                  <span className="gradient-text">Ecosystem</span>
                </h2>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--color-text-muted)" }}>
                  From AI-powered symptom analysis to medicine delivery and video consultations —
                  everything for your health in one platform.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                  <FeatureCard key={feature.title} {...feature} />
                ))}
              </div>
            </div>
          </section>

          {/* AI Features Highlight */}
          <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="badge badge-primary mb-4 inline-block">Powered by AI</span>
                  <h2 className="text-4xl font-display font-black mb-6">
                    Advanced AI
                    <br />
                    <span className="gradient-text">Health Intelligence</span>
                  </h2>
                  <div className="space-y-4">
                    {[
                      { icon: "🧠", title: "Symptom Analyzer", desc: "AI analyzes 300+ symptoms to suggest possible conditions" },
                      { icon: "🗣️", title: "Voice AI Assistant", desc: "Speak in Hindi or English, get instant health advice" },
                      { icon: "📋", title: "Medical Report OCR", desc: "Upload reports — AI extracts and explains your results" },
                      { icon: "💡", title: "Smart Reminders", desc: "AI-powered medicine reminders based on your schedule" },
                      { icon: "🌍", title: "Multilingual Support", desc: "Full Hindi + English support for all features" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-4 p-4 glass-card"
                      >
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <h4 className="font-bold mb-1">{item.title}</h4>
                          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass-card p-6"
                >
                  {/* Mock Chat Preview */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="ai-orb" style={{ width: 40, height: 40 }} />
                    <div>
                      <div className="font-bold">MediMind AI</div>
                      <div className="text-xs text-green-400">● Online</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-primary-500/20 border border-primary-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs text-sm">
                        I have a headache and mild fever since morning 🤒
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="ai-orb flex-shrink-0" style={{ width: 32, height: 32 }} />
                      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs text-sm">
                        <p className="mb-2">I understand you&apos;re not feeling well. Based on your symptoms:</p>
                        <p>🌡️ <strong>Likely:</strong> Viral fever or tension headache</p>
                        <p>💊 <strong>Suggested:</strong> Paracetamol 500mg + rest</p>
                        <p>💧 <strong>Hydration:</strong> 8-10 glasses of water</p>
                        <p className="mt-2 text-xs text-yellow-400">⚠️ Consult a doctor if fever exceeds 103°F</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {["Book Doctor", "Order Medicine", "More Info"].map((btn) => (
                        <span key={btn} className="badge badge-primary text-xs cursor-pointer">{btn}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-display font-black mb-4">
                  Loved by <span className="gradient-text">Thousands</span>
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    viewport={{ once: true }}
                    className="glass-card p-6"
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm mb-6 italic" style={{ color: "var(--color-text-muted)" }}>
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{t.avatar}</div>
                      <div>
                        <div className="font-bold text-sm">{t.name}</div>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{t.role}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 px-6">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-12"
                style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(217,70,239,0.1))" }}
              >
                <div className="ai-orb mx-auto mb-6" style={{ width: 80, height: 80 }} />
                <h2 className="text-4xl font-display font-black mb-4">
                  Start Your Health Journey
                  <br />
                  <span className="gradient-text">Today</span>
                </h2>
                <p className="text-lg mb-8" style={{ color: "var(--color-text-muted)" }}>
                  Join 48,000+ users who trust MediMind AI for their healthcare needs.
                  Free to start, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
                    >
                      <Sparkles size={20} /> Get Started Free
                    </motion.button>
                  </Link>
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-ghost flex items-center gap-2 px-8 py-4 text-lg"
                    >
                      View Dashboard <ArrowRight size={20} />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t py-12 px-6" style={{ borderColor: "var(--color-border)" }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="ai-orb" style={{ width: 28, height: 28 }} />
                  <span className="font-display font-bold gradient-text">MediMind AI</span>
                </div>
                <div className="flex flex-wrap gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {["Privacy Policy", "Terms of Service", "Contact", "Help Center"].map((link) => (
                    <a key={link} href="#" className="hover:text-primary-500 transition-colors">{link}</a>
                  ))}
                </div>
                <div className="flex gap-3">
                  <span className="badge badge-success text-xs">🔒 HIPAA Compliant</span>
                  <span className="badge badge-primary text-xs">✓ ISO 27001</span>
                </div>
              </div>
              <div className="mt-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                © 2026 MediMind AI. All rights reserved. | ⚕️ For informational purposes only — not a substitute for professional medical advice.
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
