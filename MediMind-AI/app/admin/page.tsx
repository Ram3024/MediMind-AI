"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Package, UserCheck, ShoppingCart, TrendingUp,
  DollarSign, Activity, Settings, BarChart2, LogOut,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import Link from "next/link";
import { X } from "lucide-react";
import { adminStats, medicines, doctors, weeklyData } from "@/lib/mockData";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useOrderStore } from "@/store/orderStore";
import { useMedicineStore } from "@/store/medicineStore";

const navItems = [
  { id: "dashboard", icon: BarChart2, label: "Dashboard" },
  { id: "users", icon: Users, label: "Users" },
  { id: "doctors", icon: UserCheck, label: "Doctors" },
  { id: "medicines", icon: Package, label: "Medicines" },
  { id: "orders", icon: ShoppingCart, label: "Orders" },
];

const revenueData = [
  { month: "Jul", revenue: 185000, orders: 1200 },
  { month: "Aug", revenue: 210000, orders: 1450 },
  { month: "Sep", revenue: 195000, orders: 1300 },
  { month: "Oct", revenue: 245000, orders: 1800 },
  { month: "Nov", revenue: 230000, orders: 1650 },
  { month: "Dec", revenue: 284750, orders: 2100 },
];

const recentOrders = [
  { id: "#ORD-4521", user: "Anjali Sharma", medicine: "Paracetamol 500mg x3", amount: 135, status: "Delivered" },
  { id: "#ORD-4520", user: "Rohit Verma", medicine: "Vitamin D3 x2", amount: 398, status: "Shipped" },
  { id: "#ORD-4519", user: "Priya Mehta", medicine: "Cetirizine 10mg", amount: 85, status: "Processing" },
  { id: "#ORD-4518", user: "Arjun Singh", medicine: "Metformin x1", amount: 89, status: "Delivered" },
  { id: "#ORD-4517", user: "Kavita Patel", medicine: "Omeprazole x2", amount: 240, status: "Cancelled" },
  { id: "#ORD-4516", user: "Rambali Sharma", medicine: "Ibuprofen 400mg x2", amount: 110, status: "Delivered" },
  { id: "#ORD-4515", user: "Vijay Kumar", medicine: "Azithromycin 500mg x1", amount: 165, status: "Shipped" },
  { id: "#ORD-4514", user: "Suresh Gupta", medicine: "Multivitamin Daily x1", amount: 320, status: "Processing" },
];

const statusColor: Record<string, string> = {
  Delivered: "#22c55e",
  Shipped: "#3b82f6",
  Processing: "#f59e0b",
  Cancelled: "#ef4444",
};

