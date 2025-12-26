import './globals.css';
// Asegúrate de que bootstrap esté antes que globals
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { ThemeProvider } from '@/context/ThemeContext';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Sistema Comercial',
  description: 'Gestión de cotizaciones',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* 1. EL PROVIDER SE ABRE AQUÍ */}
        <ThemeProvider>
          
          <div className="d-flex flex-column min-vh-100">
            <main className="flex-grow-1">
              {children}
            </main>
            
            {/* 2. EL FOOTER DEBE ESTAR ADENTRO DEL PROVIDER */}
            <Footer />
            
          </div>

        {/* 3. EL PROVIDER SE CIERRA AL FINAL DE TODO */}
        </ThemeProvider> 
      </body>
    </html>
  );
}