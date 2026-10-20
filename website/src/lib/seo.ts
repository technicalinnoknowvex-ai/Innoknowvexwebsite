import { API_BASE_URL } from "../services/api";

export type PublicProgram = {
  title?: string;
  slug?: string;
  shortDescription?: string;
  imageUrl?: string;
  updatedAt?: string;
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.innoknowvex.in";

  try {
    return new URL(configuredUrl).origin;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be a valid absolute URL, such as https://www.example.com.",
    );
  }
}

export async function getPublicProgram(slug: string): Promise<PublicProgram | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/programs/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Program metadata request failed (HTTP ${response.status}).`);
  }

  const result: { data?: PublicProgram } = await response.json();
  if (!result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
    throw new Error("The program metadata response has an unexpected format.");
  }

  return result.data;
}

export async function getPublicPrograms(): Promise<PublicProgram[]> {
  const response = await fetch(`${API_BASE_URL}/api/programs`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Program sitemap request failed (HTTP ${response.status}).`);
  }

  const result: { data?: PublicProgram[] } = await response.json();
  if (!Array.isArray(result.data)) {
    throw new Error("The program sitemap response has an unexpected format.");
  }

  return result.data;
}
