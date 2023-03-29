import { Directus } from "@directus/sdk";

export const getDirectusClient = async () => {
  const directus = new Directus(import.meta.env.PUBLIC_API_URL);
  const authToken = await directus.auth.token; 
  if (authToken) return directus;

  if (import.meta.env.DIRECTUS_EMAIL && import.meta.env.DIRECTUS_PASSWORD) {
    await directus.auth.login({
      email: import.meta.env.DIRECTUS_EMAIL,
      password: import.meta.env.DIRECTUS_PASSWORD,
    });
  } else if (import.meta.env.DIRECTUS_STATIC_TOKEN) {
    await directus.auth.static(import.meta.env.DIRECTUS_STATIC_TOKEN);
  }

  return directus;
};

const UNITS = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const LOCALE = "pt";

const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

export function formatRelativeTime(fromDate, toDate) {
  const elapsed = fromDate - (toDate || new Date());

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (let u in UNITS) {
    if (Math.abs(elapsed) > UNITS[u] || u === "second")
      return rtf.format(Math.round(elapsed / UNITS[u]), u);
  }

  return fromDate.toLocaleDateString(LOCALE);
}



export function getAssetURL(id: string) {
    if (!id) return null;
    // const directus = await getDirectusClient();
    // return directus.files.readOne(id);
    return `${import.meta.env.PUBLIC_API_URL}/assets/${id}`;
}