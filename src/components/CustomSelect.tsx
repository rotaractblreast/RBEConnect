import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  dotColor?: string;
  count?: number;
}

interface CustomSelectProps {
  labelPrefix?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  labelPrefix,
  value,
  options,
  onChange,
  icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative select-none text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white hover:bg-stone-50 border rounded-xl text-xs font-semibold text-stone-800 shadow-2xs transition-all cursor-pointer ${
          isOpen
            ? "border-[#ff9000] ring-2 ring-[#ff9000]/20"
            : "border-stone-300 hover:border-stone-400"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption.dotColor ? (
            <span className={`h-2 w-2 rounded-full ${selectedOption.dotColor}`}></span>
          ) : (
            icon && (
              <span className="material-symbols-outlined text-stone-400 text-base">
                {icon}
              </span>
            )
          )}
          <span className="truncate">
            {labelPrefix && (
              <span className="text-stone-400 font-normal mr-1">{labelPrefix}</span>
            )}
            <span className="text-stone-900">{selectedOption.label}</span>
          </span>
        </div>

        <span
          className={`material-symbols-outlined text-stone-400 text-lg transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-stone-700" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 sm:right-auto sm:min-w-[210px] mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl py-1.5 z-50 drawer-panel max-h-64 overflow-y-auto"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-amber-50 text-amber-950 font-bold"
                    : "text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.dotColor ? (
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${opt.dotColor}`}></span>
                  ) : opt.icon ? (
                    <span className="material-symbols-outlined text-stone-400 text-base flex-shrink-0">
                      {opt.icon}
                    </span>
                  ) : null}
                  <span className="truncate">{opt.label}</span>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {opt.count !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-mono">
                      {opt.count}
                    </span>
                  )}
                  {isSelected && (
                    <span className="material-symbols-outlined text-amber-600 text-base font-bold">
                      check
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
