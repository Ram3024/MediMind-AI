"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";

// =============================================
// SYMPTOM DATA
// =============================================
const bodyParts = [
  { id: "head", label: "Head / Brain", emoji: "🧠", symptoms: ["Headache", "Dizziness", "Memory issues", "Migraine", "Fever"] },
  { id: "eyes", label: "Eyes", emoji: "👁️", symptoms: ["Blurry vision", "Eye pain", "Redness", "Watering", "Itching"] },
  { id: "throat", label: "Throat / Nose", emoji: "👃", symptoms: ["Sore throat", "Runny nose", "Sneezing", "Nasal congestion", "Loss of smell"] },
  { id: "chest", label: "Chest / Heart", emoji: "❤️", symptoms: ["Chest pain", "Shortness of breath", "Palpitations", "Coughing"] },
  { id: "stomach", label: "Stomach", emoji: "🫃", symptoms: ["Stomach pain", "Nausea", "Vomiting", "Bloating", "Acidity", "Diarrhea"] },
  { id: "skin", label: "Skin", emoji: "🦴", symptoms: ["Rash", "Itching", "Swelling", "Redness", "Dry skin"] },
  { id: "joints", label: "Joints / Muscles", emoji: "💪", symptoms: ["Joint pain", "Muscle ache", "Weakness", "Stiffness", "Swelling"] },
  { id: "general", label: "General", emoji: "🌡️", symptoms: ["Fatigue", "Fever", "Weakness", "Weight loss", "Night sweats"] },
];

const conditions: Record<string, { name: string; probability: string; color: string; description: string; action: string }[]> = {
  head: [
    { name: "Tension Headache", probability: "High", color: "#f59e0b", description: "Most common headache type, caused by stress, poor posture, or dehydration.", action: "Rest, drink water, Paracetamol 500mg" },
    { name: "Migraine", probability: "Medium", color: "#ef4444", description: "Recurring intense headaches often with nausea, light/sound sensitivity.", action: "Rest in dark room, consult neurologist" },
    { name: "Sinus Infection", probability: "Medium", color: "#3b82f6", description: "Inflammation of sinuses causing pressure and facial pain.", action: "Steam inhalation, decongestants, see ENT" },
  ],
  chest: [
    { name: "Muscle Strain", probability: "High", color: "#22c55e", description: "Chest muscle pain from physical activity or poor posture.", action: "Rest, warm compress, mild pain relievers" },
    { name: "Acid Reflux", probability: "High", color: "#f59e0b", description: "Stomach acid flowing back causing burning sensation.", action: "Antacids, avoid spicy food, see gastroenterologist" },
    { name: "⚠️ Cardiac Issue", probability: "Low", color: "#ef4444", description: "EMERGENCY: Severe chest pain may indicate heart attack.", action: "CALL 112 IMMEDIATELY" },
  ],
  stomach: [
    { name: "Gastritis", probability: "High", color: "#f59e0b", description: "Inflammation of stomach lining causing pain and acidity.", action: "Omeprazole, bland diet, see gastroenterologist" },
    { name: "Food Poisoning", probability: "Medium", color: "#ef4444", description: "Contaminated food causing nausea, vomiting, diarrhea.", action: "ORS, rest, light foods, doctor if severe" },
    { name: "IBS", probability: "Medium", color: "#3b82f6", description: "Irritable Bowel Syndrome - chronic digestive condition.", action: "Dietary changes, stress management, GI specialist" },
  ],
  general: [
    { name: "Viral Fever", probability: "High", color: "#f59e0b", description: "Common viral infection with fever, fatigue, body ache.", action: "Rest, fluids, Paracetamol, see doctor if >3 days" },
    { name: "Dengue Fever", probability: "Medium", color: "#ef4444", description: "Mosquito-borne viral disease with high fever and rash.", action: "Immediate medical attention, blood test required" },
    { name: "Anemia", probability: "Medium", color: "#3b82f6", description: "Low red blood cell count causing fatigue and weakness.", action: "Blood test, iron supplements, see doctor" },
  ],
};

