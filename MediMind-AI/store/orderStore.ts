/**
 * Zustand Store for Shared Orders (User + Admin Panel)
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  amount: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  address: string;
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => void;
  updateStatus: (id: string, status: Order["status"]) => void;
  clearAll: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [
        {
          id: "#ORD-4521",
          user: "Anjali Sharma",
          items: [{ id: "med-001", name: "Paracetamol 500mg", price: 45, quantity: 3, image: "💊" }],
          amount: 135,
          status: "Delivered",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          address: "B-102, Green Valley, Pune",
        },
        {
          id: "#ORD-4520",
          user: "Rohit Verma",
          items: [{ id: "med-004", name: "Vitamin D3 1000IU", price: 199, quantity: 2, image: "🌟" }],
          amount: 398,
          status: "Shipped",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          address: "Sector 62, Noida, UP",
        },
        {
          id: "#ORD-4519",
          user: "Priya Mehta",
          items: [{ id: "med-002", name: "Cetirizine 10mg", price: 85, quantity: 1, image: "💊" }],
          amount: 85,
          status: "Processing",
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          address: "Flat 405, Heights Residency, Hyderabad",
        },
        {
          id: "#ORD-4518",
          user: "Arjun Singh",
          items: [{ id: "med-006", name: "Metformin 500mg", price: 89, quantity: 1, image: "💊" }],
          amount: 89,
          status: "Delivered",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          address: "Civil Lines, Jaipur, Rajasthan",
        },
        {
          id: "#ORD-4517",
          user: "Kavita Patel",
          items: [{ id: "med-003", name: "Omeprazole 20mg", price: 120, quantity: 2, image: "💊" }],
          amount: 240,
          status: "Cancelled",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          address: "G-12, Orchid Towers, Ahmedabad",
        },
        {
          id: "#ORD-4516",
          user: "Rambali Sharma",
          items: [{ id: "med-007", name: "Ibuprofen 400mg", price: 55, quantity: 2, image: "💊" }],
          amount: 110,
          status: "Delivered",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          address: "A-204, Sunshine Apartments, Sector 15, Noida, UP 201301",
        },
        {
          id: "#ORD-4515",
          user: "Vijay Kumar",
          items: [{ id: "med-005", name: "Azithromycin 500mg", price: 165, quantity: 1, image: "💊" }],
          amount: 165,
          status: "Shipped",
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          address: "Kothrud, Pune, Maharashtra",
        },
        {
          id: "#ORD-4514",
          user: "Suresh Gupta",
          items: [{ id: "med-008", name: "Multivitamin Daily", price: 320, quantity: 1, image: "🌟" }],
          amount: 320,
          status: "Processing",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          address: "Salt Lake, Kolkata, West Bengal",
        },
      ],

      addOrder: (order) => {
        const id = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const newOrder: Order = {
          ...order,
          id,
          status: "Processing",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
      },

      updateStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
      },

      clearAll: () => set({ orders: [] }),
    }),
    { name: "medimind-orders" }
  )
);
