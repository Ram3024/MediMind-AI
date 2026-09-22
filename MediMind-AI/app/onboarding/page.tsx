"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    emoji: "🏥",
    title: "Your Health, Your Way",
    description: "MediMind AI combines cutting-edge artificial intelligence with healthcare expertise to give you personalized health guidance 24/7.",
    color: "#14b8a6",
  },
  {
    emoji: "🤖",
    title: "AI Symptom Analysis",
    description: "Describe any symptom in plain language. Our AI analyzes and provides insights, possible conditions, and when to see a doctor.",
    color: "#d946ef",
  },
  {
    emoji: "💊",
    title: "Medicine & Consultation",
    description: "Order medicines online, consult certified doctors via video call, and track your health metrics — all from one app.",
    color: "#3b82f6",
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="animated-bg" />
      <div className="w-full max-w-md">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="text-center"
        >
          <div
            className="w-28 h-28 rounded-4xl flex items-center justify-center text-6xl mx-auto mb-8"
            style={{ background: `${step.color}15`, border: `2px solid ${step.color}30` }}
          >
            {step.emoji}
          </div>
          <h1 className="text-3xl font-display font-black mb-4">{step.title}</h1>
          <p className="text-lg leading-relaxed mb-8" style={{ color: "var(--color-text-muted)" }}>{step.description}</p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === currentStep ? 24 : 8,
                background: i === currentStep ? step.color : "var(--glass-border)",
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn-ghost flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <Link href="/dashboard" className="flex-1">
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                Get Started 🚀
              </button>
            </Link>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/dashboard">
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Skip onboarding →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
