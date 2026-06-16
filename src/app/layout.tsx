import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "مسابقة توقعات كأس العالم 2026",
  description: "مسابقة توقعات كأس العالم 2026 - توقع النتائج واربح الجوائز",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-cairo">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/15 rounded-full blur-[120px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
