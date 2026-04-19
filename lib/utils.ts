import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uniqueId(prefix: string, sequence: number) {
  return `${prefix}_${sequence.toString(36).padStart(4, "0")}`;
}
