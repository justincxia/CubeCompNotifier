import type { WcaApiResponse, WcaCompetition } from "@/types";

const WCA_API_BASE =
  "https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/refs/heads/v1";

/**
 * Fetches all competitions for a given year from the WCA REST API.
 * The API returns paginated pages of 1000 items. For a full year we
 * iterate until all pages are collected.
 */
export async function fetchCompetitionsByYear(
  year: number
): Promise<WcaCompetition[]> {
  const url = `${WCA_API_BASE}/competitions/${year}.json`;

  const response = await fetch(url, {
    next: { revalidate: 0 }, // always fresh in server context
    signal: AbortSignal.timeout(15000),
  });

  if (response.status === 404) {
    return []; // no competitions for this year yet
  }

  if (!response.ok) {
    throw new Error(`WCA API error ${response.status} for year ${year}`);
  }

  const data: WcaApiResponse = await response.json();
  const allItems: WcaCompetition[] = [...data.items];

  // Fetch remaining pages if there are more than 1000 competitions in a year
  const totalPages = Math.ceil(data.total / data.pagination.size);
  for (let page = 2; page <= totalPages; page++) {
    const pageUrl = `${WCA_API_BASE}/competitions/${year}-page-${page}.json`;
    const pageRes = await fetch(pageUrl, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(15000),
    });
    if (!pageRes.ok) break;
    const pageData: WcaApiResponse = await pageRes.json();
    allItems.push(...pageData.items);
  }

  return allItems;
}

/** Fetches upcoming (not yet started, not canceled) competitions. */
export async function fetchUpcomingCompetitions(): Promise<WcaCompetition[]> {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();

  // Fetch current year and the next year to catch far-future announcements
  const [current, next] = await Promise.all([
    fetchCompetitionsByYear(currentYear),
    fetchCompetitionsByYear(currentYear + 1),
  ]);

  const all = [...current, ...next];

  return all.filter(
    (comp) => comp.date.from >= today && !comp.isCanceled
  );
}

/** Constructs the canonical WCA competition URL from an ID. */
export function wcaCompetitionUrl(competitionId: string): string {
  return `https://www.worldcubeassociation.org/competitions/${competitionId}`;
}

/** Maps a WCA event code to a human-readable name. */
const EVENT_NAMES: Record<string, string> = {
  "222": "2x2",
  "333": "3x3",
  "444": "4x4",
  "555": "5x5",
  "666": "6x6",
  "777": "7x7",
  "333bf": "3x3 BLD",
  "333fm": "FMC",
  "333oh": "OH",
  "333mbf": "Multi BLD",
  "444bf": "4x4 BLD",
  "555bf": "5x5 BLD",
  clock: "Clock",
  minx: "Megaminx",
  pyram: "Pyraminx",
  skewb: "Skewb",
  sq1: "Square-1",
};

export function formatEvents(events: string[]): string {
  return events.map((e) => EVENT_NAMES[e] ?? e).join(", ");
}

/** Formats a date range for SMS display: "Aug 15–16" or "Aug 15 – Sep 2". */
export function formatDateRange(from: string, till: string): string {
  const start = new Date(from + "T00:00:00Z");
  const end = new Date(till + "T00:00:00Z");

  const startMonth = start.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const endMonth = end.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();

  if (startMonth === endMonth) {
    return startDay === endDay
      ? `${startMonth} ${startDay}`
      : `${startMonth} ${startDay}–${endDay}`;
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}
