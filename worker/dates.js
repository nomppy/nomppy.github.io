// Working out when a photo was taken, in order of trust:
//   manual   set in the admin panel
//   shortcut sent by the Apple Shortcut (the Photos app's own date)
//   camera   DateTimeOriginal in the photo's EXIF data
//   caption  a date written in the caption, e.g. "tokyo 25.05.14" or "fall '25"
// Dates are stored as epoch ms at noon UTC on the day, which is all the site
// needs for grouping by season.

const noon = (y, m, d) => Date.UTC(y, m - 1, d, 12);

const fullYear = (y) => (y < 100 ? 2000 + y : y);

function valid(y, m, d) {
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const t = new Date(noon(y, m, d));
  return t.getUTCMonth() === m - 1; // rejects 31 Feb and similar
}

// Seasons follow the photos page: Winter = Jan-Mar, Spring = Apr-Jun,
// Summer = Jul-Sep, Fall = Oct-Dec. A caption season maps to mid-quarter.
const SEASON_MONTH = { winter: 2, spring: 5, summer: 8, fall: 11, autumn: 11 };

// Returns { takenAt, precision: "day" | "season" } or null.
export function dateFromCaption(caption) {
  if (!caption) return null;
  const text = String(caption);
  // Year first: 25.05.14, 26.1.9, 2025-05-14, 25/5/14
  const ymd = text.match(/(?:^|[^\d])(\d{4}|\d{2})[./-](\d{1,2})[./-](\d{1,2})(?!\d)/);
  if (ymd) {
    const y = fullYear(+ymd[1]);
    if (valid(y, +ymd[2], +ymd[3])) return { takenAt: noon(y, +ymd[2], +ymd[3]), precision: "day" };
  }
  // Season and year: "fall '25", "summer ‘26", "Spring 2024"
  const season = text.match(/\b(spring|summer|fall|autumn|winter)\b[\s,]*['‘’]?\s*(\d{4}|\d{2})(?!\d)/i);
  if (season) {
    const y = fullYear(+season[2]);
    if (y >= 1990 && y <= 2100) return { takenAt: noon(y, SEASON_MONTH[season[1].toLowerCase()], 15), precision: "season" };
  }
  return null;
}

// Dates from the Shortcut or the admin panel: ISO ("2025-07-14",
// "2025-07-14T18:22:05-07:00") or the Shortcuts default ("Jul 14, 2025 at 6:22 PM").
export function parseDateInput(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/);
  if (iso && valid(+iso[1], +iso[2], +iso[3])) return noon(+iso[1], +iso[2], +iso[3]);
  const t = Date.parse(s.replace(/\s+at\s+/i, " "));
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  return noon(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
