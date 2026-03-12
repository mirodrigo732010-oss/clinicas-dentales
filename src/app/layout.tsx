import type { Metadata } from "next";
import { Readex_Pro, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const readexPro = Readex_Pro({
  variable: "--font-readex-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Clínica Dental Sonrisa Perfecta | Odontología de Vanguardia en Madrid",
  description: "Clínica dental premium en Madrid con tecnología de última generación. Escáner 3D, láser dental, ortodoncia invisible e implantes. Tu sonrisa perfecta comienza aquí.",
  keywords: ["clínica dental", "dentista Madrid", "ortodoncia invisible", "implantes dentales", "diseño de sonrisa", "escáner 3D dental"],
  authors: [{ name: "Clínica Dental Sonrisa Perfecta" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Clínica Dental Sonrisa Perfecta",
    description: "Odontología de vanguardia en Madrid. Tecnología avanzada para tu mejor sonrisa.",
    type: "website",
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
        className={`${readexPro.variable} ${inter.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
