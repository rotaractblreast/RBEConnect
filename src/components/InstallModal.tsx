import React from "react";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIos: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, isIos }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs drawer-backdrop">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#8e4e00]">
            <span className="material-symbols-outlined text-2xl">install_mobile</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-display">Install RBE Connect</h3>
            <p className="text-xs text-stone-500">Standalone Desktop & Mobile Web App</p>
          </div>
        </div>

        {isIos ? (
          <div className="space-y-4 text-sm text-stone-700">
            <p className="text-xs text-stone-500">
              To install RBE Connect on your iPhone or iPad with instant home screen access and lock-screen notifications:
            </p>
            <ol className="space-y-3 pl-1">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  1
                </span>
                <span>
                  Tap the <strong className="font-semibold text-stone-900">Share button</strong> (
                  <span className="material-symbols-outlined text-base align-middle text-[#ff9000]">ios_share</span>
                  ) in Safari's bottom toolbar.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  2
                </span>
                <span>
                  Scroll down and tap{" "}
                  <strong className="font-semibold text-stone-900">"Add to Home Screen"</strong> (
                  <span className="material-symbols-outlined text-base align-middle text-[#ff9000]">add_box</span>).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  3
                </span>
                <span>
                  Tap <strong className="font-semibold text-stone-900">Add</strong> in the top-right corner.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-4 text-sm text-stone-700">
            <p className="text-xs text-stone-500">
              Install RBE Connect on your Mac, Windows PC, or Android device for native desktop windowing:
            </p>
            <ol className="space-y-3 pl-1">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  1
                </span>
                <span>
                  Click the <strong className="font-semibold text-stone-900">Install App</strong> icon in your browser's address bar (or browser menu ⋮).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  2
                </span>
                <span>
                  Select <strong className="font-semibold text-stone-900">"Install"</strong> to add RBE Connect to your applications.
                </span>
              </li>
            </ol>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
