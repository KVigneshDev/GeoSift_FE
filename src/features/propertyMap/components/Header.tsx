import React from "react";
import { LogOut, MapPin, Building2, SlidersHorizontal, User, Layers } from "lucide-react";
import type { User as UserType } from "@/features/auth/types";

interface HeaderProps {
  user: UserType | null;
  totalCount: number;
  activeFilterCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  totalCount,
  activeFilterCount,
  sidebarOpen,
  onToggleSidebar,
  onLogout,
}) => {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm z-20">
      {/* Logo and Brand */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative w-11 h-11 bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
            <MapPin className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <div className="text-lg font-black text-stone-900">
            GeoSift
          </div>
          <div className="text-xs text-stone-500 hidden sm:block font-semibold -mt-0.5">
            Property Intelligence
          </div>
        </div>
      </div>

      {/* Right Section - Stats and Actions */}
      <div className="flex items-center gap-3">
        {/* Building Count - Compact Design */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-teal-50/60 rounded-xl border border-teal-100">
          <Building2 className="w-4 h-4 text-teal-700" />
          <span className="text-sm font-bold text-stone-900">
            {totalCount.toLocaleString()}
          </span>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm shadow-md transition-all transform hover:scale-105 ${
            sidebarOpen
              ? "bg-gradient-to-br from-teal-700 to-teal-900 text-white shadow-teal-700/30"
              : "bg-white border-2 border-stone-200 text-stone-700 hover:border-teal-300"
          }`}
        >
          {sidebarOpen ? (
            <Layers className="w-4 h-4" />
          ) : (
            <SlidersHorizontal className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {sidebarOpen ? "Filters" : "Filters"}
          </span>
          {activeFilterCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-md text-xs font-black ${
              sidebarOpen
                ? "bg-white/25 backdrop-blur-sm text-white"
                : "bg-teal-100 text-teal-700"
            }`}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* User Info and Logout */}
        <div className="hidden sm:flex items-center gap-3 pl-3 border-l-2 border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center ring-2 ring-teal-200/50">
              <User className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-sm">
              <div className="font-bold text-stone-900">{user?.name}</div>
              <div className="text-xs text-stone-500 font-semibold">{user?.organization.name}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition-all group border border-transparent hover:border-red-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-stone-500 group-hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};