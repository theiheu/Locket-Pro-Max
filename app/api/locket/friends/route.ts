import { NextRequest, NextResponse } from "next/server";
import { mockFriends } from "@/lib/mockData";
import { validateToken } from "@/lib/locket";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({
        success: true,
        friends: mockFriends,
        isMock: true,
      });
    }

    const tokenStatus = validateToken(token);
    if (!tokenStatus.isValid) {
      return NextResponse.json({
        success: true,
        friends: mockFriends,
        isMock: true,
      });
    }

    // You can also forward to Locket friends endpoint or Firestore if available
    return NextResponse.json({
      success: true,
      friends: mockFriends,
      isMock: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
