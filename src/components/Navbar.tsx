import React, { useState } from "react";
import { Reviewer } from "../types";
import { getNotificationPermission, requestNotificationPermission, showLocalSystemNotification } from "../services/onesignal";

interface NavbarProps {
  user: Reviewer | null;
  isSyncing: boolean;
  canInstall: boolean;
  onInstall: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  onToast: (msg: string, type?: "done" | "error" | "warning" | "info" | "lock") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isSyncing,
  canInstall,
  onInstall,
  onRefresh,
  onLogout,
  onToast,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());

  const handleToggleNotifs = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      onToast("Push notifications enabled! 🚀", "done");
      showLocalSystemNotification(
        "RBE Connect Alerts Active",
        "You will receive instant alerts on this device whenever candidates apply."
      );
    } else {
      onToast("Notification permission was denied or dismissed.", "warning");
    }
  };

  const handleSendTestPush = () => {
    if (permission === "granted") {
      showLocalSystemNotification(
        "RBE Connect Test Push",
        "Push notification delivery is functioning smoothly on this device! 🎯"
      );
      onToast("Test notification dispatched!", "done");
    } else {
      onToast("Please enable notifications first.", "warning");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-shadow">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#8e4e00] shadow-2xs flex-shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-2xl text-[#ff9000]">badge</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-extrabold text-stone-900 text-sm sm:text-base md:text-lg tracking-tight truncate">
                  RBE Connect
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex-shrink-0">
                  PORTAL
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 hidden md:block truncate">
                Member Applications & Reviewer Portal
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Syncing indicator */}
            {isSyncing && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-medium animate-pulse border border-amber-200/60">
                <span className="inline-block animate-spin text-xs">⟳</span>
                <span className="hidden md:inline">Syncing…</span>
              </div>
            )}

            {/* Install App Button */}
            {canInstall && (
              <button
                onClick={onInstall}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Install RBE Connect App on this device"
              >
                <span className="material-symbols-outlined text-sm">install_mobile</span>
                <span className="hidden md:inline">Install App</span>
              </button>
            )}

            {/* Notification Bell with Dropdown Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className={`relative p-2 rounded-xl border transition-colors cursor-pointer ${
                  permission === "granted"
                    ? "bg-amber-50/80 border-amber-200 text-amber-800 hover:bg-amber-100"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
                title="Push Notification Settings"
                aria-label="Push Notification Settings"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">
                  {permission === "granted" ? "notifications_active" : "notifications"}
                </span>
                {permission === "granted" && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Popover Menu */}
              {showNotifMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 sm:w-84 bg-white border border-stone-200 rounded-2xl shadow-2xl p-4 z-50 text-left drawer-panel">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-lg">
                          notifications
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          Push Alerts
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          permission === "granted"
                            ? "bg-emerald-100 text-emerald-800"
                            : permission === "denied"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {permission === "granted"
                          ? "Active"
                          : permission === "denied"
                          ? "Blocked"
                          : "Pending"}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                      {permission === "granted"
                        ? "Push alerts are active on this device. You will receive real-time notifications whenever prospective members apply."
                        : "Enable desktop and mobile push alerts to review incoming member applications without keeping this tab open."}
                    </p>

                    <div className="space-y-2">
                      {permission !== "granted" ? (
                        <button
                          onClick={handleToggleNotifs}
                          className="w-full py-2.5 px-3 bg-[#ff9000] hover:bg-[#e07f00] text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">notifications_active</span>
                          <span>Enable Push Notifications</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleSendTestPush}
                          className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">send_to_mobile</span>
                          <span>Send Test Notification</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh applications and subscribers"
              aria-label="Refresh Data"
            >
              <span
                className={`material-symbols-outlined text-lg sm:text-xl ${
                  isSyncing ? "animate-spin text-[#ff9000]" : ""
                }`}
              >
                refresh
              </span>
            </button>

            {/* Reviewer Profile Avatar & Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
                  title={`${user.name} (${user.role || "Reviewer"})`}
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-950 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs leading-tight hidden lg:block">
                    <div className="font-semibold text-stone-900 truncate max-w-[110px]">{user.name}</div>
                    <div className="text-[10px] text-stone-500 truncate max-w-[110px]">{user.role || "Reviewer"}</div>
                  </div>
                  <span className="material-symbols-outlined text-stone-400 text-base hidden lg:inline">
                    expand_more
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 text-left drawer-panel">
                      <div className="px-3.5 py-2 border-b border-stone-100">
                        <div className="font-bold text-xs text-stone-900 truncate">{user.name}</div>
                        <div className="text-[11px] text-stone-500 truncate">{user.email}</div>
                        <div className="text-[10px] text-amber-700 font-semibold uppercase mt-0.5">
                          {user.role || "Reviewer"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs drawer-backdrop">
          <div className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl text-left">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 mb-4">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>
            <h3 className="text-base font-bold text-stone-900 font-display">Sign out of RBE Connect?</h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Your session on this device will be concluded. You can log back in anytime with your reviewer credentials.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
