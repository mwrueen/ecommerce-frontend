import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStorageUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  // Remove /api if it exists to get the server root
  const serverRoot = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${serverRoot}${normalizedPath}`;
}
