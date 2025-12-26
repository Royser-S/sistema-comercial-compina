'use client';

import { useEffect, useState } from 'react';
import { Navbar, Container, Button, Badge, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
// --- NUEVOS IMPORTS ---
import { useTheme } from '@/context/ThemeContext';
import { SunFill, MoonFill } from 'react-bootstrap-icons';

export default function TopNavbar() {
  const router = useRouter();
  // --- USAR EL HOOK DEL TEMA ---
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    // ... (tu código existente de getUserInfo) ...
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      setEmail(user.email);
      const { data: roleData } = await supabase.from('tb_usuarios_roles').select('rol').eq('email', user.email).single();
      if (roleData) setRol(roleData.rol.toUpperCase());
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    // ... (tu código existente de handleLogout) ...
    await supabase.auth.signOut();
    router.push('/');
  };

  // ... (tu código existente de badgeColor) ...
  const badgeColor = rol === 'JEFA' || rol === 'ADMIN' ? 'warning' : 'info';
  const badgeText = rol === 'JEFA' || rol === 'ADMIN' ? 'text-dark' : 'text-white';

  return (
    // NOTA: Hemos quitado 'bg-white' y 'border-bottom' fijos y añadido 'navbar-themed'
    <Navbar className="shadow-sm mb-4 border-bottom sticky-top py-3 navbar-themed" style={{ zIndex: 1000 }}>
      <Container fluid className="px-4">
        {/* LOGO */}
        <Navbar.Brand href="#" className="d-flex align-items-center me-4">
           <div style={{ position: 'relative', width: '50px', height: '50px', marginRight: '12px' }}>
              <Image src="/compina.jpeg" alt="Logo" fill style={{ objectFit: 'contain' }} />
           </div>
           {/* Añadido 'brand-text' para controlar el color */}
           <span className="fw-bold text-secondary d-none d-sm-block fs-4 brand-text">Sistema Comercial</span>
        </Navbar.Brand>

        {/* --- MENÚ ADMIN --- (Tu código existente) */}
        {rol === 'ADMIN' && (
          <div className="d-flex gap-3 ms-3 border-start ps-4">
             {/* ... tus Links ... */}
             <Link href="/proyectos" className="text-decoration-none text-secondary fw-bold fs-5 px-3 py-2 rounded hover- transition" style={{ transition: 'all 0.2s' }}>📋 Cotizaciones</Link>
             <Link href="/admin/maestros" className="text-decoration-none text-dark fw-bold fs-5 px-3 py-2 rounded hover- transition" style={{ transition: 'all 0.2s' }}>🗂️ Maestros</Link>
          </div>
        )}

        <div className="me-auto"></div>

        {/* INFO USUARIO Y BOTÓN DE TEMA */}
        <div className="d-flex align-items-center gap-3">
          
          {/* --- NUEVO BOTÓN DE TOGGLE THEME --- */}
          <Button 
            variant="link" 
            onClick={toggleTheme} 
            className="text-secondary p-2 d-flex align-items-center justify-content-center theme-toggle-btn"
            title={theme === 'light' ? "Activar modo oscuro" : "Activar modo claro"}
          >
            {theme === 'light' ? <MoonFill size={20} /> : <SunFill size={20} />}
          </Button>
          
          {/* (Tu código existente de info de usuario) */}
          {loading ? (
             <Spinner animation="border" variant="warning" />
          ) : (
            <div className="text-end d-none d-md-block">
              <div className="fw-bold text-dark fs-6 user-text">{email}</div>
              <Badge bg={badgeColor} className={`px-3 py-2 ${badgeText}`}>
                {rol === 'ADMIN' ? '🛠️ ADMIN' : rol === 'JEFA' ? '👑 JEFA' : '👤 VENTAS'}
              </Badge>
            </div>
          )}
          
          <Button 
            variant="outline-danger" 
            size="lg" 
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