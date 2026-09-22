"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, MessageSquare, Activity, ShoppingBag,
  Video, Heart, User, Settings, LogOut, Menu, X,
  Bell, Search, Moon, Sun, Shield, ChevronRight, Ticket,
} from "lucide-react";
import { useTheme } from "@/components/Providers";
import { useCartStore } from "@/store/cartStore";
import { notifications } from "@/lib/mockData";

// Navigation links
const navLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/symptom-checker", icon: Activity, label: "Symptom Checker" },
  { href: "/opd-booking", icon: Ticket, label: "OPD Tickets" },
  { href: "/medicines", icon: ShoppingBag, label: "Medicine Store" },
  { href: "/doctors", icon: Video, label: "Doctors" },
  { href: "/health-tracker", icon: Heart, label: "Health Tracker" },
  { href: "/profile", icon: User, label: "My Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

// =============================================
// USER AVATAR — shows Google photo or initials
// =============================================
function UserAvatar({ name, image, size = 32 }: { name?: string | null; image?: string | null; size?: number }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "MM";

  if (image) {
    return (
      <Image
        src={image}
        alt={name || "User"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

// =============================================
// SIDEBAR COMPONENT
// =============================================
function Sidebar({ isMobileOpen, onClose }: { isMobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { totalItems } = useCartStore();

  const user = session?.user;
  const displayName = user?.name || "MediMind User";
  const displayEmail = user?.email || "";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="ai-orb" style={{ width: 36, height: 36 }} />
          <span className="font-display font-bold text-xl gradient-text">MediMind</span>
        </Link>
        <button onClick={onClose} className="lg:hidden" style={{ color: "var(--color-text-muted)" }}>
          <X size={20} />
        </button>
      </div>

      {/* User Card — REAL SESSION DATA */}
      <div className="mx-4 mb-4 p-3 glass-card">
        <div className="flex items-center gap-3">
          <UserAvatar name={user?.name} image={user?.image} size={40} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{displayName}</div>
            <div className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{displayEmail}</div>
          </div>
          <span className="badge badge-primary text-xs">Pro</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider px-3 py-2" style={{ color: "var(--color-text-muted)" }}>
          Main Menu
        </p>
        {navLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}>
              <div className={`sidebar-link ${isActive ? "active" : ""}`}>
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {label === "Medicine Store" && totalItems() > 0 && (
                  <span className="badge badge-accent text-xs">{totalItems()}</span>
                )}
                {isActive && <ChevronRight size={14} />}
              </div>
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider px-3 py-2" style={{ color: "var(--color-text-muted)" }}>
            Quick Actions
          </p>
          <Link href="/admin">
            <div className="sidebar-link">
              <Shield size={18} />
              <span>Admin Panel</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* SOS Button */}
      <div className="p-4">
        <button
          className="w-full p-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(239,68,68,0.2))",
            border: "1px solid rgba(239,68,68,0.4)",
            color: "#ef4444",
          }}
          onClick={() => alert("🚨 Emergency services contacted!\nCalling 112...")}
        >
          🆘 Emergency SOS
        </button>
      </div>

      {/* REAL Sign Out */}
      <div className="p-4 pt-0">
        <button onClick={handleSignOut} className="w-full">
          <div className="sidebar-link text-red-400">
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 glass border-r"
        style={{ borderColor: "var(--color-border)" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 glass lg:hidden overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// =============================================
// HEADER COMPONENT
// =============================================
function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const user = session?.user;

  return (
    <header
      className="fixed top-0 left-0 right-0 lg:left-64 z-30 glass border-b h-16 flex items-center px-4 gap-4"
      style={{ borderColor: "var(--color-border)" }}
    >
      <button onClick={onMenuClick} className="lg:hidden" style={{ color: "var(--color-text-muted)" }}>
        <Menu size={22} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
        <input
          type="text"
          placeholder="Search symptoms, medicines, doctors..."
          className="input-glass pl-9 py-2 text-sm"
          style={{ background: "var(--glass-bg)" }}
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-all hover:border-primary-500"
          style={{ color: "var(--color-text-muted)" }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center relative"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white"
                style={{ background: "#ef4444" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 glass rounded-2xl border overflow-hidden z-50"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <h3 className="font-bold">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 border-b flex gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="text-lg">
                        {n.type === "medicine" ? "💊" : n.type === "appointment" ? "📅" : n.type === "order" ? "🚚" : "💡"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{n.time}</p>
                      </div>
                      {n.unread && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "var(--color-primary)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real User Avatar */}
        <div className="avatar-ring cursor-pointer">
          <UserAvatar name={user?.name} image={user?.image} size={32} />
        </div>
      </div>
    </header>
  );
}

// =============================================
// MAIN LAYOUT — with Auth Protection
// =============================================
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Route protection — if not logged in, go to /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="text-center">
          <div className="ai-orb mx-auto mb-4" style={{ width: 56, height: 56 }} />
          <p style={{ color: "var(--color-text-muted)" }}>Loading MediMind...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — don't render (redirect happening)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <div className="animated-bg" />
      <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Header onMenuClick={() => setMobileOpen(true)} />
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
