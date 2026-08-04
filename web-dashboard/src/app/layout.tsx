import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "E-Komite Pintar — Dashboard",
  description:
    "Dashboard manajemen keuangan komite sekolah. Kelola tagihan, pembayaran, dan laporan dengan mudah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script 
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-DUMMY123'}
          async
        ></script>
      </head>
      <body className="min-h-full flex flex-col bg-navy-800 text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
