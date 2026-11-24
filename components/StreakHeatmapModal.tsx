"use client";

import React, { useState } from "react";
import {
  X,
  Flame,
  Shield,
  Calendar,
  Sparkles,
  RefreshCw,
  Gift,
  CheckCircle2,
  HeartCrack,
  Trophy,
  Zap,
  UserPlus,
} from "lucide-react";
import { LocketFriend, LocketUser } from "@/types/locket";

interface StreakHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: LocketUser;
  topFriend: LocketFriend;
  onRecoverStreak?: () => void;
  onEarnToken?: (taskId: string) => void;
}

const RECOVERY_TASKS = [
  {
    id: "send_3",
    icon: <Flame className="w-4 h-4 text-orange-400" />,
    label: "Gửi 3 ảnh liên tiếp hôm nay",
    reward: "+1 🔮 Token",
    color: "border-orange-500/30 bg-orange-500/10",
    textColor: "text-orange-300",
  },
  {
    id: "react_5",
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    label: "Thả reaction cho 5 ảnh bạn bè",
    reward: "+1 🔮 Token",
    color: "border-yellow-500/30 bg-yellow-500/10",
    textColor: "text-yellow-300",
  },
  {
    id: "invite_1",
    icon: <UserPlus className="w-4 h-4 text-cyan-400" />,
    label: "Mời 1 người bạn mới tham gia",
    reward: "+1 🔮 Token",
    color: "border-cyan-500/30 bg-cyan-500/10",
    textColor: "text-cyan-300",
  },
];

