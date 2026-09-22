"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Filter, X, Star, Package,
  ChevronRight, Upload, CheckCircle, Plus, Minus, Truck,
} from "lucide-react";
import Link from "next/link";
import { orderSteps, mockUser } from "@/lib/mockData";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useMedicineStore, type Medicine } from "@/store/medicineStore";
import { formatCurrency } from "@/lib/utils";

const categories = ["All", "Pain Relief", "Allergy", "Acidity", "Vitamins", "Antibiotic", "Diabetes"];

// =============================================
// MEDICINE CARD
// =============================================
function MedicineCard({ medicine, onViewCart }: { medicine: Medicine; onViewCart: () => void }) {
  const { addItem, items } = useCartStore();
  const cartItem = items.find((i) => i.id === medicine.id);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: medicine.id,
      name: medicine.name,
      brand: medicine.brand,
      price: medicine.price,
      image: medicine.image,
      prescriptionRequired: medicine.prescriptionRequired,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="medicine-card"
    >
      <Link href={`/medicines/${medicine.id}`}>
        <div className="p-5">
          {/* Image area */}
          <div
            className="w-full h-28 rounded-xl flex items-center justify-center overflow-hidden mb-4 bg-white/5"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            {medicine.image.startsWith("/") ? (
              <img
                src={medicine.image}
                alt={medicine.name}
                className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-5xl">{medicine.image}</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-2 mb-2 flex-wrap">
            <span className="badge badge-primary text-xs">{medicine.category}</span>
            {medicine.prescriptionRequired && (
              <span className="badge badge-warning text-xs">Rx</span>
            )}
            {!medicine.inStock && (
              <span className="badge badge-danger text-xs">Out of Stock</span>
            )}
          </div>

          <h3 className="font-bold text-sm mb-0.5">{medicine.name}</h3>
          <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>{medicine.brand} • {medicine.composition}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold">{medicine.rating}</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>({medicine.reviews.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg" style={{ color: "var(--color-primary)" }}>
              {formatCurrency(medicine.price)}
            </span>
            <span className="text-xs line-through" style={{ color: "var(--color-text-muted)" }}>
              {formatCurrency(medicine.originalPrice)}
            </span>
            <span className="badge badge-success text-xs">
              {Math.round((1 - medicine.price / medicine.originalPrice) * 100)}% off
            </span>
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-5 pb-5">
        {cartItem ? (
          <div className="flex items-center gap-2">
            <QuantityControl id={medicine.id} quantity={cartItem.quantity} />
            <button
              onClick={onViewCart}
              className="flex-1 btn-ghost text-sm flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/10"
            >
              <ShoppingCart size={14} /> View Cart
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!medicine.inStock}
            className="w-full btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {added ? (
              <><CheckCircle size={14} /> Added!</>
            ) : (
              <><ShoppingCart size={14} /> Add to Cart</>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// =============================================
// QUANTITY CONTROL
// =============================================
function QuantityControl({ id, quantity }: { id: string; quantity: number }) {
  const { updateQuantity } = useCartStore();
  return (
    <div
      className="flex items-center gap-2 rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
    >
      <button
        onClick={() => updateQuantity(id, quantity - 1)}
        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
        style={{ color: "var(--color-primary)" }}
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-bold">{quantity}</span>
      <button
        onClick={() => updateQuantity(id, quantity + 1)}
        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors"
        style={{ color: "var(--color-primary)" }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// =============================================
// CART PANEL
// =============================================
function CartPanel({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 bottom-0 w-80 z-50 glass border-l flex flex-col"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
        <h3 className="font-bold flex items-center gap-2">
          <ShoppingCart size={18} /> Cart ({items.length})
        </h3>
        <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}>
          <X size={18} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="text-5xl">🛒</div>
          <p className="font-bold">Your cart is empty</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Add medicines to get started</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white/5 p-1 flex-shrink-0"
                  style={{ border: "1px solid var(--glass-border)" }}
                >
                  {item.image.startsWith("/") ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl">{item.image}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-primary)" }}>
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <QuantityControl id={item.id} quantity={item.quantity} />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs"
                    style={{ color: "#ef4444" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
              <span className="font-bold">{formatCurrency(totalPrice())}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span style={{ color: "var(--color-text-muted)" }}>Delivery</span>
              <span className="text-green-400 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between mb-4 text-lg">
              <span className="font-bold">Total</span>
              <span className="font-display font-black gradient-text">{formatCurrency(totalPrice())}</span>
            </div>
            <button
              onClick={() => {
                if (items.length === 0) return;
                addOrder({
                  user: mockUser.name,
                  items: items.map(i => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image: i.image
                  })),
                  amount: totalPrice(),
                  address: mockUser.address
                });
                alert("🎉 Order Placed Successfully! The pharmacist has been notified. You can track it at the top.");
                clearCart();
                onClose();
              }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Truck size={16} /> Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-sm text-center py-2"
              style={{ color: "#ef4444" }}
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

// =============================================
// ORDER TRACKER
// =============================================
function OrderTracker({ onCancelOrder }: { onCancelOrder: (id: string) => void }) {
  const { orders } = useOrderStore();
  const activeOrder = orders.find(o => o.user === mockUser.name && (o.status === "Processing" || o.status === "Shipped"))
    || orders.find(o => o.user === mockUser.name)
    || orders[0];

  if (!activeOrder) return null;

  const isShipped = activeOrder.status === "Shipped";
  const isDelivered = activeOrder.status === "Delivered";

  const trackingSteps = [
    { id: 1, label: "Order Placed", icon: "📋", completed: true, time: "Just now" },
    { id: 2, label: "Confirmed", icon: "✅", completed: true, time: "Just now" },
    { id: 3, label: "Packed", icon: "📦", completed: true, time: "Just now" },
    { id: 4, label: "Shipped", icon: "🚚", completed: isShipped || isDelivered, time: isShipped ? "On the way" : "Pending" },
    { id: 5, label: "Delivered", icon: "🏠", completed: isDelivered, time: isDelivered ? "Delivered" : "Pending" },
  ];

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
        <div>
          <h3 className="font-bold mb-1 flex items-center gap-2">
            <Truck size={16} style={{ color: "var(--color-primary)" }} /> Active Order Tracking
          </h3>
          <p className="text-xs flex items-center gap-3" style={{ color: "var(--color-text-muted)" }}>
            <span>Order {activeOrder.id} • Status: <span className="font-bold text-teal-400">{activeOrder.status}</span></span>
            {activeOrder.status === "Processing" && (
              <button
                onClick={() => onCancelOrder(activeOrder.id)}
                className="py-0.5 px-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold transition-all cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </p>
        </div>
        <div className="text-xs glass p-3 rounded-2xl max-w-xl">
          <span className="font-bold block mb-1">Items in this order:</span>
          <div className="flex gap-2 flex-wrap text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            {activeOrder.items.map((item, index) => (
              <span key={item.id}>
                {index > 0 && " • "}
                {item.image} {item.name} x{item.quantity}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between relative mt-4">
        {trackingSteps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1 relative z-10">
            {i < trackingSteps.length - 1 && (
              <div
                className="absolute top-4 left-1/2 w-full h-0.5 -z-0"
                style={{
                  background: step.completed && trackingSteps[i + 1]?.completed
                    ? "var(--color-primary)"
                    : step.completed
                    ? "linear-gradient(to right, var(--color-primary), var(--glass-border))"
                    : "var(--glass-border)",
                }}
              />
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm z-10"
              style={{
                background: step.completed ? "var(--gradient-primary)" : "var(--glass-bg)",
                border: step.completed ? "none" : "1px solid var(--glass-border)",
              }}
            >
              {step.completed ? "✓" : step.icon}
            </div>
            <span className="text-xs font-semibold text-center" style={{ color: step.completed ? "var(--color-primary)" : "var(--color-text-muted)" }}>
              {step.label}
            </span>
            <span className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>{step.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// MEDICINES PAGE
// =============================================
export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const { totalItems, addItem } = useCartStore();
  const { medicines } = useMedicineStore();

  const filtered = medicines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-black mb-1">
              💊 <span className="gradient-text">Medicine Store</span>
            </h1>
            <p style={{ color: "var(--color-text-muted)" }}>Order medicines online with fast delivery</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                medicines.forEach((m) => {
                  if (m.inStock) {
                    addItem({
                      id: m.id,
                      name: m.name,
                      brand: m.brand,
                      price: m.price,
                      image: m.image,
                      prescriptionRequired: m.prescriptionRequired,
                    });
                  }
                });
                alert("🛒 All in-stock medicines added to your cart!");
              }}
              className="btn-ghost flex items-center gap-2 text-sm border border-primary-500/30"
              style={{ color: "var(--color-primary)" }}
            >
              <Plus size={16} /> Add All
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <Upload size={16} /> Upload Prescription
            </button>
            <button
              onClick={() => setShowCart(true)}
              className="btn-primary flex items-center gap-2 text-sm relative"
            >
              <ShoppingCart size={16} /> Cart
              {totalItems() > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: "#ef4444", color: "white" }}
                >
                  {totalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Order Tracker */}
      <OrderTracker onCancelOrder={setOrderToCancel} />

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicines, brands..."
            className="input-glass pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: selectedCategory === cat ? "rgba(20,184,166,0.2)" : "var(--glass-bg)",
                border: selectedCategory === cat ? "1px solid rgba(20,184,166,0.5)" : "1px solid var(--glass-border)",
                color: selectedCategory === cat ? "var(--color-primary)" : "var(--color-text-muted)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        Showing <strong style={{ color: "var(--color-text)" }}>{filtered.length}</strong> medicines
      </p>

      {/* Medicine Grid */}
      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((medicine) => (
          <MedicineCard key={medicine.id} medicine={medicine} onViewCart={() => setShowCart(true)} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-bold text-lg mb-2">No medicines found</p>
          <p style={{ color: "var(--color-text-muted)" }}>Try a different search term or category</p>
        </div>
      )}

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCart(false)}
            />
            <CartPanel onClose={() => setShowCart(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Prescription Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl">Upload Prescription</h3>
                <button onClick={() => setShowUpload(false)} style={{ color: "var(--color-text-muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div
                className="border-2 border-dashed rounded-2xl p-12 text-center mb-4 cursor-pointer transition-all hover:border-primary-500"
                style={{ borderColor: "var(--glass-border)" }}
                onClick={() => alert("File picker would open here in production")}
              >
                <Upload size={40} className="mx-auto mb-3" style={{ color: "var(--color-text-muted)" }} />
                <p className="font-semibold mb-1">Drop prescription here</p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>or click to browse</p>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>JPG, PNG, PDF up to 10MB</p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl mb-4" style={{ background: "rgba(20,184,166,0.1)" }}>
                <Package size={16} style={{ color: "var(--color-primary)" }} className="mt-0.5" />
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Our AI will scan your prescription and automatically add prescribed medicines to your cart.
                </p>
              </div>

              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={() => { alert("Prescription uploaded! AI is analyzing..."); setShowUpload(false); }}
              >
                <Upload size={16} /> Upload & Analyze
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Cancel Confirmation Modal */}
      <AnimatePresence>
        {orderToCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setOrderToCancel(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-sm text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl">⚠️</div>
              <h3 className="font-bold text-lg text-white">Cancel Order?</h3>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Are you sure you want to cancel medicine order {orderToCancel}? This action cannot be undone.</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setOrderToCancel(null)}
                  className="btn-ghost flex-1 py-2 text-xs border border-white/5 rounded-xl cursor-pointer"
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => {
                    useOrderStore.getState().updateStatus(orderToCancel, "Cancelled");
                    setOrderToCancel(null);
                  }}
                  className="btn-primary flex-1 py-2 text-xs bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  Yes, Cancel Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
