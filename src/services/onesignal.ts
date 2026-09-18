/**
 * OneSignal Web Push SDK v16 Service
 */

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: any) => Promise<void> | void>;
    OneSignal?: any;
  }
}

let activeAppId = "";
let isInitialized = false;

export function getActiveAppId(): string {
  return activeAppId;
}

export function initOneSignal(appId: string): void {
  const cleanId = String(appId || "").trim();
  if (!cleanId || isInitialized) return;
  activeAppId = cleanId;
  isInitialized = true;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal: any) {
    try {
      await OneSignal.init({
        appId: cleanId,
        serviceWorkerPath: "OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/" },
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
      });

      console.log("[OneSignal] Initialized successfully with App ID:", cleanId);
    } catch (err: any) {
      const msg = err && err.message ? err.message : String(err);
      if (msg.includes("localhost") || msg.includes("domain") || msg.includes("only be used on")) {
        console.info("[OneSignal] Running on development origin (push alerts active in production):", msg);
      } else {
        console.warn("[OneSignal] Notice:", err);
      }
    }
  });
}

export function isPushSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  try {
    // 1. Direct native browser permission request (prevents triggering unmanaged OneSignal slidedown popups)
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      // 2. Register subscription with OneSignal
      if (window.OneSignal && window.OneSignal.Notifications) {
        try {
          await window.OneSignal.Notifications.requestPermission();
        } catch (e) {
          // Ignore wrapper notice if native permission is already granted
        }
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[Notification] Permission request error:", err);
    return false;
  }
}

export function showLocalSystemNotification(title: string, body: string, url: string = "/") {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "/icons/icon-192.png",
          badge: "/images/site/favicon.png",
          data: { url },
        });
      })
      .catch(() => {
        new Notification(title, {
          body,
          icon: "/icons/icon-192.png",
        });
      });
  } else {
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png",
    });
  }
}
