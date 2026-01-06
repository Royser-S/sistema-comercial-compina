'use client';

import { Modal, Table } from 'react-bootstrap';
import { DetalleProducto } from '@/types/database';

interface Props {
  show: boolean;
  handleClose: () => void;
  productos: DetalleProducto[];
  nombreProyecto: string;
}

export default function LocationDistributionModal({ show, handleClose, productos, nombreProyecto }: Props) {
  return (
    // Quitamos size="md" porque no existe. Usamos el tamaño por defecto (que es mediano) o "lg" si prefieres.
    <Modal show={show} onHide={handleClose} centered> 
      
      {/* CORRECCIÓN CLAVE: 
          1. 'bg-primary text-white': Fondo azul y letras blancas SIEMPRE. Se lee perfecto.
          2. 'closeVariant="white"': La 'X' de cerrar será blanca para que se vea en el azul.
      */}
      <Modal.Header closeButton closeVariant="white" className="bg-primary text-white">
        <Modal.Title className="fw-bold fs-8">
          📍 PROYECTO: {nombreProyecto}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        <Table striped hover className="mb-0 fs-8 align-middle">
          {/* Quitamos bg-light del thead para que se adapte mejor al modo oscuro automático */}
          <thead>
            <tr>
              <th className="ps-4 py-3">Producto</th>
              <th className="text-end pe-4 py-3">Ubicación Exacta</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod, idx) => (
              <tr key={idx}>
                <td className="ps-4 py-3">{prod.nombre_producto}</td>
                <td className="text-end pe-4 py-3">
                  {prod.ubicacion ? (
                    <span className="fw-bold text-primary">
                      {prod.ubicacion.nombre}
                    </span>
                  ) : (
                    <span className="text-muted small fst-italic">
                      - General -
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
}