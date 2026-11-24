"use client";

import React, { useState } from "react";
import { X, Clock, Calendar, Send, Trash2, CheckCircle2, Play } from "lucide-react";
import { ScheduledMoment } from "@/types/locket";

interface ScheduledMomentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduledQueue: ScheduledMoment[];
  onTriggerNow: (scheduledId: string) => void;
  onDeleteScheduled: (scheduledId: string) => void;
}

export const ScheduledMomentsModal: React.FC<ScheduledMomentsModalProps> = ({
  isOpen,
  onClose,
  scheduledQueue,
  onTriggerNow,
  onDeleteScheduled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-4xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-base">
              Khoảnh Khắc Hẹn Giờ ({scheduledQueue.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {scheduledQueue.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs flex flex-col items-center">
              <Clock className="w-8 h-8 mb-2 opacity-40 text-yellow-400" />
              <span>Không có khoảnh khắc nào đang được hẹn giờ.</span>
              <span className="text-[11px] text-zinc-600 mt-1">
                Khi chụp hoặc tải ảnh, bạn có thể chọn hẹn giờ gửi tự động!
              </span>
            </div>
          ) : (
            scheduledQueue.map((item) => {
              const date = new Date(item.scheduledTime);
              const timeStr = date.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-white/5 hover:bg-zinc-900 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageBase64}
                      alt="Scheduled thumbnail"
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {timeStr} ngày {dateStr}
                        </span>
                      </div>
                      <p className="text-xs text-white line-clamp-1 mt-0.5">
                        {item.caption || "(Không có chú thích)"}
                      </p>
                      <span className="text-[10px] text-zinc-500">
                        {item.sentToAll ? "Gửi cho tất cả bạn bè" : "Gửi chọn lọc"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTriggerNow(item.id)}
                      className="p-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black transition-all active:scale-95"
                      title="Gửi ngay bây giờ"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                    </button>
                    <button
                      onClick={() => onDeleteScheduled(item.id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/5 transition-all"
                      title="Hủy hẹn giờ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 text-center text-[11px] text-zinc-500">
          Hệ thống sẽ tự động đăng ảnh lên Locket khi tới mốc thời gian đã đặt.
        </div>
      </div>
    </div>
  );
};
