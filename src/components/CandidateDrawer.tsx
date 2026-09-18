import React, { useState, useEffect } from "react";
import { Application, ApplicationStatus, Reviewer } from "../types";
import { apiPost } from "../services/api";
import {
  formatDisplayDob,
  formatTimestamp,
  parseReviewerNote,
  parseSocialProfile,
  splitNotes,
} from "../utils/formatters";

interface CandidateDrawerProps {
  candidate: Application | null;
  currentUser: Reviewer | null;
  onClose: () => void;
  onUpdateCandidate: (updated: Application) => void;
  onToast: (msg: string, type?: "done" | "error" | "warning" | "info" | "lock") => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidate,
  currentUser,
  onClose,
  onUpdateCandidate,
  onToast,
}) => {
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const cleanPhone = (candidate.phone || "").replace(/\D/g, "");
  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi ${candidate.name}, greetings from Rotaract Club of Bangalore East! We received your membership application.`
  )}`;

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (isUpdatingStatus || candidate.status === newStatus) return;
    setIsUpdatingStatus(true);

    const token = localStorage.getItem("rbe_connect_token") || "";
    const prevStatus = candidate.status;
    const nowStr = new Date().toISOString();
    const reviewerName = currentUser?.name || "Reviewer";

    // Optimistic UI update
    const updatedCandidate: Application = {
      ...candidate,
      status: newStatus,
      lastReviewer: reviewerName,
      lastReviewedAt: nowStr,
    };
    onUpdateCandidate(updatedCandidate);

    try {
      const res = await apiPost({
        action: "updateStatus",
        token,
        rowIndex: candidate.rowIndex,
        status: newStatus,
      });

      if (res.ok) {
        onToast(`Status updated to "${newStatus}"`, "done");
      } else {
        // Rollback on failure
        onUpdateCandidate({ ...candidate, status: prevStatus });
        onToast(res.error || "Failed to update status. Please try again.", "error");
      }
    } catch (err: any) {
      onUpdateCandidate({ ...candidate, status: prevStatus });
      onToast("Unable to reach service. Please try again.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const noteText = newNote.trim();
    if (!noteText || isSubmittingNote) return;

    setIsSubmittingNote(true);
    const token = localStorage.getItem("rbe_connect_token") || "";
    const reviewerName = currentUser?.name || "Reviewer";
    const reviewerRole = currentUser?.role ? ` (${currentUser.role})` : "";
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStamp = `${year}-${month}-${day} ${hours}:${minutes}`;

    const entry = `[${timeStamp} | ${reviewerName}${reviewerRole}]: ${noteText}`;
    const updatedNotes = candidate.notes ? `${candidate.notes}\n\n${entry}` : entry;

    // Optimistic update
    const updatedCandidate: Application = {
      ...candidate,
      notes: updatedNotes,
      lastReviewer: `${reviewerName}${reviewerRole}`,
      lastReviewedAt: timeStamp,
    };
    onUpdateCandidate(updatedCandidate);
    setNewNote("");

    try {
      const res = await apiPost({
        action: "addNote",
        token,
        rowIndex: candidate.rowIndex,
        note: noteText,
      });

      if (res.ok) {
        onToast("Reviewer note recorded.", "done");
      } else {
        onToast(res.error || "Could not save note. Please try again.", "error");
      }
    } catch (err: any) {
      onToast("Unable to save note. Please try again.", "error");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Parse notes chain
  const notesList = splitNotes(candidate.notes);

  // Contributions tags
  const contributions: string[] = Array.isArray(candidate.contribute)
    ? candidate.contribute
    : (candidate.contribute || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

  const socialInfo = parseSocialProfile(candidate.social);

  const statusOptions: ApplicationStatus[] = [
    "Pending",
    "Under Review",
    "Contacted",
    "Accepted",
    "Waitlisted",
    "Rejected",
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs drawer-backdrop">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <aside className="relative w-full max-w-2xl bg-white border-l border-stone-200 h-full flex flex-col shadow-2xl z-10 drawer-panel overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/80 bg-stone-50/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900">
                {candidate.name}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  candidate.status === "Accepted"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : candidate.status === "Rejected"
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : candidate.status === "Waitlisted"
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : candidate.status === "Under Review" || candidate.status === "Contacted"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {candidate.status || "Pending"}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Applied on {formatTimestamp(candidate.timestamp) || candidate.timestamp || "Recently"} · Application #{candidate.rowIndex}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-left">
          {/* Quick Contact Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {candidate.phone && (
              <>
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-base text-stone-600">call</span>
                  <span>Call {candidate.phone}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>WhatsApp</span>
                </a>
              </>
            )}
            {candidate.email && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(candidate.email);
                  onToast("Email address copied to clipboard!", "done");
                }}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-stone-600">content_copy</span>
                <span>Copy Email</span>
              </button>
            )}
          </div>

          {/* Demographic & Career Card */}
          <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Profile & Demographics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div>
                <span className="text-stone-500 block mb-0.5">Email</span>
                <span className="font-medium text-stone-900 break-all">{candidate.email || "—"}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Phone</span>
                <span className="font-medium text-stone-900">{candidate.phone || "—"}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Date of Birth</span>
                <span className="font-medium text-stone-900">{formatDisplayDob(candidate.dob)}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Gender</span>
                <span className="font-medium text-stone-900">{candidate.gender || "—"}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Locality / Area</span>
                <span className="font-medium text-stone-900">{candidate.address || "—"}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-stone-500 block mb-0.5">Social Profile</span>
                {socialInfo.hasSocial ? (
                  <div className="flex items-start gap-1.5 pt-0.5">
                    <div className="font-medium text-stone-900 break-all leading-snug flex-1 select-all">
                      {socialInfo.isUrl ? (
                        <a
                          href={socialInfo.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 hover:text-amber-900 hover:underline inline-flex items-center gap-1"
                          title="Open link in new tab"
                        >
                          <span>{socialInfo.displayText}</span>
                          <span className="material-symbols-outlined text-[13px] shrink-0">open_in_new</span>
                        </a>
                      ) : (
                        <span className="text-stone-900">{socialInfo.displayText}</span>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(socialInfo.copyValue);
                          onToast("Social profile copied to clipboard!", "done");
                        }}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold transition-colors cursor-pointer border border-stone-200/80 shadow-2xs"
                        title="Copy to clipboard"
                        aria-label="Copy social profile"
                      >
                        <span className="material-symbols-outlined text-[12px]">content_copy</span>
                        <span>Copy</span>
                      </button>
                      {socialInfo.isHandle && (
                        <a
                          href={socialInfo.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors inline-flex items-center"
                          title="Open on Instagram"
                          aria-label="Open on Instagram"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="font-medium text-stone-400">—</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200/60 grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="text-stone-500 block mb-0.5">Occupation Category</span>
                <span className="font-semibold text-stone-900 capitalize">
                  {candidate.organizationType || "—"}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">College or Organization</span>
                <span className="font-semibold text-stone-900">
                  {candidate.organization || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Rotaract Experience Card */}
          <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-stone-600">
              Rotaract Background
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">Member Classification:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                  candidate.rotaractStatus?.toLowerCase() === "experienced"
                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                    : "bg-stone-200 text-stone-800"
                }`}
              >
                {candidate.rotaractStatus || "New Candidate"}
              </span>
            </div>

            {candidate.clubName && (
              <div>
                <span className="text-stone-500 block mb-0.5">Previous Rotaract Club</span>
                <p className="text-stone-900 font-medium">{candidate.clubName}</p>
              </div>
            )}

            {candidate.journey && (
              <div>
                <span className="text-stone-500 block mb-0.5">Rotaract Experience & Journey</span>
                <p className="text-stone-800 whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-stone-200/60">
                  {candidate.journey}
                </p>
              </div>
            )}

            {candidate.why && (
              <div>
                <span className="text-stone-500 block mb-0.5">Why join Rotaract Bangalore East?</span>
                <p className="text-stone-800 whitespace-pre-line leading-relaxed bg-white p-3 rounded-xl border border-stone-200/60">
                  {candidate.why}
                </p>
              </div>
            )}
          </div>

          {/* Hobbies & Contributions */}
          <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-stone-600">
              Hobbies & Contribution Areas
            </h3>
            {candidate.hobbies && (
              <div>
                <span className="text-stone-500 block mb-0.5">Hobbies & Interests</span>
                <p className="text-stone-800 leading-relaxed">{candidate.hobbies}</p>
              </div>
            )}

            <div>
              <span className="text-stone-500 block mb-1.5">Intended Contribution Areas</span>
              <div className="flex flex-wrap gap-1.5">
                {contributions.length > 0 ? (
                  contributions.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium text-[11px]"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400 italic">None specified</span>
                )}
                {candidate.contributeOther && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-medium text-[11px]">
                    Other: {candidate.contributeOther}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reviewer Notes Timeline */}
          <div className="border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-4 bg-stone-50/40">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-amber-600">rate_review</span>
                <span>Reviewer Notes Log ({notesList.length})</span>
              </h3>
            </div>

            {notesList.length > 0 ? (
              <div className="space-y-3">
                {notesList.map((entry, idx) => {
                  const note = parseReviewerNote(entry);
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-2xs hover:border-amber-200/90 transition-all space-y-2 text-left"
                    >
                      {/* Note Header: Avatar + Author + Role + Date */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 border border-amber-300/60 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {note.initials}
                          </div>
                          <span className="font-semibold text-stone-900 text-xs truncate">
                            {note.author}
                          </span>
                          {note.role && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
                              {note.role}
                            </span>
                          )}
                        </div>
                        {note.formattedDate && (
                          <span className="text-[11px] text-stone-400 font-normal shrink-0">
                            {note.formattedDate}
                          </span>
                        )}
                      </div>

                      {/* Note Message */}
                      <div className="text-xs text-stone-800 leading-relaxed font-normal whitespace-pre-wrap pl-8">
                        {note.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No notes recorded yet for this applicant.</p>
            )}

            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-stone-200/60">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a remark (e.g. 'Interview scheduled for Sunday 5 PM' or 'Contacted via WhatsApp')..."
                rows={2}
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#ff9000] focus:ring-1 focus:ring-[#ff9000] transition-colors resize-none bg-white"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim() || isSubmittingNote}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_comment</span>
                  <span>{isSubmittingNote ? "Saving…" : "Post Note"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Drawer Sticky Decision Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-white shadow-lg space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
            <span>Update Candidate Status</span>
            {isUpdatingStatus && (
              <span className="text-amber-700 animate-pulse font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>Updating status…</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {statusOptions.map((st) => {
              const isSelected = candidate.status === st;
              return (
                <button
                  key={st}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                    isSelected
                      ? st === "Accepted"
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                        : st === "Rejected"
                        ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                        : st === "Waitlisted"
                        ? "bg-purple-600 text-white border-purple-700 shadow-xs"
                        : st === "Under Review" || st === "Contacted"
                        ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                        : "bg-amber-500 text-stone-950 border-amber-600 shadow-xs"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
