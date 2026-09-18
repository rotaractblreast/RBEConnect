import { Application, RawDashboardData, Reviewer } from "../types";
import { initOneSignal, showLocalSystemNotification } from "./onesignal";
import { playNotificationChime } from "./sound";

// Google Apps Script Web App URL (constant endpoint)
export const FORMS_API_URL =
  "https://script.google.com/macros/s/AKfycbwchW0c5HpKBvqSuhtownO-xtqGEoo3qtjo73CSmVvQINpNptmy_DMlkb5gq36Zoun1/exec";

// LocalStorage Keys
const TOKEN_KEY = "rbe_connect_token";
const USER_KEY = "rbe_connect_user";
const DATA_CACHE_KEY = "rbe_connect_data_cache";

export function getStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getStoredUser(): Reviewer | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredDataCache(): RawDashboardData | null {
  try {
    const raw = localStorage.getItem(DATA_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredSession(token: string, user: Reviewer) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn("Storage save error:", e);
  }
}

export function saveStoredDataCache(data: RawDashboardData) {
  try {
    localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Cache save error:", e);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DATA_CACHE_KEY);
  } catch {}
}

export function getDeviceSummary(): string {
  const ua = navigator.userAgent || "";
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  let os = "Desktop";
  if (/iphone/i.test(ua)) os = "iPhone";
  else if (/ipad/i.test(ua)) os = "iPad";
  else if (/android/i.test(ua)) os = "Android";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/crios/i.test(ua)) browser = "Chrome iOS";
  else if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";

  return `${os} ${isPWA ? "(PWA)" : `(${browser})`}`;
}

export async function apiPost<T = any>(payload: Record<string, any>): Promise<T> {
  const res = await fetch(FORMS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  const data = await res.json();
  return data;
}

export async function logPwaInstall(source: string = "PWA Install"): Promise<void> {
  try {
    await apiPost({
      action: "logInstall",
      platform: navigator.platform || "Web",
      device: getDeviceSummary(),
      source,
    });
  } catch (e) {
    console.warn("Could not log install telemetry:", e);
  }
}

export async function verifyStoredSession(token: string): Promise<{
  ok: boolean;
  user?: Reviewer;
  token?: string;
  oneSignalAppId?: string;
  error?: string;
  status?: number;
}> {
  try {
    const res = await apiPost({ action: "verifySession", token });
    if (res.ok && res.user) {
      if (res.token) {
        saveStoredSession(res.token, res.user);
      }
      if (res.oneSignalAppId) {
        initOneSignal(res.oneSignalAppId);
      }
      return res;
    }
    return res;
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

function sortDescending<T extends { timestamp: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ta = new Date(a.timestamp || 0).getTime();
    const tb = new Date(b.timestamp || 0).getTime();
    return tb - ta;
  });
}

export async function fetchDashboardData(
  token: string,
  previousApps: Application[] = [],
  bypassCache: boolean = false
): Promise<{ ok: boolean; data?: RawDashboardData; error?: string; status?: number }> {
  try {
    const res = await apiPost({
      action: "getData",
      token,
      bypassCache,
    });

    if (res.ok) {
      if (res.oneSignalAppId) {
        initOneSignal(res.oneSignalAppId);
      }

      const incomingApps = sortDescending<Application>(res.applications || []);
      const formatted: RawDashboardData = {
        applications: incomingApps,
        subscribers: sortDescending(res.subscribers || []),
        contactMessages: sortDescending(res.contactMessages || []),
      };

      saveStoredDataCache(formatted);

      // Detect newly arrived applications
      if (previousApps.length > 0 && incomingApps.length > previousApps.length) {
        const prevKeys = new Set(previousApps.map((a) => a.rowIndex + "_" + a.email));
        const newOnes = incomingApps.filter((a) => !prevKeys.has(a.rowIndex + "_" + a.email));

        if (newOnes.length > 0) {
          playNotificationChime();
          const first = newOnes[0];
          const summary =
            newOnes.length === 1
              ? `${first.name} just applied to join RBE!`
              : `${newOnes.length} new candidates have submitted applications.`;
          showLocalSystemNotification("New Member Application", summary);
        }
      }

      return { ok: true, data: formatted };
    }

    return { ok: false, error: res.error || "Failed to fetch dashboard data", status: res.status };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
