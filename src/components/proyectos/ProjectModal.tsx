'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table, Spinner, Alert, Image, Badge } from 'react-bootstrap';
import { getEjecutivas, getUbicaciones } from '@/services/maestrosService';
import { createProyecto, updateProyecto } from '@/services/proyectosService';
import { Ejecutiva, Ubicacion, Proyecto, GaleriaProyecto } from '@/types/database';

interface Props {
    show: boolean;
    handleClose: () => void;
    onSuccess: () => void;
    proyectoEditar?: Proyecto | null; // <--- NUEVA PROPIEDAD
    esJefa: boolean;        // <--- NUEVO
    listaEstados: any[];    // <--- NUEVO
}

export default function ProjectModal({ show, handleClose, onSuccess, proyectoEditar, esJefa, listaEstados }: Props) {
    // Maestros
    const [listaEjecutivas, setListaEjecutivas] = useState<Ejecutiva[]>([]);
    const [listaUbicaciones, setListaUbicaciones] = useState<Ubicacion[]>([]);
    const [estadoId, setEstadoId] = useState('1'); // Por defecto 1 (En Proceso)
    // Estado UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Campos Formulario
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [ejecutivaId, setEjecutivaId] = useState('');
    const [ubicacionId, setUbicacionId] = useState('');
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [nombreEmpresa, setNombreEmpresa] = useState('');
    const [motivo, setMotivo] = useState('');
    const [innovador, setInnovador] = useState('');

    // Kit
    const [esKit, setEsKit] = useState(false);
    const [nombreKit, setNombreKit] = useState('');

    // Productos
    const [productos, setProductos] = useState([{ nombre: '', cantidad: '' }]);

    // Imágenes Nuevas (File) y Existentes (BD)
    const [imagenesNuevas, setImagenesNuevas] = useState<File[]>([]);
    const [imagenesExistentes, setImagenesExistentes] = useState<GaleriaProyecto[]>([]);
    const [idsFotosAEliminar, setIdsFotosAEliminar] = useState<number[]>([]);

    // 1. Cargar Maestros al inicio
    useEffect(() => {
        async function loadMaestros() {
            const ejs = await getEjecutivas();
            const ubs = await getUbicaciones();
            setListaEjecutivas(ejs);
            setListaUbicaciones(ubs);
        }
        loadMaestros();
    }, []);

    // 2. DETECTAR SI ES EDICIÓN: Rellenar datos
    useEffect(() => {
        if (proyectoEditar) {
            // Estamos editando
            setFecha(proyectoEditar.fecha_mes_anio);
            setEjecutivaId(proyectoEditar.ejecutiva_id.toString());
            setUbicacionId(proyectoEditar.ubicacion_id.toString());
            setNombreProyecto(proyectoEditar.nombre_proyecto);
            setNombreEmpresa(proyectoEditar.nombre_empresa);
            setMotivo(proyectoEditar.motivo_compra || '');
            setInnovador(proyectoEditar.innovador || '');
            setEsKit(proyectoEditar.es_kit);
            setNombreKit(proyectoEditar.nombre_kit || '');
            setEstadoId(proyectoEditar.estado_id.toString()); // <--- Cargar estado actual

            // Productos: Mapeamos para que coincida con el formato del state
            if (proyectoEditar.tb_detalle_productos && proyectoEditar.tb_detalle_productos.length > 0) {
                setProductos(proyectoEditar.tb_detalle_productos.map(p => ({
                    nombre: p.nombre_producto,
                    cantidad: p.cantidad.toString()
                })));
            } else {
                setProductos([{ nombre: '', cantidad: '' }]);
            }

            // Fotos Existentes
            setImagenesExistentes(proyectoEditar.tb_galeria_proyectos || []);
            setIdsFotosAEliminar([]); // Resetear lista de borrar
        } else {
            // Estamos creando (Limpiar todo)
            limpiarFormulario();
        }
        setImagenesNuevas([]); // Siempre limpiar las nuevas al abrir/cambiar
        setError(null);
    }, [proyectoEditar, show]);

    // Lógica Productos
    const addProductoRow = () => setProductos([...productos, { nombre: '', cantidad: '' }]);

    const removeProductoRow = (index: number) => {
        const nuevos = [...productos];
        nuevos.splice(index, 1);
        setProductos(nuevos);
    };

    const updateProducto = (index: number, field: 'nombre' | 'cantidad', value: string) => {
        if (field === 'cantidad') {
            if (value === '') { /* permitir vacio temporal */ }
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

    // Lógica Fotos
    const handleMarcarEliminar = (idFoto: number) => {
        // Agregamos a la lista negra
        setIdsFotosAEliminar([...idsFotosAEliminar, idFoto]);
        // Lo quitamos de la vista actual
        setImagenesExistentes(imagenesExistentes.filter(img => img.id !== idFoto));
    };

    // GUARDAR
    const handleSubmit = async () => {
        if (!ejecutivaId || !nombreProyecto || !nombreEmpresa || !ubicacionId) {
            setError('Por favor completa los campos obligatorios (*)');
            return;
        }

        // Validar productos vacíos
        const productosInvalidos = productos.some(p => !p.nombre || !p.cantidad);
        if (productosInvalidos) {
            setError('Revisa los productos: todos deben tener nombre y cantidad.');
            return;
        }

        // 3. VALIDACIÓN KIT (NUEVO) 🔒
        // 3. VALIDACIÓN DE LÓGICA KIT vs UNITARIO (El Candado Doble) 🔒
        if (esKit) {
            // CASO A: Es Kit pero tiene muy pocos productos
            if (productos.length < 2) {
                setError('Un KIT debe tener al menos 2 productos. Agrega más o desmarca la opción "Es un KIT".');
                return;
            }
        } else {
            // CASO B: Es Unitario pero tiene demasiados productos (Tu bug XD)
            if (productos.length > 1) {
                setError('Un proyecto UNITARIO solo puede tener 1 producto. Elimina los sobrantes o marca "Es un KIT".');
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const formData = {
                fecha, ejecutivaId, ubicacionId, nombreProyecto, nombreEmpresa,
                motivo, innovador, esKit, nombreKit,
                estadoId // <--- Enviar estado
            };

            if (proyectoEditar) {
                // MODO EDICIÓN
                await updateProyecto(proyectoEditar.id, formData, productos, imagenesNuevas, idsFotosAEliminar);
            } else {
                // MODO CREACIÓN
                await createProyecto(formData, productos, imagenesNuevas);
            }

            onSuccess();
            handleClose();
        } catch (err: any) {
            console.error(err);
            setError('Error al guardar. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setFecha(new Date().toISOString().split('T')[0]);
        setEjecutivaId(''); setUbicacionId('');
        setNombreProyecto(''); setNombreEmpresa('');
        setMotivo(''); setInnovador('');
        setEsKit(false); setNombreKit('');
        setProductos([{ nombre: '', cantidad: '' }]);
        setImagenesExistentes([]);
        setIdsFotosAEliminar([]);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton className="">
                <Modal.Title className="fw-bold text-secondary">
                    {proyectoEditar ? '✏️ Editar Proyecto' : '✨ Nuevo Proyecto'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form>

                    {/* --- ZONA EXCLUSIVA JEFA --- */}
                    {esJefa && proyectoEditar && (
                        <Alert variant="warning" className="d-flex align-items-center justify-content-between py-2">
                            <strong className="text-dark">👑 Panel de Control (Jefa):</strong>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted small">Estado del Proyecto:</span>
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

                    {/* FECHA Y EJECUTIVA */}
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

                    {/* DATOS PROYECTO */}
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

                    {/* KIT SWITCH */}
                    <div className="p-3 mb-3  rounded border">
                        <Form.Check
                            type="switch" label="¿Es un KIT?" checked={esKit}
                            onChange={(e) => setEsKit(e.target.checked)}
                            className="fw-bold text-corporate mb-2"
                        />
                        {esKit && (
                            <Form.Control placeholder="Nombre del Kit" value={nombreKit} onChange={e => setNombreKit(e.target.value)} />
                        )}
                    </div>

                    {/* PRODUCTOS */}
                    <Form.Label className="fw-bold">Productos *</Form.Label>
                    <Table size="sm" bordered>
                        <thead className="">
                            <tr>
                                <th>Producto</th>
                                <th style={{ width: '100px' }}>Cant.</th>
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

                    {/* TEXTOS LARGOS */}
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Motivo Compra</Form.Label>
                            <Form.Control as="textarea" rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} />
                        </Col>
                        <Col md={6}>
                            <Form.Label>¿Por qué innovador?</Form.Label>
                            <Form.Control as="textarea" rows={2} value={innovador} onChange={e => setInnovador(e.target.value)} />
                        </Col>
                    </Row>

                    {/* FOTOS Y UBICACION */}
                    <Row>
                        <Col md={12}>
                            <Form.Label>Ubicación *</Form.Label>
                            <Form.Select value={ubicacionId} onChange={e => setUbicacionId(e.target.value)} className="mb-3">
                                <option value="">Seleccione...</option>
                                {listaUbicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                            </Form.Select>
                        </Col>

                        <Col md={12}>
                            <Form.Label className="fw-bold">Gestión de Imágenes</Form.Label>

                            {/* 1. FOTOS EXISTENTES (Solo modo edición) */}
                            {imagenesExistentes.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mb-3 p-2 border rounded ">
                                    {imagenesExistentes.map(img => (
                                        <div key={img.id} className="position-relative text-center" style={{ width: '100px' }}>
                                            <Image src={img.imagen_url} alt="foto" thumbnail style={{ height: '80px', objectFit: 'cover' }} />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                                                onClick={() => handleMarcarEliminar(img.id)}
                                                style={{ zIndex: 5 }}
                                            >
                                                X
                                            </Button>
                                            <small className="d-block text-truncate" style={{ fontSize: '0.7rem' }}>Existente</small>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 2. SUBIR NUEVAS */}
                            <Form.Control
                                type="file" multiple accept="image/*"
                                onChange={(e: any) => {
                                    if (e.target.files) setImagenesNuevas(prev => [...prev, ...Array.from(e.target.files) as File[]]);
                                }}
                            />

                            {/* Lista de Nuevas */}
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