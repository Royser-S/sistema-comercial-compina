'use client';

import { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button, Badge, Spinner } from 'react-bootstrap';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link'; // <--- Importante
import { useTheme } from '@/context/ThemeContext';
import { SunFill, MoonFill } from 'react-bootstrap-icons';

export default function TopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  
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
    router.refresh();
    router.push('/');
  };

  const badgeColor = rol === 'JEFA' || rol === 'ADMIN' ? 'warning' : 'info';
  const badgeText = rol === 'JEFA' || rol === 'ADMIN' ? 'text-dark' : 'text-white';

  return (
    <Navbar 
        bg={theme} 
        variant={theme} 
        expand="lg" 
        className="shadow-sm mb-4 border-bottom sticky-top py-3" 
        style={{ zIndex: 1000 }}
    >
      <Container fluid className="px-3 px-lg-4">
        
        {/* 1. LOGO (Corregido con as={Link}) */}
        <Navbar.Brand as={Link} href="/proyectos" className="d-flex align-items-center me-4">
           <div style={{ position: 'relative', width: '40px', height: '40px', marginRight: '10px' }}>
              <Image src="/compina.jpeg" alt="Logo" fill style={{ objectFit: 'contain' }} className="rounded-circle" />
           </div>
           <span className={`fw-bold d-none d-sm-block fs-4 ${theme === 'light' ? 'text-secondary' : 'text-light'}`}>
             Sistema Comercial
           </span>
        </Navbar.Brand>

        {/* 2. BOTÓN HAMBURGUESA */}
        <Navbar.Toggle aria-controls="navbar-responsive-content" />

        {/* 3. CONTENIDO COLAPSABLE */}
        <Navbar.Collapse id="navbar-responsive-content">
            
            {/* ENLACES CENTRALES (Corregidos) */}
            <Nav className="me-auto my-3 my-lg-0 fw-bold gap-2">
                {/* ANTES: <Link ...><Nav.Link>...</Nav.Link></Link> (Error legacyBehavior)
                   AHORA: <Nav.Link as={Link} href="..."> (Correcto)
                */}
                <Nav.Link 
                    as={Link} 
                    href="/proyectos" 
                    active={pathname === '/proyectos'} 
                    className="px-3"
                >
                    📋 Cotizaciones
                </Nav.Link>
                
                {rol === 'ADMIN' && (
                    <Nav.Link 
                        as={Link} 
                        href="/admin/maestros" 
                        active={pathname.startsWith('/admin')} 
                        className="px-3"
                    >
                        🗂️ Maestros
                    </Nav.Link>
                )}
            </Nav>

            {/* ZONA DERECHA */}
            <div className="d-flex flex-column flex-lg-row align-items-center gap-3 pt-3 pt-lg-0 border-top border-lg-0 mt-2 mt-lg-0">
                
                {/* Switch Tema */}
                <Button 
                    variant="link" 
                    onClick={toggleTheme} 
                    className={`p-2 d-flex align-items-center justify-content-center ${theme === 'light' ? 'text-secondary' : 'text-light'}`}
                    title="Cambiar tema"
                >
                    {theme === 'light' ? <MoonFill size={20} /> : <SunFill size={20} />}
                    <span className="d-lg-none ms-2">Cambiar Tema</span>
                </Button>

                {/* Info Usuario */}
                {loading ? (
                    <Spinner animation="border" variant="warning" size="sm" />
                ) : (
                    <div className="text-center text-lg-end">
                        <div className={`fw-bold fs-6 ${theme === 'light' ? 'text-dark' : 'text-light'}`}>
                            {email}
                        </div>
                        <Badge bg={badgeColor} className={`px-2 py-1 ${badgeText}`}>
                            {rol === 'ADMIN' ? '🛠️ ADMIN' : rol === 'JEFA' ? '👑 JEFA' : '👤 VENTAS'}
                        </Badge>
                    </div>
                )}

                {/* Botón Salir */}
                <Button 
                    variant={theme === 'light' ? "outline-danger" : "danger"}
                    size="sm" 
                    onClick={handleLogout}
                    className="px-4 w-100 w-lg-auto"
                >
                    Salir
                </Button>

            </div>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}