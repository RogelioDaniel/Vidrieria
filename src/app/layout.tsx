import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GlassIntro } from "@/components/glass-intro";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRISMA — Vidriería de Autor · Ciudad de México",
  description:
    "Vidriería de autor en la CDMX. Cristales, espejos, templado, mamparas, barandales y vitrales hechos a medida. Cotización instantánea, cita de medición y chat en vivo.",
  keywords: [
    "vidriería CDMX",
    "cristales Ciudad de México",
    "vidrio templado",
    "espejos a medida",
    "mamparas de vidrio",
    "barandales de cristal",
    "vitral de autor",
    "puertas de vidrio",
  ],
  authors: [{ name: "PRISMA Vidriería de Autor" }],
  openGraph: {
    title: "PRISMA — Vidriería de Autor · CDMX",
    description:
      "Vidriería de autor en la Ciudad de México. Vidrio hecho a medida con precisión de taller.",
    siteName: "PRISMA Vidriería",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRISMA — Vidriería de Autor · CDMX",
    description: "Vidriería de autor en la Ciudad de México.",
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
        className={`${inter.variable} ${plexMono.variable} ${fraunces.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <GlassIntro />
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
