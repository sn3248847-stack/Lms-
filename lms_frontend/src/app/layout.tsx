"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Define pages where the main website navbar should NOT appear
  const hideNavbar = 
    pathname?.includes("/dashboard") || 
    pathname === "/login" || 
    pathname === "/register";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[100px]" />
        </div>
        
        <main className="relative z-10 flex min-h-screen flex-col">
          {!hideNavbar && <Navbar />}
          {children}
        </main>
      </body>
    </html>
  );
}
