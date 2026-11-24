"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  HelpCircle,
  ExternalLink,
  Smartphone,
  Save,
} from "lucide-react";
import { TokenStatus } from "@/types/locket";
import { validateToken } from "@/lib/locket";

interface TokenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSaveToken: (newToken: string) => void;
  tokenStatus: TokenStatus;
}

export const TokenSettingsModal: React.FC<TokenSettingsModalProps> = ({
  isOpen,
  onClose,
  token,
  onSaveToken,
  tokenStatus,
}) => {
  const [inputToken, setInputToken] = useState(token);
  const [showGuide, setShowGuide] = useState(false);
  const [liveValidation, setLiveValidation] = useState<TokenStatus>(tokenStatus);

  useEffect(() => {
    setInputToken(token);
    setLiveValidation(validateToken(token));
  }, [token, isOpen]);

  const handleInputChange = (val: string) => {
    // If user pasted "Bearer eyJhbG...", strip "Bearer "
    const cleanToken = val.replace(/^Bearer\s+/i, "").trim();
    setInputToken(cleanToken);
    setLiveValidation(validateToken(cleanToken));
  };

  const handleSave = () => {
    onSaveToken(inputToken.trim());
    onClose();
  };

  const handleClear = () => {
    setInputToken("");
    onSaveToken("");
    setLiveValidation(validateToken(""));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-4xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-base">Cài Đặt Kết Nối Locket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Connection Status Badge */}
        <div
          className={`p-3 rounded-2xl border mb-4 flex items-start gap-3 ${
            liveValidation.isValid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
        >
          {liveValidation.isValid ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          )}
          <div className="text-xs">
            <div className="font-bold">
              {liveValidation.isValid
                ? "Đã kết nối tài khoản Locket thành công!"
                : "Đang ở Chế độ Demo (Chưa có Token thật)"}
            </div>
            <div className="text-zinc-400 mt-0.5">{liveValidation.message}</div>
            {liveValidation.uid && (
              <div className="mt-1 font-mono text-[10px] text-zinc-400">
                UID: {liveValidation.uid}
              </div>
            )}
          </div>
        </div>

        {/* Token Input Box */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Locket Bearer Token (Firebase JWT)
            </label>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-yellow-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Cách lấy token?
            </button>
          </div>
          <textarea
            rows={4}
            placeholder="Dán mã Bearer token (bắt đầu bằng eyJhbGciOi...)"
            value={inputToken}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-yellow-400 transition-all resize-none"
          />
        </div>

        {/* Instructions Collapsible */}
        {showGuide && (
          <div className="mb-4 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs text-zinc-300 space-y-2.5">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-yellow-400" />
              Hướng dẫn lấy Token từ ứng dụng Locket:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 leading-relaxed">
              <li>
                Cài ứng dụng proxy mạng như <strong>HTTP Toolkit</strong> hoặc <strong>Charles Proxy</strong> trên máy tính.
              </li>
              <li>
                Cấu hình kết nối Wifi điện thoại qua proxy máy tính (cổng 8000/8888).
              </li>
              <li>
                Mở app Locket trên điện thoại, chụp hoặc tải feed.
              </li>
              <li>
                Tìm các request gửi tới domain:{" "}
                <code className="text-yellow-400 font-mono">api.locketcamera.com</code>
              </li>
              <li>
                Vào mục <strong>Headers</strong>, tìm dòng{" "}
                <code className="text-yellow-400 font-mono">Authorization: Bearer ey...</code> và copy toàn bộ chuỗi token dán vào đây.
              </li>
            </ol>
            <p className="text-[11px] text-zinc-500 italic">
              * Mẹo: Nếu bạn chỉ muốn trải nghiệm giao diện và gửi ảnh giả lập từ máy tính, hãy để trống ô token để dùng chế độ Demo sẵn có.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {inputToken ? (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa Token
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-lg shadow-yellow-400/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5 text-black" />
              Lưu & Áp Dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
