import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "IZEL",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: "#FDF9F1",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='90'%3E%3Cdefs%3E%3Cpattern id='m1' width='24' height='30' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 0 26 v -12 h 4 v 8 h 8 v -16 h -8 v -4 h 16 v 24 h 4' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-opacity='0.15'/%3E%3Crect x='6' y='10' width='4' height='8' fill='%23D4AF37' fill-opacity='0.15'/%3E%3C/pattern%3E%3Cpattern id='m2' width='16' height='30' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 0 26 v -12 h 8 v 12 h 8' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-opacity='0.15'/%3E%3Crect x='2' y='18' width='4' height='6' fill='%23D4AF37' fill-opacity='0.15'/%3E%3Crect x='10' y='6' width='4' height='6' fill='%23D4AF37' fill-opacity='0.15'/%3E%3C/pattern%3E%3Cpattern id='m3' width='24' height='30' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 0 4 v 12 h 4 v -8 h 8 v 16 h -8 v 4 h 16 v -24 h 4' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-opacity='0.15'/%3E%3Crect x='6' y='12' width='4' height='8' fill='%23D4AF37' fill-opacity='0.15'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='120' height='30' fill='url(%23m1)'/%3E%3Crect y='30' width='120' height='30' fill='url(%23m2)'/%3E%3Crect y='60' width='120' height='30' fill='url(%23m3)'/%3E%3Cpath d='M0 0h120M0 30h120M0 60h120M0 90h120' fill='none' stroke='%23D4AF37' stroke-width='4' stroke-opacity='0.15'/%3E%3C/svg%3E\")",
          color: "#2A5A3B"
        }}
      >
        {children}
      </body>
    </html >
  );
}