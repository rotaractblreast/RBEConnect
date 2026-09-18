import React from "react";
import { Application, Subscriber } from "../types";

interface MetricsProps {
  applications: Application[];
  subscribers: Subscriber[];
  activeFilter: string;
  onSelectFilter: (status: string) => void;
  isLoading?: boolean;
}

export const Metrics: React.FC<MetricsProps> = ({
  applications,
  subscribers,
  activeFilter,
  onSelectFilter,
  isLoading = false,
}) => {
  const totalApps = applications.length;
  const pending = applications.filter(
    (a) => (a.status || "Pending").toLowerCase() === "pending"
  ).length;
  const underReview = applications.filter((a) => {
    const s = (a.status || "").toLowerCase();
    return s === "under review" || s === "contacted";
  }).length;
  const accepted = applications.filter(
    (a) => (a.status || "").toLowerCase() === "accepted"
  ).length;
  const waitlisted = applications.filter(
    (a) => (a.status || "").toLowerCase() === "waitlisted"
  ).length;
  const rejected = applications.filter(
    (a) => (a.status || "").toLowerCase() === "rejected"
  ).length;
  const totalSubs = subscribers.length;

  const cards = [
    {
      label: "Total Applicants",
      value: totalApps,
      filter: "all",
      icon: "groups",
      color: "text-stone-900",
      bg: "bg-white",
      border: "border-stone-200/90",
      activeStyle: "ring-2 ring-amber-500 border-amber-400 bg-amber-50/40",
      dot: "bg-stone-600",
    },
    {
      label: "Pending Review",
      value: pending,
      filter: "pending",
      icon: "pending_actions",
      color: "text-amber-800",
      bg: "bg-white",
      border: "border-amber-200/90",
      activeStyle: "ring-2 ring-amber-500 border-amber-400 bg-amber-50/60",
      dot: "bg-amber-500",
    },
    {
      label: "Under Review",
      value: underReview,
      filter: "under review",
      icon: "schedule",
      color: "text-blue-800",
      bg: "bg-white",
      border: "border-blue-200/90",
      activeStyle: "ring-2 ring-blue-500 border-blue-400 bg-blue-50/60",
      dot: "bg-blue-500",
    },
    {
      label: "Accepted",
      value: accepted,
      filter: "accepted",
      icon: "verified",
      color: "text-emerald-800",
      bg: "bg-white",
      border: "border-emerald-200/90",
      activeStyle: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/60",
      dot: "bg-emerald-500",
    },
    {
      label: "Waitlisted",
      value: waitlisted,
      filter: "waitlisted",
      icon: "hourglass_top",
      color: "text-purple-800",
      bg: "bg-white",
      border: "border-purple-200/90",
      activeStyle: "ring-2 ring-purple-500 border-purple-400 bg-purple-50/60",
      dot: "bg-purple-500",
    },
    {
      label: "Rejected",
      value: rejected,
      filter: "rejected",
      icon: "cancel",
      color: "text-rose-800",
      bg: "bg-white",
      border: "border-rose-200/90",
      activeStyle: "ring-2 ring-rose-500 border-rose-400 bg-rose-50/60",
      dot: "bg-rose-500",
    },
    {
      label: "Subscribers",
      value: totalSubs,
      filter: "subscribers",
      icon: "mark_email_read",
      color: "text-stone-800",
      bg: "bg-white",
      border: "border-stone-200/90",
      activeStyle: "ring-2 ring-stone-700 border-stone-400 bg-stone-100",
      dot: "bg-stone-500",
    },
  ];

  return (
    <section className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3.5">
        {cards.map((c, idx) => {
          const isSelected =
            c.filter === "all"
              ? activeFilter === "all"
              : activeFilter.toLowerCase() === c.filter.toLowerCase();
          const isLast = idx === cards.length - 1;

          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onSelectFilter(c.filter)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[96px] sm:min-h-[105px] ${
                isLast ? "col-span-2 sm:col-span-3 lg:col-span-1" : ""
              } ${c.bg} ${c.border} ${isSelected ? c.activeStyle : "hover:border-stone-400 hover:bg-stone-50/70"}`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 leading-tight block">
                  {c.label}
                </span>
                <span className={`h-2 w-2 rounded-full ${c.dot} flex-shrink-0 mt-0.5`}></span>
              </div>
              <div className="flex items-baseline justify-between">
                {isLoading && c.value === 0 ? (
                  <div className="h-7 w-12 rounded-lg bg-stone-200/80 animate-pulse mt-0.5"></div>
                ) : (
                  <div className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${c.color}`}>
                    {c.value}
                  </div>
                )}
                <span className="material-symbols-outlined text-stone-400 text-lg opacity-70">
                  {c.icon}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
