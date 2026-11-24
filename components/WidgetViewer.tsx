"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
  Maximize2,
  Clock,
  Sparkles,
  RefreshCw,
  Camera,
  MessageCircle,
  Volume2,
  VolumeX,
  Sun,
  Music,
  BatteryCharging,
  MapPin,
  Check,
  AppWindow,
  PictureInPicture2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Flame,
  Palette,
} from "lucide-react";
import { LocketMoment, WidgetFrameStyle } from "@/types/locket";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/soundEffects";

interface WidgetViewerProps {
  moments: LocketMoment[];
  onOpenCapture: () => void;
  onRefresh: () => void;
  onOpenComments: (moment: LocketMoment) => void;
  isLoading?: boolean;
}

const EMOJI_OPTIONS = ["❤️", "🔥", "🥰", "😂", "😮", "☕", "✨"];

const FRAME_STYLES: { id: WidgetFrameStyle; name: string }[] = [
  { id: "default", name: "Hiện Đại" },
  { id: "polaroid", name: "Polaroid" },
  { id: "vhs", name: "Retro VHS 90s" },
  { id: "cyberpunk", name: "Cyberpunk" },
  { id: "love", name: "Trái Tim" },
];

export const WidgetViewer: React.FC<WidgetViewerProps> = ({
  moments,
  onOpenCapture,
  onRefresh,
  onOpenComments,
  isLoading = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reactionsMap, setReactionsMap] = useState<Record<string, Record<string, number>>>({});
  const [animatingEmoji, setAnimatingEmoji] = useState<{ emoji: string; id: number } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPipActive, setIsPipActive] = useState(false);

  // Overrides & interactive states
  const [activeFrameOverride, setActiveFrameOverride] = useState<WidgetFrameStyle | null>(null);
  const [unlockedCapsules, setUnlockedCapsules] = useState<Record<string, boolean>>({});
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [secretBurnedMap, setSecretBurnedMap] = useState<Record<string, boolean>>({});
  const [secretTimer, setSecretTimer] = useState<number>(5);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const secretIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentMoment = moments[currentIndex] || null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, moments.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : moments.length - 1));
    setActiveFrameOverride(null);
    setSecretRevealed(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < moments.length - 1 ? prev + 1 : 0));
    setActiveFrameOverride(null);
    setSecretRevealed(false);
  };

  const handleReact = (emoji: string) => {
    if (!currentMoment) return;
    sounds.playPop();

    if (emoji === "❤️" || emoji === "🔥") {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.72 },
        colors: ["#FACC15", "#EF4444", "#F97316"],
      });
    }

    setAnimatingEmoji({ emoji, id: Date.now() });
    setTimeout(() => setAnimatingEmoji(null), 800);

    setReactionsMap((prev) => {
      const momentReactions = prev[currentMoment.id] || {};
      return {
        ...prev,
        [currentMoment.id]: {
          ...momentReactions,
          [emoji]: (momentReactions[emoji] || 0) + 1,
        },
      };
    });
  };

  const handleDownload = async () => {
    if (!currentMoment) return;
    const mediaUrl = currentMoment.videoUrl || currentMoment.thumbnailUrl;
    const ext = currentMoment.videoUrl ? "mp4" : "jpg";
    try {
      const link = document.createElement("a");
      link.href = mediaUrl;
      link.download = `locket_${currentMoment.user.username}_${Date.now()}.${ext}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(mediaUrl, "_blank");
    }
  };

  const handleShare = () => {
    if (!currentMoment) return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Khoảnh khắc của ${currentMoment.user.name} trên Locket`,
        text: currentMoment.caption || "Xem khoảnh khắc trên Locket Web!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Picture in Picture
  const handleOpenPip = async () => {
    if (!currentMoment) return;
    if ("documentPictureInPicture" in window) {
      try {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 340,
          height: 420,
        });

        document.querySelectorAll("link[rel='stylesheet'], style").forEach((elem) => {
          pipWindow.document.head.appendChild(elem.cloneNode(true));
        });

        pipWindow.document.body.style.backgroundColor = "#000000";
        pipWindow.document.body.style.padding = "10px";
        pipWindow.document.body.style.color = "#FFFFFF";
        pipWindow.document.body.style.fontFamily = "sans-serif";
        pipWindow.document.body.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; width: 100%;">
              <img src="${currentMoment.user.avatarUrl}" style="width: 28px; height: 28px; border-radius: 9999px; border: 2px solid #FACC15;" />
              <div style="font-size: 12px; font-weight: bold;">${currentMoment.user.name}</div>
            </div>
            <div style="width: 290px; height: 290px; border-radius: 28px; overflow: hidden; border: 1px solid #27272a; position: relative;">
              <img src="${currentMoment.thumbnailUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
              ${
                currentMoment.caption
                  ? `<div style="position: absolute; bottom: 10px; left: 10px; right: 10px; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); padding: 6px 10px; border-radius: 12px; font-size: 11px; text-align: center;">${currentMoment.caption}</div>`
                  : ""
              }
            </div>
          </div>
        `;
        setIsPipActive(true);
        pipWindow.addEventListener("pagehide", () => setIsPipActive(false));
      } catch (err) {
        window.open(currentMoment.thumbnailUrl, "_blank");
      }
    } else {
      window.open(currentMoment.thumbnailUrl, "_blank");
    }
  };

  // View Once Hold Handlers
  const handleStartHoldSecret = () => {
    if (!currentMoment || secretBurnedMap[currentMoment.id]) return;
    setSecretRevealed(true);
    setSecretTimer(5);

    secretIntervalRef.current = setInterval(() => {
      setSecretTimer((prev) => {
        if (prev <= 1) {
          handleBurnSecret();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEndHoldSecret = () => {
    if (secretIntervalRef.current) clearInterval(secretIntervalRef.current);
    if (secretRevealed && currentMoment) {
      handleBurnSecret();
    }
  };

  const handleBurnSecret = () => {
    if (!currentMoment) return;
    if (secretIntervalRef.current) clearInterval(secretIntervalRef.current);
    setSecretRevealed(false);
    setSecretBurnedMap((prev) => ({ ...prev, [currentMoment.id]: true }));
    sounds.playShutter();
  };

  if (!currentMoment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4 text-zinc-500">
          <Camera className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Chưa có khoảnh khắc nào</h3>
        <p className="text-zinc-400 text-sm max-w-sm mb-6">
          Hãy là người đầu tiên chụp và gửi ảnh khoảnh khắc để làm mới widget!
        </p>
        <button
          onClick={onOpenCapture}
          className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20"
        >
          <Camera className="w-5 h-5" />
          Chụp ảnh ngay
        </button>
      </div>
    );
  }

  // Time Capsule calculation
  const isTimeCapsule = Boolean(
    currentMoment.timeCapsuleUnlockAt &&
      new Date(currentMoment.timeCapsuleUnlockAt) > new Date() &&
      !unlockedCapsules[currentMoment.id]
  );

  // View Once calculation
  const isViewOnceActive = Boolean(
    currentMoment.isViewOnce && !secretBurnedMap[currentMoment.id]
  );
  const isSecretBurned = Boolean(
    currentMoment.isViewOnce && secretBurnedMap[currentMoment.id]
  );

  // Active Frame Style
  const activeFrame = activeFrameOverride || currentMoment.frameStyle || "default";

  const currentReactions = reactionsMap[currentMoment.id] || {};
  const commentsCount = currentMoment.comments?.length || 0;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-2 px-2">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between px-2 mb-2.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentMoment.user.avatarUrl}
              alt={currentMoment.user.name}
              className="w-11 h-11 rounded-full border-2 border-yellow-400 bg-zinc-800 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base leading-tight">
              {currentMoment.user.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span>@{currentMoment.user.username}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                {currentMoment.relativeTime}
              </span>
            </div>
          </div>
        </div>

        {/* Counter, Frame Switcher & PiP */}
        <div className="flex items-center gap-1.5">
          {/* Frame Switcher Quick Dropdown */}
          <select
            value={activeFrame}
            onChange={(e) => setActiveFrameOverride(e.target.value as WidgetFrameStyle)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-yellow-400 cursor-pointer"
            title="Đổi khung viền cho Widget"
          >
            {FRAME_STYLES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* PiP Button */}
          <button
            onClick={handleOpenPip}
            className={`p-2 rounded-xl border transition-all ${
              isPipActive
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white"
            }`}
            title="Ghim Widget nổi trên màn hình máy tính (Picture-in-Picture)"
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRefresh}
            className={`p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-all ${
              isLoading ? "animate-spin text-yellow-400" : ""
            }`}
            title="Làm mới bài đăng"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container Styling wrapper */}
      <div
        className={`relative w-full max-w-[420px] transition-all duration-300 ${
          activeFrame === "polaroid"
            ? "bg-white p-3.5 pb-12 rounded-2xl shadow-2xl rotate-[-0.5deg]"
            : activeFrame === "vhs"
            ? "p-2 bg-zinc-950 border-4 border-zinc-800 rounded-3xl shadow-2xl"
            : activeFrame === "cyberpunk"
            ? "p-1.5 bg-zinc-950 rounded-4xl border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            : activeFrame === "love"
            ? "p-2.5 bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-400 rounded-4xl shadow-xl shadow-pink-500/20"
            : "widget-shadow"
        }`}
      >
        {/* Main Widget Card */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 group">
          {/* Media Player */}
          {currentMoment.videoUrl ? (
            <video
              ref={videoRef}
              src={currentMoment.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className={`w-full h-full object-cover select-none pointer-events-none ${
                isTimeCapsule || (isViewOnceActive && !secretRevealed) ? "blur-2xl scale-110" : ""
              }`}
            />
          ) : (
            <img
              src={currentMoment.thumbnailUrl}
              alt={currentMoment.caption || "Locket moment"}
              className={`w-full h-full object-cover transition-transform duration-500 select-none pointer-events-none ${
                isTimeCapsule || (isViewOnceActive && !secretRevealed) ? "blur-2xl scale-110" : ""
              }`}
            />
          )}

          {/* VHS 90s Overlays: REC 🔴, SP, Vintage Orange Date Stamp */}
          {activeFrame === "vhs" && (
            <>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-red-500 font-mono text-xs font-bold drop-shadow z-20 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>REC</span>
              </div>
              <div className="absolute top-3 right-3 text-zinc-300 font-mono text-xs font-bold drop-shadow z-20">
                SP 0:02:18
              </div>
            </>
          )}

          {/* Vintage Orange Date Stamp (Tính năng 7) */}
          {(currentMoment.hasDateStamp || activeFrame === "vhs") && (
            <div className="absolute bottom-3 right-3 font-mono font-black text-amber-500 text-sm tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-20 select-none">
              &apos;26 11 23
            </div>
          )}

          {/* Love Frame Decal */}
          {activeFrame === "love" && (
            <div className="absolute top-3 left-3 text-xl animate-bounce drop-shadow z-20">
              💖
            </div>
          )}

          {/* Cyberpunk Neon Glitch Badge */}
          {activeFrame === "cyberpunk" && (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-mono text-[10px] font-bold tracking-widest z-20">
              LOCKET_CYBER_2077
            </div>
          )}

          {/* Time Capsule Overlay (Tính năng 3) */}
          {isTimeCapsule && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 flex items-center justify-center mb-3 shadow-xl shadow-yellow-400/10">
                <Lock className="w-8 h-8 animate-pulse text-yellow-400" />
              </div>
              <h4 className="text-base font-extrabold text-white mb-1">
                Hộp Thư Thời Gian Đang Khóa ⏳
              </h4>
              <p className="text-xs text-zinc-300 mb-3">
                Khoảnh khắc này được khóa lại và sẽ tự động mở vào:
              </p>
              <div className="px-4 py-2 rounded-2xl bg-zinc-900 border border-yellow-400/40 text-yellow-300 font-mono text-xs font-bold mb-4">
                {new Date(currentMoment.timeCapsuleUnlockAt!).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                (Còn 7 ngày)
              </div>
              <button
                onClick={() => {
                  setUnlockedCapsules((prev) => ({ ...prev, [currentMoment.id]: true }));
                  sounds.playDing();
                  confetti({ particleCount: 40 });
                }}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Unlock className="w-3.5 h-3.5 text-black" />
                Mở khóa ngay để xem trước
              </button>
            </div>
          )}

          {/* View Once / Secret Moment Overlay (Tính năng 6) */}
          {isViewOnceActive && (
            <div
              onMouseDown={handleStartHoldSecret}
              onMouseUp={handleEndHoldSecret}
              onTouchStart={handleStartHoldSecret}
              onTouchEnd={handleEndHoldSecret}
              className={`absolute inset-0 z-30 cursor-pointer flex flex-col items-center justify-center p-6 text-center select-none transition-all ${
                secretRevealed
                  ? "bg-transparent pointer-events-auto"
                  : "bg-black/85 backdrop-blur-xl"
              }`}
            >
              {!secretRevealed ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-yellow-400 flex items-center justify-center mb-3 shadow-xl">
                    <span className="text-yellow-400 font-black text-xl">1</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Khoảnh Khắc Bí Mật (Xem 1 lần)
                  </h4>
                  <p className="text-xs text-yellow-300 font-medium">
                    Chạm và GIỮ để xem (Tự hủy sau 5 giây) 👁️
                  </p>
                </div>
              ) : (
                /* Countdown timer when holding */
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl animate-pulse">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Đang xem: 00:0{secretTimer}s (Thả tay sẽ tự hủy)</span>
                </div>
              )}
            </div>
          )}

          {/* Secret Burned / Destroyed Screen */}
          {isSecretBurned && (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-30">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-2 text-zinc-500">
                <Flame className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-300 mb-1">
                Khoảnh khắc đã tự hủy 🔥
              </h4>
              <p className="text-xs text-zinc-500">
                Ảnh bí mật này đã được xem và biến mất vĩnh viễn.
              </p>
            </div>
          )}

          {/* Floating Emoji Animation */}
          {animatingEmoji && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <span className="text-7xl animate-heart-pop drop-shadow-2xl">
                {animatingEmoji.emoji}
              </span>
            </div>
          )}

          {/* Navigation Arrow Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-20"
            title="Khoảnh khắc trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-20"
            title="Khoảnh khắc tiếp theo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Top Badges / Floating Stickers */}
          {!isTimeCapsule && !isSecretBurned && (
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
              {currentMoment.badge ? (
                <div className="glass-pill px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-md">
                  <span>{currentMoment.badge.text}</span>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-1.5">
                {currentMoment.videoUrl && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-full glass-pill text-white/90 hover:text-white transition-all"
                    title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-400" />}
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full glass-pill text-white/90 hover:text-white transition-all"
                  title="Chia sẻ khoảnh khắc"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleDownload}
                  className="p-2.5 rounded-full glass-pill text-white/90 hover:text-white transition-all"
                  title="Tải ảnh gốc về máy"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Caption Pill (For non-Polaroid frames) */}
          {activeFrame !== "polaroid" && currentMoment.caption && !isTimeCapsule && !isSecretBurned && (
            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
              <div className="glass-pill px-4 py-2 rounded-2xl max-w-[90%] text-center shadow-lg border border-white/15">
                <p className="text-sm font-medium text-white break-words tracking-normal leading-relaxed">
                  {currentMoment.caption}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Polaroid Style Handwritten Caption at Bottom */}
        {activeFrame === "polaroid" && (
          <div className="absolute bottom-2 left-4 right-4 text-center">
            <p className="text-zinc-800 font-serif italic text-sm tracking-wide">
              {currentMoment.caption || "Kỷ niệm ngày đẹp trời ✨"}
            </p>
          </div>
        )}
      </div>

      {/* Floating Reaction Bar & Comment Button */}
      <div className="w-full mt-3.5 flex items-center justify-between bg-zinc-900/90 border border-white/10 rounded-3xl p-2 px-3 shadow-xl">
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none flex-1">
          {EMOJI_OPTIONS.map((emoji) => {
            const count =
              (currentReactions[emoji] || 0) +
              (currentMoment.reactions?.find((r) => r.emoji === emoji)?.count || 0);
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="relative px-2 py-1.5 rounded-2xl hover:bg-zinc-800 active:scale-90 transition-all flex items-center gap-1 text-xl select-none"
              >
                <span>{emoji}</span>
                {count > 0 && (
                  <span className="text-[10px] font-bold text-yellow-400 bg-zinc-800/90 px-1.5 py-0.5 rounded-full border border-white/10">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onOpenComments(currentMoment)}
          className="ml-2 p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all border border-white/10 flex items-center gap-1.5 relative flex-shrink-0"
          title="Bình luận / Trò chuyện"
        >
          <MessageCircle className="w-4 h-4 text-yellow-400" />
          {commentsCount > 0 && (
            <span className="text-[11px] font-bold text-white bg-yellow-500/20 px-1.5 py-0.5 rounded-md border border-yellow-500/30">
              {commentsCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenCapture}
          className="ml-2 p-2.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl transition-all shadow-md shadow-yellow-400/20 active:scale-95 flex-shrink-0"
          title="Gửi phản hồi ảnh"
        >
          <Camera className="w-4 h-4 text-black" />
        </button>
      </div>

      <div className="mt-2 text-center text-[11px] text-zinc-500">
        Dùng phím mũi tên <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-300">←</kbd> / <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-300">→</kbd> để chuyển ảnh
      </div>
    </div>
  );
};
