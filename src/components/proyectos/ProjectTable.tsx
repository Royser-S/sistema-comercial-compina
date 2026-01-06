'use client';

import { useState } from 'react';
import { Table, Badge, Button, Form, Card, Row, Col } from 'react-bootstrap';
import { Proyecto, Estado, DetalleProducto } from '@/types/database';
import LocationDistributionModal from './LocationDistributionModal';
import Swal from 'sweetalert2';

interface Props {
  proyectos: Proyecto[];
  onOpenGallery: (p: Proyecto) => void;
  onEdit: (p: Proyecto) => void;
  esJefa: boolean;
  listaEstados: Estado[];
  onStateChange: (idProyecto: number, idNuevoEstado: string) => void;
  esSistemas: boolean;
  onDelete: (id: number) => void;
}

export default function ProjectTable({
  proyectos,
  onOpenGallery,
  onEdit,
  esJefa,
  listaEstados,
  onStateChange,
  esSistemas,
  onDelete
}: Props) {

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedKitProducts, setSelectedKitProducts] = useState<DetalleProducto[]>([]);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  const handleOpenLocation = (p: Proyecto) => {
    setSelectedKitProducts(p.tb_detalle_productos || []);
    setSelectedProjectName(p.nombre_proyecto);
    setShowLocationModal(true);
  };

  const formatDate = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  };

  const getBadgeColor = (nombreEstado: string) => {
    if (nombreEstado === 'Terminado') return 'success';
    if (nombreEstado === 'Cancelado') return 'danger';
    return 'warning';
  };


  // Agrega esta función antes del return
  const handleDeleteClick = (id: number) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción. Se eliminará el proyecto y sus fotos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rojo para peligro
      cancelButtonColor: '#3085d6', // Azul para cancelar
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario dijo "SÍ", llamamos a tu función onDelete original
        onDelete(id);

        // Opcional: Mostrar confirmación visual inmediata
        Swal.fire(
          '¡Eliminado!',
          'El proyecto ha sido eliminado.',
          'success'
        );
      }
    });
  };

  return (
    <>
      {/* =================================================================================
          VISTA DE ESCRITORIO (TABLA) - Se oculta en pantallas menores a 'lg' (d-none d-lg-block)
      ================================================================================= */}
      <div className="table-responsive shadow-sm p-3 d-none d-lg-block" style={{ borderRadius: '15px' }}>
        <Table bordered hover className="align-middle mb-0" style={{ minWidth: '1600px', fontSize: '1rem' }}>
          <thead className="text-uppercase text-secondary">
            <tr>
              <th className="py-3">Ejecutiva</th>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Empresa</th>
              <th>Paquete</th>
              <th>Producto(s)</th>
              <th>Cant.</th>
              <th style={{ width: '200px' }}>Motivo</th>
              <th style={{ width: '200px' }}>Innovación</th>
              <th className="text-center">Imagen</th>
              <th className="text-center" style={{ minWidth: '140px' }}>Estado</th>
              <th className="text-center">Ubicación</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-5 text-muted h5">
                  No se encontraron resultados.
                </td>
              </tr>
            ) : (
              proyectos.map((p) => (
                <tr key={p.id}>
                  <td className="fw-bold text-dark">{p.ejecutiva?.nombre_completo}</td>
                  <td>{formatDate(p.fecha_mes_anio)}</td>
                  <td className="text-primary fw-bold">{p.nombre_proyecto}</td>
                  <td className="fw-semibold">{p.nombre_empresa}</td>
                  <td>
                    {p.es_kit ?
                      <Badge bg="success" className="p-2">📦 KIT: {p.nombre_kit}</Badge> :
                      <Badge bg="primary" className="p-2">👤 Unitario</Badge>
                    }
                  </td>

                  <td colSpan={2} className="p-0">
                    <Table size="sm" className="mb-0 table-borderless bg-transparent">
                      <tbody>
                        {p.tb_detalle_productos?.map((prod, idx) => (
                          <tr key={idx}>
                            <td className="border-bottom-0 py-1">• {prod.nombre_producto}</td>
                            <td className="border-bottom-0 fw-bold text-end py-1">{prod.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </td>

                  <td><small className="d-block text-muted">{p.motivo_compra}</small></td>
                  <td><small className="d-block text-muted">{p.innovador}</small></td>

                  <td className="text-center">
                    {p.tb_galeria_proyectos && p.tb_galeria_proyectos.length > 0 ? (
                      <Button variant="outline-secondary" size="sm" onClick={() => onOpenGallery(p)}>
                        📷 Ver ({p.tb_galeria_proyectos.length})
                      </Button>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>

                  <td className="text-center">
                    {esJefa ? (
                      <Form.Select
                        size="sm"
                        value={p.estado_id}
                        onChange={(e) => onStateChange(p.id, e.target.value)}
                        className={`fw-bold text-${getBadgeColor(p.estado?.nombre || '')} border-${getBadgeColor(p.estado?.nombre || '')}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {listaEstados.map(est => (
                          <option key={est.id} value={est.id}>{est.nombre}</option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Badge className="p-2" bg={getBadgeColor(p.estado?.nombre || '')}>
                        {p.estado?.nombre}
                      </Badge>
                    )}
                  </td>

                  <td className="text-center">
                    {p.es_kit ? (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="fw-bold d-flex align-items-center gap-2 mx-auto"
                        onClick={() => handleOpenLocation(p)}
                        title="Ver detalle de ubicaciones"
                      >
                        Múltiple 👁️
                      </Button>
                    ) : (
                      <span className="fw-bold">
                        {p.ubicacion?.nombre || '-'}
                      </span>
                    )}
                  </td>

                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-1">
                      <Button size="sm" variant="outline-primary" onClick={() => onEdit(p)}>✏️</Button>
                      {esSistemas && (
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(p.id)}>🗑️</Button>)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* =================================================================================
          VISTA MÓVIL (TARJETAS) - Se muestra SOLO en pantallas menores a 'lg' (d-lg-none)
      ================================================================================= */}
      <div className="d-lg-none">
        {proyectos.length === 0 ? (
          <div className="text-center py-5 text-muted h5">No se encontraron resultados.</div>
        ) : (
          proyectos.map((p) => (
            <Card key={p.id} className="mb-3 shadow-sm border-0">
              <Card.Header className="d-flex justify-content-between align-items-center border-bottom-0 pt-3 bg-transparent">
                <div className="fw-bold text-primary">{p.nombre_proyecto}</div>
                {esJefa ? (
                  <Form.Select
                    size="sm"
                    value={p.estado_id}
                    onChange={(e) => onStateChange(p.id, e.target.value)}
                    className={`fw-bold text-${getBadgeColor(p.estado?.nombre || '')} border-${getBadgeColor(p.estado?.nombre || '')}`}
                    style={{ width: '130px' }}
                  >
                    {listaEstados.map(est => <option key={est.id} value={est.id}>{est.nombre}</option>)}
                  </Form.Select>
                ) : (
                  <Badge bg={getBadgeColor(p.estado?.nombre || '')}>{p.estado?.nombre}</Badge>
                )}
              </Card.Header>
              <Card.Body className="pt-0">
                <Row className="mb-2">
                  <Col xs={6}><small className="text-muted d-block">Empresa</small><strong>{p.nombre_empresa}</strong></Col>
                  <Col xs={6} className="text-end"><small className="text-muted d-block">Fecha</small>{formatDate(p.fecha_mes_anio)}</Col>
                </Row>

                <div className="mb-2">
                  {p.es_kit ? <Badge bg="success" className="me-1">📦 KIT: {p.nombre_kit}</Badge> : <Badge bg="primary">👤 Unitario</Badge>}
                </div>

                {/* Productos en Móvil */}
                {/* CAMBIO AQUÍ: Quitamos 'bg-light' y ponemos 'box-themed' */}
                <div className="box-themed p-3 rounded mb-3">
                  <small className="text-muted fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '0.75rem' }}>
                    Productos:
                  </small>
                  {p.tb_detalle_productos?.map((prod, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center small border-bottom py-2 last-border-0">
                      <span className="fw-medium">• {prod.nombre_producto}</span>
                      <Badge bg="secondary" className="text-white">
                        {prod.cantidad}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Row className="align-items-center mt-3">
                  <Col xs={6}>
                    {/* Ubicación Móvil */}
                    {p.es_kit ? (
                      <Button variant="outline-secondary" size="sm" className="w-100" onClick={() => handleOpenLocation(p)}>
                        Ubicación 👁️
                      </Button>
                    ) : (
                      <div><small className="text-muted">Ubicación:</small> <span className="fw-bold">{p.ubicacion?.nombre || '-'}</span></div>
                    )}
                  </Col>
                  <Col xs={6} className="text-end">
                    {/* Galería Móvil */}
                    {p.tb_galeria_proyectos && p.tb_galeria_proyectos.length > 0 ? (
                      <Button variant="outline-secondary" size="sm" onClick={() => onOpenGallery(p)}>
                        📷 Fotos ({p.tb_galeria_proyectos.length})
                      </Button>
                    ) : <span className="text-muted small">- Sin fotos -</span>}
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer className="border-top-0 d-flex justify-content-end gap-2 pb-3 bg-transparent">
                <Button size="sm" variant="outline-primary" onClick={() => onEdit(p)}>✏️ Editar</Button>
                {esSistemas && (
                  <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(p.id)}>🗑️ Eliminar</Button>)}
              </Card.Footer>
            </Card>
          ))
        )}
      </div>

      <LocationDistributionModal
        show={showLocationModal}
        handleClose={() => setShowLocationModal(false)}
        productos={selectedKitProducts}
        nombreProyecto={selectedProjectName}
      />
    </>
  );
}