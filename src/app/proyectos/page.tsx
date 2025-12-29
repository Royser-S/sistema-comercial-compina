'use client';

import { useEffect, useState } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import { supabase } from '@/lib/supabase'; // <--- Agregar
// Servicios y Tipos

import { getProyectos } from '@/services/proyectosService';
import { getEjecutivas, getUbicaciones, getEstados } from '@/services/maestrosService';
import { Proyecto, Ejecutiva, Ubicacion } from '@/types/database';
// Componentes
import TopNavbar from '@/components/TopNavbar';
import ProjectFilters from '@/components/proyectos/ProjectFilters'; // <--- Nuevo
import ProjectTable from '@/components/proyectos/ProjectTable';     // <--- Nuevo
import ProjectModal from '@/components/proyectos/ProjectModal';
import ImageViewerModal from '@/components/proyectos/ImageViewerModal';

export default function ProyectosPage() {
  // 1. ESTADOS DE DATOS
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [listaEjecutivas, setListaEjecutivas] = useState<Ejecutiva[]>([]);
  const [listaUbicaciones, setListaUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Proyecto | null>(null);
  // ... otros estados ...
  const [rolUsuario, setRolUsuario] = useState(''); // <--- NUEVO: Para saber si es Jefa
  const [listaEstados, setListaEstados] = useState<any[]>([]); // <--- NUEVO: Lista de estados

  // 2. ESTADOS DE FILTROS
  const [filtros, setFiltros] = useState({
    ejecutiva: '', fecha: '', ubicaciones: [] as string[], tipo: '',estado: '',
    proyecto: '', empresa: '', producto: '', nombreKit: ''  
  });

  // 3. ESTADOS DE MODALES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);

  // 4. CARGA INICIAL
  useEffect(() => {
    cargarDatosCompletos();
  }, []);

  const cargarDatosCompletos = async () => {
    setLoading(true);
    try {
      // 1. Averiguar quién soy
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: rolData } = await supabase.from('tb_usuarios_roles').select('rol').eq('email', user.email).single();
        if (rolData) setRolUsuario(rolData.rol.toUpperCase()); // "JEFA", "EJECUTIVA", etc.
      }

      // 2. Cargar datos (Agregamos getEstados)
      const [proys, ejes, ubis, estados] = await Promise.all([
        getProyectos(),
        getEjecutivas(),
        getUbicaciones(),
        getEstados() // <--- Nuevo
      ]);

      setProyectos(proys);
      setListaEjecutivas(ejes);
      setListaUbicaciones(ubis);
      setListaEstados(estados); // <--- Guardamos estados

    } catch (err) {
      // ... (igual que antes)
    } finally {
      setLoading(false);
    }
  };
// 5. LÓGICA DE FILTRADO MEJORADA
  const proyectosFiltrados = proyectos.filter((p) => {
    // Filtro Ejecutiva
    if (filtros.ejecutiva && p.ejecutiva_id.toString() !== filtros.ejecutiva) return false;
    
    // Filtro Ubicación (MULTIPLE) 
    // Si hay ubicaciones seleccionadas, verificamos si la del proyecto está en la lista
    if (filtros.ubicaciones.length > 0 && !filtros.ubicaciones.includes(p.ubicacion_id.toString())) return false;

    // Filtro Tipo
    if (filtros.tipo === 'kit' && !p.es_kit) return false;
    if (filtros.tipo === 'unitario' && p.es_kit) return false;

    // --- NUEVO: FILTRO POR ESTADO ---
    if (filtros.estado && p.estado_id.toString() !== filtros.estado) return false;
    // --------------------------------

    // Búsquedas Texto
    if (filtros.proyecto && !p.nombre_proyecto.toLowerCase().includes(filtros.proyecto.toLowerCase())) return false;
    if (filtros.empresa && !p.nombre_empresa.toLowerCase().includes(filtros.empresa.toLowerCase())) return false;
    if (filtros.fecha && !p.fecha_mes_anio.includes(filtros.fecha)) return false;

    // Filtro Productos
    if (filtros.producto) {
      const termino = filtros.producto.toLowerCase();
      const tieneProducto = p.tb_detalle_productos?.some(prod => prod.nombre_producto.toLowerCase().includes(termino));
      if (!tieneProducto) return false;
    }

    // NUEVO: Filtro Nombre Kit
    if (filtros.nombreKit) {
      // Si el usuario busca un kit, pero el proyecto NO es kit, lo descartamos
      if (!p.es_kit) return false;
      // Si es kit, validamos el nombre (evitando nulos)
      const nombreK = p.nombre_kit?.toLowerCase() || '';
      if (!nombreK.includes(filtros.nombreKit.toLowerCase())) return false;
    }

    return true;
  });

  // Manejadores
  const handleFilterChange = (campo: string, valor: string) => setFiltros(prev => ({ ...prev, [campo]: valor }));

  // NUEVO: Manejador Especial para Multi-Select de Ubicaciones
  const toggleUbicacion = (idUbicacion: string) => {
    setFiltros(prev => {
        const existe = prev.ubicaciones.includes(idUbicacion);
        if (existe) {
            // Si ya está, lo quitamos
            return { ...prev, ubicaciones: prev.ubicaciones.filter(id => id !== idUbicacion) };
        } else {
            // Si no está, lo agregamos
            return { ...prev, ubicaciones: [...prev.ubicaciones, idUbicacion] };
        }
    });
  };


