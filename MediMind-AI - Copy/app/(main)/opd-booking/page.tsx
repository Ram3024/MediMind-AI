"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, Search, MapPin, Calendar, Clock, User, 
  ArrowRight, CheckCircle2, QrCode, RefreshCw, X, FileText 
} from "lucide-react";

interface OPDToken {
  id: string;
  hospital: string;
  department: string;
  room: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  tokenNumber: string;
  bookedAt: string;
  patientsAhead: number;
  status: "waiting" | "called" | "completed";
}

const hospitals = [
  // Delhi
  { id: "h1", name: "AIIMS (All India Institute of Medical Sciences)", address: "Ansari Nagar, New Delhi", type: "Government", city: "Delhi" },
  { id: "h2", name: "Safdarjung Hospital", address: "Ansari Nagar West, New Delhi", type: "Government", city: "Delhi" },
  { id: "h3", name: "Max Super Speciality Hospital", address: "Saket, New Delhi", type: "Private", city: "Delhi" },
  // Lucknow (LKO)
  { id: "h5", name: "SGPGI (Sanjay Gandhi Post Graduate Institute of Medical Sciences)", address: "Raebareli Road, Lucknow", type: "Government", city: "Lucknow" },
  { id: "h6", name: "KGMU (King George's Medical University)", address: "Chowk, Lucknow", type: "Government", city: "Lucknow" },
  { id: "h7", name: "Dr. Ram Manohar Lohia Institute of Medical Sciences", address: "Vibhuti Khand, Gomti Nagar, Lucknow", type: "Government", city: "Lucknow" },
  { id: "h8", name: "Medanta Hospital", address: "Amar Shaheed Path, Lucknow", type: "Private", city: "Lucknow" },
  // Patna
  { id: "h9", name: "PMCH (Patna Medical College and Hospital)", address: "Ashok Rajpath, Patna", type: "Government", city: "Patna" },
  { id: "h10", name: "AIIMS Patna", address: "Phulwari Sharif, Patna", type: "Government", city: "Patna" },
  // Noida / NCR
  { id: "h4", name: "MediMind Care Clinic", address: "Sector 62, Noida", type: "Clinic", city: "Noida" },
  { id: "h11", name: "Fortis Hospital", address: "Sector 62, Noida", type: "Private", city: "Noida" },
];

const departments = [
  { name: "General Medicine", room: "Room 102 (First Floor)", averageWait: "12 mins" },
  { name: "Pediatrics (Child Care)", room: "Room 115 (First Floor)", averageWait: "8 mins" },
  { name: "Cardiology (Heart)", room: "Room 204 (Second Floor)", averageWait: "20 mins" },
  { name: "Orthopedics (Bones)", room: "Room 209 (Second Floor)", averageWait: "15 mins" },
  { name: "Dermatology (Skin)", room: "Room 302 (Third Floor)", averageWait: "10 mins" },
  { name: "ENT (Ear, Nose, Throat)", room: "Room 108 (First Floor)", averageWait: "9 mins" },
  { name: "Ophthalmology (Eye Care)", room: "Room 110 (First Floor)", averageWait: "14 mins" },
  { name: "Gynaecology & Obstetrics", room: "Room 215 (Second Floor)", averageWait: "18 mins" },
  { name: "Neurology (Brain & Nerves)", room: "Room 310 (Third Floor)", averageWait: "25 mins" },
  { name: "Pulmonology (Lungs/Asthma)", room: "Room 201 (Second Floor)", averageWait: "11 mins" },
  { name: "Nephrology (Kidney Care)", room: "Room 305 (Third Floor)", averageWait: "22 mins" },
];

// Initial mock token to make the dashboard look active
const initialTokens: OPDToken[] = [
  {
    id: "opd-9421",
    hospital: "AIIMS (All India Institute of Medical Sciences)",
    department: "General Medicine",
    room: "Room 102 (First Floor)",
    patientName: "Rambali Sharma",
    patientAge: 45,
    patientGender: "Male",
    tokenNumber: "OPD-205",
    bookedAt: "Today, 10:30 AM",
    patientsAhead: 4,
    status: "waiting",
  }
];

