'use client';

import { Modal, Carousel, Image, Button } from 'react-bootstrap';
import { GaleriaProyecto } from '@/types/database';

interface Props {
  show: boolean;
  handleClose: () => void;
  imagenes: GaleriaProyecto[];
  projectName: string;
}

export default function ImageViewerModal({ show, handleClose, imagenes, projectName }: Props) {
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-white border-0">
        <Modal.Title style={{ fontSize: '1rem' }}>📷 Galería: {projectName}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark p-0 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        {imagenes.length === 0 ? (
          <p className="text-white">No hay imágenes disponibles.</p>
        ) : (
          <Carousel interval={null} className="w-100">
            {/* AQUÍ ESTÁ EL CAMBIO: Agregamos "index" y lo usamos en la key */}
            {imagenes.map((img, index) => (
              <Carousel.Item key={img.id || index}>
                <div style={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                  <Image 
                    src={img.imagen_url} 
                    alt={img.nombre_archivo} 
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-dark border-0">
        <Button variant="secondary" size="sm" onClick={handleClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
}