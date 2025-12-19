import { supabase } from '@/lib/supabase';
import { Ejecutiva, Ubicacion, Estado } from '@/types/database';

// Función para obtener todas las ejecutivas activas
export const getEjecutivas = async (): Promise<Ejecutiva[]> => {
  const { data, error } = await supabase
    .from('tb_maestro_ejecutivas')
    .select('*')
    .eq('activo', true) // Solo las activas
    .order('nombre_completo', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Función para obtener ubicaciones
export const getUbicaciones = async (): Promise<Ubicacion[]> => {
  const { data, error } = await supabase
    .from('tb_maestro_ubicaciones')
    .select('*')
    .eq('activo', true);

  if (error) throw error;
  return data || [];
};