import { LocketFriend, LocketMoment, TokenStatus } from "@/types/locket";

export function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    return null;
  }
}

export function validateToken(token?: string): TokenStatus {
  if (!token || token.trim() === "") {
    return {
      isValid: false,
      message: "Chưa cấu hình Bearer Token",
    };
  }

  const payload = parseJwt(token);
  if (!payload) {
    return {
      isValid: false,
      message: "Định dạng JWT token không hợp lệ",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return {
      isValid: false,
      uid: payload.user_id || payload.sub,
      expiresAt: payload.exp,
      message: "Token đã hết hạn. Hãy lấy token mới từ thiết bị.",
    };
  }

  return {
    isValid: true,
    uid: payload.user_id || payload.sub,
    username: payload.email || payload.phone_number || "Locket User",
    expiresAt: payload.exp,
    message: "Token hợp lệ và đang hoạt động",
  };
}

export const LOCKET_API_BASE = "https://api.locketcamera.com";
export const LOCKET_STORAGE_BUCKET = "locket-img";

export const DEFAULT_HEADERS = {
  "User-Agent": "Locket/1.43.1 (com.locket.Locket; build:1431; iOS 17.5.1) Alamofire/5.8.0",
  "Accept": "*/*",
  "Accept-Language": "en-US;q=1.0, vi-VN;q=0.9",
  "Content-Type": "application/json",
};
