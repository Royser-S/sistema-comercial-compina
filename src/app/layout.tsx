import type { Metadata } from "next";
// 1. IMPORTACIONES DE ESTILOS (Bootstrap y Tus colores)
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema Comercial",
  description: "Gestión de Cotizaciones",
};

// 2. LA ESTRUCTURA HTML OBLIGATORIA
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* El body es el cuerpo de tu web */}
      <body>
        {children}
      </body>
    </html>
  );
}