import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Lucky Mooncake | Back-office",
  description: "Manage your Lucky Mooncake pre-orders efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${notoSansThai.className} flex h-screen bg-muted/20 overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto w-full">
          <div className="p-4 pt-16 md:p-8 w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
