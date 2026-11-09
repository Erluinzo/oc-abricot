import type { Metadata } from "next";
import localFont from "next/font/local";
import { Manrope } from "next/font/google";
import "./globals.css";

//inter 3.19 is the version used in figma, google fonts now serves inter 4
const inter = localFont({
  src: "./fonts/inter-400.woff2",
  weight: "400",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Abricot",
  description: "Outil de gestion de projet pour freelances",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
