import React, { useRef, useEffect } from "react";
import { Application, FilterState } from "../types";
import { CustomSelect, SelectOption } from "./CustomSelect";

interface ApplicationFeedProps {
  applications: Application[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onSelectCandidate: (candidate: Application) => void;
  isLoading?: boolean;
}

export const ApplicationFeed: React.FC<ApplicationFeedProps> = ({
  applications,
  filters,
  onFilterChange,
  onSelectCandidate,
  isLoading = false,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global '/' hotkey to jump to search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter logic
  const filtered = applications.filter((app) => {
    // Search query match
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = (app.name || "").toLowerCase().includes(q);
      const matchEmail = (app.email || "").toLowerCase().includes(q);
      const matchPhone = (app.phone || "").toLowerCase().includes(q);
      const matchOrg = (app.organization || "").toLowerCase().includes(q);
      const matchClub = (app.clubName || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchOrg && !matchClub) {
        return false;
      }
    }

    // Status match
    if (filters.status && filters.status !== "all") {
      const s = (app.status || "Pending").toLowerCase();
      const target = filters.status.toLowerCase();
      if (target === "under review") {
        if (s !== "under review" && s !== "contacted") return false;
      } else if (s !== target) {
        return false;
      }
    }

    // Occupation match
    if (filters.occupation && filters.occupation !== "all") {
      if ((app.organizationType || "").toLowerCase() !== filters.occupation.toLowerCase()) {
        return false;
      }
    }

    // Experience match
    if (filters.experience && filters.experience !== "all") {
      if ((app.rotaractStatus || "").toLowerCase() !== filters.experience.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Calculate counts for options
  const statusOptions: SelectOption[] = [
    { value: "all", label: "All Statuses", dotColor: "bg-stone-400", count: applications.length },
    {
      value: "pending",
      label: "Pending",
      dotColor: "bg-amber-500",
      count: applications.filter((a) => (a.status || "Pending").toLowerCase() === "pending").length,
    },
    {
      value: "under review",
      label: "Under Review",
      dotColor: "bg-blue-500",
      count: applications.filter((a) => {
        const s = (a.status || "").toLowerCase();
        return s === "under review" || s === "contacted";
      }).length,
    },
    {
      value: "accepted",
      label: "Accepted",
      dotColor: "bg-emerald-500",
      count: applications.filter((a) => (a.status || "").toLowerCase() === "accepted").length,
    },
    {
      value: "waitlisted",
      label: "Waitlisted",
      dotColor: "bg-purple-500",
      count: applications.filter((a) => (a.status || "").toLowerCase() === "waitlisted").length,
    },
    {
      value: "rejected",
      label: "Rejected",
      dotColor: "bg-rose-500",
      count: applications.filter((a) => (a.status || "").toLowerCase() === "rejected").length,
    },
  ];

  const occupationOptions: SelectOption[] = [
    { value: "all", label: "All Occupations", icon: "badge" },
    { value: "student", label: "Student", icon: "school" },
    { value: "professional", label: "Professional", icon: "work" },
  ];

  const experienceOptions: SelectOption[] = [
    { value: "all", label: "All Backgrounds", icon: "diversity_3" },
    { value: "new", label: "New to Rotaract", icon: "person_add" },
    { value: "experienced", label: "Experienced Member", icon: "workspace_premium" },
  ];

  const getStatusBadge = (status?: string) => {
    const s = (status || "Pending").toLowerCase();
    if (s === "accepted") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Accepted
        </span>
      );
    }
    if (s === "under review" || s === "contacted") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          {status}
        </span>
      );
    }
    if (s === "waitlisted") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Waitlisted
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        Pending
      </span>
    );
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== "all" ||
    filters.occupation !== "all" ||
    filters.experience !== "all";

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 text-left">
        {/* Top Filter Row: Search & Custom Dropdowns */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Bar with Shortcut */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg pointer-events-none">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search candidate by name, college, email, phone…"
              className="w-full pl-10 pr-12 py-2.5 bg-stone-50/70 border border-stone-300 hover:border-stone-400 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#ff9000] focus:ring-1 focus:ring-[#ff9000] transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-200/70 rounded border border-stone-300/80">
                /
              </kbd>
            </div>
          </div>

          {/* Styled Custom Dropdowns (Stacked on Mobile, 3-Columns on Tablet/Split-screen, Inline on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 sm:gap-2 flex-shrink-0">
            <CustomSelect
              value={filters.status}
              options={statusOptions}
              onChange={(val) => onFilterChange({ status: val })}
              className="w-full sm:w-full lg:w-44"
            />
            <CustomSelect
              value={filters.occupation}
              options={occupationOptions}
              onChange={(val) => onFilterChange({ occupation: val })}
              className="w-full sm:w-full lg:w-44"
            />
            <CustomSelect
              value={filters.experience}
              options={experienceOptions}
              onChange={(val) => onFilterChange({ experience: val })}
              className="w-full sm:w-full lg:w-44"
            />
          </div>
        </div>

        {/* Quick Filter Chips for Status on Mobile & Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-stone-500 border-t border-stone-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              Showing <strong className="text-stone-900 font-bold">{filtered.length}</strong> of{" "}
              {applications.length} candidates
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  search: "",
                  status: "all",
                  occupation: "all",
                  experience: "all",
                })
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && applications.length === 0 ? (
        <div className="space-y-3 my-4">
          <div className="flex items-center gap-2 p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl text-xs text-amber-900 animate-pulse">
            <span className="material-symbols-outlined text-base animate-spin text-amber-600">sync</span>
            <span className="font-semibold">Loading member applications…</span>
          </div>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 w-1/3">
                  <div className="h-4 bg-stone-200 rounded-md w-3/4"></div>
                  <div className="h-3 bg-stone-100 rounded-md w-1/2"></div>
                </div>
                <div className="h-5 w-20 bg-stone-200 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <div className="h-3.5 bg-stone-100 rounded-md w-1/4"></div>
                <div className="h-3.5 bg-stone-200 rounded-md w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-3xl p-12 text-center my-6">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined text-3xl">inbox</span>
          </div>
          <h3 className="text-base font-bold text-stone-900 font-display">No candidates found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {applications.length === 0
              ? "No member applications have been submitted yet. When candidates apply on the website, they will appear here in real time."
              : "No candidates match the active search query or filter criteria. Try resetting filters."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                onFilterChange({ search: "", status: "all", occupation: "all", experience: "all" })
              }
              className="mt-4 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : null}

      {/* Full Table View (>= 1024px) */}
      <div className="hidden lg:block bg-white border border-stone-200/90 rounded-2xl shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <th className="py-3.5 px-4">Candidate</th>
              <th className="py-3.5 px-4">Occupation / College</th>
              <th className="py-3.5 px-4">Rotaract Background</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Applied</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {filtered.map((candidate) => (
              <tr
                key={candidate.rowIndex}
                onClick={() => onSelectCandidate(candidate)}
                className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                    {candidate.name}
                  </div>
                  <div className="text-stone-500 text-[11px] flex items-center gap-2 mt-0.5">
                    <span>{candidate.email}</span>
                    {candidate.phone && <span>· {candidate.phone}</span>}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-stone-800 line-clamp-1">
                    {candidate.organization || "—"}
                  </div>
                  <div className="text-stone-400 text-[11px] capitalize">
                    {candidate.organizationType || "—"}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                      candidate.rotaractStatus?.toLowerCase() === "experienced"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {candidate.rotaractStatus || "New"}
                  </span>
                  {candidate.clubName && (
                    <span className="block text-[11px] text-stone-500 truncate max-w-[140px] mt-0.5">
                      {candidate.clubName}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4">{getStatusBadge(candidate.status)}</td>
                <td className="py-3.5 px-4 text-stone-500 text-[11px] whitespace-nowrap">
                  {candidate.timestamp || "—"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCandidate(candidate);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 group-hover:bg-[#ff9000] text-stone-700 group-hover:text-stone-950 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Review</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Feed (< 1024px, optimized for Mobile and Split-Screen) */}
      <div className="lg:hidden space-y-3">
        {filtered.map((candidate) => (
          <div
            key={candidate.rowIndex}
            onClick={() => onSelectCandidate(candidate)}
            className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:border-amber-400 transition-colors cursor-pointer text-left space-y-2.5 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-stone-900">{candidate.name}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{candidate.email}</p>
                {candidate.phone && <p className="text-[11px] text-stone-400 mt-0.5">{candidate.phone}</p>}
              </div>
              {getStatusBadge(candidate.status)}
            </div>

            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-stone-100 text-stone-600">
              <div className="truncate max-w-[200px]">
                <span className="font-medium text-stone-800">
                  {candidate.organization || candidate.organizationType || "Candidate"}
                </span>
                {candidate.rotaractStatus?.toLowerCase() === "experienced" && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-900 font-semibold">
                    Exp
                  </span>
                )}
              </div>
              <span className="text-amber-800 font-bold text-xs flex items-center gap-0.5 flex-shrink-0">
                Review <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
