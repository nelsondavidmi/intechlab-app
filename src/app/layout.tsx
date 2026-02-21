import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/providers/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "intechlab | Estética y Función Dental",
  description:
    "Laboratorio dental que entrega carillas, coronas e implantes con evidencia digital y portal operativo para clínicas.",
  keywords: [
    "laboratorio dental",
    "carillas",
    "coronas zirconio",
    "prótesis",
    "intechlab",
    "odontología digital",
  ],
  openGraph: {
    title: "intechlab | Estética y Función Dental",
    description:
      "Restauraciones premium con control CAD/CAM, evidencia fotográfica y portal para odontólogos.",
    url: "https://intechlab.com",
    siteName: "intechlab",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
