"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Undo,
  Trash2,
  Check,
  X,
  Sparkles,
  Sun,
  Flame,
  Heart,
  Star,
  Smile,
  Brush,
  Eraser,
} from "lucide-react";

interface DoodleCanvasProps {
  imageSrc: string;
  onSave: (newImageBase64: string) => void;
  onCancel: () => void;
}

const COLORS = [
  "#FFFFFF",
  "#FACC15", // Locket Yellow
  "#EF4444", // Red
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#A855F7", // Purple
  "#000000", // Black
];

const STAMPS = ["❤️", "🔥", "✨", "⭐", "😍", "🐱", "☕", "💀"];

export const DoodleCanvas: React.FC<DoodleCanvasProps> = ({
  imageSrc,
  onSave,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#FACC15");
  const [brushSize, setBrushSize] = useState(6);
  const [isGlow, setIsGlow] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [activeStamp, setActiveStamp] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Load image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = 1080;
      canvas.height = 1080;
      ctx.drawImage(img, 0, 0, 1080, 1080);
      saveState();
    };
  }, [imageSrc]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-15), state]);
    } catch (e) {}
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const firstState = history[0];
    ctx.putImageData(firstState, 0, 0);
    setHistory([firstState]);
  };

  // Convert mouse/touch coord to canvas 1080x1080 coord
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    // If stamp is active, stamp emoji
    if (activeStamp) {
      ctx.font = "80px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(activeStamp, x, y);
      saveState();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = currentColor;
      if (isGlow) {
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 18;
      } else {
        ctx.shadowBlur = 0;
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeStamp) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleFinish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onSave(dataUrl);
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md rounded-4xl flex flex-col p-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Brush className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">Vẽ & Dán Sticker</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white disabled:opacity-40"
            title="Hoàn tác"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-red-400 hover:text-red-300"
            title="Xóa tất cả hình vẽ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white ml-1"
            title="Hủy"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleFinish}
            className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1 shadow-md shadow-yellow-400/20 active:scale-95"
            title="Xong"
          >
            <Check className="w-3.5 h-3.5 text-black" />
            Lưu
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 aspect-square max-h-[360px] mx-auto rounded-3xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full object-contain touch-none cursor-crosshair"
        />
      </div>

      {/* Bottom Toolbars */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Colors Palette & Tools */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrentColor(c);
                  setIsEraser(false);
                  setActiveStamp(null);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentColor === c && !isEraser && !activeStamp
                    ? "scale-125 border-white shadow-lg"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            {/* Glow toggle */}
            <button
              onClick={() => {
                setIsGlow(!isGlow);
                setIsEraser(false);
                setActiveStamp(null);
              }}
              className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                isGlow
                  ? "bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-400/20"
                  : "bg-zinc-900 text-zinc-400 border-white/5"
              }`}
              title="Bút phát sáng Neon"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Glow
            </button>

            {/* Eraser */}
            <button
              onClick={() => {
                setIsEraser(true);
                setActiveStamp(null);
              }}
              className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                isEraser
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-zinc-900 text-zinc-400 border-white/5"
              }`}
              title="Cục tẩy"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Emoji Stamps Selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[11px] font-bold text-zinc-400 whitespace-nowrap">Sticker:</span>
          {STAMPS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setActiveStamp(activeStamp === s ? null : s);
                setIsEraser(false);
              }}
              className={`px-2 py-1 rounded-xl text-base transition-all ${
                activeStamp === s
                  ? "bg-yellow-400/20 scale-110 border border-yellow-400"
                  : "hover:bg-zinc-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
