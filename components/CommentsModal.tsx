"use client";

import React, { useState } from "react";
import { X, Send, MessageCircle, Sparkles, Heart } from "lucide-react";
import { LocketMoment, MomentComment } from "@/types/locket";
import { sounds } from "@/lib/soundEffects";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moment: LocketMoment | null;
  onAddComment: (momentId: string, comment: MomentComment) => void;
  currentUserName: string;
  currentUserAvatar: string;
}

const QUICK_REPLIES = ["Đẹp quá bà ơi! ✨", "Cực phẩm luôn 🔥", "Đi đâu đấy? 👀", "Xịn thế! 😍", "Hẹn mai nhé ☕"];

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  moment,
  onAddComment,
  currentUserName,
  currentUserAvatar,
}) => {
  const [inputText, setInputText] = useState("");

  if (!isOpen || !moment) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newComment: MomentComment = {
      id: `comm_${Date.now()}`,
      userId: "user_me_001",
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      text: inputText.trim(),
      createdAt: "Vừa xong",
    };

    sounds.playDing();
    onAddComment(moment.id, newComment);
    setInputText("");
  };

  const handleQuickReply = (text: string) => {
    const newComment: MomentComment = {
      id: `comm_${Date.now()}`,
      userId: "user_me_001",
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      text: text,
      createdAt: "Vừa xong",
    };
    sounds.playDing();
    onAddComment(moment.id, newComment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-4xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-base">
              Bình luận ({moment.comments?.length || 0})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mini Preview of the Moment */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-900/60 border border-white/5 mb-3">
          <img
            src={moment.thumbnailUrl}
            alt="Thumbnail"
            className="w-12 h-12 rounded-xl object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs text-white truncate">{moment.user.name}</h5>
            <p className="text-[11px] text-zinc-400 truncate">{moment.caption || "Không có chú thích"}</p>
          </div>
        </div>

        {/* Comment Thread List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {(!moment.comments || moment.comments.length === 0) ? (
            <div className="text-center py-12 text-zinc-500 text-xs flex flex-col items-center">
              <MessageCircle className="w-8 h-8 mb-2 opacity-40 text-yellow-400" />
              <span>Chưa có tin nhắn nào cho khoảnh khắc này.</span>
              <span className="text-[11px] text-zinc-600 mt-1">Hãy gửi phản hồi đầu tiên cho bạn bè!</span>
            </div>
          ) : (
            moment.comments.map((comm) => (
              <div key={comm.id} className="flex items-start gap-2.5">
                <img
                  src={comm.userAvatar}
                  alt={comm.userName}
                  className="w-8 h-8 rounded-full border border-yellow-400/40 object-cover mt-0.5"
                />
                <div className="flex-1 bg-zinc-900/80 rounded-2xl p-2.5 border border-white/5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-yellow-300">{comm.userName}</span>
                    <span className="text-[10px] text-zinc-500">{comm.createdAt}</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed break-words">{comm.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Replies chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-white/5 mt-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => handleQuickReply(q)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Gửi phản hồi cho bạn bè..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-2xl transition-all shadow-md shadow-yellow-400/20 active:scale-95 disabled:opacity-40"
            title="Gửi tin nhắn"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};