const limpiarFiltros = () => setFiltros({
    ejecutiva: '', fecha: '', ubicaciones: [], tipo: '', estado: '', proyecto: '', empresa: '', producto: '', nombreKit: ''
  });

  const handleOpenGallery = (proyecto: Proyecto) => {
    setSelectedProject(proyecto);
    setShowGalleryModal(true);
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="warning" /></Container>;

  const handleEditProject = (proyecto: Proyecto) => {
    setProjectToEdit(proyecto); // Guardamos el proyecto que queremos editar
    setShowCreateModal(true);   // Abrimos el mismo modal de siempre
  };

  // Función para cambiar estado desde la tabla (JEFA)
  const handleQuickStateChange = async (idProyecto: number, idNuevoEstado: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('tb_proyectos')
        .update({ estado_id: parseInt(idNuevoEstado) })
        .eq('id', idProyecto);

      if (error) throw error;
      
      // Recargamos los datos para ver el cambio (badge verde/rojo)
      await cargarDatosCompletos();
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el estado.');
      setLoading(false);
    }
  };

  return (
<div className="min-vh-100">      
  <TopNavbar />

      <Container fluid className="pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold text-secondary">Listado de Cotizaciones</h2>
          <Button className="btn-corporate btn-lg" onClick={() => setShowCreateModal(true)}>
            + Nuevo Proyecto
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* COMPONENTE DE FILTROS */}
        <ProjectFilters
          filtros={filtros}
          onChange={handleFilterChange}
          onToggleUbicacion={toggleUbicacion} // <--- NUEVA PROP
          onClean={limpiarFiltros}
          listaEjecutivas={listaEjecutivas}
          listaUbicaciones={listaUbicaciones}
          listaEstados={listaEstados} // <--- 3. PASAMOS LA LISTA DE ESTADOS
        />

        {/* COMPONENTE DE TABLA */}
        <ProjectTable
          proyectos={proyectosFiltrados}
          onOpenGallery={handleOpenGallery}
          onEdit={handleEditProject}

          // --- NUEVAS PROPIEDADES ---
          esJefa={rolUsuario === 'JEFA'}
          listaEstados={listaEstados}
          onStateChange={handleQuickStateChange}
        />

        {/* MODALES OCULTOS */}
        <ProjectModal
          show={showCreateModal}
          handleClose={() => {
            setShowCreateModal(false);
            setProjectToEdit(null); // Importante: Limpiamos al cerrar para que el próximo sea nuevo
          }}
          onSuccess={() => cargarDatosCompletos()}
          proyectoEditar={projectToEdit}

          // --- NUEVAS PROPS ---
          esJefa={rolUsuario === 'JEFA'}
          listaEstados={listaEstados}

        />

        {selectedProject && (
          <ImageViewerModal
            show={showGalleryModal}
            handleClose={() => setShowGalleryModal(false)}
            imagenes={selectedProject.tb_galeria_proyectos || []}
            projectName={selectedProject.nombre_proyecto}
          />
        )}
      </Container>
    </div>
  );
}