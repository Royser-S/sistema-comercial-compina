import { supabase } from '@/lib/supabase';
import { Proyecto } from '@/types/database';

// --- LEER PROYECTOS ---
export const getProyectos = async (): Promise<Proyecto[]> => {
  const { data, error } = await supabase
    .from('tb_proyectos')
    .select(`
      *,
      ejecutiva:ejecutiva_id ( nombre_completo ),
      estado:estado_id ( nombre ),
      ubicacion:ubicacion_id ( nombre ),
    tb_detalle_productos ( 
        nombre_producto, 
        cantidad,
        ubicacion_id, 
        ubicacion:ubicacion_id ( nombre ) 
      ),
      tb_galeria_proyectos ( id, imagen_url, nombre_archivo ) 



    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as any) || [];
};

// --- CREAR PROYECTO (ADAPTADO CLOUDINARY) ---
// Nota: 'imagenesUrls' ahora recibe un array de textos (links), no archivos
export const createProyecto = async (formData: any, productos: any[], imagenesUrls: string[]) => {
  
  // 1. Insertar Proyecto
  const { data: proyectoData, error: projError } = await supabase
    .from('tb_proyectos')
    .insert({
      fecha_mes_anio: formData.fecha,
      ejecutiva_id: formData.ejecutivaId,
      nombre_proyecto: formData.nombreProyecto,
      nombre_empresa: formData.nombreEmpresa,
      es_kit: formData.esKit,
      nombre_kit: formData.esKit ? formData.nombreKit : null,
      motivo_compra: formData.motivo,
      innovador: formData.innovador,
      ubicacion_id: formData.ubicacionId,
      estado_id: formData.estadoId || 1, 
    })
    .select()
    .single();

  if (projError) throw projError;
  const proyectoId = proyectoData.id;

  // 2. Insertar Productos
  await insertProductos(proyectoId, productos);

  // 3. Insertar Links de Fotos (Nueva Lógica)
  await insertFotosCloudinary(proyectoId, imagenesUrls);

  return true;
};

export const deleteProyecto = async (id: number) => {
  // 1. Borrar los items de la galería (Las fotos referenciadas)
  const { error: errorGaleria } = await supabase.from('tb_galeria_proyectos').delete().eq('proyecto_id', id);
  if (errorGaleria) throw errorGaleria;

  // 2. Borrar los productos asociados
  const { error: errorProd } = await supabase.from('tb_detalle_productos').delete().eq('proyecto_id', id);
  if (errorProd) throw errorProd;

  // 3. Finalmente borrar el proyecto principal
  const { error } = await supabase.from('tb_proyectos').delete().eq('id', id);
  if (error) throw error;

  return true;
};

// --- ACTUALIZAR PROYECTO (ADAPTADO CLOUDINARY) ---
export const updateProyecto = async (
  id: number, 
  formData: any, 
  productos: any[], 
  newImagesUrls: string[], // <-- Recibe links nuevos
  idsFotosAEliminar: number[]
) => {
  try {
    // 1. Actualizar Datos Principales
    const { error: projError } = await supabase
      .from('tb_proyectos')
      .update({
        fecha_mes_anio: formData.fecha,
        ejecutiva_id: formData.ejecutivaId,
        nombre_proyecto: formData.nombreProyecto,
        nombre_empresa: formData.nombreEmpresa,
        es_kit: formData.esKit,
        nombre_kit: formData.esKit ? formData.nombreKit : null,
        motivo_compra: formData.motivo,
        innovador: formData.innovador,
        ubicacion_id: formData.ubicacionId,
        estado_id: formData.estadoId, 
      })
      .eq('id', id);

    if (projError) throw projError;

    // 2. Actualizar Productos (Borrar y Crear)
    await supabase.from('tb_detalle_productos').delete().eq('proyecto_id', id);
    await insertProductos(id, productos);

    // 3. Eliminar Fotos marcadas (Solo de la BD)
    if (idsFotosAEliminar.length > 0) {
      // Nota: Con Cloudinary Unsigned no podemos borrar el archivo físico desde el front,
      // pero borramos el registro de la BD para que ya no aparezca.
      await supabase.from('tb_galeria_proyectos').delete().in('id', idsFotosAEliminar);
    }

    // 4. Insertar Nuevas Fotos (Links)
    await insertFotosCloudinary(id, newImagesUrls);

    return true;
  } catch (error) {
    console.error('Error actualizando:', error);
    throw error;
  }
};

// --- FUNCIONES AUXILIARES ---

async function insertProductos(proyectoId: number, productos: any[]) {
  const productosAInsertar = productos.map(p => ({
    proyecto_id: proyectoId,
    nombre_producto: p.nombre,
    cantidad: parseInt(p.cantidad),

    ubicacion_id: p.ubicacionId ? parseInt(p.ubicacionId) : null

  }));
  if (productosAInsertar.length > 0) {
    await supabase.from('tb_detalle_productos').insert(productosAInsertar);
  }
}

async function insertFotosCloudinary(proyectoId: number, urls: string[]) {
  if (urls.length > 0) {
    const fotosParaInsertar = urls.map(url => ({
      proyecto_id: proyectoId,
      imagen_url: url,          
      nombre_archivo: 'cloudinary_img' 
    }));
    
    await supabase.from('tb_galeria_proyectos').insert(fotosParaInsertar);
  }
}