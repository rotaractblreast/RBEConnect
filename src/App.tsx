import React, { useState, useEffect, useCallback, useRef } from "react";
import { Application, FilterState, RawDashboardData, Reviewer, ToastMessage, ToastType } from "./types";
import {
  clearStoredSession,
  fetchDashboardData,
  getStoredDataCache,
  getStoredToken,
  getStoredUser,
  logPwaInstall,
  saveStoredDataCache,
} from "./services/api";
import { Navbar } from "./components/Navbar";
import { Metrics } from "./components/Metrics";
import { ApplicationFeed } from "./components/ApplicationFeed";
import { CandidateDrawer } from "./components/CandidateDrawer";
import { SubscribersTab } from "./components/SubscribersTab";
import { AuthScreen } from "./components/AuthScreen";
import { ToastContainer } from "./components/Toast";
import { InstallModal } from "./components/InstallModal";
import { NotificationModal } from "./components/NotificationModal";
import { getNotificationPermission } from "./services/onesignal";

export const App: React.FC = () => {
  // Synchronous initial hydration from local storage
  const [token, setToken] = useState<string>(() => getStoredToken());
  const [user, setUser] = useState<Reviewer | null>(() => getStoredUser());
  const [data, setData] = useState<RawDashboardData>(() => {
    const cached = getStoredDataCache();
    return cached || { applications: [], subscribers: [], contactMessages: [] };
  });

  const [activeTab, setActiveTab] = useState<"applications" | "subscribers">("applications");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    occupation: "all",
    experience: "all",
  });
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Push Notification Gate state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // PWA Install Prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // PWA Install Handlers
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      showToast("RBE Connect installed successfully! 🎉", "done");
      logPwaInstall("Web Browser PWA");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [showToast]);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Revalidate session and quiet background data fetch
  const refreshData = useCallback(
    async (silent: boolean = false, bypassCache: boolean = false) => {
      if (!token) return;
      if (!silent) setIsSyncing(true);

      const res = await fetchDashboardData(token, data.applications, bypassCache);
      if (res.ok && res.data) {
        setData(res.data);
        if (!silent) {
          showToast("Applications updated.", "done");
        }
      } else if (res.status === 401 || !res.ok) {
        const errLower = (res.error || "").toLowerCase();
        if (
          res.status === 401 ||
          errLower.includes("revoked") ||
          errLower.includes("expired") ||
          errLower.includes("unauthorized") ||
          errLower.includes("removed") ||
          errLower.includes("inactive") ||
          errLower.includes("invalid") ||
          errLower.includes("log in") ||
          errLower.includes("not found")
        ) {
          clearStoredSession();
          setToken("");
          setUser(null);
          showToast(res.error || "Session revoked or expired. Please sign in again.", "lock");
        } else if (!silent) {
          showToast(res.error || "Could not sync latest data.", "warning");
        }
      }

      if (!silent) setIsSyncing(false);
    },
    [token, data.applications, showToast]
  );

  // Background session verification and quiet sync only once on initial mount
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      const stored = getStoredToken();
      if (stored) {
        // Startup sync: verify session validity directly with backend and refresh cached items
        refreshData(true, false);
      }
    }
  }, [refreshData]);

  // Auto-polling (60 seconds) & visibility change revalidation
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshData(true, true);
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData(true, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, refreshData]);

  // Proactively prompt reviewer to enable push notifications if not yet granted
  useEffect(() => {
    if (token && user) {
      const perm = getNotificationPermission();
      setNotificationPermission(perm);
      if (perm !== "granted") {
        const timer = setTimeout(() => {
          setShowNotificationModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [token, user]);

  // Login handler: instant transition with preloaded data
  const handleLoginSuccess = (newUser: Reviewer, newToken: string, initialData?: RawDashboardData) => {
    setUser(newUser);
    setToken(newToken);
    if (initialData) {
      setData(initialData);
      saveStoredDataCache(initialData);
    }
    showToast(`Welcome back, ${newUser.name}!`, "done");
    if (!initialData) {
      refreshData(false, false);
    }

    const perm = getNotificationPermission();
    setNotificationPermission(perm);
    if (perm !== "granted") {
      setShowNotificationModal(true);
    }
  };

  // Logout handler
  const handleLogout = () => {
    clearStoredSession();
    setToken("");
    setUser(null);
    setData({ applications: [], subscribers: [], contactMessages: [] });
    showToast("Signed out successfully.", "info");
  };

  // Candidate status or note update handler - instant state & localStorage persistence
  const handleCandidateUpdate = (updated: Application) => {
    setData((prev) => {
      const next = {
        ...prev,
        applications: prev.applications.map((app) =>
          app.rowIndex === updated.rowIndex ? updated : app
        ),
      };
      saveStoredDataCache(next);
      return next;
    });
    if (selectedCandidate?.rowIndex === updated.rowIndex) {
      setSelectedCandidate(updated);
    }
  };

  // If not logged in, render AuthScreen
  if (!token || !user) {
    return (
      <div className="min-h-full flex flex-col flex-1 bg-[#fff8f5]">
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          canInstall={!isStandalone}
          onInstall={handleTriggerInstall}
        />
        <InstallModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          isIos={isIos}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col flex-1 bg-[#fff8f5]">
      {/* Top Navigation */}
      <Navbar
        user={user}
        isSyncing={isSyncing}
        canInstall={!isStandalone}
        onInstall={handleTriggerInstall}
        onRefresh={() => refreshData(false, true)}
        onLogout={handleLogout}
        onToast={showToast}
      />

      {/* Sticky Notification Alert Banner if push alerts are inactive */}
      {notificationPermission !== "granted" && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border-b border-amber-200/80 px-3.5 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-amber-600 text-base shrink-0 animate-pulse">
              notifications_active
            </span>
            <span className="truncate">
              <strong>Closed-App Alerts Inactive:</strong> Enable push notifications to receive real-time applicant updates when RBE Connect is closed.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowNotificationModal(true)}
            className="shrink-0 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Enable Alerts
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Metric Cards with Quick Filters */}
        <Metrics
          applications={data.applications}
          subscribers={data.subscribers}
          activeFilter={activeTab === "subscribers" ? "subscribers" : filters.status}
          isLoading={isSyncing && data.applications.length === 0}
          onSelectFilter={(statusFilter) => {
            if (statusFilter === "subscribers") {
              setActiveTab("subscribers");
            } else {
              setActiveTab("applications");
              setFilters((prev) => ({ ...prev, status: statusFilter }));
            }
          }}
        />

        {/* Responsive Segmented Tab Selection Bar */}
        <div className="w-full max-w-md mx-auto sm:mx-0 bg-stone-200/70 p-1 rounded-2xl flex items-center gap-1 mb-6 border border-stone-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "applications"
                ? "bg-white text-stone-950 shadow-xs border border-stone-200/60"
                : "text-stone-600 hover:text-stone-950"
            }`}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">group</span>
            <span>Applications ({data.applications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subscribers")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "subscribers"
                ? "bg-white text-stone-950 shadow-xs border border-stone-200/60"
                : "text-stone-600 hover:text-stone-950"
            }`}
          >
            <span className="material-symbols-outlined text-base sm:text-lg">mark_email_read</span>
            <span>Subscribers ({data.subscribers.length})</span>
          </button>
        </div>

        {/* View Content */}
        {activeTab === "applications" ? (
          <ApplicationFeed
            applications={data.applications}
            filters={filters}
            isLoading={isSyncing && data.applications.length === 0}
            onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            onSelectCandidate={(candidate) => setSelectedCandidate(candidate)}
          />
        ) : (
          <SubscribersTab
            subscribers={data.subscribers}
            contactMessages={data.contactMessages}
          />
        )}
      </main>

      {/* Candidate Details Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        currentUser={user}
        onClose={() => setSelectedCandidate(null)}
        onUpdateCandidate={handleCandidateUpdate}
        onToast={showToast}
      />

      {/* Mandatory Push Notification Permission Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSuccess={() => setNotificationPermission("granted")}
        onToast={showToast}
      />

      {/* Install Instruction Modal */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        isIos={isIos}
      />

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