export default function OPDBookingPage() {
  const [tokens, setTokens] = useState<OPDToken[]>(initialTokens);
  const [activeStep, setActiveStep] = useState<"dashboard" | "book_hospital" | "book_details" | "success">("dashboard");
  
  // Form State
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);
  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [symptoms, setSymptoms] = useState("");
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<OPDToken | null>(null);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  // Selected ticket for detailed view modal
  const [selectedTicketModal, setSelectedTicketModal] = useState<OPDToken | null>(null);

  // Simulate queue updates (live countdown of patients ahead)
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prevTokens) =>
        prevTokens.map((token) => {
          if (token.status === "waiting" && token.patientsAhead > 0) {
            const nextAhead = token.patientsAhead - 1;
            return {
              ...token,
              patientsAhead: nextAhead,
              status: nextAhead === 0 ? "called" : "waiting",
            };
          }
          return token;
        })
      );
      
      // Update selected modal data if it is active
      if (selectedTicketModal) {
        setSelectedTicketModal((prev) => {
          if (prev && prev.status === "waiting" && prev.patientsAhead > 0) {
            const nextAhead = prev.patientsAhead - 1;
            return {
              ...prev,
              patientsAhead: nextAhead,
              status: nextAhead === 0 ? "called" : "waiting",
            };
          }
          return prev;
        });
      }
    }, 15000); // Decrase wait count every 15 seconds for simulation

    return () => clearInterval(interval);
  }, [selectedTicketModal]);

  const handleCreateBooking = () => {
    if (!patientName.trim()) {
      alert("Please enter patient name");
      return;
    }
    if (!patientAge || isNaN(Number(patientAge))) {
      alert("Please enter a valid age");
      return;
    }

    const tNum = `OPD-${Math.floor(Math.random() * 800) + 100}`;
    const mockAhead = Math.floor(Math.random() * 8) + 3; // 3 to 10 ahead

    const newToken: OPDToken = {
      id: `opd-${Date.now().toString().slice(-4)}`,
      hospital: selectedHospital.name,
      department: selectedDept.name,
      room: selectedDept.room,
      patientName,
      patientAge: parseInt(patientAge),
      patientGender,
      tokenNumber: tNum,
      bookedAt: "Today, Just Now",
      patientsAhead: mockAhead,
      status: "waiting",
    };

    setTokens([newToken, ...tokens]);
    setNewlyCreatedToken(newToken);
    
    // Clear form
    setPatientName("");
    setPatientAge("");
    setSymptoms("");

    setActiveStep("success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black gradient-text">OPD Queue Tickets</h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm">
            Book fast-track OPD slots online and skip the manual paper registration lines.
          </p>
        </div>

        {activeStep === "dashboard" && (
          <button
            onClick={() => setActiveStep("book_hospital")}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Ticket size={16} />
            Book OPD Ticket
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: DASHBOARD (Active Tickets & History) */}
        {activeStep === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Active Tickets List (Left 2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🎟️ Active OPD Tickets
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">Live Status</span>
              </h2>

              {tokens.length === 0 ? (
                <div className="glass-card p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-white/5 border" style={{ borderColor: "var(--glass-border)" }}>
                    <Ticket size={28} style={{ color: "var(--color-text-muted)" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">No Active OPD Tickets</h3>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>You don't have any bookings today. Book a ticket to check in at the hospital.</p>
                  </div>
                  <button onClick={() => setActiveStep("book_hospital")} className="btn-ghost text-xs px-4">
                    Book Now
                  </button>
                </div>
              ) : (
                tokens.map((token) => (
                  <motion.div
                    key={token.id}
                    layoutId={`ticket-${token.id}`}
                    className="glass-card overflow-hidden flex flex-col md:flex-row relative group hover:scale-[1.01] transition-transform duration-300"
                  >
                    {/* Visual Stamp Card accent */}
                    <div className="w-2 md:w-3 bg-gradient-to-b from-teal-400 to-pink-400" />
                    
                    <div className="p-5 flex-1 space-y-4">
                      {/* Hospital & Department */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--color-primary)" }}>{token.department}</p>
                          <h3 className="font-bold text-base mt-0.5">{token.hospital}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Token Number</p>
                          <h4 className="text-xl font-black gradient-text">{token.tokenNumber}</h4>
                        </div>
                      </div>

                      {/* Patient & Room Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-dashed" style={{ borderColor: "var(--glass-border)" }}>
                        <div>
                          <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Patient Name</p>
                          <p className="text-xs font-bold text-white mt-0.5">{token.patientName} ({token.patientAge}, {token.patientGender})</p>
                        </div>
                        <div>
                          <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Location / Room</p>
                          <p className="text-xs font-semibold text-white mt-0.5">{token.room}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Booked On</p>
                          <p className="text-xs text-white mt-0.5">{token.bookedAt}</p>
                        </div>
                      </div>

                      {/* Live Queue Indicator */}
                      <div className="p-3 rounded-xl flex items-center justify-between gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
                        <div className="flex items-center gap-2">
                          <RefreshCw size={14} className="animate-spin text-teal-400" />
                          <span className="text-xs font-semibold text-white">
                            {token.status === "called" 
                              ? "🚨 Your number is called! Proceed immediately." 
                              : `Queue Status: ${token.patientsAhead} patients ahead of you`}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold" style={{ color: "var(--color-secondary)" }}>
                          {token.status === "called" ? "Go to Room" : `Est. Wait: ~${token.patientsAhead * 4} mins`}
                        </span>
                      </div>
                    </div>

                    {/* QR Code trigger & Actions (Right side) */}
                    <div className="p-5 flex flex-row md:flex-col items-center justify-between border-t md:border-t-0 md:border-l border-dashed" style={{ borderColor: "var(--glass-border)", background: "rgba(255,255,255,0.01)" }}>
                      <div className="flex flex-col items-center gap-1.5">
                        <QrCode size={48} className="text-white/80 group-hover:text-teal-400 transition-colors" />
                        <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">Scan at Kiosk</span>
                      </div>

                      <div className="flex gap-2 md:flex-col w-auto md:w-full mt-0 md:mt-4">
                        <button 
                          onClick={() => setSelectedTicketModal(token)}
                          className="btn-ghost py-1 px-3 text-[11px] font-bold w-full"
                        >
                          View Ticket
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm("Cancel this OPD booking?")) {
                              setTokens(tokens.filter(t => t.id !== token.id));
                            }
                          }}
                          className="py-1.5 px-3 text-[11px] font-bold rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Quick Informative Kiosk Guide (Right column) */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold">💡 How OPD Booking Works</h2>
              
              <div className="glass-card p-5 space-y-4 text-sm leading-relaxed">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white">Book Online</h4>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      Select a hospital, department, and fill patient details. Get a token instantly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white">Skip Manual Lines</h4>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      When you reach the hospital, don't stand in the long OPD booking queue. Find the digital kiosk.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/15 text-yellow-400 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white">Scan & Print</h4>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      Scan your booking QR Code at the kiosk. It will instantly print your official OPD paper-slip (Parcha).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs flex gap-2 text-teal-300">
                  <span>⚡</span>
                  <span><strong>Zero Waiting:</strong> Book at home, reach hospital on time, and get directly in front of the doctor’s room.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: BOOKING - CHOOSE HOSPITAL */}
        {activeStep === "book_hospital" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-6 max-w-2xl mx-auto space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="text-xl font-bold">Step 1: Select Hospital & Clinic</h2>
              <button onClick={() => setActiveStep("dashboard")} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>

            {/* Hospital cards */}
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Hospitals Near You</label>
                
                {/* Search Hospital */}
                <div className="relative w-full md:w-64">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search by name or city..."
                    value={hospitalSearch}
                    onChange={(e) => setHospitalSearch(e.target.value)}
                    className="input-glass pl-8 py-1 text-xs w-full"
                    style={{ background: "rgba(255, 255, 255, 0.02)" }}
                  />
                </div>
              </div>

              {/* City location filter pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 hide-scrollbar">
                {["All", "Delhi", "Lucknow", "Patna", "Noida"].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      selectedCity === city
                        ? "bg-teal-500/20 border-teal-500 text-teal-300"
                        : "bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    📍 {city}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 hide-scrollbar">
                {hospitals
                  .filter((h) => selectedCity === "All" || h.city === selectedCity)
                  .filter((h) => 
                    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) || 
                    h.address.toLowerCase().includes(hospitalSearch.toLowerCase())
                  )
                  .map((hosp) => (
                    <div
                      key={hosp.id}
                      onClick={() => setSelectedHospital(hosp)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        selectedHospital.id === hosp.id 
                          ? "bg-primary-500/10 border-primary-500 shadow-lg" 
                          : "hover:bg-white/5 border-white/5"
                      }`}
                      style={selectedHospital.id === hosp.id ? { borderColor: "var(--color-primary)" } : {}}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-lg">🏥</div>
                        <div>
                          <h4 className="font-semibold text-sm">{hosp.name}</h4>
                          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                            <MapPin size={11} /> {hosp.address}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        hosp.type === "Government" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {hosp.type}
                      </span>
                    </div>
                  ))}
                {hospitals.filter((h) => 
                  (selectedCity === "All" || h.city === selectedCity) &&
                  (h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) || 
                   h.address.toLowerCase().includes(hospitalSearch.toLowerCase()))
                ).length === 0 && (
                  <p className="text-center text-xs p-4" style={{ color: "var(--color-text-muted)" }}>
                    No hospitals found matching your search.
                  </p>
                )}
              </div>
            </div>

            {/* Department dropdown */}
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Select Speciality Department</label>
                
                {/* Search Department */}
                <div className="relative w-full md:w-64">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search department..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    className="input-glass pl-8 py-1 text-xs w-full"
                    style={{ background: "rgba(255, 255, 255, 0.02)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 hide-scrollbar">
                {departments
                  .filter((d) => d.name.toLowerCase().includes(deptSearch.toLowerCase()))
                  .map((dept) => (
                    <div
                      key={dept.name}
                      onClick={() => setSelectedDept(dept)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedDept.name === dept.name 
                          ? "bg-secondary-500/10 border-pink-500 shadow-md" 
                          : "hover:bg-white/5 border-white/5"
                      }`}
                      style={selectedDept.name === dept.name ? { borderColor: "var(--color-secondary)" } : {}}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-white">{dept.name}</span>
                        <span className="text-[10px] opacity-75 font-bold" style={{ color: "var(--color-text-muted)" }}>Wait: ~{dept.averageWait}</span>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>{dept.room}</p>
                    </div>
                  ))}
                {departments.filter((d) => d.name.toLowerCase().includes(deptSearch.toLowerCase())).length === 0 && (
                  <p className="text-center text-xs p-4 col-span-2" style={{ color: "var(--color-text-muted)" }}>
                    No departments found matching your search.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
              <button 
                onClick={() => setActiveStep("dashboard")}
                className="py-2 px-4 rounded-xl border text-sm font-semibold hover:bg-white/5 transition-all"
                style={{ borderColor: "var(--glass-border)" }}
              >
                Back to Dashboard
              </button>
              <button 
                onClick={() => setActiveStep("book_details")}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: BOOKING - PATIENT DETAILS */}
        {activeStep === "book_details" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="glass-card p-6 max-w-2xl mx-auto space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="text-xl font-bold">Step 2: Enter Patient Information</h2>
              <button onClick={() => setActiveStep("dashboard")} className="text-white/60 hover:text-white"><X size={18} /></button>
            </div>

            {/* Selected summary */}
            <div className="p-3.5 rounded-xl text-xs space-y-1 bg-white/5 border border-dashed" style={{ borderColor: "var(--glass-border)" }}>
              <p style={{ color: "var(--color-text-muted)" }}>Booking Appointment Slot at:</p>
              <p className="font-bold text-white text-sm">{selectedHospital.name}</p>
              <p className="font-semibold text-teal-400">{selectedDept.name} • {selectedDept.room}</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Patient Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                    <input 
                      type="text" 
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rambali Sharma" 
                      className="input-glass pl-9" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Age</label>
                    <input 
                      type="number" 
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Age" 
                      className="input-glass" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="input-glass"
                      style={{ background: "var(--glass-bg)", color: "white" }}
                    >
                      <option value="Male" style={{ background: "var(--color-bg)" }}>Male</option>
                      <option value="Female" style={{ background: "var(--color-bg)" }}>Female</option>
                      <option value="Other" style={{ background: "var(--color-bg)" }}>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Brief Symptoms / Illness Reason (Optional)</label>
                <textarea 
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Fever from 2 days, mild stomach discomfort..." 
                  className="input-glass min-h-20"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
              <button 
                onClick={() => setActiveStep("book_hospital")}
                className="py-2 px-4 rounded-xl border text-sm font-semibold hover:bg-white/5 transition-all"
                style={{ borderColor: "var(--glass-border)" }}
              >
                Back
              </button>
              <button 
                onClick={handleCreateBooking}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Generate Token Ticket
                <CheckCircle2 size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: SUCCESS VIEW */}
        {activeStep === "success" && newlyCreatedToken && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
              <CheckCircle2 size={40} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">OPD Booking Confirmed!</h2>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Your digital queue ticket has been generated successfully.</p>
            </div>

            {/* Simulated OPD Slip Card */}
            <div className="bg-[#fcfbf9] text-gray-900 border-2 border-gray-300 rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto relative font-sans text-left">
              {/* Receipt Header */}
              <div className="p-4 bg-gray-100 border-b border-gray-300 text-center relative">
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gray-300 shadow-inner" />
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gray-300 shadow-inner" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Govt. Registered Kiosk OPD</p>
                <h3 className="font-extrabold text-xs text-gray-800 tracking-tight mt-1">{newlyCreatedToken.hospital.toUpperCase()}</h3>
                <p className="text-[8px] text-gray-400 mt-0.5">HEALTH DEPARTMENT SLIP</p>
              </div>

              {/* Barcode */}
              <div className="pt-4 flex flex-col items-center">
                {/* Simulated Barcode */}
                <div className="flex h-10 w-48 bg-black gap-0.5 overflow-hidden items-stretch">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 4, 3, 1, 2, 4, 1].map((width, idx) => (
                    <div key={idx} className="bg-black flex-1" style={{ opacity: idx % 2 === 0 ? 1 : 0 }} />
                  ))}
                </div>
                <p className="text-[9px] tracking-[0.3em] font-mono text-gray-600 mt-1">*{newlyCreatedToken.id.toUpperCase()}*</p>
              </div>

              {/* Card slip content */}
              <div className="p-5 space-y-4 text-xs">
                {/* Main Token Box */}
                <div className="border-2 border-dashed border-gray-400 p-3 rounded-xl bg-gray-50 text-center space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Queue Token Number</span>
                  <p className="font-mono font-black text-4xl text-gray-900 tracking-tighter">{newlyCreatedToken.tokenNumber}</p>
                  <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">{newlyCreatedToken.department}</p>
                  <p className="text-[9px] font-medium text-gray-500">{newlyCreatedToken.room}</p>
                </div>

                {/* Patient Information Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-200 py-3 font-mono">
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">PATIENT NAME</span>
                    <span className="font-bold text-gray-800 text-[11px] truncate block">{newlyCreatedToken.patientName}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">AGE / GENDER</span>
                    <span className="font-bold text-gray-800 text-[11px] block">{newlyCreatedToken.patientAge} Years / {newlyCreatedToken.patientGender}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">REG DATE / TIME</span>
                    <span className="font-bold text-gray-600 text-[10px] block">
                      {newlyCreatedToken.bookedAt === "Today, Just Now" 
                        ? new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) 
                        : newlyCreatedToken.bookedAt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">ESTIMATED WAIT</span>
                    <span className="font-bold text-emerald-600 text-[11px] block">{newlyCreatedToken.patientsAhead} ahead (~{newlyCreatedToken.patientsAhead * 4} mins)</span>
                  </div>
                </div>

                {/* Real QR Code */}
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <div className="bg-white p-2 border border-gray-300 rounded-xl inline-block shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=000000&bgcolor=ffffff&data=${encodeURIComponent(
                        `OPD SLIP\nRef: ${newlyCreatedToken.id.toUpperCase()}\nHospital: ${newlyCreatedToken.hospital}\nDept: ${newlyCreatedToken.department}\nRoom: ${newlyCreatedToken.room}\nPatient: ${newlyCreatedToken.patientName} (${newlyCreatedToken.patientAge}Y/${newlyCreatedToken.patientGender})\nToken: ${newlyCreatedToken.tokenNumber}`
                      )}`}
                      alt="Real OPD Ticket QR Code"
                      className="w-28 h-28"
                    />
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 tracking-wider">SCAN TO VERIFY OPD SLIP</span>
                </div>

                {/* Vitals Check Boxes */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-1.5 font-mono text-[9px] text-gray-600">
                  <p className="font-bold border-b border-gray-200 pb-1 uppercase tracking-wider text-[8px] text-gray-400">VITAL SIGNS (NURSE WARD)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>TEMP: __________ °F</div>
                    <div>BP: ____________ mmHg</div>
                    <div>PULSE: ________ bpm</div>
                    <div>WEIGHT: ________ kg</div>
                  </div>
                </div>

                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[10px] leading-relaxed text-teal-800 font-sans shadow-sm">
                  ⚡ <strong>Hospital Check-In:</strong> Go directly to **Counter #1** (or any Self-Service OPD Kiosk) and scan this QR code to instantly print the paper prescription parcha.
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => {
                  const printContent = document.querySelector(".bg-\\[\\#fcfbf9\\]")?.innerHTML;
                  if (printContent) {
                    const printWindow = window.open("", "_blank");
                    printWindow?.document.write(`<html><head><title>Print OPD Ticket</title><style>body{font-family:sans-serif;padding:30px;background:#f9f9f9;} .card{background:#fcfbf9;color:#111;padding:20px;border:1px solid #ddd;border-radius:15px;max-width:400px;margin:auto;box-shadow:0 5px 15px rgba(0,0,0,0.05);}</style></head><body><div class="card">${printContent}</div></body></html>`);
                    printWindow?.document.close();
                    printWindow?.print();
                  }
                }}
                className="py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 hover:bg-white/5 transition-all"
                style={{ borderColor: "var(--glass-border)" }}
              >
                <FileText size={16} />
                Print Ticket
              </button>
              <button 
                onClick={() => setActiveStep("dashboard")}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED TICKET MODAL */}
      <AnimatePresence>
        {selectedTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-sm w-full overflow-hidden relative"
              style={{ border: "1px solid var(--color-primary)" }}
            >
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.02)" }}>
                <span className="font-bold text-sm text-white">OPD Kiosk Token Receipt</span>
                <button onClick={() => setSelectedTicketModal(null)} className="text-white/60 hover:text-white"><X size={16} /></button>
              </div>

              {/* Receipt Content */}
              <div className="bg-[#fcfbf9] text-gray-900 p-5 space-y-4 font-sans text-xs text-left">
                {/* Receipt Header */}
                <div className="text-center relative border-b border-gray-200 pb-3">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Kiosk Token Receipt</p>
                  <h3 className="font-extrabold text-xs text-gray-800 tracking-tight mt-1">{selectedTicketModal.hospital.toUpperCase()}</h3>
                </div>

                {/* Main Token Box */}
                <div className="border-2 border-dashed border-gray-400 p-3 rounded-xl bg-gray-50 text-center space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Queue Token Number</span>
                  <p className="font-mono font-black text-3xl text-gray-900 tracking-tighter">{selectedTicketModal.tokenNumber}</p>
                  <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">{selectedTicketModal.department}</p>
                  <p className="text-[9px] font-medium text-gray-500">{selectedTicketModal.room}</p>
                </div>

                {/* Patient Information Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-200 py-3 font-mono">
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">PATIENT NAME</span>
                    <span className="font-bold text-gray-800 text-[11px] truncate block">{selectedTicketModal.patientName}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">AGE / GENDER</span>
                    <span className="font-bold text-gray-800 text-[11px] block">{selectedTicketModal.patientAge} Years / {selectedTicketModal.patientGender}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">BOOKED ON</span>
                    <span className="font-bold text-gray-600 text-[10px] block">{selectedTicketModal.bookedAt}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 block uppercase">QUEUE STATUS</span>
                    <span className={`font-bold text-[10px] block ${selectedTicketModal.status === "called" ? "text-red-600" : "text-emerald-600"}`}>
                      {selectedTicketModal.status === "called" ? "🚨 Proceed to Room" : `${selectedTicketModal.patientsAhead} Patients Ahead`}
                    </span>
                  </div>
                </div>

                {/* Real QR Code */}
                <div className="flex flex-col items-center gap-1.5 pt-1">
                  <div className="bg-white p-2 border border-gray-300 rounded-xl inline-block shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=000000&bgcolor=ffffff&data=${encodeURIComponent(
                        `OPD SLIP\nRef: ${selectedTicketModal.id.toUpperCase()}\nHospital: ${selectedTicketModal.hospital}\nDept: ${selectedTicketModal.department}\nRoom: ${selectedTicketModal.room}\nPatient: ${selectedTicketModal.patientName} (${selectedTicketModal.patientAge}Y/${selectedTicketModal.patientGender})\nToken: ${selectedTicketModal.tokenNumber}`
                      )}`}
                      alt="Real OPD Ticket QR Code"
                      className="w-24 h-24"
                    />
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 tracking-wider">Kiosk ID: {selectedTicketModal.id.toUpperCase()}</span>
                </div>

                {/* Vitals Check Boxes */}
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-1.5 font-mono text-[9px] text-gray-600">
                  <p className="font-bold border-b border-gray-200 pb-1 uppercase tracking-wider text-[8px] text-gray-400">VITAL SIGNS (NURSE WARD)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>TEMP: __________ °F</div>
                    <div>BP: ____________ mmHg</div>
                    <div>PULSE: ________ bpm</div>
                    <div>WEIGHT: ________ kg</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 justify-center pt-2 font-sans">
                  <button 
                    onClick={() => {
                      const printContent = document.querySelector(".bg-\\[\\#fcfbf9\\]")?.innerHTML;
                      if (printContent) {
                        const printWindow = window.open("", "_blank");
                        printWindow?.document.write(`<html><head><title>Print OPD Ticket</title><style>body{font-family:sans-serif;padding:30px;background:#f9f9f9;} .card{background:#fcfbf9;color:#111;padding:20px;border:1px solid #ddd;border-radius:15px;max-width:400px;margin:auto;box-shadow:0 5px 15px rgba(0,0,0,0.05);}</style></head><body><div class="card">${printContent}</div></body></html>`);
                        printWindow?.document.close();
                        printWindow?.print();
                      }
                    }}
                    className="btn-primary text-xs w-full py-2 cursor-pointer"
                  >
                    Print Ticket
                  </button>
                  <button 
                    onClick={() => setSelectedTicketModal(null)}
                    className="btn-ghost text-xs w-full py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
