import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStorageUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  // If path is a local public asset like /placeholder.svg, return as is
  if (path.startsWith('/') && !path.startsWith('/storage/')) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  // Remove /api if it exists to get the server root
  const serverRoot = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;

  // Ensure path starts with /storage/
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!normalizedPath.startsWith('/storage/')) {
    normalizedPath = `/storage${normalizedPath}`;
  }

  return `${serverRoot}${normalizedPath}`;
}
