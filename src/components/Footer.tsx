'use client';

import { Container, Row, Col } from 'react-bootstrap';
import { Github } from 'react-bootstrap-icons';
import Image from 'next/image';             // <--- Importamos Image
import { useTheme } from '@/context/ThemeContext'; // <--- Importamos para saber el color

const Footer = () => {
  const { theme } = useTheme(); // Obtenemos el tema actual

  return (
    <footer className="py-4 mt-auto border-top footer-themed">
      <Container>
        <Row className="align-items-center gy-3">
          
          {/* 1. IZQUIERDA: Créditos del Equipo */}
          <Col md={5} className="text-center text-md-start">
            <div className="d-flex flex-column gap-1">
              <span className="fw-bold text-secondary small">© 2025 Sistema Comercial</span>
              <div className="small">
                💻 Dev: <strong className="text-primary">Royser</strong> &nbsp;|&nbsp; 
                🎨 Art: <strong className="text-success">Frank</strong>
              </div>
            </div>
          </Col>
          
          {/* 2. CENTRO: EL CAPYBARA MASCOTA 🧢 */}
          <Col md={2} className="text-center">
            <div 
                className="mx-auto" 
                style={{ 
                    width: '70px',     // Tamaño del Capy
                    height: '70px', 
                    position: 'relative',
                    opacity: 0.9       // Un toque sutil
                }}
            >
              <Image 
                // Si es Light -> Capy Negro. Si es Dark -> Capy Blanco
                src={theme === 'light' ? "/capy-dark.png" : "/capy-light.png"} 
                alt="Capybara Mascot" 
                fill    
                style={{ objectFit: 'contain' }} 
              />
            </div>
          </Col>
          
          {/* 3. DERECHA: Link de GitHub */}
          <Col md={5} className="text-center text-md-end">
            <a
              href="https://github.com/TU_USUARIO" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-secondary d-inline-flex align-items-center footer-link fw-bold"
            >
              <span className="me-2">Ver código</span>
              <Github size={24} />
            </a>
          </Col>

        </Row>
      </Container>
    </footer>
  );
};

export default Footer;