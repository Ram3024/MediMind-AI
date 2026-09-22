import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Appointment {
  id: string;
  doctorName: string;
  doctorAvatar: string;
  specialty: string;
  date: string;
  time: string;
  fee: number;
  status: "Scheduled" | "Cancelled";
}

interface AppointmentStore {
  appointments: Appointment[];
  bookAppointment: (appointment: Omit<Appointment, "id" | "status">) => void;
  cancelAppointment: (id: string) => void;
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set) => ({
      appointments: [
        {
          id: "apt-1",
          doctorName: "Dr. Priya Sharma",
          doctorAvatar: "👩‍⚕️",
          specialty: "Cardiologist",
          date: "Today, Dec 18",
          time: "3:00 PM",
          fee: 800,
          status: "Scheduled",
        },
        {
          id: "apt-2",
          doctorName: "Dr. Amit Patel",
          doctorAvatar: "👨‍⚕️",
          specialty: "Neurologist",
          date: "Tomorrow, Dec 19",
          time: "11:00 AM",
          fee: 1000,
          status: "Scheduled",
        }
      ],
      bookAppointment: (apt) => {
        const id = `apt-${Date.now()}`;
        set((state) => ({
          appointments: [
            { ...apt, id, status: "Scheduled" },
            ...state.appointments,
          ],
        }));
      },
      cancelAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: "Cancelled" } : a
          ),
        }));
      },
    }),
    { name: "medimind-appointments" }
  )
);
