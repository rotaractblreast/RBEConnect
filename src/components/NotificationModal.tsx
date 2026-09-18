import React, { useState } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  showLocalSystemNotification,
} from "../services/onesignal";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type?: "done" | "error" | "warning" | "info" | "lock") => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onToast,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );

  if (!isOpen) return null;

  const handleEnable = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      const currentPerm = getNotificationPermission();
      setPermission(currentPerm);

      if (granted || currentPerm === "granted") {
        onToast("Instant applicant alerts enabled! 🚀", "done");
        showLocalSystemNotification(
          "RBE Connect Alerts Active",
          "You will now receive instant push alerts whenever candidates apply, even when the app is closed."
        );
        onSuccess();
        onClose();
      } else if (currentPerm === "denied") {
        onToast(
          "Notifications are blocked in your browser. Please allow them in site settings.",
          "warning"
        );
      }
    } catch (err: any) {
      onToast(`Notification setup error: ${err.message || err}`, "error");
    } finally {
      setIsRequesting(false);
    }
  };

  const isDenied = permission === "denied";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs drawer-backdrop">
      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left overflow-hidden">
        {/* Decorative Top Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header with Icon */}
        <div className="flex items-start gap-3.5 mb-5 relative">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#8e4e00] shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-2xl text-[#ff9000] animate-bounce">
              notifications_active
            </span>
          </div>
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 mb-1 border border-amber-200">
              Essential for Reviewers
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-display text-stone-900 leading-tight">
              Enable Closed-App Alerts
            </h3>
          </div>
        </div>

        {/* Body Text & Benefits */}
        <div className="space-y-3.5 text-xs text-stone-600 mb-6">
          <p className="leading-relaxed text-stone-700 text-xs sm:text-[13px]">
            Most of the time, RBE Connect will not be open on your screen. Enabling push notifications ensures you receive
            <strong className="text-stone-900 font-semibold"> instant lock-screen alerts</strong> via OneSignal the moment a prospective member applies.
          </p>

          <div className="space-y-2.5 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/70 text-stone-800">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base text-amber-600 shrink-0 mt-0.5">
                screen_lock_portrait
              </span>
              <div>
                <strong className="font-semibold text-stone-900 block">Works When App is Closed</strong>
                <span className="text-stone-500 text-[11px] leading-tight block">
                  Delivered natively to your device lock screen and desktop notification center.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base text-amber-600 shrink-0 mt-0.5">
                touch_app
              </span>
              <div>
                <strong className="font-semibold text-stone-900 block">1-Tap Candidate Review</strong>
                <span className="text-stone-500 text-[11px] leading-tight block">
                  Tap any alert to open the portal straight to the candidate's profile.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base text-amber-600 shrink-0 mt-0.5">
                verified_user
              </span>
              <div>
                <strong className="font-semibold text-stone-900 block">Zero Spam</strong>
                <span className="text-stone-500 text-[11px] leading-tight block">
                  Strictly sent only for verified membership applications and contact inquiries.
                </span>
              </div>
            </div>
          </div>

          {/* Browser Denied Warning Card */}
          {isDenied && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>Notifications Blocked by Browser</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Your browser has notifications set to "Block". To enable:
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-rose-800 font-medium">
                <li>Click the lock or site settings icon 🔒 next to the website URL.</li>
                <li>Change <strong>Notifications</strong> to <strong>Allow</strong>.</li>
                <li>Click "Check Permission Again" below.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer text-center"
          >
            Remind Me Later
          </button>
          <button
            type="button"
            disabled={isRequesting}
            onClick={handleEnable}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">
              {isDenied ? "refresh" : "notifications"}
            </span>
            <span>
              {isRequesting
                ? "Connecting…"
                : isDenied
                ? "Check Permission Again"
                : "Enable Push Notifications"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
