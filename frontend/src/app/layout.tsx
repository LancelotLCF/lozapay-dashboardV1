import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reporte Comercial Izipay",
  description: "Dashboard ejecutivo de desempeño comercial",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
