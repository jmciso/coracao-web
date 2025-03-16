import {Directus} from "@directus/sdk";

const locale = 'pt-PT';
const timeOpts: Intl.DateTimeFormatOptions = {
	dateStyle: 'long',
	// timeStyle: 'short'
};

export const getDirectusClient = async () => {
  try {
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
  } catch (error) {
    console.error('Failed to initialize Directus client:', error);
    throw error; // Re-throw to handle in calling code
  }
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

// function formatRelativeTime(fromDate: any, toDate: any) {
//   const elapsed = fromDate - (toDate || new Date());
//
//   // "Math.abs" accounts for both "past" & "future" scenarios
//   for (let u in UNITS) {
//     if (Math.abs(elapsed) > UNITS[u] || u === "second")
//       return rtf.format(Math.round(elapsed / UNITS[u]), u);
//   }
//
//   return fromDate.toLocaleDateString(LOCALE);
// }

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString(locale, timeOpts)
  } catch (error) {
    console.error('Failed to format date:', error);
    return dateStr; // Return original string if formatting fails
  }
}

export function getAssetURL(id: string) {
  try {
    if (!id) return null;
    return `${import.meta.env.PUBLIC_API_URL}/assets/${id}`;
  } catch (error) {
    console.error('Failed to generate asset URL:', error);
    return null;
  }
}