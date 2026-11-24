export type WidgetFrameStyle = "default" | "polaroid" | "vhs" | "cyberpunk" | "love";

export interface LocketUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl: string;
  phone?: string;
  stats: {
    momentsSent: number;
    momentsReceived: number;
    reactionsCount: number;
    bestStreak: number;
    currentStreak: number;        // Active streak count (may differ from best)
    streakRecoveries: number;     // Recovery tokens available
    streakBroken: boolean;        // Was streak recently broken?
    brokenStreakDays: number;     // How many days ago streak broke
    lastActivityDate?: string;    // ISO date of last post "YYYY-MM-DD"
  };
  streakHistory?: Record<string, number>; // date "YYYY-MM-DD" -> count
}

export interface LocketFriend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  streak?: number;
  lastActive?: string;
  isFavorite?: boolean;
}

export interface LocketFriendRequest {
  id: string;
  friend: LocketFriend;
  createdAt: string;
}

export interface MomentReaction {
  emoji: string;
  count: number;
  userReacted?: boolean;
}

export interface MomentComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface MomentBadge {
  type: "weather" | "music" | "battery" | "location" | "custom";
  text: string;
  icon?: string;
}

export interface LocketMoment {
  id: string;
  userId: string;
  user: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  mediaType: "image" | "video";
  thumbnailUrl: string;
  videoUrl?: string;
  caption?: string;
  badge?: MomentBadge;
  filter?: string;
  themeColor?: string;
  frameStyle?: WidgetFrameStyle;
  isViewOnce?: boolean;
  isBurned?: boolean;
  timeCapsuleUnlockAt?: string; // ISO string if locked until future
  hasDateStamp?: boolean;
  createdAt: string; // ISO string
  relativeTime: string;
  reactions: MomentReaction[];
  comments: MomentComment[];
  sentToAll?: boolean;
  recipients?: string[];
}

export interface ScheduledMoment {
  id: string;
  imageBase64: string;
  videoUrl?: string;
  mediaType: "image" | "video";
  caption: string;
  badge?: MomentBadge;
  filter?: string;
  frameStyle?: WidgetFrameStyle;
  isViewOnce?: boolean;
  timeCapsuleUnlockAt?: string;
  hasDateStamp?: boolean;
  scheduledTime: string;
  sentToAll: boolean;
  recipients?: string[];
  createdAt: string;
}

export interface TokenStatus {
  isValid: boolean;
  uid?: string;
  username?: string;
  expiresAt?: number;
  message?: string;
}