// =============================================
// ADMIN LAYOUT
// =============================================
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { orders, updateStatus } = useOrderStore();
  const { medicines: adminMedicines, addMedicine, toggleStock, removeMedicine } = useMedicineStore();

  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedForm, setNewMedForm] = useState({
    name: "",
    brand: "",
    category: "Pain Relief",
    price: "",
    originalPrice: "",
    prescriptionRequired: false,
    description: "",
    composition: "",
    manufacturer: "",
    expiryDate: "2027-12",
  });

  const handleAddMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedForm.name || !newMedForm.brand || !newMedForm.price) {
      alert("Please fill all required fields!");
      return;
    }
    addMedicine({
      name: newMedForm.name,
      brand: newMedForm.brand,
      category: newMedForm.category,
      price: Number(newMedForm.price),
      originalPrice: Number(newMedForm.originalPrice || newMedForm.price),
      prescriptionRequired: newMedForm.prescriptionRequired,
      inStock: true,
      image: "/medicines/blister.png",
      description: newMedForm.description || "Medicine details and description",
      uses: ["General therapy"],
      dosage: "As directed by physician",
      sideEffects: ["Nausea", "Headache"],
      warnings: ["Consult doctor before use"],
      manufacturer: newMedForm.manufacturer || "Generic Pharmaceuticals",
      expiryDate: newMedForm.expiryDate,
      composition: newMedForm.composition || newMedForm.name,
    });
    alert(`✅ Medicine "${newMedForm.name}" added to catalog successfully!`);
    setShowAddMedModal(false);
    setNewMedForm({
      name: "",
      brand: "",
      category: "Pain Relief",
      price: "",
      originalPrice: "",
      prescriptionRequired: false,
      description: "",
      composition: "",
      manufacturer: "",
      expiryDate: "2027-12",
    });
  };

  // Find if there are any Processing orders placed in the last 15 minutes
  const latestProcessingOrders = orders.filter(
    (o) => o.status === "Processing" && Date.now() - new Date(o.createdAt).getTime() < 15 * 60 * 1000
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      <div className="animated-bg" />

      {/* Admin Sidebar */}
      <aside
        className="w-56 h-screen fixed left-0 top-0 flex flex-col glass border-r z-40"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="ai-orb" style={{ width: 28, height: 28 }} />
            <span className="font-display font-bold gradient-text">MediMind</span>
          </div>
          <span className="badge badge-warning text-xs">Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`sidebar-link w-full text-left ${activeTab === id ? "active" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-1">
          <Link href="/dashboard">
            <div className="sidebar-link">
              <Activity size={16} />
              <span>User App</span>
            </div>
          </Link>
          <div className="sidebar-link" style={{ color: "#ef4444" }}>
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-56 flex-1 p-6">
        {/* New Order Alert Banner */}
        {latestProcessingOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(59,130,246,0.15))",
              border: "1px solid rgba(20,184,166,0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-bounce">🔔</div>
              <div>
                <p className="font-bold text-sm text-teal-400">New Order Received from {latestProcessingOrders[0].user}!</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Order ID: {latestProcessingOrders[0].id} ({latestProcessingOrders[0].items.length} items) • Total: {formatCurrency(latestProcessingOrders[0].amount)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-xl transition-all"
            >
              Go to Orders
            </button>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-black">
              {activeTab === "dashboard" ? "📊 Admin Dashboard" :
               activeTab === "users" ? "👥 User Management" :
               activeTab === "doctors" ? "👨‍⚕️ Doctor Management" :
               activeTab === "medicines" ? "💊 Medicine Inventory" : "🛒 Order Management"}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-2xl">👨‍💼</div>
            <div>
              <div className="text-sm font-bold">Admin User</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>Super Admin</div>
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, label: "Total Users", value: formatNumber(adminStats.totalUsers), sub: `+${adminStats.newUsersToday} today`, color: "#14b8a6" },
                { icon: UserCheck, label: "Doctors", value: adminStats.totalDoctors, sub: `${adminStats.activeConsultations} active`, color: "#d946ef" },
                { icon: Package, label: "Medicines", value: formatNumber(adminStats.totalMedicines), sub: "In stock", color: "#3b82f6" },
                { icon: DollarSign, label: "Revenue", value: `₹${formatNumber(adminStats.totalRevenue)}`, sub: `${adminStats.totalOrders.toLocaleString()} orders`, color: "#22c55e" },
              ].map(({ icon: Icon, label, value, sub, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5"
                  style={{ borderTop: `2px solid ${color}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={20} style={{ color }} />
                    <TrendingUp size={14} style={{ color: "#22c55e" }} />
                  </div>
                  <div className="text-2xl font-display font-black mb-0.5" style={{ color }}>{value}</div>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</div>
                  <div className="text-xs mt-1" style={{ color: "#22c55e" }}>{sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="chart-container">
                <h3 className="font-bold mb-4">Revenue This Year (₹)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#14b8a6" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="chart-container">
                <h3 className="font-bold mb-4">Monthly Orders</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#d946ef" radius={[4, 4, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Recent Orders */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
              <div className="p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="font-bold">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Medicine</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => {
                      const medicineNames = order.items.map((i) => `${i.name} x${i.quantity}`).join(", ");
                      return (
                        <tr key={order.id}>
                          <td className="font-mono text-xs">{order.id}</td>
                          <td>{order.user}</td>
                          <td className="text-xs" style={{ color: "var(--color-text-muted)" }}>{medicineNames}</td>
                          <td className="font-bold" style={{ color: "var(--color-primary)" }}>{formatCurrency(order.amount)}</td>
                          <td>
                            <span className="badge text-xs" style={{ color: statusColor[order.status], background: `${statusColor[order.status]}15`, border: `1px solid ${statusColor[order.status]}30` }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                <h3 className="font-bold">All Users ({formatNumber(adminStats.totalUsers)})</h3>
                <button className="btn-primary text-sm px-4 py-2">+ Add User</button>
              </div>
              <div className="overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Anjali Sharma", email: "anjali@email.com", status: "Active", joined: "Jan 2024" },
                      { name: "Rohit Verma", email: "rohit@email.com", status: "Active", joined: "Feb 2024" },
                      { name: "Priya Mehta", email: "priya@email.com", status: "Inactive", joined: "Mar 2024" },
                      { name: "Arjun Singh", email: "arjun@email.com", status: "Active", joined: "Mar 2024" },
                      { name: "Kavita Patel", email: "kavita@email.com", status: "Suspended", joined: "Apr 2024" },
                    ].map((user, i) => (
                      <tr key={i}>
                        <td className="font-semibold">{user.name}</td>
                        <td className="text-sm" style={{ color: "var(--color-text-muted)" }}>{user.email}</td>
                        <td>
                          <span className={`badge text-xs ${user.status === "Active" ? "badge-success" : user.status === "Inactive" ? "badge-warning" : "badge-danger"}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="text-sm" style={{ color: "var(--color-text-muted)" }}>{user.joined}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="text-xs text-primary-400 hover:underline">Edit</button>
                            <button className="text-xs text-red-400 hover:underline">Ban</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Medicines Tab */}
        {activeTab === "medicines" && (
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="font-bold">Medicine Inventory ({adminMedicines.length} items)</h3>
              <button onClick={() => setShowAddMedModal(true)} className="btn-primary text-sm px-4 py-2">+ Add Medicine</button>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock (Click to Toggle)</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminMedicines.map((med) => (
                    <tr key={med.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-white/5 p-0.5 flex-shrink-0" style={{ border: "1px solid var(--glass-border)" }}>
                            {med.image.startsWith("/") ? (
                              <img src={med.image} alt={med.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-xl">{med.image}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{med.name}</div>
                            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{med.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary text-xs">{med.category}</span></td>
                      <td className="font-bold" style={{ color: "var(--color-primary)" }}>{formatCurrency(med.price)}</td>
                      <td>
                        <button
                          onClick={() => {
                            toggleStock(med.id);
                            alert(`🛒 Stock status updated for: ${med.name}`);
                          }}
                          className={`badge text-xs font-bold transition-all ${med.inStock ? "badge-success" : "badge-danger"}`}
                          title="Click to toggle Stock status"
                        >
                          {med.inStock ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>
                      <td className="text-sm">⭐ {med.rating}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${med.name}" from catalog?`)) {
                                removeMedicine(med.id);
                              }
                            }}
                            className="text-xs text-red-400 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === "doctors" && (
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="font-bold">Doctors ({doctors.length} registered)</h3>
              <button className="btn-primary text-sm px-4 py-2">+ Add Doctor</button>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Fee</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{doc.avatar}</span>
                          <div>
                            <div className="font-semibold text-sm">{doc.name}</div>
                            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{doc.experience} yrs exp</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-accent text-xs">{doc.specialty}</span></td>
                      <td className="font-bold" style={{ color: "var(--color-primary)" }}>{formatCurrency(doc.consultationFee)}</td>
                      <td className="text-sm">⭐ {doc.rating} ({doc.reviews.toLocaleString()})</td>
                      <td><span className={`badge text-xs ${doc.available ? "badge-success" : "badge-warning"}`}>{doc.available ? "Online" : "Offline"}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="text-xs text-primary-400 hover:underline">Edit</button>
                          <button className="text-xs text-red-400 hover:underline">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="font-bold">All Orders ({orders.length})</h3>
              <div className="flex gap-2">
                <span className="badge badge-warning text-xs">
                  {orders.filter((o) => o.status === "Processing" || o.status === "Shipped").length} Active
                </span>
                <span className="badge badge-success text-xs">
                  {orders.filter((o) => o.status === "Delivered").length} Delivered
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Medicine</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const medicineNames = order.items.map((i) => `${i.name} x${i.quantity}`).join(", ");
                    return (
                      <tr key={order.id}>
                        <td className="font-mono text-xs">{order.id}</td>
                        <td>{order.user}</td>
                        <td className="text-xs" style={{ color: "var(--color-text-muted)" }}>{medicineNames}</td>
                        <td className="font-bold" style={{ color: "var(--color-primary)" }}>{formatCurrency(order.amount)}</td>
                        <td>
                          <span className="badge text-xs" style={{ color: statusColor[order.status], background: `${statusColor[order.status]}15`, border: `1px solid ${statusColor[order.status]}30` }}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {order.status === "Processing" && (
                              <button
                                onClick={() => {
                                  updateStatus(order.id, "Shipped");
                                  alert(`📦 Order ${order.id} marked as SHIPPED.`);
                                }}
                                className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg hover:bg-blue-500/40 transition-colors"
                              >
                                🚚 Ship
                              </button>
                            )}
                            {order.status === "Shipped" && (
                              <button
                                onClick={() => {
                                  updateStatus(order.id, "Delivered");
                                  alert(`✅ Order ${order.id} marked as DELIVERED.`);
                                }}
                                className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg hover:bg-green-500/40 transition-colors"
                              >
                                🏠 Deliver
                              </button>
                            )}
                            {(order.status === "Processing" || order.status === "Shipped") && (
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to cancel this order?")) {
                                    updateStatus(order.id, "Cancelled");
                                  }
                                }}
                                className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-lg hover:bg-red-500/40 transition-colors"
                              >
                                ❌ Cancel
                              </button>
                            )}
                            {order.status === "Delivered" && (
                              <span className="text-[10px] text-green-500 font-bold">✓ Complete</span>
                            )}
                            {order.status === "Cancelled" && (
                              <span className="text-[10px] text-red-500 font-bold">Cancelled</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Medicine Modal */}
      {showAddMedModal && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowAddMedModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="font-display font-bold text-lg text-teal-400">➕ Add New Medicine</h3>
              <button onClick={() => setShowAddMedModal(false)} style={{ color: "var(--color-text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMedSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-slate-300">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.name}
                    onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                    placeholder="e.g. Paracetamol 650mg"
                    className="input-glass text-xs w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-slate-300">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.brand}
                    onChange={(e) => setNewMedForm({ ...newMedForm, brand: e.target.value })}
                    placeholder="e.g. Calpol"
                    className="input-glass text-xs w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-slate-300">Category *</label>
                  <select
                    value={newMedForm.category}
                    onChange={(e) => setNewMedForm({ ...newMedForm, category: e.target.value })}
                    className="input-glass text-xs w-full bg-slate-900 border border-white/10 text-white rounded-xl py-2 px-3 outline-none"
                  >
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Allergy">Allergy</option>
                    <option value="Acidity">Acidity</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-slate-300">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newMedForm.price}
                    onChange={(e) => setNewMedForm({ ...newMedForm, price: e.target.value })}
                    placeholder="MRP ₹"
                    className="input-glass text-xs w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1 text-slate-300">Original Price</label>
                  <input
                    type="number"
                    value={newMedForm.originalPrice}
                    onChange={(e) => setNewMedForm({ ...newMedForm, originalPrice: e.target.value })}
                    placeholder="Before discount"
                    className="input-glass text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-300">Chemical Composition</label>
                <input
                  type="text"
                  value={newMedForm.composition}
                  onChange={(e) => setNewMedForm({ ...newMedForm, composition: e.target.value })}
                  placeholder="e.g. Paracetamol IP 650mg"
                  className="input-glass text-xs w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-slate-300">Manufacturer</label>
                  <input
                    type="text"
                    value={newMedForm.manufacturer}
                    onChange={(e) => setNewMedForm({ ...newMedForm, manufacturer: e.target.value })}
                    placeholder="e.g. GSK India"
                    className="input-glass text-xs w-full"
                  />
                </div>
                <div className="flex items-center pt-5 gap-2">
                  <input
                    type="checkbox"
                    id="rxCheck"
                    checked={newMedForm.prescriptionRequired}
                    onChange={(e) => setNewMedForm({ ...newMedForm, prescriptionRequired: e.target.checked })}
                    className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                  />
                  <label htmlFor="rxCheck" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Requires Doctor's Prescription (Rx)
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-300">Description</label>
                <textarea
                  value={newMedForm.description}
                  onChange={(e) => setNewMedForm({ ...newMedForm, description: e.target.value })}
                  placeholder="Describe uses, warnings, etc."
                  className="input-glass text-xs w-full h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2 text-xs font-bold mt-2"
              >
                Save Medicine to Inventory
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
