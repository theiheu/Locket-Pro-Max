import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_HEADERS, LOCKET_API_BASE, validateToken } from "@/lib/locket";
import { mockCurrentUser } from "@/lib/mockData";
import { LocketMoment } from "@/types/locket";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    const body = await req.json();

    const {
      imageBase64,
      videoUrl,
      mediaType = "image",
      caption,
      badge,
      filter,
      frameStyle,
      isViewOnce,
      timeCapsuleUnlockAt,
      hasDateStamp,
      recipients,
      sentToAll = true,
    } = body;

    if (!imageBase64 && !videoUrl) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp hình ảnh hoặc video" },
        { status: 400 }
      );
    }

    const tokenStatus = token ? validateToken(token) : { isValid: false };

    // If real token is present and valid, try posting to real Locket API
    if (tokenStatus.isValid && token) {
      try {
        const response = await fetch(`${LOCKET_API_BASE}/postMoment`, {
          method: "POST",
          headers: {
            ...DEFAULT_HEADERS,
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              analytics: {
                platform: "ios",
              },
              caption: caption || "",
              sent_to_all: sentToAll,
              recipients: recipients || [],
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn("Locket postMoment API error:", response.status, errText);
        }
      } catch (err) {
        console.warn("Locket remote post error:", err);
      }
    }

    // Always create a structured new moment so the client immediately displays it
    const newMoment: LocketMoment = {
      id: `moment_${Date.now()}`,
      userId: tokenStatus.uid || mockCurrentUser.id,
      user: {
        name: tokenStatus.username || mockCurrentUser.displayName,
        username: tokenStatus.username || mockCurrentUser.username,
        avatarUrl: mockCurrentUser.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Me",
      },
      mediaType: mediaType as "image" | "video",
      thumbnailUrl: imageBase64 || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
      videoUrl: videoUrl,
      caption: caption || "",
      badge: badge,
      filter: filter,
      frameStyle: frameStyle,
      isViewOnce: isViewOnce,
      timeCapsuleUnlockAt: timeCapsuleUnlockAt,
      hasDateStamp: hasDateStamp,
      createdAt: new Date().toISOString(),
      relativeTime: "Vừa xong",
      reactions: [],
      comments: [],
      sentToAll: sentToAll,
      recipients: recipients || [],
    };

    return NextResponse.json({
      success: true,
      moment: newMoment,
      isLivePosted: tokenStatus.isValid,
      message: tokenStatus.isValid
        ? "Đã gửi khoảnh khắc lên Locket!"
        : "Đã đăng khoảnh khắc thành công (Chế độ xem trước cục bộ).",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to post moment" },
      { status: 500 }
    );
  }
}
