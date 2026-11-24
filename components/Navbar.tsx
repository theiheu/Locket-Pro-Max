"use client";

import React from "react";
import {
  Users,
  History,
  KeyRound,
  Sparkles,
  PlusCircle,
  User,
  Bell,
  BellOff,
  Clock,
  Grid,
} from "lucide-react";
import { LocketUser, TokenStatus } from "@/types/locket";

interface NavbarProps {
  tokenStatus: TokenStatus;
  activeTab: "widget" | "history";
  setActiveTab: (tab: "widget" | "history") => void;
  onOpenSettings: () => void;
  onOpenFriends: () => void;
  onOpenCapture: () => void;
  onOpenProfile: () => void;
  onOpenScheduled: () => void;
  onOpenCollage: () => void;
  onOpenHeatmap: () => void;
  friendsCount: number;
  requestsCount: number;
  scheduledCount: number;
  currentUser: LocketUser;
  isRadarEnabled: boolean;
  onToggleRadar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  tokenStatus,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenFriends,
  onOpenCapture,
  onOpenProfile,
  onOpenScheduled,
  onOpenCollage,
  onOpenHeatmap,
  friendsCount,
  requestsCount,
  scheduledCount,
  currentUser,
  isRadarEnabled,
  onToggleRadar,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full px-4 py-2.5 glass-panel border-b border-white/5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab("widget")}
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <span className="text-black font-extrabold text-xl leading-none tracking-tighter">
              L
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base md:text-lg text-white tracking-tight flex items-center gap-1.5">
              Locket Web
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-yellow-400 text-black shadow-sm">
                ULTRA
              </span>
            </span>
          </div>
        </div>

        {/* Center Navigation Buttons */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("widget")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === "widget"
                ? "bg-yellow-400 text-black font-bold shadow-md shadow-yellow-400/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            Widget
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "history"
                ? "bg-yellow-400 text-black font-bold shadow-md shadow-yellow-400/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Lịch sử
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Post Moment Shortcut button */}
          <button
            onClick={onOpenCapture}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-3 py-2 rounded-xl transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
            title="Đăng khoảnh khắc mới"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">Gửi ảnh</span>
          </button>

          {/* Scheduled Moments button */}
          <button
            onClick={onOpenScheduled}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-all border border-white/5 relative"
            title="Khoảnh khắc hẹn giờ gửi"
          >
            <Clock className="w-4 h-4 text-yellow-400" />
            {scheduledCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-black text-[9px] font-black flex items-center justify-center">
                {scheduledCount}
              </span>
            )}
          </button>

          {/* Streak Heatmap button */}
          <button
            onClick={onOpenHeatmap}
            className={`p-2 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-all border relative ${
              currentUser.stats.streakBroken
                ? "border-red-500/40 bg-red-500/10 animate-pulse"
                : "border-white/5 text-zinc-300"
            }`}
            title={
              currentUser.stats.streakBroken
                ? `⚠️ Streak đã đứt ${currentUser.stats.brokenStreakDays ?? 0} ngày trước! Nhấn để khôi phục`
                : `Bản đồ Streak ${currentUser.stats.bestStreak} ngày & Cứu Streak`
            }
          >
            <span
              className={`flex items-center gap-0.5 text-xs font-black ${
                currentUser.stats.streakBroken ? "text-red-400" : "text-amber-400"
              }`}
            >
              {currentUser.stats.streakBroken ? "💔" : "🔥"}{" "}
              {currentUser.stats.streakBroken
                ? currentUser.stats.currentStreak ?? 0
                : currentUser.stats.bestStreak}
            </span>
            {currentUser.stats.streakBroken && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                !
              </span>
            )}
          </button>

          {/* Radar Desktop Notifications Toggle */}
          <button
            onClick={onToggleRadar}
            className={`p-2 rounded-xl transition-all border ${
              isRadarEnabled
                ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
                : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
            }`}
            title={
              isRadarEnabled
                ? "Radar Locket đang BẬT: Thông báo màn hình khi có ảnh mới"
                : "Bật Radar Locket để nhận thông báo máy tính"
            }
          >
            {isRadarEnabled ? (
              <Bell className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>

          {/* Friends List Button */}
          <button
            onClick={onOpenFriends}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-all border border-white/5 relative"
            title="Danh sách bạn bè & Lời mời"
          >
            <Users className="w-4 h-4" />
            {requestsCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                {requestsCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-black text-[9px] font-black flex items-center justify-center">
                {friendsCount}
              </span>
            )}
          </button>

          {/* User Profile Button */}
          <button
            onClick={onOpenProfile}
            className="p-0.5 rounded-xl hover:ring-2 hover:ring-yellow-400 transition-all"
            title="Hồ sơ tài khoản"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-xl border border-yellow-400 object-cover bg-zinc-800"
            />
          </button>

          {/* Token Status / Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              tokenStatus.isValid
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-yellow-400 hover:border-yellow-400/30"
            }`}
            title="Cài đặt Token Locket"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {tokenStatus.isValid ? "Live" : "Demo"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                tokenStatus.isValid ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
