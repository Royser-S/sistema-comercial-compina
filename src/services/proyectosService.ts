import { supabase } from '@/lib/supabase';
import { Proyecto } from '@/types/database';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';

// --- LEER PROYECTOS ---
export const getProyectos = async (): Promise<Proyecto[]> => {
  const { data, error } = await supabase
    .from('tb_proyectos')
    .select(`
      *,
      ejecutiva:ejecutiva_id ( nombre_completo ),
      estado:estado_id ( nombre ),
      ubicacion:ubicacion_id ( nombre ),
      tb_detalle_productos ( nombre_producto, cantidad ),
      tb_galeria_proyectos ( id, imagen_url, nombre_archivo ) 
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as any) || [];
};

// --- CREAR PROYECTO ---
export const createProyecto = async (formData: any, productos: any[], imagenes: File[]) => {
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
      estado_id: 1, 
    })
    .select()
    .single();

  if (projError) throw projError;
  const proyectoId = proyectoData.id;

  // 2. Insertar Productos y Fotos (Usamos función auxiliar abajo)
  await insertProductos(proyectoId, productos);
  await uploadImagenes(proyectoId, imagenes);

  return true;
};

// --- ACTUALIZAR PROYECTO (NUEVO) ---
export const updateProyecto = async (
  id: number, 
  formData: any, 
  productos: any[], 
  newImages: File[], 
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
        estado_id: formData.estadoId, // <--- ¡NUEVA LÍNEA CLAVE!
      })
      .eq('id', id);

    if (projError) throw projError;

    // 2. Actualizar Productos: Borramos todos los viejos y ponemos los nuevos (más seguro)
    await supabase.from('tb_detalle_productos').delete().eq('proyecto_id', id);
    await insertProductos(id, productos);

    // 3. Eliminar Fotos marcadas para borrar
    if (idsFotosAEliminar.length > 0) {
      // Primero obtenemos los nombres de archivo para borrarlos del Storage
      const { data: fotos } = await supabase
        .from('tb_galeria_proyectos')
        .select('nombre_archivo')
        .in('id', idsFotosAEliminar);

      if (fotos && fotos.length > 0) {
        const rutas = fotos.map(f => f.nombre_archivo);
        await supabase.storage.from('muestras').remove(rutas);
      }
      
      // Luego borramos el registro de la base de datos
      await supabase.from('tb_galeria_proyectos').delete().in('id', idsFotosAEliminar);
    }

    // 4. Subir Nuevas Fotos (si las hay)
    await uploadImagenes(id, newImages);

    return true;
  } catch (error) {
    console.error('Error actualizando:', error);
    throw error;
  }
};

// --- FUNCIONES AUXILIARES (Para no repetir código) ---
async function insertProductos(proyectoId: number, productos: any[]) {
  const productosAInsertar = productos.map(p => ({
    proyecto_id: proyectoId,
    nombre_producto: p.nombre, // Asegúrate que en tu front mandes 'nombre'
    cantidad: parseInt(p.cantidad)
  }));
  if (productosAInsertar.length > 0) {
    await supabase.from('tb_detalle_productos').insert(productosAInsertar);
  }
}

async function uploadImagenes(proyectoId: number, imagenes: File[]) {
  if (imagenes.length > 0) {
    for (const imgFile of imagenes) {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1200 };
      const compressedFile = await imageCompression(imgFile, options);
      const fileName = `${proyectoId}/${uuidv4()}-${imgFile.name}`;
      
      await supabase.storage.from('muestras').upload(fileName, compressedFile);
      const { data } = supabase.storage.from('muestras').getPublicUrl(fileName);
      
      await supabase.from('tb_galeria_proyectos').insert({
        proyecto_id: proyectoId,
        imagen_url: data.publicUrl,
        nombre_archivo: fileName
      });
    }
  }
}