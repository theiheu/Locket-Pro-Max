import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Locket Web Client - Widget & Camera for PC",
  description: "Trải nghiệm ứng dụng Locket trực tiếp trên trình duyệt máy tính: xem moments, chụp ảnh qua webcam, tải ảnh từ PC, thả reaction và quản lý bạn bè.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-black text-white min-h-screen antialiased selection:bg-yellow-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