export const StreakHeatmapModal: React.FC<StreakHeatmapModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  topFriend,
  onRecoverStreak,
  onEarnToken,
}) => {
  const [streakFrozen, setStreakFrozen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [localRecoveries, setLocalRecoveries] = useState(currentUser.stats.streakRecoveries ?? 0);
  const [isRecovered, setIsRecovered] = useState(!currentUser.stats.streakBroken);
  const [recoveringAnim, setRecoveringAnim] = useState(false);

  if (!isOpen) return null;

  const streakData = currentUser.streakHistory || {};
  const dates = Object.keys(streakData).sort();
  const isBroken = !isRecovered && (currentUser.stats.streakBroken ?? false);
  const brokenDays = currentUser.stats.brokenStreakDays ?? 0;
  const bestStreak = currentUser.stats.bestStreak;
  const currentStreak = isRecovered ? bestStreak : (currentUser.stats.currentStreak ?? 0);

  const getColor = (count: number) => {
    if (count === 0) return "bg-zinc-900 border-white/5";
    if (count === 1) return "bg-amber-900/60 border-amber-700/50";
    if (count === 2) return "bg-amber-600/80 border-amber-500";
    return "bg-yellow-400 border-yellow-300 shadow-sm shadow-yellow-400/40";
  };

  const handleRecover = () => {
    if (localRecoveries <= 0 || isRecovered) return;
    setRecoveringAnim(true);
    setTimeout(() => {
      setLocalRecoveries((prev) => prev - 1);
      setIsRecovered(true);
      setRecoveringAnim(false);
      onRecoverStreak?.();
    }, 900);
  };

  const handleEarnTask = (taskId: string) => {
    if (completedTasks.has(taskId)) return;
    setCompletedTasks((prev) => new Set(Array.from(prev).concat(taskId)));
    setLocalRecoveries((prev) => prev + 1);
    onEarnToken?.(taskId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-4xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto gap-4">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <h3 className="font-bold text-white text-base">Bản Đồ Streak & Khôi Phục</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STREAK BROKEN ALERT ── */}
        {isBroken && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-red-500/20 via-zinc-900 to-rose-500/10 border border-red-500/40 flex items-start gap-3 animate-fade-in">
            <HeartCrack className="w-6 h-6 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-300">
                Chuỗi {bestStreak} ngày của bạn đã bị đứt {brokenDays} ngày trước! 💔
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Dùng Token Khôi Phục để lấy lại chuỗi streak ngay bây giờ.
              </p>
            </div>
          </div>
        )}

        {/* ── STREAK RECOVERED SUCCESS ── */}
        {isRecovered && currentUser.stats.streakBroken && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-zinc-900 to-green-500/10 border border-emerald-500/40 flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">
                🎉 Đã khôi phục chuỗi {bestStreak} ngày thành công!
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tiếp tục gửi ảnh mỗi ngày để giữ vững chuỗi nhé!
              </p>
            </div>
          </div>
        )}

        {/* Streak Hero Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-zinc-900 to-yellow-500/10 border border-yellow-400/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center">
              <Flame
                className={`w-8 h-8 text-yellow-400 fill-yellow-400 ${!isBroken ? "animate-pulse" : "opacity-40"}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white">
                  {isBroken ? currentStreak : bestStreak} Ngày
                </span>
                {isBroken ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    Đã đứt 💔
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Đang cháy 🔥
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Kỷ lục tốt nhất:{" "}
                <strong className="text-yellow-300">{bestStreak} ngày</strong> cùng{" "}
                <strong className="text-white">{topFriend.name}</strong>
              </p>
            </div>
          </div>

          {/* Freeze Shield Button */}
          <button
            onClick={() => setStreakFrozen(!streakFrozen)}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              streakFrozen
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                : "bg-zinc-900 text-zinc-300 border-white/10 hover:border-cyan-400"
            }`}
            title="Đóng băng bảo vệ streak 1 ngày nếu bận"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>{streakFrozen ? "Đã đóng băng ❄️" : "Cứu Streak"}</span>
          </button>
        </div>

        {/* ── STREAK RECOVERY PANEL ── */}
        {(isBroken || localRecoveries > 0) && (
          <div className="rounded-3xl border border-purple-500/30 bg-purple-500/5 overflow-hidden">
            {/* Recovery Panel Header */}
            <div className="px-4 pt-4 pb-3 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔮</span>
                <div>
                  <p className="text-sm font-bold text-purple-200">Token Khôi Phục Streak</p>
                  <p className="text-xs text-zinc-400">Dùng token để khôi phục chuỗi streak đã đứt</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-500/20 border border-purple-500/40">
                <span className="text-base">🔮</span>
                <span className="text-sm font-black text-purple-200">{localRecoveries}</span>
                <span className="text-xs text-zinc-400">token</span>
              </div>
            </div>

            {/* Recover Button */}
            <div className="p-4 flex flex-col gap-3">
              {isBroken ? (
                <button
                  onClick={handleRecover}
                  disabled={localRecoveries <= 0 || recoveringAnim}
                  className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    localRecoveries > 0
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                  } ${recoveringAnim ? "animate-pulse scale-95" : ""}`}
                >
                  {recoveringAnim ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang khôi phục...
                    </>
                  ) : localRecoveries > 0 ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      Khôi phục ngay — dùng 1 🔮 Token
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Không đủ Token (kiếm thêm bên dưới)
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 justify-center py-2 text-xs text-zinc-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Streak đang hoạt động — không cần khôi phục
                </div>
              )}

              {/* Earn Token Tasks */}
              <div>
                <p className="text-xs font-bold text-zinc-300 flex items-center gap-1 mb-2">
                  <Gift className="w-3.5 h-3.5 text-purple-400" />
                  Kiếm thêm Token miễn phí:
                </p>
                <div className="flex flex-col gap-2">
                  {RECOVERY_TASKS.map((task) => {
                    const done = completedTasks.has(task.id);
                    return (
                      <button
                        key={task.id}
                        onClick={() => handleEarnTask(task.id)}
                        disabled={done}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                          done
                            ? "border-emerald-500/30 bg-emerald-500/10 cursor-default"
                            : `${task.color} hover:brightness-125 cursor-pointer`
                        }`}
                      >
                        <div className="shrink-0">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            task.icon
                          )}
                        </div>
                        <span
                          className={`flex-1 text-xs font-medium ${done ? "text-emerald-300" : task.textColor}`}
                        >
                          {task.label}
                        </span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                            done
                              ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                              : "text-purple-300 border-purple-500/40 bg-purple-500/10"
                          }`}
                        >
                          {done ? "✓ Xong" : task.reward}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GitHub Style Heatmap Grid */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-yellow-400" />
              Lịch sử 90 ngày vừa qua
            </span>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
              <span>Ít</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 border border-white/10" />
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-900/60" />
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-600/80" />
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400" />
              <span>Nhiều</span>
            </div>
          </div>

          {/* Heatmap Blocks */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
            {dates.map((dateStr) => {
              const count = streakData[dateStr] || 0;
              return (
                <div
                  key={dateStr}
                  onMouseEnter={() => setHoveredDay({ date: dateStr, count })}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 rounded-sm border cursor-pointer transition-transform hover:scale-125 ${getColor(count)}`}
                />
              );
            })}
          </div>

          {/* Tooltip on hover */}
          <div className="min-h-[20px] text-center text-xs text-yellow-400 font-mono mt-1">
            {hoveredDay ? (
              <span>
                {hoveredDay.date}: {hoveredDay.count} khoảnh khắc
              </span>
            ) : (
              <span className="text-zinc-500 text-[11px]">Rê chuột vào từng ô vuông để xem chi tiết</span>
            )}
          </div>
        </div>

        {/* Tips & Instructions */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-400 space-y-1">
          <p className="font-bold text-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Cách duy trì chuỗi Streak Locket:
          </p>
          <p>• Cả hai người cần gửi ít nhất 1 ảnh/video cho nhau trong vòng 24 giờ.</p>
          <p>• Dùng tính năng <strong>Cứu Streak</strong> (❄️) để giữ chuỗi nếu hôm đó bạn quá bận!</p>
          <p>• Dùng <strong>🔮 Token Khôi Phục</strong> khi streak đã bị đứt để lấy lại ngay.</p>
        </div>
      </div>
    </div>
  );
};
