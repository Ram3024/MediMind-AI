import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediMind AI - Intelligent Healthcare Assistant",
  description:
    "Your AI-powered healthcare companion. Analyze symptoms, consult doctors, order medicines, and track your health - all in one place.",
  keywords: [
    "AI health assistant",
    "symptom checker",
    "online doctor consultation",
    "medicine delivery",
    "health tracker",
    "MediMind AI",
  ],
  openGraph: {
    title: "MediMind AI - Intelligent Healthcare Assistant",
    description: "AI-powered healthcare platform for smarter health decisions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
