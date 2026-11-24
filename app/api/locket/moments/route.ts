import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_HEADERS, LOCKET_API_BASE, validateToken } from "@/lib/locket";
import { initialMockMoments } from "@/lib/mockData";
import { LocketMoment } from "@/types/locket";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    // If no token or invalid, return mock moments
    if (!token) {
      return NextResponse.json({
        success: true,
        isMock: true,
        moments: initialMockMoments,
        message: "Đang hiển thị dữ liệu demo. Cung cấp Locket Bearer Token trong Cài đặt để đồng bộ tài khoản thật.",
      });
    }

    const tokenStatus = validateToken(token);
    if (!tokenStatus.isValid) {
      return NextResponse.json({
        success: true,
        isMock: true,
        moments: initialMockMoments,
        message: `${tokenStatus.message}. Tự động chuyển sang chế độ demo.`,
      });
    }

    // Attempt to call Locket's real getLatestMomentV2 endpoint
    try {
      const response = await fetch(`${LOCKET_API_BASE}/getLatestMomentV2`, {
        method: "POST",
        headers: {
          ...DEFAULT_HEADERS,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            excluded_users: [],
            last_fetch: {
              "@type": "type.googleapis.com/google.protobuf.Int64Value",
              "value": String(Date.now() - 1000 * 60 * 60 * 24 * 7),
            },
            fetch_streak: false,
            should_count_missed_moments: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("Locket API returned error:", response.status, errorText);
        return NextResponse.json({
          success: true,
          isMock: true,
          moments: initialMockMoments,
          apiStatus: response.status,
          message: `Locket API (${response.status}): ${errorText.slice(0, 100)}. Đang dùng dữ liệu demo.`,
        });
      }

      const data = await response.json();
      
      // Parse moments from response if present
      const rawMoments = data.data?.moments || data.result?.moments || [];
      if (!Array.isArray(rawMoments) || rawMoments.length === 0) {
        return NextResponse.json({
          success: true,
          isMock: false,
          moments: initialMockMoments,
          message: "Tài khoản chưa có khoảnh khắc nào gần đây.",
        });
      }

      const formattedMoments: LocketMoment[] = rawMoments.map((item: any, idx: number) => {
        const createdAt = item.created_at || new Date().toISOString();
        const isVideo = Boolean(item.video_url || item.url?.includes(".mp4"));
        return {
          id: item.id || `locket_${idx}`,
          userId: item.user_id || "unknown",
          user: {
            name: item.user_name || item.user?.name || "Bạn bè",
            username: item.user_username || item.user?.username || "locket_friend",
            avatarUrl: item.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user_id || idx}`,
          },
          mediaType: isVideo ? "video" : "image",
          thumbnailUrl: item.thumbnail_url || item.url || "",
          videoUrl: item.video_url || (isVideo ? item.url : undefined),
          caption: item.caption || "",
          createdAt: createdAt,
          relativeTime: "Gần đây",
          reactions: item.reactions || [
            { emoji: "❤️", count: item.hearts || 1, userReacted: false },
          ],
          comments: [],
        };
      });

      return NextResponse.json({
        success: true,
        isMock: false,
        moments: formattedMoments,
      });
    } catch (apiErr: any) {
      console.error("Failed to connect to Locket API:", apiErr.message);
      return NextResponse.json({
        success: true,
        isMock: true,
        moments: initialMockMoments,
        message: `Không kết nối được server Locket (${apiErr.message}). Đang dùng dữ liệu demo.`,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
