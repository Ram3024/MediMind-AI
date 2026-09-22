"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Video, Calendar, Clock, MapPin,
  ChevronDown, Search, X, Check, Phone,
} from "lucide-react";
import { doctors } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { useAppointmentStore } from "@/store/appointmentStore";

const specialties = ["All", "Cardiologist", "Neurologist", "Dermatologist", "Psychiatrist", "Dentist", "General Physician"];

// =============================================
// DOCTOR CARD
// =============================================
function DoctorCard({ doctor, onBook }: { doctor: typeof doctors[0]; onBook: (doc: typeof doctors[0]) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="doctor-card p-5"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: "rgba(20,184,166,0.1)" }}
          >
            {doctor.avatar}
          </div>
          {doctor.available && (
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 bg-green-400"
              style={{ borderColor: "var(--color-surface)" }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate">{doctor.name}</h3>
          <p className="text-sm" style={{ color: "var(--color-primary)" }}>{doctor.specialty}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{doctor.qualification}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={11}
                  className={i <= Math.floor(doctor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}
                />
              ))}
            </div>
            <span className="text-xs font-semibold">{doctor.rating}</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>({doctor.reviews.toLocaleString()} reviews)</span>
          </div>
        </div>
        <span
          className={`badge text-xs flex-shrink-0 ${doctor.available ? "badge-success" : "badge-warning"}`}
        >
          {doctor.available ? "● Online" : "Offline"}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={13} style={{ color: "var(--color-text-muted)" }} />
          <span style={{ color: "var(--color-text-muted)" }}>{doctor.hospital}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={13} style={{ color: "var(--color-text-muted)" }} />
          <span style={{ color: "var(--color-text-muted)" }}>{doctor.experience} years exp • {doctor.patients.toLocaleString()}+ patients</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={13} style={{ color: "var(--color-primary)" }} />
          <span style={{ color: "var(--color-primary)" }}>{doctor.nextSlot}</span>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {doctor.conditions.slice(0, 3).map((c) => (
          <span key={c} className="badge badge-primary text-xs">{c}</span>
        ))}
      </div>

      {/* Price & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-display font-black text-xl" style={{ color: "var(--color-primary)" }}>
            {formatCurrency(doctor.consultationFee)}
          </span>
          <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>/consultation</span>
        </div>
        <div className="flex gap-2">
          <button
            className="w-9 h-9 glass rounded-xl flex items-center justify-center"
            style={{ color: "var(--color-text-muted)" }}
            onClick={() => alert(`Calling ${doctor.name}...`)}
          >
            <Phone size={15} />
          </button>
          <button
            onClick={() => onBook(doctor)}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Video size={14} /> Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================
// BOOKING MODAL
// =============================================
function BookingModal({ doctor, onClose }: { doctor: typeof doctors[0]; onClose: () => void }) {
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const dates = ["Today, Dec 18", "Tomorrow, Dec 19", "Dec 20", "Dec 21", "Dec 22"];
  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Book Consultation</h3>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Doctor Summary */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-5"
          style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)" }}
        >
          <div className="text-3xl">{doctor.avatar}</div>
          <div>
            <p className="font-bold text-sm">{doctor.name}</p>
            <p className="text-xs" style={{ color: "var(--color-primary)" }}>{doctor.specialty}</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Fee: {formatCurrency(doctor.consultationFee)}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Date Selection */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>Select Date</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: selectedDate === date ? "rgba(20,184,166,0.2)" : "var(--glass-bg)",
                        border: selectedDate === date ? "1px solid rgba(20,184,166,0.4)" : "1px solid var(--glass-border)",
                        color: selectedDate === date ? "var(--color-primary)" : "var(--color-text-muted)",
                      }}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-muted)" }}>Select Time</p>
                <div className="grid grid-cols-4 gap-2">
                  {times.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className="py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: selectedTime === time ? "rgba(217,70,239,0.2)" : "var(--glass-bg)",
                        border: selectedTime === time ? "1px solid rgba(217,70,239,0.4)" : "1px solid var(--glass-border)",
                        color: selectedTime === time ? "#d946ef" : "var(--color-text-muted)",
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep("confirm")}
                disabled={!selectedDate || !selectedTime}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Calendar size={16} /> Continue
              </button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Doctor", value: doctor.name },
                  { label: "Specialty", value: doctor.specialty },
                  { label: "Date", value: selectedDate },
                  { label: "Time", value: selectedTime },
                  { label: "Mode", value: "Video Consultation" },
                  { label: "Fee", value: formatCurrency(doctor.consultationFee) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mb-4" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--color-text-muted)" }}>Consultation Fee</span>
                  <span>{formatCurrency(doctor.consultationFee)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--color-text-muted)" }}>Platform Fee</span>
                  <span>{formatCurrency(50)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span className="gradient-text">{formatCurrency(doctor.consultationFee + 50)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("select")} className="btn-ghost flex-1">Back</button>
                <button
                  onClick={() => {
                    useAppointmentStore.getState().bookAppointment({
                      doctorName: doctor.name,
                      doctorAvatar: doctor.avatar,
                      specialty: doctor.specialty,
                      date: selectedDate,
                      time: selectedTime,
                      fee: doctor.consultationFee
                    });
                    setStep("success");
                  }}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  💳 Pay & Confirm
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(34,197,94,0.2)", border: "2px solid rgba(34,197,94,0.4)" }}>
                <Check size={32} style={{ color: "#22c55e" }} />
              </div>
              <h4 className="font-display font-bold text-xl mb-2">Appointment Confirmed! 🎉</h4>
              <p style={{ color: "var(--color-text-muted)" }} className="text-sm mb-4">
                Your consultation with {doctor.name} is booked for {selectedDate} at {selectedTime}
              </p>
              <p className="text-sm mb-6">
                📧 Confirmation sent to your email<br />
                📱 Video link will be shared 15 mins before
              </p>
              <div className="flex gap-3">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                  <Video size={14} /> Join Call
                </button>
                <button onClick={onClose} className="btn-ghost flex-1 text-sm">Done</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// =============================================
// VIDEO CALL SCREEN (MOCK)
// =============================================
function VideoCallScreen({ doctor, onClose }: { doctor: typeof doctors[0]; onClose: () => void }) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [duration, setDuration] = useState("00:00");
  const [elapsed, setElapsed] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        const mins = String(Math.floor(next / 60)).padStart(2, "0");
        const secs = String(next % 60).padStart(2, "0");
        setDuration(`${mins}:${secs}`);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Doctor Video (mock background) */}
      <div className="flex-1 relative flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0a0e1a, #0d1320)" }}>
        <div className="text-center">
          <div className="text-8xl mb-4">{doctor.avatar}</div>
          <p className="text-xl font-bold text-white">{doctor.name}</p>
          <p className="text-sm text-gray-400">{doctor.specialty}</p>
          <p className="mt-2 text-green-400">{duration}</p>
          <div className="flex gap-1.5 justify-center mt-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="voice-wave-bar bg-green-400" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>

        {/* Self preview */}
        <div
          className="absolute bottom-4 right-4 w-28 h-20 rounded-xl flex items-center justify-center"
          style={{ background: videoOff ? "#1a1a2e" : "#0d1b2e", border: "2px solid rgba(255,255,255,0.2)" }}
        >
          {videoOff ? (
            <p className="text-xs text-gray-400">Camera off</p>
          ) : (
            <span className="text-4xl">👨</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{ background: muted ? "#374151" : "rgba(255,255,255,0.1)", color: "white" }}
          >
            {muted ? "🔇" : "🎤"}
          </button>
          <button
            onClick={() => setVideoOff(!videoOff)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: videoOff ? "#374151" : "rgba(255,255,255,0.1)", color: "white" }}
          >
            {videoOff ? "📷" : "📹"}
          </button>
          <button
            onClick={onClose}
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl"
            style={{ background: "#dc2626" }}
          >
            📞
          </button>
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
          >
            💬
          </button>
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
          >
            📋
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          End-to-end encrypted • {duration} • {muted ? "Muted" : "Active"}
        </p>
      </div>
    </motion.div>
  );
}

