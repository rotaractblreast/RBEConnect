/**
 * RBE Connect - Formatting Utilities
 * Cleanly formats Dates of Birth, Timestamps, and Reviewer Notes
 * without exposing raw technical artifacts or backend implementation details.
 */

export interface ParsedReviewerNote {
  author: string;
  role?: string;
  timestamp: string;
  formattedDate: string;
  text: string;
  initials: string;
}

/**
 * Format raw Date of Birth into clean "Month Day, Year" (e.g. "March 12, 1993")
 * Strips away day of week ("Fri"), "00:00:00", "GMT+0530", and standard time strings.
 */
export function formatDisplayDob(dobRaw?: string | null): string {
  if (!dobRaw || !dobRaw.trim() || dobRaw === "—" || dobRaw === "-") {
    return "—";
  }

  const raw = dobRaw.trim();

  // 1. ISO style YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  // 2. Common Indian / UK style DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  // 3. Full Date strings like "Fri Mar 12 1993 00:00:00 GMT+0530 (India Standard Time)"
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // 4. Return as-is if unparseable
  return raw;
}

/**
 * Format timestamps into friendly strings: "Sep 12, 2026 · 11:11 AM"
 */
export function formatTimestamp(rawTime?: string | null): string {
  if (!rawTime || !rawTime.trim()) return "";
  const str = rawTime.trim();

  // Pattern: YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss
  const isoMatch = str.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::\d{2})?)?/
  );
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const hours = isoMatch[4] !== undefined ? parseInt(isoMatch[4], 10) : 0;
    const mins = isoMatch[5] !== undefined ? parseInt(isoMatch[5], 10) : 0;
    const d = new Date(year, month, day, hours, mins);
    if (!isNaN(d.getTime())) {
      const monthStr = d.toLocaleDateString("en-US", { month: "short" });
      const timeStr = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${monthStr} ${day}, ${year} · ${timeStr}`;
    }
  }

  // Fallback: Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = parsed.getDate();
    const monthStr = parsed.toLocaleDateString("en-US", { month: "short" });
    const year = parsed.getFullYear();
    const timeStr = parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${monthStr} ${day}, ${year} · ${timeStr}`;
  }

  return str;
}

/**
 * Split notes field into distinct note entries.
 * Handles both multiple newlines and newline preceding a note bracket.
 */
export function splitNotes(notesStr?: string | null): string[] {
  if (!notesStr || !notesStr.trim()) return [];
  const trimmed = notesStr.trim();
  const chunks = trimmed.split(/\n\s*\n+/);
  const result: string[] = [];
  for (const chunk of chunks) {
    const subChunks = chunk.split(/\n(?=\s*\[[^\]]+\]\s*:)/);
    for (const sub of subChunks) {
      if (sub.trim()) result.push(sub.trim());
    }
  }
  return result;
}

/**
 * Parse reviewer note string into a structured, presentation-ready object.
 * e.g. "[2026-09-12 11:11 | RBE Team (Reviewers)]: No response"
 * -> { author: "RBE Team", role: "Reviewers", timestamp: "...", formattedDate: "Sep 12, 2026 · 11:11 AM", text: "No response", initials: "RT" }
 */
