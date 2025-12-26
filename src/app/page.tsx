import { Container } from 'react-bootstrap';
import LoginForm from '@/components/auth/LoginForm';

// ESTA ES LA PÁGINA DE INICIO (LOGIN)
export default function LoginPage() {
  return (
    <div className="bg-corporate-light min-vh-100 d-flex align-items-center">
      <Container className="d-flex justify-content-center">
        <LoginForm />
      </Container>
    </div>
  );
}