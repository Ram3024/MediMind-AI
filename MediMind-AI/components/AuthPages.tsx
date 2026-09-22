"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle } from "lucide-react";

function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--gradient-hero)" }}>
      <div className="animated-bg" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="ai-orb mx-auto mb-4" style={{ width: 56, height: 56 }} />
          <h1 className="text-3xl font-display font-black gradient-text">MediMind AI</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Your Intelligent Health Companion</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-display font-bold mb-2">{title}</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// =============================================
// GOOGLE SIGN IN BUTTON
// =============================================
function GoogleSignInButton({ label = "Continue with Google", callbackUrl = "/dashboard" }: { label?: string; callbackUrl?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      // This opens the REAL Google account chooser
      await signIn("google", { callbackUrl });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="btn-ghost w-full flex items-center justify-center gap-3 relative overflow-hidden"
        onClick={handleGoogleSignIn}
        disabled={loading}
        id="google-signin-btn"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            Redirecting to Google...
          </span>
        ) : (
          <>
            {/* Real Google G Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-400 text-center mt-2">{error}</p>
      )}
    </div>
  );
}

// =============================================
// LOGIN PAGE
// =============================================
export function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async () => {
    setLoading(true);
    // Email/password login — for now redirects to dashboard
    // You can add credentials provider in NextAuth for real email login
    await new Promise(r => setTimeout(r, 400));
    router.push("/dashboard");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-center">
          <div className="ai-orb mx-auto mb-4" style={{ width: 56, height: 56 }} />
          <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout title="Welcome Back 👋" subtitle="Sign in to your MediMind AI account">
      <div className="space-y-4">
        {/* Real Google Sign In */}
        <GoogleSignInButton label="Continue with Google" callbackUrl="/dashboard" />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>or email</span>
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-glass pl-9"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-glass pl-9 pr-10"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password">
            <span className="text-xs" style={{ color: "var(--color-primary)" }}>Forgot password?</span>
          </Link>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? "Signing in..." : <><ArrowRight size={16} /> Sign In</>}
        </button>

        <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register">
            <span style={{ color: "var(--color-primary)" }} className="font-semibold">Sign up free</span>
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

// =============================================
// REGISTER PAGE
// =============================================
export function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleRegister = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    setStep("otp");
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setLoading(false);
    setStep("success");
  };

  if (step === "success") {
    return (
      <AuthLayout title="🎉 Welcome to MediMind!" subtitle="Your account has been created successfully">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(34,197,94,0.2)" }}>
            <CheckCircle size={40} style={{ color: "#22c55e" }} />
          </div>
          <p className="mb-6" style={{ color: "var(--color-text-muted)" }}>
            Account verified! You&apos;re ready to start your health journey with AI.
          </p>
          <Link href="/onboarding">
            <button className="btn-primary w-full">Complete Setup →</button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout title="Verify OTP 📱" subtitle={`Enter the 6-digit code sent to ${phone}`}>
        <div className="space-y-6">
          <div className="p-4 rounded-xl text-xs font-semibold glass border border-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-between gap-3 bg-teal-500/10 backdrop-blur-md shadow-sm">
            <div>
              💬 <strong>Demo OTP:</strong> Use <strong>123456</strong> to verify!
            </div>
            <button
              onClick={() => setOtp(["1", "2", "3", "4", "5", "6"])}
              className="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded font-bold transition-all text-[10px] uppercase flex-shrink-0"
            >
              Auto-Fill
            </button>
          </div>

          <div className="flex gap-2 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[i] = e.target.value;
                  setOtp(newOtp);
                  if (e.target.value && i < 5) {
                    const next = document.getElementById(`otp-${i + 1}`);
                    next?.focus();
                  }
                }}
                id={`otp-${i}`}
                className="w-12 h-12 text-center text-lg font-bold rounded-xl input-glass"
              />
            ))}
          </div>
          <button onClick={handleVerifyOTP} disabled={loading} className="btn-primary w-full">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            Didn&apos;t receive? <button className="font-semibold" style={{ color: "var(--color-primary)" }}>Resend OTP</button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account 🏥" subtitle="Join 48,000+ users on MediMind AI">
      <div className="space-y-4">
        {/* Real Google Sign Up */}
        <GoogleSignInButton label="Sign up with Google" callbackUrl="/onboarding" />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>or register</span>
          <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
        </div>

        {[
          { label: "Full Name", icon: User, value: name, onChange: setName, placeholder: "Rambali Sharma", type: "text" },
          { label: "Email", icon: Mail, value: email, onChange: setEmail, placeholder: "your@email.com", type: "email" },
          { label: "Phone Number", icon: Phone, value: phone, onChange: setPhone, placeholder: "+91 98765 43210", type: "tel" },
          { label: "Password", icon: Lock, value: password, onChange: setPassword, placeholder: "••••••••", type: "password" },
        ].map(({ label, icon: Icon, value, onChange, placeholder, type }) => (
          <div key={label}>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-text-muted)" }}>{label}</label>
            <div className="relative">
              <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
              <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-glass pl-9" />
            </div>
          </div>
        ))}

        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          By signing up, you agree to our{" "}
          <span style={{ color: "var(--color-primary)" }}>Terms of Service</span> and{" "}
          <span style={{ color: "var(--color-primary)" }}>Privacy Policy</span>
        </p>

        <button onClick={handleRegister} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? "Creating account..." : "Create Account & Get OTP"}
        </button>

        <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login">
            <span style={{ color: "var(--color-primary)" }} className="font-semibold">Sign in</span>
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
