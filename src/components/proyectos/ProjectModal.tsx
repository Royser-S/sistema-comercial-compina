'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, Spinner, Alert, Image, Badge, Dropdown } from 'react-bootstrap'; // <--- AGREGAR Dropdown
import { getEjecutivas, getUbicaciones } from '@/services/maestrosService';
import { createProyecto, updateProyecto } from '@/services/proyectosService';
import { Ejecutiva, Ubicacion, Proyecto, GaleriaProyecto } from '@/types/database';
import { uploadToCloudinary } from '@/utils/cloudinaryService';
import Swal from 'sweetalert2';

interface Props {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
    proyectoEditar?: Proyecto | null;
    esJefa: boolean;
    listaEstados: any[];
}

export default function ProjectModal({ show, handleClose, onSuccess, proyectoEditar, esJefa, listaEstados }: Props) {
    // Maestros
    const [listaEjecutivas, setListaEjecutivas] = useState<Ejecutiva[]>([]);
    const [listaUbicaciones, setListaUbicaciones] = useState<Ubicacion[]>([]);
    const [estadoId, setEstadoId] = useState('1');

    // Estado UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);



    // Campos Formulario
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [ejecutivaId, setEjecutivaId] = useState('');

    // --- CAMBIO 1: AHORA ES UN ARRAY DE STRING ---
    const [ubicacionesIds, setUbicacionesIds] = useState<string[]>([]);

    const [nombreProyecto, setNombreProyecto] = useState('');
    const [nombreEmpresa, setNombreEmpresa] = useState('');
    const [motivo, setMotivo] = useState('');
    const [innovador, setInnovador] = useState('');

    // Kit
    const [esKit, setEsKit] = useState(false);
    const [nombreKit, setNombreKit] = useState('');

    // Productos
    const [productos, setProductos] = useState([{ nombre: '', cantidad: '', ubicacionId: "" }]);

    // Imágenes
    const [imagenesNuevas, setImagenesNuevas] = useState<File[]>([]);
    const [imagenesExistentes, setImagenesExistentes] = useState<GaleriaProyecto[]>([]);
    const [idsFotosAEliminar, setIdsFotosAEliminar] = useState<number[]>([]);

    // 1. Cargar Maestros
    useEffect(() => {
        async function loadMaestros() {
            const ejs = await getEjecutivas();
            const ubs = await getUbicaciones();
            setListaEjecutivas(ejs);
            setListaUbicaciones(ubs);
        }
        loadMaestros();
    }, []);

    // 2. DETECTAR EDICIÓN
    useEffect(() => {
        if (proyectoEditar) {
            setFecha(proyectoEditar.fecha_mes_anio);
            setEjecutivaId(proyectoEditar.ejecutiva_id.toString());

            // --- CAMBIO 2: CARGAR UBICACIÓN EXISTENTE EN EL ARRAY ---
            // Nota: Si tu base de datos aun guarda 1 sola ID, la metemos al array.
            // Si ya soporta multiples, deberias recibir un array de IDs.
            setUbicacionesIds(proyectoEditar.ubicacion_id ? [proyectoEditar.ubicacion_id.toString()] : []);
            setNombreProyecto(proyectoEditar.nombre_proyecto);
            setNombreEmpresa(proyectoEditar.nombre_empresa);
            setMotivo(proyectoEditar.motivo_compra || '');
            setInnovador(proyectoEditar.innovador || '');
            setEsKit(proyectoEditar.es_kit);
            setNombreKit(proyectoEditar.nombre_kit || '');
            setEstadoId(proyectoEditar.estado_id.toString());

            if (proyectoEditar.tb_detalle_productos && proyectoEditar.tb_detalle_productos.length > 0) {
                setProductos(proyectoEditar.tb_detalle_productos.map(p => ({
                    nombre: p.nombre_producto,
                    cantidad: p.cantidad.toString(),
                    ubicacionId: p.ubicacion_id ? p.ubicacion_id.toString() : ''
                })));
            } else {
                setProductos([{ nombre: '', cantidad: '', ubicacionId: '' }]);
            }

            setImagenesExistentes(proyectoEditar.tb_galeria_proyectos || []);
            setIdsFotosAEliminar([]);
        } else {
            limpiarFormulario();
        }
        setImagenesNuevas([]);
        setError(null);
    }, [proyectoEditar, show]);

    // Helpers de Productos (sin cambios)
    const addProductoRow = () => setProductos([...productos, { nombre: '', cantidad: '', ubicacionId: "" }]);
    const removeProductoRow = (index: number) => {
        const nuevos = [...productos];
        nuevos.splice(index, 1);
        setProductos(nuevos);
    };
    const updateProducto = (index: number, field: 'nombre' | 'cantidad' | 'ubicacionId', value: string) => {
        if (field === 'cantidad') {
            if (value === '') { }
            else {
                const num = parseInt(value);
                if (isNaN(num) || num <= 0) return;
            }
        }
        const nuevos = [...productos];
        // @ts-ignore
        nuevos[index][field] = value;
        setProductos(nuevos);
    };

    // Fotos (sin cambios)
    const handleMarcarEliminar = (idFoto: number) => {
        setIdsFotosAEliminar([...idsFotosAEliminar, idFoto]);
        setImagenesExistentes(imagenesExistentes.filter(img => img.id !== idFoto));
    };

    // --- CAMBIO 3: MANEJO DE SELECCIÓN MÚLTIPLE ---
    const toggleUbicacion = (id: string) => {
        setUbicacionesIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id); // Quitar
            } else {
                return [...prev, id]; // Agregar
            }
        });
    };

    // GUARDAR
    const handleSubmit = async () => {
        // 1. Validaciones básicas (Nombre, Empresa, Ejecutiva)
        // OJO: Quitamos 'ubicacionesIds.length === 0' de aquí porque ahora depende
        if (!ejecutivaId || !nombreProyecto || !nombreEmpresa) {
           Swal.fire({
                icon: 'warning',
                title: 'Faltan datos',
                text: 'Por favor completa los campos obligatorios (*).',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        // 2. Validación de Ubicación Inteligente 🧠
        // - Si es UNITARIO: DEBE tener ubicación general.
        // - Si es KIT: Puede estar vacía la general (porque se define por producto).
        if (!esKit && ubicacionesIds.length === 0) {
      Swal.fire({
                icon: 'warning',
                title: 'Falta Ubicación',
                text: 'Por favor selecciona al menos una ubicación para el proyecto.',
                confirmButtonColor: '#3085d6',
            });
       return;
    }

        // 3. Validación de Productos
        const productosInvalidos = productos.some(p => !p.nombre || !p.cantidad);
        if (productosInvalidos) {
Swal.fire({
                icon: 'error',
                title: 'Productos incompletos',
                text: 'Revisa los productos: todos deben tener nombre y cantidad.',
            });            return;
        }

        // 4. Validación Kit vs Unitario
        if (esKit) {
            if (productos.length < 2) {
Swal.fire({
                icon: 'error',
                title: 'Productos incompletos en Kits',
                text: 'Un Kit debe tener por lo menos 2 productos',
            });                return;
            }
        } else {
            if (productos.length > 1) {
Swal.fire({
                icon: 'error',
                title: 'Muchos productos',
                text: 'Un proyecto UNITARIO solo debe de tener 1 producto',
            });                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            // ... (resto de tu lógica de guardado igual que antes) ...
            const uploadPromises = imagenesNuevas.map(file => uploadToCloudinary(file));
            const urlsCloudinary = await Promise.all(uploadPromises);

            const formData = {
                fecha, ejecutivaId,
                // Si no eligió ubicación general (Kit), mandamos null o la primera que haya
                ubicacionId: ubicacionesIds.length > 0 ? ubicacionesIds[0] : null,
                nombreProyecto, nombreEmpresa, motivo, innovador, esKit, nombreKit, estadoId
            };

            if (proyectoEditar) {
                await updateProyecto(proyectoEditar.id, formData, productos, urlsCloudinary, idsFotosAEliminar);
            } else {
                await createProyecto(formData, productos, urlsCloudinary);
            }

            onSuccess();
            handleClose();

            Swal.fire({
                icon: 'success',
                title: '¡Excelente!',
                text: proyectoEditar ? 'El proyecto se actualizó correctamente.' : 'El proyecto ha sido creado con éxito.',
                timer: 2000, 
                showConfirmButton: false
            });
        } catch (err: any) {
            console.error(err);
Swal.fire({
                icon: 'error',
                title: 'Ocurrió un error',
                text: 'No se pudo guardar el proyecto. Intenta de nuevo.',
            });        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setFecha(new Date().toISOString().split('T')[0]);
        setEjecutivaId('');
        setUbicacionesIds([]); // <--- Limpiar array
        setNombreProyecto(''); setNombreEmpresa('');
        setMotivo(''); setInnovador('');
        setEsKit(false); setNombreKit('');
        setProductos([{ nombre: '', cantidad: '', ubicacionId: "" }]);
        setImagenesExistentes([]);
        setIdsFotosAEliminar([]);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold text-secondary">
                    {proyectoEditar ? '✏️ Editar Proyecto' : '✨ Nuevo Proyecto'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form>
                    {/* ZONA JEFA */}
                    {esJefa && proyectoEditar && (
                        <Alert variant="warning" className="d-flex align-items-center justify-content-between py-2">
                            <strong className="text-dark">👑 Panel de Control (Jefa):</strong>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Estado:</span>
                                <Form.Select
                                    size="sm"
                                    style={{ width: '200px', fontWeight: 'bold' }}
                                    value={estadoId}
                                    onChange={(e) => setEstadoId(e.target.value)}
                                >
                                    {listaEstados.map(est => (
                                        <option key={est.id} value={est.id}>{est.nombre}</option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Alert>
                    )}

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label>Fecha *</Form.Label>
                            <Form.Control type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
                        </Col>
                        <Col md={8}>
                            <Form.Label>Ejecutiva *</Form.Label>
                            <Form.Select value={ejecutivaId} onChange={e => setEjecutivaId(e.target.value)}>
                                <option value="">Seleccione...</option>
                                {listaEjecutivas.map(e => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
                            </Form.Select>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Nombre Proyecto *</Form.Label>
                            <Form.Control placeholder="Ej: Campaña Escolar" value={nombreProyecto} onChange={e => setNombreProyecto(e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Empresa *</Form.Label>
                            <Form.Control placeholder="Ej: BCP" value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} />
                        </Col>
                    </Row>

                    {/* SWITCH KIT */}
                    <div className="p-3 mb-3 rounded border">
                        <Form.Check
                            type="switch" label="¿Es un KIT?" checked={esKit}
                            onChange={(e) => setEsKit(e.target.checked)}
                            className="fw-bold text-corporate mb-2"
                        />
                        {esKit && (
                            <Form.Control placeholder="Nombre del Kit" value={nombreKit} onChange={e => setNombreKit(e.target.value)} />
                        )}
                    </div>

                    <Form.Label className="fw-bold">Productos *</Form.Label>
                    <Table size="sm" bordered>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th style={{ width: '100px' }}>Cant.</th>
                                {esKit && <th style={{ width: '200px' }}>Ubicación Exacta</th>}
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.map((prod, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <Form.Control size="sm" placeholder="Nombre..." value={prod.nombre} onChange={e => updateProducto(idx, 'nombre', e.target.value)} />
                                    </td>
                                    <td>
                                        <Form.Control size="sm" type="number" min="1" placeholder="0" value={prod.cantidad} onChange={e => updateProducto(idx, 'cantidad', e.target.value)}
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                        />
                                    </td>

                                    {/* 👇 ¡ESTO ES LO QUE TE FALTA! AGREGALO AQUÍ 👇 */}
                                    {esKit && (
                                        <td>
                                            <Form.Select
                                                size="sm"
                                                value={prod.ubicacionId || ''}
                                                onChange={e => updateProducto(idx, 'ubicacionId', e.target.value)}
                                            >
                                                <option value="">-- Igual al Proyecto --</option>
                                                {listaUbicaciones.map(u => (
                                                    <option key={u.id} value={u.id}>{u.nombre}</option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                    )}
                                    {/* 👆 FIN DE LO QUE FALTA 👆 */}

                                    <td className="text-center">
                                        {productos.length > 1 && (
                                            <Button variant="outline-danger" size="sm" onClick={() => removeProductoRow(idx)}>🗑️</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {esKit && <Button variant="link" size="sm" onClick={addProductoRow}>+ Agregar producto</Button>}

                    <hr />

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Motivo de Compra</Form.Label>
                            <Form.Control as="textarea" rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label>¿Por qué innovador?</Form.Label>
                            <Form.Control as="textarea" rows={2} value={innovador} onChange={e => setInnovador(e.target.value)} />
                        </Col>
                    </Row>

                    <Row>
                        {!esKit && (
                            <Col md={12} className="mb-3">
                                <Form.Label>Ubicación(es) *</Form.Label>
                                <Dropdown autoClose="outside">
                                    <Dropdown.Toggle
                                        variant=""
                                        className="w-100 text-start d-flex justify-content-between align-items-center custom-dropdown-toggle bg-light"
                                    >
                                        {ubicacionesIds.length === 0
                                            ? 'Seleccione Ubicaciones...'
                                            : `${ubicacionesIds.length} seleccionadas`}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="w-100 p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {listaUbicaciones.map(u => (
                                            <Form.Check
                                                key={u.id}
                                                type="checkbox"
                                                id={`ubi-modal-${u.id}`}
                                                label={u.nombre}
                                                checked={ubicacionesIds.includes(u.id.toString())}
                                                onChange={() => toggleUbicacion(u.id.toString())}
                                                className="mb-2"
                                            />
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        )}
                        <Col md={12}>
                            <Form.Label className="fw-bold">Gestión de Imágenes</Form.Label>
                            {/* FOTOS EXISTENTES */}
                            {imagenesExistentes.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-3 p-2 border rounded">
                                    {imagenesExistentes.map(img => (
                                        <div key={img.id} className="position-relative text-center" style={{ width: '100px' }}>
                                            <Image src={img.imagen_url} alt="foto" thumbnail style={{ height: '80px', objectFit: 'cover' }} />
                                            <Button
                                                variant="danger" size="sm"
                                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                                                onClick={() => handleMarcarEliminar(img.id)}
                                                style={{ zIndex: 5 }}
                                            >X</Button>
                                            <small className="d-block text-truncate" style={{ fontSize: '0.7rem' }}>Existente</small>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SUBIR NUEVAS */}
                            <Form.Control
                                type="file" multiple accept="image/*"
                                onChange={(e: any) => {
                                    if (e.target.files) setImagenesNuevas(prev => [...prev, ...Array.from(e.target.files) as File[]]);
                                }}
                            />

                            {imagenesNuevas.length > 0 && (
                                <div className="mt-2">
                                    {imagenesNuevas.map((file, idx) => (
                                        <Badge key={idx} bg="info" className="me-1 text-dark">
                                            {file.name} <span style={{ cursor: 'pointer' }} onClick={() => setImagenesNuevas(imagenesNuevas.filter((_, i) => i !== idx))}>✖</span>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button className="btn-corporate" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : (proyectoEditar ? 'Guardar Cambios' : 'Crear Proyecto')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}