import type { Metadata } from "next";
import { Almarai, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcwave Pilates | Find your strength. Find your flow.",
  description:
    "Mindful movement, core conditioning and expert-led Pilates in Thiruvanmiyur, Chennai. Start your journey with Arcwave Pilates.",
  keywords: [
    "Arcwave Pilates",
    "Pilates Chennai",
    "Reformer Pilates",
    "Thiruvanmiyur",
    "Mindful movement",
  ],
  authors: [{ name: "Arcwave Pilates" }],
  icons: {
    icon: "/images/arcwave-01.png",
    apple: "/images/arcwave-01.png",
  },
  openGraph: {
    title: "Arcwave Pilates | Find your strength. Find your flow.",
    description:
      "Mindful movement, core conditioning and expert-led Pilates in Thiruvanmiyur, Chennai.",
    type: "website",
  },
  // Mobile web app capable — standalone feel when added to home screen
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arcwave Pilates",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // allow zoom for accessibility, but prevent layout-breaking auto-zoom on input focus
  viewportFit: "cover", // respect notches / safe areas on iOS
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${almarai.variable} ${instrumentSerif.variable} antialiased bg-black text-[#E1E0CC] overflow-x-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
