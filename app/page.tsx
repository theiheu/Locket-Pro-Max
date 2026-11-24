"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { WidgetViewer } from "@/components/WidgetViewer";
import { HistoryGrid } from "@/components/HistoryGrid";
import { CameraModal } from "@/components/CameraModal";
import { FriendsModal } from "@/components/FriendsModal";
import { TokenSettingsModal } from "@/components/TokenSettingsModal";
import { CommentsModal } from "@/components/CommentsModal";
import { UserProfileModal } from "@/components/UserProfileModal";
import { ScheduledMomentsModal } from "@/components/ScheduledMomentsModal";
import { CollageModal } from "@/components/CollageModal";
import { StreakHeatmapModal } from "@/components/StreakHeatmapModal";
import {
  LocketFriend,
  LocketFriendRequest,
  LocketMoment,
  LocketUser,
  MomentComment,
  ScheduledMoment,
  TokenStatus,
} from "@/types/locket";
import { initialMockMoments, mockFriendRequests, mockFriends, mockCurrentUser } from "@/lib/mockData";
import { validateToken } from "@/lib/locket";
import confetti from "canvas-confetti";
import { Sparkles, Bell } from "lucide-react";
import { sounds } from "@/lib/soundEffects";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<LocketUser>(mockCurrentUser);
  const [token, setToken] = useState<string>("");
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({ isValid: false });
  const [moments, setMoments] = useState<LocketMoment[]>(initialMockMoments);
  const [friends, setFriends] = useState<LocketFriend[]>(mockFriends);
  const [friendRequests, setFriendRequests] = useState<LocketFriendRequest[]>(mockFriendRequests);
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledMoment[]>([]);
  const [activeTab, setActiveTab] = useState<"widget" | "history">("widget");
  const [themeColor, setThemeColor] = useState<string>("#FACC15");

  // Radar / Desktop Notifications state
  const [isRadarEnabled, setIsRadarEnabled] = useState(false);

  // Modals state
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScheduledOpen, setIsScheduledOpen] = useState(false);
  const [isCollageOpen, setIsCollageOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [activeCommentsMoment, setActiveCommentsMoment] = useState<LocketMoment | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load token & theme from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("locket_token");
      const savedTheme = localStorage.getItem("locket_theme");
      const savedQueue = localStorage.getItem("locket_scheduled");

      if (savedTheme) setThemeColor(savedTheme);
      if (savedQueue) {
        try {
          setScheduledQueue(JSON.parse(savedQueue));
        } catch (e) {}
      }

      if (savedToken) {
        setToken(savedToken);
        const status = validateToken(savedToken);
        setTokenStatus(status);
        loadMoments(savedToken);
      } else {
        loadMoments("");
      }
    } catch (e) {
      console.warn("Storage not accessible");
    }
  }, []);

  // Background ticker: Check scheduled moments queue every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setScheduledQueue((prevQueue) => {
        const dueMoments = prevQueue.filter(
          (item) => new Date(item.scheduledTime).getTime() <= now
        );
        if (dueMoments.length > 0) {
          dueMoments.forEach((item) => {
            const newMoment: LocketMoment = {
              id: `moment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              userId: currentUser.id,
              user: {
                name: currentUser.displayName,
                username: currentUser.username,
                avatarUrl: currentUser.avatarUrl,
              },
              mediaType: item.mediaType,
              thumbnailUrl: item.imageBase64,
              videoUrl: item.videoUrl,
              caption: item.caption,
              badge: item.badge,
              filter: item.filter,
              createdAt: new Date().toISOString(),
              relativeTime: "Vừa xong",
              reactions: [],
              comments: [],
              sentToAll: item.sentToAll,
              recipients: item.recipients,
            };
            handleMomentPosted(newMoment);
            showToast(`⏰ Đã tự động gửi khoảnh khắc hẹn giờ: "${item.caption || "Ảnh mới"}"!`);
            sounds.playDing();
          });
          const remaining = prevQueue.filter(
            (item) => new Date(item.scheduledTime).getTime() > now
          );
          try {
            localStorage.setItem("locket_scheduled", JSON.stringify(remaining));
          } catch (e) {}
          return remaining;
        }
        return prevQueue;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadMoments = async (bearerToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/locket/moments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.moments)) {
        setMoments((prev) => {
          if (data.isMock) return prev;
          return data.moments;
        });
        if (data.message && bearerToken) {
          showToast(data.message);
        }
      }
    } catch (err) {
      console.error("Error loading moments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToken = (newToken: string) => {
    setToken(newToken);
    const status = validateToken(newToken);
    setTokenStatus(status);
    try {
      if (newToken) {
        localStorage.setItem("locket_token", newToken);
        showToast("Đã lưu Token Locket thành công!");
      } else {
        localStorage.removeItem("locket_token");
        showToast("Đã chuyển về chế độ Demo.");
      }
    } catch (e) {}
    loadMoments(newToken);
  };

  const handleMomentPosted = (newMoment: LocketMoment) => {
    setMoments((prev) => [newMoment, ...prev]);
    setCurrentUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        momentsSent: prev.stats.momentsSent + 1,
      },
    }));
    setActiveTab("widget");
    showToast("🎉 Đã gửi khoảnh khắc mới thành công!");
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleScheduleMoment = (scheduled: ScheduledMoment) => {
    const updated = [scheduled, ...scheduledQueue];
    setScheduledQueue(updated);
    try {
      localStorage.setItem("locket_scheduled", JSON.stringify(updated));
    } catch (e) {}
    showToast(`⏰ Đã hẹn giờ gửi lúc ${new Date(scheduled.scheduledTime).toLocaleTimeString("vi-VN")}!`);
  };

  const handleTriggerScheduledNow = (id: string) => {
    const item = scheduledQueue.find((s) => s.id === id);
    if (!item) return;

    const newMoment: LocketMoment = {
      id: `moment_${Date.now()}`,
      userId: currentUser.id,
      user: {
        name: currentUser.displayName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
      },
      mediaType: item.mediaType,
      thumbnailUrl: item.imageBase64,
      videoUrl: item.videoUrl,
      caption: item.caption,
      badge: item.badge,
      filter: item.filter,
      createdAt: new Date().toISOString(),
      relativeTime: "Vừa xong",
      reactions: [],
      comments: [],
      sentToAll: item.sentToAll,
      recipients: item.recipients,
    };

    handleMomentPosted(newMoment);
    handleDeleteScheduled(id);
  };

  const handleDeleteScheduled = (id: string) => {
    const remaining = scheduledQueue.filter((s) => s.id !== id);
    setScheduledQueue(remaining);
    try {
      localStorage.setItem("locket_scheduled", JSON.stringify(remaining));
    } catch (e) {}
    showToast("Đã xóa khỏi hàng đợi hẹn giờ.");
  };

  const handleSelectMomentFromHistory = (moment: LocketMoment) => {
    setMoments((prev) => {
      const filtered = prev.filter((m) => m.id !== moment.id);
      return [moment, ...filtered];
    });
    setActiveTab("widget");
  };

  const handleDeleteMoment = (momentId: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== momentId));
    showToast("Đã xóa khoảnh khắc khỏi lịch sử.");
  };

  const handleAddComment = (momentId: string, comment: MomentComment) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === momentId) {
          const updated = {
            ...m,
            comments: [...(m.comments || []), comment],
          };
          if (activeCommentsMoment && activeCommentsMoment.id === momentId) {
            setActiveCommentsMoment(updated);
          }
          return updated;
        }
        return m;
      })
    );
  };

  // Toggle Radar Locket (Desktop Push Notifications)
  const handleToggleRadar = async () => {
    if (!isRadarEnabled) {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setIsRadarEnabled(true);
          sounds.playDing();
          new Notification("Radar Locket đã bật! 🛰️", {
            body: "Bạn sẽ nhận được thông báo máy tính ngay khi bạn bè đăng ảnh mới.",
            icon: "/favicon.ico",
          });
          showToast("Radar Locket đã kích hoạt thông báo máy tính!");
        } else {
          showToast("Vui lòng cho phép thông báo trên trình duyệt!");
        }
      } else {
        setIsRadarEnabled(true);
        showToast("Đã bật chế độ Radar.");
      }
    } else {
      setIsRadarEnabled(false);
      showToast("Đã tắt Radar Locket.");
    }
  };

  // Friend actions
  const handleAcceptRequest = (reqId: string) => {
    const req = friendRequests.find((r) => r.id === reqId);
    if (!req) return;
    setFriends((prev) => [req.friend, ...prev]);
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast(`Đã kết bạn với ${req.friend.name}! 🎉`);
  };

  const handleDeclineRequest = (reqId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast("Đã từ chối lời mời kết bạn.");
  };

  const handleAddNewFriend = (username: string) => {
    const newFriend: LocketFriend = {
      id: `friend_${Date.now()}`,
      name: `@${username}`,
      username: username,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      streak: 1,
      lastActive: "Vừa xong",
    };
    setFriends((prev) => [newFriend, ...prev]);
    showToast(`Đã thêm bạn @${username}!`);
  };

  const handleToggleFavorite = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    showToast("Đã xóa bạn bè.");
  };

  const handleSelectTheme = (colorHex: string) => {
    setThemeColor(colorHex);
    try {
      localStorage.setItem("locket_theme", colorHex);
    } catch (e) {}
    showToast("Đã thay đổi màu chủ đề!");
  };

  // Streak Recovery handler
  const handleRecoverStreak = () => {
    setCurrentUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        streakBroken: false,
        currentStreak: prev.stats.bestStreak,
        streakRecoveries: Math.max(0, (prev.stats.streakRecoveries ?? 0) - 1),
      },
    }));
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#FACC15", "#F97316", "#A855F7", "#22D3EE"],
    });
    sounds.playDing();
    showToast("🔮 Đã khôi phục chuỗi streak thành công! 🔥");
  };

  // Earn recovery token for completing a task
  const handleEarnToken = (taskId: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        streakRecoveries: (prev.stats.streakRecoveries ?? 0) + 1,
      },
    }));
    const labels: Record<string, string> = {
      send_3: "Gửi 3 ảnh liên tiếp",
      react_5: "Thả 5 reactions",
      invite_1: "Mời bạn mới",
    };
    showToast(`🔮 +1 Token Khôi Phục! Nhiệm vụ: ${labels[taskId] ?? taskId} ✅`);
    sounds.playDing();
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-black text-white relative"
      style={{
        ["--theme-accent" as any]: themeColor,
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className="bg-zinc-900 border border-yellow-400/40 text-yellow-300 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        tokenStatus={tokenStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFriends={() => setIsFriendsOpen(true)}
        onOpenCapture={() => setIsCaptureOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenScheduled={() => setIsScheduledOpen(true)}
        onOpenCollage={() => setIsCollageOpen(true)}
        onOpenHeatmap={() => setIsHeatmapOpen(true)}
        friendsCount={friends.length}
        requestsCount={friendRequests.length}
        scheduledCount={scheduledQueue.length}
        currentUser={currentUser}
        isRadarEnabled={isRadarEnabled}
        onToggleRadar={handleToggleRadar}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center py-2 px-2">
        {activeTab === "widget" ? (
          <WidgetViewer
            moments={moments}
            onOpenCapture={() => setIsCaptureOpen(true)}
            onRefresh={() => loadMoments(token)}
            onOpenComments={(m) => setActiveCommentsMoment(m)}
            isLoading={isLoading}
          />
        ) : (
          <HistoryGrid
            moments={moments}
            friends={friends}
            onSelectMoment={handleSelectMomentFromHistory}
            onDeleteMoment={handleDeleteMoment}
            onOpenCollage={() => setIsCollageOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <CameraModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        friends={friends}
        onMomentPosted={handleMomentPosted}
        onScheduleMoment={handleScheduleMoment}
        token={token}
      />

      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        friends={friends}
        requests={friendRequests}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
        onAddFriend={handleAddNewFriend}
        onToggleFavorite={handleToggleFavorite}
        onRemoveFriend={handleRemoveFriend}
        myUsername={currentUser.username}
      />

      <TokenSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        token={token}
        onSaveToken={handleSaveToken}
        tokenStatus={tokenStatus}
      />

      <CommentsModal
        isOpen={Boolean(activeCommentsMoment)}
        onClose={() => setActiveCommentsMoment(null)}
        moment={activeCommentsMoment}
        onAddComment={handleAddComment}
        currentUserName={currentUser.displayName}
        currentUserAvatar={currentUser.avatarUrl}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          showToast("Đã lưu thông tin hồ sơ!");
        }}
        themeColor={themeColor}
        onSelectTheme={handleSelectTheme}
      />

      <ScheduledMomentsModal
        isOpen={isScheduledOpen}
        onClose={() => setIsScheduledOpen(false)}
        scheduledQueue={scheduledQueue}
        onTriggerNow={handleTriggerScheduledNow}
        onDeleteScheduled={handleDeleteScheduled}
      />

      <CollageModal
        isOpen={isCollageOpen}
        onClose={() => setIsCollageOpen(false)}
        moments={moments}
        friends={friends}
        currentUser={currentUser}
      />

      <StreakHeatmapModal
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
        currentUser={currentUser}
        topFriend={friends[0]}
        onRecoverStreak={handleRecoverStreak}
        onEarnToken={handleEarnToken}
      />
    </div>
  );
}