// =============================================
// DOCTORS PAGE
// =============================================
export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [bookingDoctor, setBookingDoctor] = useState<typeof doctors[0] | null>(null);
  const [callDoctor, setCallDoctor] = useState<typeof doctors[0] | null>(null);

  const filtered = doctors.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = selectedSpecialty === "All" || d.specialty === selectedSpecialty;
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-display font-black mb-1">
          👨‍⚕️ <span className="gradient-text">Find Doctors</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Connect with {doctors.length} verified specialists for video consultation
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Available Now", value: doctors.filter(d => d.available).length, color: "#22c55e" },
          { label: "Specialists", value: doctors.length, color: "#14b8a6" },
          { label: "Avg Wait Time", value: "< 5 min", color: "#d946ef" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className="text-2xl font-display font-black" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor name or specialty..."
            className="input-glass pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: selectedSpecialty === s ? "rgba(20,184,166,0.2)" : "var(--glass-bg)",
                border: selectedSpecialty === s ? "1px solid rgba(20,184,166,0.4)" : "1px solid var(--glass-border)",
                color: selectedSpecialty === s ? "var(--color-primary)" : "var(--color-text-muted)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onBook={setBookingDoctor}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👨‍⚕️</div>
          <p className="font-bold text-lg">No doctors found</p>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingDoctor && (
          <BookingModal
            doctor={bookingDoctor}
            onClose={() => setBookingDoctor(null)}
          />
        )}
      </AnimatePresence>

      {/* Video Call */}
      <AnimatePresence>
        {callDoctor && (
          <VideoCallScreen
            doctor={callDoctor}
            onClose={() => setCallDoctor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
