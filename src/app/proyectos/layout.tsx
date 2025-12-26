'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Spinner } from 'react-bootstrap';
import { supabase } from '@/lib/supabase';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // 1. Preguntamos a Supabase: "¿Hay alguien logueado?"
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Si NO hay usuario, lo mandamos al inicio (Login)
      if (!user) {
        router.push('/'); 
      } else {
        // 3. Si SÍ hay usuario, dejamos de cargar y mostramos la página
        setLoading(false);
      }
    } catch (error) {
      router.push('/');
    }
  };

  // MIENTRAS VERIFICAMOS, MOSTRAMOS UN CARGANDO...
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="warning" />
        <span className="ms-3 fw-bold text-secondary">Verificando acceso...</span>
      </div>
    );
  }

  // SI PASÓ LA SEGURIDAD, MOSTRAMOS EL CONTENIDO (LA TABLA)
  return (
    <>
      {/* Aquí podrías poner un Navbar común para todas las ejecutivas */}
      <div className="min-vh-100 bg-light">
        {children}
      </div>
    </>
  );
}