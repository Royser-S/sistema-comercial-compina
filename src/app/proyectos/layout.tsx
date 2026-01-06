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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/'); 
      } else {
        setLoading(false);
      }
    } catch (error) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="warning" />
        <span className="ms-3 fw-bold text-secondary">Verificando acceso...</span>
      </div>
    );
  }

  return (
    <>
<div className="min-vh-100">        
  {children}
      </div>
    </>
  );
}