"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Grid,
  Sparkles,
  Download,
  Award,
  Flame,
  Heart,
  Check,
  Share2,
} from "lucide-react";
import { LocketFriend, LocketMoment, LocketUser } from "@/types/locket";

interface CollageModalProps {
  isOpen: boolean;
  onClose: () => void;
  moments: LocketMoment[];
  friends: LocketFriend[];
  currentUser: LocketUser;
}

export const CollageModal: React.FC<CollageModalProps> = ({
  isOpen,
  onClose,
  moments,
  friends,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<"collage" | "recap">("collage");
  const [gridSize, setGridSize] = useState<4 | 9>(4);
  const [selectedMomentIds, setSelectedMomentIds] = useState<string[]>(
    moments.slice(0, 4).map((m) => m.id)
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    if (selectedMomentIds.includes(id)) {
      setSelectedMomentIds(selectedMomentIds.filter((item) => item !== id));
    } else {
      if (selectedMomentIds.length < gridSize) {
        setSelectedMomentIds([...selectedMomentIds, id]);
      } else {
        // Replace oldest
        setSelectedMomentIds([...selectedMomentIds.slice(1), id]);
      }
    }
  };

  // Export Collage as High-res Image
  const handleExportCollage = async () => {
    setIsGenerating(true);
    const canvas = document.createElement("canvas");
    const cols = gridSize === 4 ? 2 : 3;
    const cellSize = 600;
    const padding = 20;
    const headerHeight = 120;
    const footerHeight = 80;

    canvas.width = cols * cellSize + (cols + 1) * padding;
    canvas.height = cols * cellSize + (cols + 1) * padding + headerHeight + footerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Title
    ctx.fillStyle = "#FACC15";
    ctx.font = "bold 52px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LOCKET MEMORIES", canvas.width / 2, 75);

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "28px sans-serif";
    ctx.fillText(
      `Bộ sưu tập khoảnh khắc cùng hội bạn • ${new Date().toLocaleDateString("vi-VN")}`,
      canvas.width / 2,
      115
    );

    // Draw grid items
    const selectedMoments = moments.filter((m) => selectedMomentIds.includes(m.id));

    const loadImages = selectedMoments.map((m) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = m.thumbnailUrl;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
      });
    });

    const loadedImages = await Promise.all(loadImages);

    loadedImages.forEach((img, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const x = padding + col * (cellSize + padding);
      const y = headerHeight + padding + row * (cellSize + padding);

      // Rounded rectangle clipping
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 36);
      ctx.clip();
      ctx.drawImage(img, x, y, cellSize, cellSize);
      ctx.restore();
    });

    // Footer
    ctx.fillStyle = "#71717A";
    ctx.font = "24px sans-serif";
    ctx.fillText("locket.cam • Made with Locket Web PRO", canvas.width / 2, canvas.height - 30);

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `locket_collage_${Date.now()}.png`;
    a.click();
    setIsGenerating(false);
  };

  // Find Top Friend
  const topFriend = friends.reduce((prev, current) =>
    (prev.streak || 0) > (current.streak || 0) ? prev : current
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-4xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-base">Bộ Sưu Tập & Recap</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl mb-4 border border-white/5">
          <button
            onClick={() => setActiveTab("collage")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "collage"
                ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Tạo Ảnh Ghép (Collage)
          </button>
          <button
            onClick={() => setActiveTab("recap")}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "recap"
                ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Locket Recap
          </button>
        </div>

        {activeTab === "collage" ? (
          <div>
            {/* Grid Size Switcher */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-300">
                Chọn ảnh ({selectedMomentIds.length}/{gridSize} ảnh):
              </span>
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-white/5">
                <button
                  onClick={() => {
                    setGridSize(4);
                    setSelectedMomentIds(moments.slice(0, 4).map((m) => m.id));
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    gridSize === 4 ? "bg-yellow-400 text-black" : "text-zinc-400"
                  }`}
                >
                  Lưới 2x2 (4 ảnh)
                </button>
                <button
                  onClick={() => {
                    setGridSize(9);
                    setSelectedMomentIds(moments.slice(0, 9).map((m) => m.id));
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    gridSize === 9 ? "bg-yellow-400 text-black" : "text-zinc-400"
                  }`}
                >
                  Lưới 3x3 (9 ảnh)
                </button>
              </div>
            </div>

            {/* Moments Selection Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto p-1 mb-4">
              {moments.map((moment) => {
                const isSelected = selectedMomentIds.includes(moment.id);
                return (
                  <div
                    key={moment.id}
                    onClick={() => toggleSelect(moment.id)}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected
                        ? "border-yellow-400 scale-95 shadow-md shadow-yellow-400/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={moment.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-[10px]">
                        <Check className="w-3.5 h-3.5 text-black" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCollage}
              disabled={isGenerating || selectedMomentIds.length === 0}
              className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 transition-all"
            >
              <Download className="w-4 h-4 text-black" />
              {isGenerating ? "Đang xuất ảnh ghép..." : "Tải ảnh ghép HD về máy tính"}
            </button>
          </div>
        ) : (
          /* Recap Tab (Locket Wrapped) */
          <div className="flex flex-col items-center">
            <div className="w-full rounded-3xl bg-gradient-to-b from-yellow-500/20 via-zinc-900 to-zinc-950 border border-yellow-400/30 p-5 mb-4 text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-3 inline-block">
                LOCKET WRAPPED
              </span>
              <h3 className="text-xl font-extrabold text-white mb-1">
                Kỷ Niệm Của Bạn & Hội Bạn Thân
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Hành trình ghi lại những khoảnh khắc chân thực nhất
              </p>

              <div className="grid grid-cols-2 gap-2.5 text-left mb-4">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold mb-1">
                    <Award className="w-4 h-4" />
                    Bạn thân số 1
                  </div>
                  <div className="text-sm font-bold text-white truncate">{topFriend.name}</div>
                  <div className="text-[10px] text-zinc-400">@{topFriend.username}</div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                    <Flame className="w-4 h-4 fill-amber-400" />
                    Kỷ lục Streak
                  </div>
                  <div className="text-sm font-bold text-white">{currentUser.stats.bestStreak} ngày</div>
                  <div className="text-[10px] text-zinc-400">Liên tục không ngắt</div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold mb-1">
                    <Heart className="w-4 h-4 fill-red-400" />
                    Cảm xúc được thả
                  </div>
                  <div className="text-sm font-bold text-white">{currentUser.stats.reactionsCount} lượt</div>
                  <div className="text-[10px] text-zinc-400">❤️ ❤️ ❤️</div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                    <Sparkles className="w-4 h-4" />
                    Tổng khoảnh khắc
                  </div>
                  <div className="text-sm font-bold text-white">
                    {currentUser.stats.momentsSent + currentUser.stats.momentsReceived} ảnh
                  </div>
                  <div className="text-[10px] text-zinc-400">Đã lưu trữ an toàn</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert("Đã lưu hình ảnh Recap tổng kết!");
              }}
              className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4 text-black" />
              Lưu & Chia Sẻ Lên Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
