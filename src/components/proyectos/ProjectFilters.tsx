'use client';

import { Card, Form, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { Ejecutiva, Ubicacion, Estado } from '@/types/database'; // <--- Importar Estado

interface Props {
  filtros: any;
  onChange: (campo: string, valor: string) => void;
  onToggleUbicacion: (id: string) => void;
  onClean: () => void;
  listaEjecutivas: Ejecutiva[];
  listaUbicaciones: Ubicacion[];
  listaEstados: Estado[]; // <--- NUEVA PROP
}

export default function ProjectFilters({ 
    filtros, onChange, onToggleUbicacion, onClean, listaEjecutivas, listaUbicaciones, listaEstados 
}: Props) {
  
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body className="rounded">
        <h6 className="fw-bold text-secondary mb-3">🔍 Búsqueda Avanzada</h6>
        <Form>
          <Row className="g-3">
            {/* --- FILA 1 REORGANIZADA PARA QUE QUEPAN 5 ELEMENTOS --- */}
            
            {/* 1. Ejecutiva (3 cols) */}
            <Col md={3}>
              <Form.Select 
                value={filtros.ejecutiva} 
                onChange={e => onChange('ejecutiva', e.target.value)}
                className="bg-light border-0"
              >
                <option value="">👤 Todas las Ejecutivas</option>
                {listaEjecutivas.map(e => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
              </Form.Select>
            </Col>

            {/* 2. Ubicación (3 cols) */}
            <Col md={3}>
                <Dropdown autoClose="outside">
                    <Dropdown.Toggle 
                        id="dropdown-ubicaciones"
                        variant="" 
                        className="w-100 text-start d-flex justify-content-between align-items-center custom-dropdown-toggle bg-light"
                        style={{ height: '38px' }} 
                    >
                        {filtros.ubicaciones.length === 0 
                            ? '📍 Todas las Ubicaciones' 
                            : `${filtros.ubicaciones.length} Seleccionadas`}
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="w-100 p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {listaUbicaciones.map(u => (
                            <Form.Check 
                                key={u.id}
                                type="checkbox"
                                id={`ubi-${u.id}`}
                                label={u.nombre}
                                checked={filtros.ubicaciones.includes(u.id.toString())}
                                onChange={() => onToggleUbicacion(u.id.toString())}
                                className="mb-2"
                            />
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Col>

            {/* 3. ESTADO (NUEVO - 2 cols) */}
            <Col md={2}>
              <Form.Select 
                value={filtros.estado} 
                onChange={e => onChange('estado', e.target.value)}
                className="bg-light border-0 fw-bold"
                style={{ color: filtros.estado ? '#fd7e14' : 'inherit' }} // Toque visual: Naranja si está seleccionado
              >
                <option value="">🚦 Todos los Estados</option>
                {listaEstados.map(est => (
                    <option key={est.id} value={est.id}>{est.nombre}</option>
                ))}
              </Form.Select>
            </Col>

            {/* 4. TIPO (2 cols) */}
            <Col md={2}>
              <Form.Select 
                value={filtros.tipo} 
                onChange={e => onChange('tipo', e.target.value)}
                className="bg-light border-0"
              >
                <option value="">📦 Todos los Tipos</option>
                <option value="kit">Solo Kits</option>
                <option value="unitario">Solo Unitarios</option>
              </Form.Select>
            </Col>

            {/* 5. FECHA (2 cols) */}
            <Col md={2}>
              <Form.Control 
                type="month" 
                value={filtros.fecha}
                onChange={e => onChange('fecha', e.target.value)}
                className="bg-light border-0"
                lang="es"
              />
            </Col>

            {/* --- FILA 2 --- */}
            <Col md={3}>
              <Form.Control 
                placeholder="Buscar Proyecto..." 
                value={filtros.proyecto}
                onChange={e => onChange('proyecto', e.target.value)}
              />
            </Col>
            
            <Col md={3}>
               <Form.Control 
                 placeholder="📦 Buscar por Nombre de Kit..." 
                 value={filtros.nombreKit}
                 onChange={e => onChange('nombreKit', e.target.value)}
               />
            </Col>

            <Col md={2}>
              <Form.Control 
                placeholder="Buscar Empresa..." 
                value={filtros.empresa}
                onChange={e => onChange('empresa', e.target.value)}
              />
            </Col>
            <Col md={2}>
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