"use client";

import React, { useState } from "react";
import { X, User, Edit3, Award, Flame, Heart, Image as ImageIcon, Check, Palette, Sparkles, Phone } from "lucide-react";
import { LocketUser } from "@/types/locket";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: LocketUser;
  onUpdateUser: (updatedUser: LocketUser) => void;
  themeColor: string;
  onSelectTheme: (colorHex: string) => void;
}

const THEME_PRESETS = [
  { name: "Vàng Locket", hex: "#FACC15" },
  { name: "Hồng Neon", hex: "#F43F5E" },
  { name: "Xanh Cyan", hex: "#06B6D4" },
  { name: "Xanh Emerald", hex: "#10B981" },
  { name: "Tím Mộng Mơ", hex: "#A855F7" },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  themeColor,
  onSelectTheme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [avatarSeed, setAvatarSeed] = useState("Felix");

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    onUpdateUser({
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      username: username.trim().toLowerCase() || currentUser.username,
      bio: bio.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
    });
    setIsEditing(false);
  };

  const cycleAvatar = () => {
    const seeds = ["Felix", "Aneka", "Oliver", "Maya", "Leo", "Sasha", "Zoe", "Milo"];
    const nextSeed = seeds[(seeds.indexOf(avatarSeed) + 1) % seeds.length];
    setAvatarSeed(nextSeed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-4xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-base">Hồ Sơ Của Bạn</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-zinc-900/60 border border-white/5 mb-4 relative">
          <div className="relative group cursor-pointer mb-3" onClick={isEditing ? cycleAvatar : undefined}>
            <img
              src={isEditing ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}` : currentUser.avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-zinc-800 object-cover shadow-xl"
            />
            {isEditing && (
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-yellow-400 text-black text-xs font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {!isEditing ? (
            <>
              <h4 className="font-bold text-lg text-white">{currentUser.displayName}</h4>
              <p className="text-xs text-yellow-400 font-semibold mb-2">@{currentUser.username}</p>
              {currentUser.bio && (
                <p className="text-xs text-zinc-300 max-w-xs leading-relaxed mb-2">{currentUser.bio}</p>
              )}
              {currentUser.phone && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Phone className="w-3 h-3" />
                  <span>{currentUser.phone}</span>
                </div>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 px-4 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3 h-3" />
                Chỉnh sửa hồ sơ
              </button>
            </>
          ) : (
            <div className="w-full space-y-2.5 text-left">
              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Tên hiển thị</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Tên người dùng (@username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 font-medium">Tiểu sử (Bio)</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 mt-1 resize-none"
                />
              </div>
              <p className="text-[10px] text-zinc-500 italic">* Chạm vào avatar để đổi kiểu hình đại diện khác.</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 rounded-xl bg-yellow-400 text-black text-xs font-black shadow-md shadow-yellow-400/20"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Stats Grid */}
        <h5 className="font-bold text-xs text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-yellow-400" />
          Thống kê hoạt động
        </h5>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{currentUser.stats.momentsSent}</div>
              <div className="text-[10px] text-zinc-400">Đã gửi đi</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{currentUser.stats.reactionsCount}</div>
              <div className="text-[10px] text-zinc-400">Cảm xúc nhận</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{currentUser.stats.bestStreak} ngày</div>
              <div className="text-[10px] text-zinc-400">Streak kỷ lục</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{currentUser.stats.momentsReceived}</div>
              <div className="text-[10px] text-zinc-400">Đã nhận về</div>
            </div>
          </div>
        </div>

        {/* Theme Accent Color Picker */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-white">Màu giao diện nổi bật</span>
          </div>
          <div className="flex items-center gap-2">
            {THEME_PRESETS.map((t) => (
              <button
                key={t.hex}
                onClick={() => onSelectTheme(t.hex)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2"
                style={{
                  backgroundColor: t.hex,
                  borderColor: themeColor === t.hex ? "#FFFFFF" : "transparent",
                }}
                title={t.name}
              >
                {themeColor === t.hex && <Check className="w-3.5 h-3.5 text-black" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
