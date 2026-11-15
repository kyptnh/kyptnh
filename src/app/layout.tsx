import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistSerif } from "geist/font/serif";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Command Center", template: "%s · Command Center" },
  description: "Personal academic and career operating system",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Command Center", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  themeColor: "#f5faf6",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSerif.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
