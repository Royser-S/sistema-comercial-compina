'use client'; // Este componente maneja interacción (clicks, inputs)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { loginUser } from '@/services/authService';

export default function LoginForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Llamamos a la capa de SERVICIO
      const { rol } = await loginUser(email, password);

      // Decisión de navegación
      if (rol === 'sistemas') {
        router.push('/admin');
      } else {
        router.push('/proyectos');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="card-clean w-100" style={{ maxWidth: '400px' }}>
      <Card.Body className="p-5">
        
        {/* LOGO */}
        <div className="text-center mb-4">
          <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
            <Image 
              src="/compina.jpeg" 
              alt="Logo Empresa" 
              fill 
              style={{ objectFit: 'contain' }} 
              priority
            />
          </div>
          <h4 className="mt-3 fw-bold text-secondary">Bienvenido</h4>
        </div>

        {/* ERROR */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* FORMULARIO */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="usuario@empresa.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="py-2" // Un poco más alto el input
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="********" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="py-2"
            />
          </Form.Group>

          <div className="d-grid gap-2">
            {/* AQUÍ USAMOS TU CLASE NUEVA: btn-corporate */}
            <Button 
              disabled={loading}
              type="submit" 
              size="lg"
              className="btn-corporate py-2" 
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Ingresar'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}