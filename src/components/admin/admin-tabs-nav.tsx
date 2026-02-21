"use client";

import type { AdminTab } from "@/app/(portal)/admin/admin.types";

type AdminTabsNavProps = {
  tabs: Array<{ id: AdminTab; label: string; description: string }>;
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
};

export function AdminTabsNav({ tabs, activeTab, onChange }: AdminTabsNavProps) {
  return (
    <nav className="mt-6 flex gap-3 overflow-x-auto border-b border-black/10 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            className={`min-w-[180px] flex-shrink-0 flex flex-col rounded-2xl border px-4 py-2.5 text-left transition ${
              isActive
                ? "border-black/80 bg-black text-white"
                : "border-black/10 bg-white/70 text-[var(--foreground)] hover:border-black/30"
            }`}
          >
            <span className="text-sm font-semibold tracking-wide sm:text-base">
              {tab.label}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] ${
                isActive ? "text-white/70" : "text-muted"
              }`}
            >
              {tab.description}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
