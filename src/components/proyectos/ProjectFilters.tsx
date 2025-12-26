'use client';

import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { Ejecutiva, Ubicacion } from '@/types/database';

interface Props {
  filtros: any;
  onChange: (campo: string, valor: string) => void;
  onClean: () => void;
  listaEjecutivas: Ejecutiva[];
  listaUbicaciones: Ubicacion[];
}

export default function ProjectFilters({ filtros, onChange, onClean, listaEjecutivas, listaUbicaciones }: Props) {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body className="rounded">
        <h6 className="fw-bold text-secondary mb-3">🔍 Búsqueda Avanzada</h6>
        <Form>
          <Row className="g-3">
            {/* FILA 1 */}
            <Col md={3}>
              <Form.Select 
                value={filtros.ejecutiva} 
                onChange={e => onChange('ejecutiva', e.target.value)}
                className=" border-0"
              >
                <option value="">Todas las Ejecutivas</option>
                {listaEjecutivas.map(e => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filtros.ubicacion} 
                onChange={e => onChange('ubicacion', e.target.value)}
                className=" border-0"
              >
                <option value="">Todas las Ubicaciones</option>
                {listaUbicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filtros.tipo} 
                onChange={e => onChange('tipo', e.target.value)}
                className="border-0"
              >
                <option value="">Todos los Tipos</option>
                <option value="kit">Solo Kits</option>
                <option value="unitario">Solo Unitarios</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control 
                type="month" // <--- AQUÍ ESTÁ EL CAMBIO (Antes era "date")
                value={filtros.fecha}
                onChange={e => onChange('fecha', e.target.value)}
                className=" border-0"
                lang="es" // Ayuda a que el navegador lo muestre en español
              />
            </Col>

            {/* FILA 2 */}
            <Col md={3}>
              <Form.Control 
                placeholder="Buscar Proyecto..." 
                value={filtros.proyecto}
                onChange={e => onChange('proyecto', e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Control 
                placeholder="Buscar Empresa..." 
                value={filtros.empresa}
                onChange={e => onChange('empresa', e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Control 
                placeholder="Buscar Producto..." 
                value={filtros.producto}
                onChange={e => onChange('producto', e.target.value)}
              />
            </Col>
            <Col md={2} className="d-grid">
              <Button variant="outline-secondary" onClick={onClean}>
                Limpiar 🗑️
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}