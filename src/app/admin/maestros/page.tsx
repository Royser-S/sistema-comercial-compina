'use client';

import { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Tab, Nav, Modal, Badge, Card, Row, Col } from 'react-bootstrap';
import TopNavbar from '@/components/TopNavbar';
import { 
  getEjecutivas, getUbicaciones, getEstados,
  createEjecutiva, createUbicacion, createEstado,
  deleteEjecutiva, deleteUbicacion, deleteEstado,
  restoreEjecutiva, restoreUbicacion, restoreEstado // <--- Importamos los nuevos
} from '@/services/maestrosService';
import { Ejecutiva, Ubicacion, Estado } from '@/types/database';

export default function MaestrosPage() {
  const [ejecutivas, setEjecutivas] = useState<Ejecutiva[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  
  // Estado Modal
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState<'EJECUTIVA' | 'UBICACION' | 'ESTADO'>('EJECUTIVA');
  const [nuevoNombre, setNuevoNombre] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // AQUI ESTÁ EL TRUCO: Pasamos 'false' para que traiga TAMBIÉN LOS INACTIVOS
    const [ejes, ubis, ests] = await Promise.all([
        getEjecutivas(false), 
        getUbicaciones(false), 
        getEstados(false)
    ]);
    setEjecutivas(ejes);
    setUbicaciones(ubis);
    setEstados(ests);
  };

  const handleGuardar = async () => {
    if (!nuevoNombre.trim()) return;
    try {
      if (tipoModal === 'EJECUTIVA') await createEjecutiva(nuevoNombre);
      else if (tipoModal === 'UBICACION') await createUbicacion(nuevoNombre);
      else await createEstado(nuevoNombre);
      
      setShowModal(false);
      setNuevoNombre('');
      cargarDatos();
    } catch (error) {
      alert('Error al guardar');
    }
  };

  // Acción de Eliminar (Desactivar)
  const handleEliminar = async (id: number, tipo: 'EJECUTIVA' | 'UBICACION' | 'ESTADO') => {
    if (!confirm('¿Seguro que deseas desactivar este elemento?')) return;
    
    if (tipo === 'EJECUTIVA') await deleteEjecutiva(id);
    else if (tipo === 'UBICACION') await deleteUbicacion(id);
    else await deleteEstado(id); 

    cargarDatos();
  };

  // Acción de Restaurar (Activar) - NUEVO
  const handleRestaurar = async (id: number, tipo: 'EJECUTIVA' | 'UBICACION' | 'ESTADO') => {
    if (!confirm('¿Deseas restaurar y volver a activar este elemento?')) return;

    if (tipo === 'EJECUTIVA') await restoreEjecutiva(id);
    else if (tipo === 'UBICACION') await restoreUbicacion(id);
    else await restoreEstado(id); 

    cargarDatos();
  };

  const abrirModal = (tipo: 'EJECUTIVA' | 'UBICACION' | 'ESTADO') => {
    setTipoModal(tipo);
    setNuevoNombre('');
    setShowModal(true);
  };

  const getBadgeColor = (nombre: string) => {
    if (nombre === 'Terminado') return 'success';
    if (nombre === 'Cancelado') return 'danger';
    return 'warning';
  };

  // Componente auxiliar para el botón de acción (para no repetir código)
  const ActionButton = ({ item, tipo }: { item: any, tipo: 'EJECUTIVA' | 'UBICACION' | 'ESTADO' }) => {
    // Si es estado fijo (1 o 2), no se toca
    if (tipo === 'ESTADO' && item.id <= 2) return <span className="text-muted small fst-italic">Sistema</span>;

    if (item.activo) {
        return (
            <Button variant="outline-danger" className="rounded-pill px-3" onClick={() => handleEliminar(item.id, tipo)}>
                Desactivar 🗑️
            </Button>
        );
    } else {
        return (
            <Button variant="success" className="rounded-pill px-3 shadow-sm" onClick={() => handleRestaurar(item.id, tipo)}>
                Restaurar ♻️
            </Button>
        );
    }
  };

  // Estilo de fila (si está inactivo se pone gris)
const getRowStyle = (activo: boolean) => activo ? {} : { opacity: 0.5, filter: 'grayscale(100%)' };
  return (
<div className="min-vh-100">      
    <TopNavbar />
      
      <Container className="py-5">
        <Row className="mb-4 text-center">
            <Col>
                <h1 className="fw-bold display-5">🗂️ Gestión de Listas</h1>
                <p className="text-muted fs-5">Administra y restaura las opciones del sistema</p>
            </Col>
        </Row>

        <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
          <Card.Header className=" p-4 border-bottom-0">
             <Tab.Container defaultActiveKey="ejecutivas">
                <Nav variant="pills" className="nav-justified gap-3 p-2  rounded-pill">
                  <Nav.Item><Nav.Link eventKey="ejecutivas" className="fs-5 fw-bold py-3">👩‍💼 Ejecutivas</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="ubicaciones" className="fs-5 fw-bold py-3">📍 Ubicaciones</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="estados" className="fs-5 fw-bold py-3">🚦 Estados</Nav.Link></Nav.Item>
                </Nav>

                <Card.Body className="p-5">
                  <Tab.Content>
                    
                    {/* 1. EJECUTIVAS */}
                    <Tab.Pane eventKey="ejecutivas">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold text-secondary m-0">Vendedoras</h3>
                        <Button className="btn-corporate btn-lg px-4 shadow-sm" onClick={() => abrirModal('EJECUTIVA')}>+ Agregar</Button>
                      </div>
                      <Table hover responsive className="align-middle">
                        <thead className=""><tr><th className="py-3 ps-4">Nombre</th><th className="text-end pe-4">Acción</th></tr></thead>
                        <tbody>
                          {ejecutivas.map(e => (
                            <tr key={e.id} style={getRowStyle(e.activo)}>
                              <td className="ps-4 fw-bold">
                                {e.nombre_completo} {!e.activo && <Badge bg="secondary">Inactivo</Badge>}
                              </td>
                              <td className="text-end pe-4"><ActionButton item={e} tipo="EJECUTIVA" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Tab.Pane>

                    {/* 2. UBICACIONES */}
                    <Tab.Pane eventKey="ubicaciones">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold text-secondary m-0">Sedes y Pisos</h3>
                        <Button className="btn-corporate btn-lg px-4 shadow-sm" onClick={() => abrirModal('UBICACION')}>+ Agregar</Button>
                      </div>
                      <Table hover responsive className="align-middle">
                        <thead className=""><tr><th className="py-3 ps-4">Nombre</th><th className="text-end pe-4">Acción</th></tr></thead>
                        <tbody>
                          {ubicaciones.map(u => (
                            <tr key={u.id} style={getRowStyle(u.activo)}>
                              <td className="ps-4 fw-bold">
                                {u.nombre} {!u.activo && <Badge bg="secondary">Inactivo</Badge>}
                              </td>
                              <td className="text-end pe-4"><ActionButton item={u} tipo="UBICACION" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Tab.Pane>

                    {/* 3. ESTADOS */}
                    <Tab.Pane eventKey="estados">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                         <h3 className="fw-bold text-secondary m-0">Estados</h3>
                         <Button variant="warning" className="btn-lg px-4 shadow-sm text-dark fw-bold" onClick={() => abrirModal('ESTADO')}>+ Agregar</Button>
                      </div>
                      <Table hover responsive className="align-middle">
                        <thead className=""><tr><th className="py-3 ps-4">Etiqueta</th><th className="text-end pe-4">Acción</th></tr></thead>
                        <tbody>
                          {estados.map(est => (
                            <tr key={est.id} style={getRowStyle(est.activo)}>
                              <td className="ps-4">
                                <Badge bg={est.activo ? getBadgeColor(est.nombre) : 'secondary'} className={`text-dark border fs-6 px-3 py-2 ${!est.activo && 'text-white'}`}>
                                   {est.nombre}
                                </Badge>
                              </td>
                              <td className="text-end pe-4"><ActionButton item={est} tipo="ESTADO" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Tab.Pane>

                  </Tab.Content>
                </Card.Body>
             </Tab.Container>
          </Card.Header>
        </Card>
      </Container>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-3 text-corporate">
            {tipoModal === 'EJECUTIVA' ? '👩‍💼 Nueva Ejecutiva' : tipoModal === 'UBICACION' ? '📍 Nueva Ubicación' : '🚦 Nuevo Estado'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group>
            <Form.Label className="fs-5 text-secondary">Nombre:</Form.Label>
            <Form.Control autoFocus size="lg" className="py-3 fs-5 fw-bold" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-4 pe-4">
          <Button variant="link" onClick={() => setShowModal(false)} className="text-decoration-none text-secondary fs-5 me-3">Cancelar</Button>
          <Button className="btn-corporate btn-lg px-5 shadow" onClick={handleGuardar}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}