import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers (e.g., 1200 → 1.2K)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Generate star rating display
 */
export function getStars(rating: number): string {
  return "⭐".repeat(Math.floor(rating));
}

/**
 * Detect emergency keywords in text
 */
export function detectEmergency(text: string): boolean {
  const emergencyKeywords = [
    "chest pain",
    "heart attack",
    "can't breathe",
    "cannot breathe",
    "difficulty breathing",
    "unconscious",
    "fainted",
    "stroke",
    "seizure",
    "overdose",
    "poison",
    "severe bleeding",
    "not breathing",
    "choking",
    "छाती में दर्द",
    "सांस नहीं",
    "बेहोश",
    "दिल का दौरा",
  ];

  const lowerText = text.toLowerCase();
  return emergencyKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Get AI response category from input text
 */
export function getResponseCategory(text: string): string {
  const lower = text.toLowerCase();

  if (detectEmergency(text)) return "emergency";

  const isHindi = /[\u0900-\u097F]/.test(text);
  if (isHindi) return "hindi";

  if (lower.includes("fever") || lower.includes("temperature") || lower.includes("bukhar")) return "fever";
  if (lower.includes("headache") || lower.includes("head pain") || lower.includes("sir dard")) return "headache";
  if (lower.includes("cold") || lower.includes("cough") || lower.includes("sneez")) return "cold";
  if (lower.includes("stomach") || lower.includes("acidity") || lower.includes("nausea")) return "stomach";
  if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("neend")) return "sleep";
  if (lower.includes("stress") || lower.includes("anxiety") || lower.includes("tension")) return "anxiety";
  if (lower.includes("diet") || lower.includes("food") || lower.includes("eat")) return "diet";
  if (lower.includes("exercise") || lower.includes("workout") || lower.includes("fitness")) return "fitness";

  return "default";
}

/**
 * Calculate BMI
 */
export function calculateBMI(weight: number, height: number): { bmi: number; category: string } {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let category = "Normal";

  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return { bmi: parseFloat(bmi.toFixed(1)), category };
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Get time ago string
 */
export function timeAgo(dateStr: string): string {
  return dateStr; // Already formatted in mock data
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Simulate AI streaming response (word by word)
 */
export async function* streamText(text: string, delay = 30): AsyncGenerator<string> {
  const words = text.split(" ");
  for (const word of words) {
    yield word + " ";
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
