"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Flame,
  UserCheck,
  Star,
  UserPlus,
  Inbox,
  Copy,
  Check,
  Trash2,
  Share2,
} from "lucide-react";
import { LocketFriend, LocketFriendRequest } from "@/types/locket";

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: LocketFriend[];
  requests: LocketFriendRequest[];
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onAddFriend: (username: string) => void;
  onToggleFavorite: (friendId: string) => void;
  onRemoveFriend: (friendId: string) => void;
  myUsername: string;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  friends,
  requests,
  onAcceptRequest,
  onDeclineRequest,
  onAddFriend,
  onToggleFavorite,
  onRemoveFriend,
  myUsername,
}) => {
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "add">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyInvite = () => {
    const inviteLink = `https://locket.cam/@${myUsername}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddNewFriend = () => {
    if (!newUsername.trim()) return;
    onAddFriend(newUsername.trim());
    setAddFeedback(`Đã gửi lời mời kết bạn tới @${newUsername.trim()}!`);
    setNewUsername("");
    setTimeout(() => setAddFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-4xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-base">Hội Bạn Thân ({friends.length}/20)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-2xl mb-3 border border-white/5">
          <button
            onClick={() => setActiveTab("friends")}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "friends"
                ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Bạn bè ({friends.length})
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "requests"
                ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Lời mời ({requests.length})
            {requests.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === "add"
                ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Thêm bạn
          </button>
        </div>

        {/* Tab 1: Current Friends */}
        {activeTab === "friends" && (
          <>
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm bạn bè theo tên hoặc @username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-all"
              />
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  Không tìm thấy bạn bè nào phù hợp.
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:bg-zinc-900 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatarUrl}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full border border-yellow-400/50 bg-zinc-800 object-cover"
                        />
                        {friend.isFavorite && (
                          <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-yellow-400 text-black">
                            <Star className="w-2.5 h-2.5 fill-black" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug">{friend.name}</h4>
                        <p className="text-[11px] text-zinc-400">@{friend.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {friend.streak && friend.streak > 0 && (
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-xl text-amber-400 text-xs font-bold">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{friend.streak}</span>
                        </div>
                      )}

                      {/* Favorite button */}
                      <button
                        onClick={() => onToggleFavorite(friend.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          friend.isFavorite
                            ? "bg-yellow-400/20 border-yellow-400 text-yellow-400"
                            : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-yellow-400"
                        }`}
                        title="Đánh dấu bạn thân"
                      >
                        <Star className={`w-3.5 h-3.5 ${friend.isFavorite ? "fill-yellow-400" : ""}`} />
                      </button>

                      {/* Unfriend button */}
                      <button
                        onClick={() => onRemoveFriend(friend.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all"
                        title="Hủy kết bạn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Tab 2: Requests */}
        {activeTab === "requests" && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {requests.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs flex flex-col items-center">
                <Inbox className="w-8 h-8 mb-2 opacity-40 text-yellow-400" />
                <span>Không có lời mời kết bạn nào đang chờ.</span>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.friend.avatarUrl}
                      alt={req.friend.name}
                      className="w-10 h-10 rounded-full border border-yellow-400/40 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs">{req.friend.name}</h4>
                      <p className="text-[11px] text-zinc-400">@{req.friend.username}</p>
                      <span className="text-[10px] text-zinc-500">{req.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeclineRequest(req.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-semibold"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => onAcceptRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold shadow-md shadow-yellow-400/20"
                    >
                      Đồng ý
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Add Friend & Share Invite Link */}
        {activeTab === "add" && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Add by username */}
            <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/5">
              <label className="text-xs font-bold text-white mb-1.5 block">
                Tìm theo @username Locket
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: linhdan.cute"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNewFriend()}
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
                />
                <button
                  onClick={handleAddNewFriend}
                  disabled={!newUsername.trim()}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs shadow-md shadow-yellow-400/20 disabled:opacity-40"
                >
                  Gửi lời mời
                </button>
              </div>
              {addFeedback && (
                <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {addFeedback}
                </p>
              )}
            </div>

            {/* Share Invite Link */}
            <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/5">
              <label className="text-xs font-bold text-white mb-1 block">
                Liên kết mời kết bạn của bạn
              </label>
              <p className="text-[11px] text-zinc-400 mb-3">
                Gửi liên kết này cho bạn bè để họ thêm bạn vào Locket Widget chỉ với 1 click!
              </p>
              <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 rounded-2xl p-2 px-3">
                <span className="flex-1 text-xs text-yellow-300 font-mono truncate">
                  https://locket.cam/@{myUsername}
                </span>
                <button
                  onClick={handleCopyInvite}
                  className="p-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black transition-all active:scale-95"
                  title="Sao chép liên kết"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-white/5 text-center text-[11px] text-zinc-500">
          Locket giới hạn tối đa 20 người bạn thân nhất để hiển thị trực tiếp trên Widget.
        </div>
      </div>
    </div>
  );
};
