"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Star, ShoppingCart, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useMedicineStore } from "@/store/medicineStore";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

export default function MedicineDetailPage({ params }: { params: { id: string } }) {
  const { medicines } = useMedicineStore();
  const medicine = medicines.find((m) => m.id === params.id) || medicines[0];
  const { addItem, items } = useCartStore();
  const cartItem = items.find((i) => i.id === medicine.id);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"uses" | "dosage" | "sideEffects" | "warnings">("uses");

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

  const tabs = [
    { id: "uses", label: "Uses" },
    { id: "dosage", label: "Dosage" },
    { id: "sideEffects", label: "Side Effects" },
    { id: "warnings", label: "Warnings" },
  ] as const;

  const tabContent: Record<string, string[]> = {
    uses: medicine.uses,
    dosage: [medicine.dosage],
    sideEffects: medicine.sideEffects,
    warnings: medicine.warnings,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/medicines">
        <button className="btn-ghost flex items-center gap-2 text-sm mb-6">
          <ArrowLeft size={16} /> Back to Store
        </button>
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left - Image & Quick Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
          <div
            className="w-full h-48 rounded-2xl flex items-center justify-center overflow-hidden mb-6 bg-white/5"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            {medicine.image.startsWith("/") ? (
              <img
                src={medicine.image}
                alt={medicine.name}
                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-8xl">{medicine.image}</span>
            )}
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="badge badge-primary">{medicine.category}</span>
            {medicine.prescriptionRequired && <span className="badge badge-warning">Prescription Required</span>}
            {medicine.inStock ? <span className="badge badge-success">In Stock</span> : <span className="badge badge-danger">Out of Stock</span>}
          </div>

          <h1 className="text-2xl font-display font-black mb-1">{medicine.name}</h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm mb-2">{medicine.brand} • {medicine.composition}</p>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm mb-4">{medicine.description}</p>

          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold">{medicine.rating}</span>
            <span style={{ color: "var(--color-text-muted)" }} className="text-sm">({medicine.reviews.toLocaleString()} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-display font-black" style={{ color: "var(--color-primary)" }}>
              {formatCurrency(medicine.price)}
            </span>
            <span className="text-sm line-through" style={{ color: "var(--color-text-muted)" }}>
              {formatCurrency(medicine.originalPrice)}
            </span>
            <span className="badge badge-success">
              {Math.round((1 - medicine.price / medicine.originalPrice) * 100)}% OFF
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!medicine.inStock}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            {added ? "Added to Cart! ✓" : cartItem ? `In Cart (${cartItem.quantity})` : "Add to Cart"}
          </button>

          <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.15)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              🚚 <strong>Free delivery</strong> on orders above ₹299<br />
              📅 <strong>Expires:</strong> {medicine.expiryDate}<br />
              🏭 <strong>Manufacturer:</strong> {medicine.manufacturer}
            </p>
          </div>
        </motion.div>

        {/* Right - Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {medicine.prescriptionRequired && (
            <div className="p-4 rounded-xl flex gap-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <AlertTriangle size={18} style={{ color: "#f59e0b" }} className="flex-shrink-0" />
              <p className="text-sm" style={{ color: "#f59e0b" }}>
                This medicine requires a valid prescription. Please upload your prescription before checkout.
              </p>
            </div>
          )}

          <div className="glass-card overflow-hidden">
            <div className="flex border-b" style={{ borderColor: "var(--color-border)" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-3 text-xs font-semibold transition-all"
                  style={{
                    background: activeTab === tab.id ? "rgba(20,184,166,0.15)" : "transparent",
                    color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-muted)",
                    borderBottom: activeTab === tab.id ? "2px solid var(--color-primary)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-5">
              <ul className="space-y-2">
                {tabContent[activeTab]?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span style={{ color: "var(--color-primary)" }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Related Medicines */}
          <div className="glass-card p-5">
            <h3 className="font-bold mb-3 text-sm">Similar Medicines</h3>
            <div className="space-y-2">
              {medicines.filter(m => m.category === medicine.category && m.id !== medicine.id).slice(0, 3).map((m) => (
                <Link key={m.id} href={`/medicines/${m.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer">
                    {m.image.startsWith("/") ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 p-1 flex-shrink-0" style={{ border: "1px solid var(--glass-border)" }}>
                        <img src={m.image} alt={m.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <span className="text-2xl flex-shrink-0">{m.image}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{m.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{m.brand}</p>
                    </div>
                    <span className="font-bold text-sm flex-shrink-0" style={{ color: "var(--color-primary)" }}>{formatCurrency(m.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
