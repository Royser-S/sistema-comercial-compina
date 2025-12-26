'use client';

import { useEffect, useState } from 'react';
import { Navbar, Container, Button, Badge, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function TopNavbar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      setEmail(user.email);
      const { data: roleData } = await supabase.from('tb_usuarios_roles').select('rol').eq('email', user.email).single();
      if (roleData) setRol(roleData.rol.toUpperCase());
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Colores dinámicos para el Badge
  const badgeColor = rol === 'JEFA' || rol === 'ADMIN' ? 'warning' : 'info';
  const badgeText = rol === 'JEFA' || rol === 'ADMIN' ? 'text-dark' : 'text-white';

  return (
    <Navbar bg="white" className="shadow-sm mb-4 border-bottom sticky-top py-3" style={{ zIndex: 1000 }}>
      <Container fluid className="px-4">
        {/* LOGO */}
        <Navbar.Brand href="#" className="d-flex align-items-center me-4">
           <div style={{ position: 'relative', width: '50px', height: '50px', marginRight: '12px' }}>
              <Image src="/compina.jpeg" alt="Logo" fill style={{ objectFit: 'contain' }} />
           </div>
           <span className="fw-bold text-secondary d-none d-sm-block fs-4">Sistema Comercial</span>
        </Navbar.Brand>

        {/* --- MENÚ ADMIN (LINKS GRANDES) --- */}
        {rol === 'ADMIN' && (
          <div className="d-flex gap-3 ms-3 border-start ps-4">
            <Link 
              href="/proyectos" 
              className="text-decoration-none text-secondary fw-bold fs-5 px-3 py-2 rounded hover-bg-light transition"
              style={{ transition: 'all 0.2s' }}
            >
               📋 Cotizaciones
            </Link>
            
            <Link 
              href="/admin/maestros" 
              // Usamos el color corporativo para resaltar donde estamos o simplemente oscuro
              className="text-decoration-none text-dark fw-bold fs-5 px-3 py-2 rounded hover-bg-light transition"
              style={{ transition: 'all 0.2s' }}
            >
               🗂️ Maestros
            </Link>
          </div>
        )}

        <div className="me-auto"></div>

        {/* INFO USUARIO */}
        <div className="d-flex align-items-center gap-3">
          {loading ? (
             <Spinner animation="border" variant="warning" />
          ) : (
            <div className="text-end d-none d-md-block">
              <div className="fw-bold text-dark fs-6">{email}</div>
              <Badge bg={badgeColor} className={`px-3 py-2 ${badgeText}`}>
                {rol === 'ADMIN' ? '🛠️ ADMIN' : rol === 'JEFA' ? '👑 JEFA' : '👤 VENTAS'}
              </Badge>
            </div>
          )}
          
          <Button 
            variant="outline-danger" 
            size="lg" // Botón más grande
            onClick={handleLogout}
            className="d-flex align-items-center gap-2 px-4"
          >
            Salir
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}