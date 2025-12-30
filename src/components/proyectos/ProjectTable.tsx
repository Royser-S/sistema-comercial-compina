'use client';

import { Table, Badge, Button, Form } from 'react-bootstrap';
import { Proyecto, Estado } from '@/types/database';

interface Props {
  proyectos: Proyecto[];
  onOpenGallery: (p: Proyecto) => void;
  onEdit: (p: Proyecto) => void;
  esJefa: boolean;              // <--- NUEVO
  listaEstados: Estado[];       // <--- NUEVO
  onStateChange: (idProyecto: number, idNuevoEstado: string) => void; // <--- NUEVO
  esSistemas: boolean;   // <--- NUEVO: Para borrar registros
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

  

  
  const formatDate = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  };

  // Función para decidir el color del estado
  const getBadgeColor = (nombreEstado: string) => {
    if (nombreEstado === 'Terminado') return 'success';
    if (nombreEstado === 'Cancelado') return 'danger';
    return 'warning';
  };

  return (
    <div className="table-responsive shadow-sm p-3" style={{ borderRadius: '15px' }}>
      <Table bordered hover className="align-middle mb-0" style={{ minWidth: '1600px', fontSize: '1rem' }}>
<thead className=" text-uppercase text-secondary">
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
            <th>Ubicación</th>
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
                    <Badge bg="success" className="p-2">
                       📦 KIT: {p.nombre_kit}
                    </Badge> : 
                    <Badge bg="primary" className="p-2">
                       👤 Unitario
                    </Badge>
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

                {/* --- AQUÍ ESTÁ EL CAMBIO DE ESTADO --- */}
                <td className="text-center">
                  {esJefa ? (
                    // SI ES JEFA: Muestra Selector
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
                    // SI ES EJECUTIVA: Solo muestra Badge (Solo lectura)
                    <Badge className="p-2" bg={getBadgeColor(p.estado?.nombre || '')}>
                      {p.estado?.nombre}
                    </Badge>
                  )}
                </td>

                <td>{p.ubicacion?.nombre}</td>
                <td className="text-center">
                  <Button size="sm" variant="outline-primary" onClick={() => onEdit(p)}>✏️ Editar</Button>
                  {/* 🔒 BOTÓN SOLO PARA SISTEMAS 🔒 */}
                    {esSistemas && (
                      <Button 
                        size="sm" 
                        variant="outline-danger" 
                        onClick={() => onDelete(p.id)}
                        title="Eliminar registro (Solo Sistemas)"
                      >
                        🗑️
                      </Button>
                    )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}