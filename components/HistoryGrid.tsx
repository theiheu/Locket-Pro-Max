"use client";

import React, { useState } from "react";
import { LocketFriend, LocketMoment } from "@/types/locket";
import {
  Calendar,
  Download,
  Filter,
  Play,
  Pause,
  Video,
  Image as ImageIcon,
  Heart,
  Trash2,
  Users,
  Eye,
  Grid,
  Archive,
  RefreshCw,
} from "lucide-react";
import JSZip from "jszip";

interface HistoryGridProps {
  moments: LocketMoment[];
  friends: LocketFriend[];
  onSelectMoment: (moment: LocketMoment) => void;
  onDeleteMoment: (momentId: string) => void;
  onOpenCollage: () => void;
}

export const HistoryGrid: React.FC<HistoryGridProps> = ({
  moments,
  friends,
  onSelectMoment,
  onDeleteMoment,
  onOpenCollage,
}) => {
  const [selectedFriendFilter, setSelectedFriendFilter] = useState<string>("all");
  const [selectedMediaFilter, setSelectedMediaFilter] = useState<"all" | "image" | "video">("all");
  const [isSlideshowRunning, setIsSlideshowRunning] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isZipping, setIsZipping] = useState(false);

  // Filter moments
  const filteredMoments = moments.filter((m) => {
    if (selectedFriendFilter !== "all" && m.userId !== selectedFriendFilter) {
      return false;
    }
    if (selectedMediaFilter === "image" && m.mediaType === "video") {
      return false;
    }
    if (selectedMediaFilter === "video" && m.mediaType !== "video") {
      return false;
    }
    return true;
  });

  // Slideshow timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSlideshowRunning && filteredMoments.length > 0) {
      timer = setInterval(() => {
        setSlideshowIndex((prev) => (prev + 1) % filteredMoments.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isSlideshowRunning, filteredMoments.length]);

  // Bulk Export All as ZIP
  const handleExportZip = async () => {
    if (moments.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder("Locket_Memories");

      const downloadPromises = moments.map(async (m, idx) => {
        try {
          const res = await fetch(m.thumbnailUrl);
          const blob = await res.blob();
          const cleanDate = new Date(m.createdAt).toISOString().split("T")[0];
          const filename = `${cleanDate}_${m.user.username}_${idx + 1}.jpg`;
          folder?.file(filename, blob);
        } catch (err) {
          console.warn("Could not add moment to zip:", err);
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `Locket_Backup_${new Date().toISOString().split("T")[0]}.zip`;
      a.click();
    } catch (err) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-3 animate-fade-in">
      {/* Top Controls & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            Lịch Sử Khoảnh Khắc
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Xem lại tất cả ảnh & video ({filteredMoments.length} khoảnh khắc)
          </p>
        </div>

        {/* Filter bar, Collage button, ZIP export & Slideshow */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Collage Button */}
          <button
            onClick={onOpenCollage}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black flex items-center gap-1.5 shadow-md shadow-yellow-400/20 transition-all active:scale-95"
            title="Tạo ảnh ghép & Locket Wrapped"
          >
            <Grid className="w-3.5 h-3.5 text-black" />
            Tạo ảnh ghép
          </button>

          {/* Export ZIP Button */}
          <button
            onClick={handleExportZip}
            disabled={isZipping || moments.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 flex items-center gap-1.5 transition-all disabled:opacity-40"
            title="Tải toàn bộ khoảnh khắc về file .ZIP"
          >
            {isZipping ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                Đang nén ZIP...
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 text-yellow-400" />
                Tải ZIP ({moments.length})
              </>
            )}
          </button>

          {/* Friend filter */}
          <select
            value={selectedFriendFilter}
            onChange={(e) => setSelectedFriendFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-400"
          >
            <option value="all">Tất cả bạn bè</option>
            {friends.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Media filter */}
          <div className="flex items-center bg-zinc-900 border border-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => setSelectedMediaFilter("all")}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                selectedMediaFilter === "all" ? "bg-yellow-400 text-black" : "text-zinc-400"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedMediaFilter("image")}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                selectedMediaFilter === "image" ? "bg-yellow-400 text-black" : "text-zinc-400"
              }`}
            >
              Ảnh
            </button>
            <button
              onClick={() => setSelectedMediaFilter("video")}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                selectedMediaFilter === "video" ? "bg-yellow-400 text-black" : "text-zinc-400"
              }`}
            >
              Video
            </button>
          </div>

          {/* Slideshow button */}
          <button
            onClick={() => setIsSlideshowRunning(!isSlideshowRunning)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSlideshowRunning
                ? "bg-red-500 text-white animate-pulse"
                : "bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-yellow-400/30"
            }`}
          >
            {isSlideshowRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Dừng chiếu
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-yellow-400" />
                Trình chiếu
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slideshow Overlay if running */}
      {isSlideshowRunning && filteredMoments[slideshowIndex] && (
        <div className="mb-6 p-4 rounded-3xl bg-zinc-950 border border-yellow-400/40 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[360px] rounded-3xl overflow-hidden mb-3">
            {filteredMoments[slideshowIndex].videoUrl ? (
              <video
                src={filteredMoments[slideshowIndex].videoUrl}
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={filteredMoments[slideshowIndex].thumbnailUrl}
                alt="Slideshow"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-3 left-3 flex items-center gap-2 glass-pill px-3 py-1.5 rounded-full">
              <img
                src={filteredMoments[slideshowIndex].user.avatarUrl}
                alt="User"
                className="w-5 h-5 rounded-full"
              />
              <span className="text-xs font-bold text-white">
                {filteredMoments[slideshowIndex].user.name}
              </span>
            </div>
            {filteredMoments[slideshowIndex].caption && (
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="glass-pill px-3 py-1.5 rounded-2xl text-xs font-medium text-white inline-block">
                  {filteredMoments[slideshowIndex].caption}
                </span>
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Đang chiếu: {slideshowIndex + 1} / {filteredMoments.length} (Tự động chuyển mỗi 3s)
          </span>
        </div>
      )}

      {/* Grid view of moments */}
      {filteredMoments.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 rounded-3xl border border-white/5 text-zinc-500 text-xs">
          Không có khoảnh khắc nào phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredMoments.map((moment) => (
            <div
              key={moment.id}
              className="group relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer hover:border-yellow-400 transition-all shadow-md hover:scale-[1.02]"
            >
              <img
                src={moment.thumbnailUrl}
                alt={moment.caption || "History thumbnail"}
                onClick={() => onSelectMoment(moment)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Video indicator badge */}
              {moment.mediaType === "video" && (
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white z-10">
                  <Video className="w-3.5 h-3.5 text-yellow-400" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div
                onClick={() => onSelectMoment(moment)}
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 opacity-75 group-hover:opacity-90 transition-opacity"
              />

              {/* Top sender tag */}
              <div
                onClick={() => onSelectMoment(moment)}
                className="absolute top-2 left-2 flex items-center gap-1.5 z-10"
              >
                <img
                  src={moment.user.avatarUrl}
                  alt={moment.user.name}
                  className="w-5 h-5 rounded-full border border-yellow-400"
                />
                <span className="text-[10px] font-semibold text-white drop-shadow truncate max-w-[90px]">
                  {moment.user.name}
                </span>
              </div>

              {/* Bottom Caption & Quick Actions */}
              <div className="absolute bottom-2 left-2 right-2 z-10">
                {moment.caption && (
                  <p
                    onClick={() => onSelectMoment(moment)}
                    className="text-[11px] text-white line-clamp-1 font-medium drop-shadow mb-1"
                  >
                    {moment.caption}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] text-zinc-300">
                  <span>{moment.relativeTime}</span>

                  <div className="flex items-center gap-1.5">
                    {moment.reactions?.length > 0 && (
                      <div className="flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded-full">
                        <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
                        <span>
                          {moment.reactions.reduce((sum, r) => sum + r.count, 0)}
                        </span>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Bạn có chắc muốn xóa khoảnh khắc này?")) {
                          onDeleteMoment(moment.id);
                        }
                      }}
                      className="p-1 rounded-md bg-black/60 hover:bg-red-500/80 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      title="Xóa khoảnh khắc"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
