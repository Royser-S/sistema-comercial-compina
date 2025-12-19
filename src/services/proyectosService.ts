import { supabase } from '@/lib/supabase';
import { Proyecto } from '@/types/database';

export const getProyectos = async (): Promise<Proyecto[]> => {
  const { data, error } = await supabase
    .from('tb_proyectos')
    .select(`
      *,
      ejecutiva:ejecutiva_id ( nombre_completo ),
      estado:estado_id ( nombre ),
      ubicacion:ubicacion_id ( nombre ),
      tb_detalle_productos ( nombre_producto, cantidad ),
      tb_galeria_proyectos ( imagen_url )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as any) || [];
};