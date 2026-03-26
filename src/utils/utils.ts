import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";

const LOCALE = "pt-PT";
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "long",
};

export function getDirectusClient() {
  const url = import.meta.env.PUBLIC_API_URL;
  const token = import.meta.env.DIRECTUS_STATIC_TOKEN;

  return createDirectus(url).with(rest()).with(staticToken(token));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(LOCALE, DATE_OPTIONS);
}

export function getAssetURL(id: string): string | null {
  if (!id) return null;
  const base = import.meta.env.PUBLIC_API_URL.replace(/\/$/, "");
  return `${base}/assets/${id}`;
}

export { readItems };