// =============================================
// SYMPTOM CHECKER PAGE
// =============================================
export default function SymptomCheckerPage() {
  const [step, setStep] = useState(1);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe" | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<typeof conditions.general | null>(null);

  const selectedPartData = bodyParts.find((b) => b.id === selectedPart);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const analyze = async () => {
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2500)); // Simulate AI analysis
    const partConditions = conditions[selectedPart as keyof typeof conditions] || conditions.general;
    setResults(partConditions);
    setAnalyzing(false);
    setStep(4);
  };

  const reset = () => {
    setStep(1);
    setSelectedPart(null);
    setSelectedSymptoms([]);
    setSeverity(null);
    setDuration("");
    setResults(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-black mb-2">
          🔍 <span className="gradient-text">AI Symptom Checker</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Describe your symptoms and get AI-powered insights about possible conditions.
        </p>
        <p className="text-xs mt-1 badge badge-warning">
          ⚠️ For informational purposes only — always consult a qualified doctor
        </p>
      </motion.div>

      {/* Progress Bar */}
      {step <= 3 && (
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all"
                style={{
                  background: s <= step ? "var(--gradient-primary)" : "var(--glass-bg)",
                  color: s <= step ? "white" : "var(--color-text-muted)",
                  border: s === step ? "none" : "1px solid var(--glass-border)",
                }}
              >
                {s < step ? <CheckCircle size={16} /> : s}
              </div>
              <span className="text-xs font-medium" style={{ color: s <= step ? "var(--color-text)" : "var(--color-text-muted)" }}>
                {s === 1 ? "Body Area" : s === 2 ? "Symptoms" : "Details"}
              </span>
              {s < 3 && <div className="flex-1 h-0.5 rounded" style={{ background: s < step ? "var(--color-primary)" : "var(--glass-border)" }} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Body Part Selection */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-6 mb-4">
              <h2 className="font-display font-bold text-xl mb-4">Where do you feel discomfort?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {bodyParts.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(part.id)}
                    className="p-4 rounded-2xl text-center transition-all"
                    style={{
                      background: selectedPart === part.id ? "rgba(20,184,166,0.2)" : "var(--glass-bg)",
                      border: selectedPart === part.id ? "1px solid rgba(20,184,166,0.5)" : "1px solid var(--glass-border)",
                    }}
                  >
                    <div className="text-3xl mb-2">{part.emoji}</div>
                    <div className="text-xs font-semibold">{part.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedPart}
              className="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              Next: Select Symptoms <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-6 mb-4">
              <h2 className="font-display font-bold text-xl mb-4">
                {selectedPartData?.emoji} Select your symptoms for {selectedPartData?.label}
              </h2>
              <div className="flex flex-wrap gap-3">
                {selectedPartData?.symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: selectedSymptoms.includes(symptom) ? "rgba(20,184,166,0.2)" : "var(--glass-bg)",
                      border: selectedSymptoms.includes(symptom) ? "1px solid rgba(20,184,166,0.5)" : "1px solid var(--glass-border)",
                      color: selectedSymptoms.includes(symptom) ? "var(--color-primary)" : "var(--color-text-muted)",
                    }}
                  >
                    {selectedSymptoms.includes(symptom) ? "✓ " : ""}{symptom}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedSymptoms.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-40"
              >
                Next: Severity <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Severity & Duration */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-6 mb-4">
              <h2 className="font-display font-bold text-xl mb-6">How severe are your symptoms?</h2>

              <div className="mb-6">
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-muted)" }}>Severity Level</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "mild", label: "Mild", emoji: "😐", color: "#22c55e", desc: "Manageable, slightly uncomfortable" },
                    { id: "moderate", label: "Moderate", emoji: "😣", color: "#f59e0b", desc: "Noticeably affecting daily activities" },
                    { id: "severe", label: "Severe", emoji: "😰", color: "#ef4444", desc: "Debilitating, need immediate help" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSeverity(s.id as "mild" | "moderate" | "severe")}
                      className="p-4 rounded-2xl text-center transition-all"
                      style={{
                        background: severity === s.id ? `${s.color}20` : "var(--glass-bg)",
                        border: severity === s.id ? `1px solid ${s.color}50` : "1px solid var(--glass-border)",
                      }}
                    >
                      <div className="text-3xl mb-1">{s.emoji}</div>
                      <div className="text-sm font-bold" style={{ color: severity === s.id ? s.color : "var(--color-text)" }}>{s.label}</div>
                      <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-muted)" }}>How long have you had these symptoms?</p>
                <div className="flex flex-wrap gap-2">
                  {["< 1 day", "1-3 days", "3-7 days", "1-2 weeks", "> 2 weeks"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className="px-4 py-2 rounded-xl text-sm transition-all"
                      style={{
                        background: duration === d ? "rgba(217,70,239,0.2)" : "var(--glass-bg)",
                        border: duration === d ? "1px solid rgba(217,70,239,0.4)" : "1px solid var(--glass-border)",
                        color: duration === d ? "#d946ef" : "var(--color-text-muted)",
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
              <button
                onClick={analyze}
                disabled={!severity || !duration || analyzing}
                className="btn-primary flex items-center gap-2 disabled:opacity-40"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Activity size={16} /> Analyze Symptoms
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 4 && results && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(20,184,166,0.2)" }}>
                  <CheckCircle size={18} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="font-display font-bold text-xl">Analysis Complete</h2>
              </div>
              <p style={{ color: "var(--color-text-muted)" }} className="text-sm">
                Based on: <strong>{selectedSymptoms.join(", ")}</strong> • Severity: <strong>{severity}</strong> • Duration: <strong>{duration}</strong>
              </p>
            </div>

            {/* Emergency warning */}
            {(selectedPart === "chest" || severity === "severe") && (
              <div className="emergency-alert p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={20} style={{ color: "#ef4444" }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: "#ef4444" }}>
                    Important: Severe or chest symptoms detected
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    Please consult a doctor immediately or call emergency services if symptoms are life-threatening.
                  </p>
                  <Link href="/doctors">
                    <button className="mt-2 text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: "#dc2626", color: "white" }}>
                      Book Emergency Consultation
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Possible Conditions */}
            <div className="space-y-4 mb-6">
              {results.map((condition, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold">{condition.name}</h3>
                    <span
                      className="badge text-xs"
                      style={{
                        background: `${condition.color}20`,
                        color: condition.color,
                        border: `1px solid ${condition.color}30`,
                      }}
                    >
                      {condition.probability} Likelihood
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>{condition.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">💊 Recommended:</span>
                    <span style={{ color: "var(--color-primary)" }}>{condition.action}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-3 gap-3">
              <Link href="/chat">
                <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  🤖 Ask AI More
                </button>
              </Link>
              <Link href="/doctors">
                <button className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
                  👨‍⚕️ Book Doctor
                </button>
              </Link>
              <button
                onClick={reset}
                className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
              >
                <RotateCcw size={14} /> Check Again
              </button>
            </div>

            <p className="text-xs text-center mt-4" style={{ color: "var(--color-text-muted)" }}>
              ⚠️ This analysis is for informational purposes only. Always consult a qualified healthcare professional for medical advice.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
