'use client';

import { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { getProyectos } from '@/services/proyectosService'; // <--- Usamos la capa de SERVICIO
import { Proyecto } from '@/types/database'; // <--- Usamos la capa de MODELO

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  // Función pequeña para formatear fecha
  const formatDate = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="warning" /></Container>;

  return (
    <Container fluid className="py-4 bg-white">
      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">Listado de Cotizaciones</h2>
        <Button className="btn-corporate">
          + Nuevo Proyecto
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Tabla con Scroll Horizontal */}
      <div className="table-responsive shadow-sm" style={{ borderRadius: '10px' }}>
        <Table bordered hover className="align-middle mb-0" style={{ minWidth: '1500px', fontSize: '0.9rem' }}>
          <thead className="bg-light text-uppercase text-secondary small">
            <tr>
              <th className="bg-light">Ejecutiva</th>
              <th className="bg-light">Fecha</th>
              <th className="bg-light">Proyecto</th>
              <th className="bg-light">Empresa</th>
              <th className="bg-light">Paquete</th>
              <th className="bg-light">Producto(s)</th>
              <th className="bg-light">Cant.</th>
              <th className="bg-light" style={{ width: '200px' }}>Motivo Compra</th>
              <th className="bg-light" style={{ width: '200px' }}>¿Por qué Innovador?</th>
              <th className="bg-light">Imagen</th>
              <th className="bg-light">Estado</th>
              <th className="bg-light">Ubicación</th>
              <th className="bg-light">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-5 text-muted">
                  No hay registros. ¡Agrega el primero!
                </td>
              </tr>
            ) : (
              proyectos.map((p) => (
                <tr key={p.id}>
                  {/* 1. EJECUTIVA */}
                  <td className="fw-bold">{p.ejecutiva?.nombre_completo}</td>
                  
                  {/* 2. FECHA */}
                  <td>{formatDate(p.fecha_mes_anio)}</td>
                  
                  {/* 3. PROYECTO */}
                  <td className="text-primary fw-semibold">{p.nombre_proyecto}</td>
                  
                  {/* 4. EMPRESA */}
                  <td>{p.nombre_empresa}</td>
                  
                  {/* 5. PAQUETE (Lógica Kit) */}
                  <td>
                    {p.es_kit ? (
                      <Badge bg="info" className="text-dark">KIT: {p.nombre_kit}</Badge>
                    ) : (
                      <Badge bg="light" text="dark" className="border">Unitario</Badge>
                    )}
                  </td>

                  {/* 6 y 7. PRODUCTOS Y CANTIDAD (Renderizado múltiple) */}
                  <td colSpan={2} className="p-0">
                    <Table size="sm" className="mb-0 table-borderless bg-transparent">
                      <tbody>
                        {p.tb_detalle_productos?.map((prod, idx) => (
                          <tr key={idx}>
                            <td className="border-bottom-0" style={{ width: '70%' }}>• {prod.nombre_producto}</td>
                            <td className="border-bottom-0 fw-bold text-end">{prod.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </td>

                  {/* 8. MOTIVO */}
                  <td><small>{p.motivo_compra}</small></td>

                  {/* 9. INNOVADOR */}
                  <td><small>{p.innovador}</small></td>

                  {/* 10. IMAGEN (Muestra si hay fotos en la galería) */}
                  <td className="text-center">
                    {p.tb_galeria_proyectos && p.tb_galeria_proyectos.length > 0 ? (
                      <Button variant="outline-secondary" size="sm">
                        📷 Ver ({p.tb_galeria_proyectos.length})
                      </Button>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>

                  {/* 11. ESTADO */}
                  <td>
                    <Badge bg={p.estado?.nombre === 'Terminado' ? 'success' : 'warning'}>
                      {p.estado?.nombre}
                    </Badge>
                  </td>

                  {/* 12. UBICACIÓN */}
                  <td>{p.ubicacion?.nombre}</td>

                  {/* Acciones */}
                  <td>
                    <Button size="sm" variant="link">✏️</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}