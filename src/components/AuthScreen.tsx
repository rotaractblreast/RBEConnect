import React, { useState } from "react";
import { Reviewer } from "../types";
import { apiPost, getDeviceSummary, saveStoredSession } from "../services/api";
import { initOneSignal } from "../services/onesignal";

interface AuthScreenProps {
  onLoginSuccess: (user: Reviewer, token: string, initialData?: any) => void;
  canInstall: boolean;
  onInstall: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  canInstall,
  onInstall,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await apiPost({
        action: "login",
        email: email.trim(),
        password,
        device: getDeviceSummary(),
      });

      if (res.ok && res.token && res.user) {
        saveStoredSession(res.token, res.user);
        if (res.oneSignalAppId) {
          initOneSignal(res.oneSignalAppId);
        }
        const initialData = res.applications ? {
          applications: res.applications || [],
          subscribers: res.subscribers || [],
          contactMessages: res.contactMessages || [],
        } : undefined;
        onLoginSuccess(res.user, res.token, initialData);
      } else {
        setErrorMsg(res.error || "Invalid reviewer credentials.");
      }
    } catch (err: any) {
      setErrorMsg(`Authentication failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-3xl shadow-card p-6 sm:p-8 text-left">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#8e4e00] mb-4 shadow-2xs">
            <span className="material-symbols-outlined text-3xl text-[#ff9000]">badge</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-stone-900 tracking-tight">
            RBE Connect
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Member Applications & Reviewer Portal
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl text-xs bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-lg mt-0.5 text-rose-600">error</span>
            <div className="leading-relaxed font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Reviewer Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reviewer@rotaractblreast.org"
                className="w-full pl-10 pr-4 py-3 bg-stone-50/70 border border-stone-200 hover:border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#ff9000] focus:ring-1 focus:ring-[#ff9000] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-stone-50/70 border border-stone-200 hover:border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#ff9000] focus:ring-1 focus:ring-[#ff9000] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#ff9000] hover:bg-[#e07f00] disabled:opacity-60 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLoading ? "Authenticating…" : "Sign In to Portal"}</span>
            <span className="material-symbols-outlined text-base">
              {isLoading ? "sync" : "arrow_forward"}
            </span>
          </button>
        </form>

        {/* Footer & PWA Install */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-400">
            Access restricted to authorized RBE Board Members & Reviewers.
          </p>

          {canInstall && (
            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-center">
              <button
                type="button"
                onClick={onInstall}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">install_mobile</span>
                <span>Install Connect App on this device</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