export function parseReviewerNote(rawNote: string): ParsedReviewerNote {
  const trimmed = (rawNote || "").trim();
  if (!trimmed) {
    return {
      author: "Reviewer",
      timestamp: "",
      formattedDate: "",
      text: "",
      initials: "R",
    };
  }

  // Check for "[header]: message"
  const bracketMatch = trimmed.match(/^\[([^\]]+)\]\s*:\s*([\s\S]*)$/);
  if (bracketMatch) {
    const header = bracketMatch[1].trim();
    const message = bracketMatch[2].trim();

    let rawTime = "";
    let rawAuthorRole = "";

    if (header.includes("|")) {
      const parts = header.split("|");
      rawTime = parts[0].trim();
      rawAuthorRole = parts.slice(1).join("|").trim();
    } else if (/\s+[–—-]\s+/.test(header)) {
      const parts = header.split(/\s+[–—-]\s+/);
      rawTime = parts[0].trim();
      rawAuthorRole = parts.slice(1).join(" - ").trim();
    } else {
      rawTime = header;
      rawAuthorRole = "Reviewer";
    }

    let author = rawAuthorRole || "Reviewer";
    let role: string | undefined = undefined;

    // Check for "Author (Role)" pattern
    const roleMatch = rawAuthorRole.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (roleMatch) {
      author = roleMatch[1].trim();
      role = roleMatch[2].trim();
    } else if (author.toLowerCase().includes("reviewer")) {
      role = "Reviewer";
    }

    const initials =
      author
        .split(/[\s_-]+/)
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "R";

    return {
      author,
      role,
      timestamp: rawTime,
      formattedDate: formatTimestamp(rawTime),
      text: message,
      initials,
    };
  }

  // Fallback for unstructured plain notes
  return {
    author: "Reviewer Note",
    role: undefined,
    timestamp: "",
    formattedDate: "",
    text: trimmed,
    initials: "RN",
  };
}

export interface SocialProfileInfo {
  hasSocial: boolean;
  displayText: string;
  isUrl: boolean;
  linkUrl?: string;
  isHandle: boolean;
  copyValue: string;
}

/**
 * Parses candidate's social field intelligently:
 * - Full URLs or known domains -> isUrl: true, valid linkUrl
 * - Handles starting with @ -> isUrl: false, isHandle: true (can view on IG), copyValue: @handle
 * - User IDs / usernames (e.g. chaithra_93, chaithra.shetty) -> isUrl: false, plain text, copyValue
 * - Blank / None / NA -> hasSocial: false
 */
export function parseSocialProfile(rawSocial?: string | null): SocialProfileInfo {
  if (!rawSocial || !rawSocial.trim() || rawSocial === "—" || rawSocial === "-") {
    return {
      hasSocial: false,
      displayText: "—",
      isUrl: false,
      isHandle: false,
      copyValue: "",
    };
  }

  const trimmed = rawSocial.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower === "none" ||
    lower === "na" ||
    lower === "n/a" ||
    lower === "no" ||
    lower === "nil" ||
    lower === "null"
  ) {
    return {
      hasSocial: false,
      displayText: "—",
      isUrl: false,
      isHandle: false,
      copyValue: "",
    };
  }

  // 1. Explicit protocol URLs
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      hasSocial: true,
      displayText: trimmed,
      isUrl: true,
      linkUrl: trimmed,
      isHandle: false,
      copyValue: trimmed,
    };
  }

  // 2. Starts with www.
  if (/^www\./i.test(trimmed)) {
    return {
      hasSocial: true,
      displayText: trimmed,
      isUrl: true,
      linkUrl: `https://${trimmed}`,
      isHandle: false,
      copyValue: trimmed,
    };
  }

  // 3. Known social network domains (e.g. instagram.com/..., linkedin.com/in/...)
  const knownSocialDomains = [
    "instagram.com",
    "instagr.am",
    "linkedin.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "fb.com",
    "github.com",
    "threads.net",
    "youtube.com",
    "behance.net",
    "dribbble.com",
    "medium.com",
    "wa.me",
    "t.me",
  ];
  const matchesDomain = knownSocialDomains.some(
    (d) => lower.startsWith(d + "/") || lower === d
  );
  if (matchesDomain) {
    return {
      hasSocial: true,
      displayText: trimmed,
      isUrl: true,
      linkUrl: `https://${trimmed}`,
      isHandle: false,
      copyValue: trimmed,
    };
  }

  // 4. Handle starting with @ (e.g. @chaithra_93)
  if (/^@[\w.-]+$/.test(trimmed)) {
    const handleName = trimmed.replace(/^@/, "");
    return {
      hasSocial: true,
      displayText: trimmed,
      isUrl: false,
      linkUrl: `https://instagram.com/${handleName}`,
      isHandle: true,
      copyValue: trimmed,
    };
  }

  // 5. Raw username, user ID or custom handle (e.g. chaithra_93, chaithra.shetty)
  return {
    hasSocial: true,
    displayText: trimmed,
    isUrl: false,
    isHandle: false,
    copyValue: trimmed,
  };
}

