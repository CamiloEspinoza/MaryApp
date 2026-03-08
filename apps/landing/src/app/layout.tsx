import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mary – Tu compañera de viaje",
  description:
    "Mary es tu asistente personal de IA para viajar. Se encarga de los detalles — vuelos, accesibilidad, rutas sin escaleras — para que tú solo disfrutes.",
  keywords: [
    "guía turístico",
    "inteligencia artificial",
    "viajes para mujeres",
    "accesibilidad",
    "compañera de viaje",
    "asistente de viaje",
    "AI travel",
  ],
  openGraph: {
    title: "Mary – Tu compañera de viaje",
    description:
      "Conoce a Mary, tu asistente personal de IA. Ella se encarga de los detalles para que tú solo disfrutes. ¡Pruébala hoy!",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mary – Tu compañera de viaje",
    description:
      "Tu asistente personal de IA para viajar sin preocupaciones.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${cormorant.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
