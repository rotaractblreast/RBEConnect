import React, { useState } from "react";
import { ContactMessage, Subscriber } from "../types";

interface SubscribersTabProps {
  subscribers: Subscriber[];
  contactMessages: ContactMessage[];
}

export const SubscribersTab: React.FC<SubscribersTabProps> = ({
  subscribers,
  contactMessages,
}) => {
  const [subTab, setSubTab] = useState<"newsletter" | "contact">("newsletter");
  const [query, setQuery] = useState("");

  const filteredSubs = subscribers.filter((s) =>
    (s.email || "").toLowerCase().includes(query.toLowerCase())
  );

  const filteredContacts = contactMessages.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(query.toLowerCase()) ||
      (c.message || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Subtab Toggle & Search */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSubTab("newsletter")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              subTab === "newsletter"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Newsletter Subscribers ({subscribers.length})
          </button>
          <button
            onClick={() => setSubTab("contact")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              subTab === "contact"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Contact Inquiries ({contactMessages.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search email, name or text…"
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#ff9000]"
          />
        </div>
      </div>

      {subTab === "newsletter" ? (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Subscriber Email</th>
                <th className="py-3.5 px-4 text-right">Subscribed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredSubs.map((sub, idx) => (
                <tr key={sub.rowIndex || idx} className="hover:bg-amber-50/30">
                  <td className="py-3 px-4 text-stone-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-stone-900">{sub.email}</td>
                  <td className="py-3 px-4 text-right text-stone-500 text-[11px]">
                    {sub.timestamp || "—"}
                  </td>
                </tr>
              ))}
              {filteredSubs.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-xs text-stone-400">
                    No newsletter subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="divide-y divide-stone-100">
            {filteredContacts.map((c, idx) => (
              <div key={c.rowIndex || idx} className="p-4 hover:bg-amber-50/30 transition-colors text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{c.name || "Inquirer"}</span>
                  <span className="text-[11px] text-stone-400">{c.timestamp}</span>
                </div>
                <div className="text-xs text-amber-900 font-medium">
                  {c.email} {c.phone && `· ${c.phone}`}
                </div>
                <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                  {c.message}
                </p>
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400">
                No contact inquiries found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
