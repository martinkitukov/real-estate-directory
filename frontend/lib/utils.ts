import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Consistent number formatting that works the same on server and client
export function formatNumber(num: number): string {
  // Use a consistent format that doesn't depend on locale
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Format currency with consistent number formatting
export function formatCurrency(num: number, currency: string = "€"): string {
  return `${currency}${formatNumber(num)}`
}
