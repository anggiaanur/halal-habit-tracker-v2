import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Clicker_Script, Playfair_Display, Quicksand, Great_Vibes } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const clickerScript = Clicker_Script({
  variable: "--font-clicker-script",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Halal Habit Tracker 🌸 — Catat, Pantau & Ibadah Bareng",
  description: "Kelola rezeki dengan amanah & bijaksana. Platform keuangan syariah dan tracker ibadah harian berbasis AI untuk Gen Z & Milenial.",
  keywords: ["halal", "keuangan syariah", "ibadah tracker", "halal score", "zakat", "sedekah"],
  authors: [{ name: "Halal Habit Tracker" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Halal Habit",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f43f5e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${clickerScript.variable} ${playfairDisplay.variable} ${quicksand.variable} ${greatVibes.variable} h-full`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5IfS51RRmC1IQFWddc50XXc3Pr/9WXSLzQsWXYKDKB2GF1nyG4gxhgCOsb7ec/q1MWv50xs+w==" crossOrigin="anonymous" referrerPolicy="no-referrer" defer></script>
      </head>
      <body
        className="min-h-dvh antialiased"
        style={{ fontFamily: "var(--font-quicksand), var(--font-jakarta), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
