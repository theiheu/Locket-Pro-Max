import { LocketFriend, LocketFriendRequest, LocketMoment, LocketUser } from "@/types/locket";

// Generate mock streak activity for the last 90 days
const generateStreakHistory = (): Record<string, number> => {
  const history: Record<string, number> = {};
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    // Random activity, with high activity in the last 65 days
    if (i < 65) {
      history[dateStr] = Math.floor(Math.random() * 4) + 1;
    } else {
      history[dateStr] = Math.random() > 0.4 ? Math.floor(Math.random() * 3) : 0;
    }
  }
  return history;
};

export const mockCurrentUser: LocketUser = {
  id: "user_me_001",
  username: "you_on_locket",
  displayName: "Bạn Của Tôi",
  bio: "✨ Ghi lại khoảnh khắc mỗi ngày cùng hội bạn thân 📸",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  phone: "+84 987 654 321",
  stats: {
    momentsSent: 48,
    momentsReceived: 182,
    reactionsCount: 520,
    bestStreak: 65,
    currentStreak: 0,         // Streak is currently broken
    streakRecoveries: 2,      // 2 recovery tokens available
    streakBroken: true,       // Simulate a broken streak scenario
    brokenStreakDays: 2,      // Broke 2 days ago
    lastActivityDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      return d.toISOString().split("T")[0];
    })(),
  },
  streakHistory: generateStreakHistory(),
};

export const mockFriends: LocketFriend[] = [
  {
    id: "friend_1",
    name: "Linh Đan",
    username: "linhdan.cute",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LinhDan",
    streak: 65,
    lastActive: "2 phút trước",
    isFavorite: true,
  },
  {
    id: "friend_2",
    name: "Minh Quân",
    username: "quan.dev",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinhQuan",
    streak: 18,
    lastActive: "15 phút trước",
    isFavorite: true,
  },
  {
    id: "friend_3",
    name: "Hà Vy",
    username: "havy.chill",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HaVy",
    streak: 9,
    lastActive: "1 giờ trước",
    isFavorite: false,
  },
  {
    id: "friend_4",
    name: "Tuấn Anh",
    username: "tuananh.99",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=TuanAnh",
    streak: 42,
    lastActive: "3 giờ trước",
    isFavorite: true,
  },
  {
    id: "friend_5",
    name: "Bảo Ngọc",
    username: "ngoc.gem",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=BaoNgoc",
    streak: 3,
    lastActive: "Hôm qua",
    isFavorite: false,
  },
];

export const mockFriendRequests: LocketFriendRequest[] = [
  {
    id: "req_1",
    friend: {
      id: "req_user_1",
      name: "Thùy Trang",
      username: "thuytrang.photo",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ThuyTrang",
      lastActive: "Mới đây",
    },
    createdAt: "10 phút trước",
  },
  {
    id: "req_2",
    friend: {
      id: "req_user_2",
      name: "Đức Huy",
      username: "duchuy_guitar",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DucHuy",
      lastActive: "Hôm nay",
    },
    createdAt: "2 giờ trước",
  },
];

export const initialMockMoments: LocketMoment[] = [
  {
    id: "moment_vhs_1",
    userId: "friend_1",
    user: {
      name: "Linh Đan",
      username: "linhdan.cute",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LinhDan",
    },
    mediaType: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    caption: "Cà phê sáng cùng nắng sớm ☕✨",
    frameStyle: "vhs",
    hasDateStamp: true,
    badge: {
      type: "weather",
      text: "27°C • Hà Nội Nắng đẹp ☀️",
      icon: "☀️",
    },
    filter: "vintage",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    relativeTime: "12 phút trước",
    reactions: [
      { emoji: "❤️", count: 4, userReacted: true },
      { emoji: "🔥", count: 2, userReacted: false },
      { emoji: "🥰", count: 1, userReacted: false },
    ],
    comments: [
      {
        id: "c1",
        userId: "friend_2",
        userName: "Minh Quân",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinhQuan",
        text: "Quán cà phê này ở đâu thế bà ơi?",
        createdAt: "8 phút trước",
      },
    ],
    sentToAll: true,
  },
  {
    id: "moment_secret_1",
    userId: "friend_2",
    user: {
      name: "Minh Quân",
      username: "quan.dev",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinhQuan",
    },
    mediaType: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    caption: "Khoảnh khắc bí mật: Chạm và giữ để xem 🤫",
    isViewOnce: true,
    isBurned: false,
    frameStyle: "cyberpunk",
    badge: {
      type: "music",
      text: "🎵 Nơi Này Có Anh - Sơn Tùng M-TP",
      icon: "🎵",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    relativeTime: "45 phút trước",
    reactions: [{ emoji: "😮", count: 3, userReacted: false }],
    comments: [],
    sentToAll: true,
  },
  {
    id: "moment_capsule_1",
    userId: "friend_4",
    user: {
      name: "Tuấn Anh",
      username: "tuananh.99",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=TuanAnh",
    },
    mediaType: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    caption: "Hộp thư thời gian: Bất ngờ dành cho cả nhóm 🎁",
    timeCapsuleUnlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // Locked for 7 days
    frameStyle: "polaroid",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    relativeTime: "3 giờ trước",
    reactions: [{ emoji: "❤️", count: 8, userReacted: true }],
    comments: [],
    sentToAll: true,
  },
  {
    id: "moment_love_1",
    userId: "friend_3",
    user: {
      name: "Hà Vy",
      username: "havy.chill",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HaVy",
    },
    mediaType: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80",
    caption: "Tặng bạn ngàn đóa hồng ngày bình yên 🌹",
    frameStyle: "love",
    badge: {
      type: "location",
      text: "📍 Phố Đi Bộ Hồ Gươm",
      icon: "📍",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    relativeTime: "8 giờ trước",
    reactions: [
      { emoji: "🥰", count: 12, userReacted: true },
      { emoji: "❤️", count: 15, userReacted: true },
    ],
    comments: [],
    sentToAll: true,
  },
];
