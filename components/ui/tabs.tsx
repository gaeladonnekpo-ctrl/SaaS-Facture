"use client";

import React from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  dotColor?: string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabsProps<T>) {
  return (
    <div
      className={`-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
              isActive
                ? "bg-forest-900 text-surface shadow-2xs"
                : "text-sage-600 hover:bg-sage-100 hover:text-forest-900"
            }`}
          >
            {tab.dotColor && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`}
                aria-hidden="true"
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] tabular ${
                  isActive
                    ? "bg-forest-800 text-lime-300"
                    : "bg-sage-200 text-sage-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

