import { supabase } from '@/lib/supabase';
import { Ejecutiva, Ubicacion, Estado } from '@/types/database';

// --- LEER (Con filtro opcional) ---

export const getEjecutivas = async (soloActivos: boolean = true): Promise<Ejecutiva[]> => {
  let query = supabase.from('tb_maestro_ejecutivas').select('*');
  
  if (soloActivos) {
    query = query.eq('activo', true);
  }
  
  // Ordenamos: Primero los activos, luego por nombre
  const { data } = await query.order('activo', { ascending: false }).order('nombre_completo');
  return data || [];
};

export const getUbicaciones = async (soloActivos: boolean = true): Promise<Ubicacion[]> => {
  let query = supabase.from('tb_maestro_ubicaciones').select('*');
  
  if (soloActivos) {
    query = query.eq('activo', true);
  }

  const { data } = await query.order('activo', { ascending: false }).order('nombre');
  return data || [];
};

export const getEstados = async (soloActivos: boolean = true): Promise<Estado[]> => {
  let query = supabase.from('tb_maestro_estados').select('*');
  
  if (soloActivos) {
    query = query.eq('activo', true);
  }

  const { data } = await query.order('activo', { ascending: false }).order('id');
  return data || [];
};

// --- AGREGAR ---
export const createEjecutiva = async (nombre: string) => {
  const { error } = await supabase.from('tb_maestro_ejecutivas').insert({ nombre_completo: nombre, activo: true });
  if (error) throw error;
};

export const createUbicacion = async (nombre: string) => {
  const { error } = await supabase.from('tb_maestro_ubicaciones').insert({ nombre: nombre, activo: true });
  if (error) throw error;
};

export const createEstado = async (nombre: string) => {
  const { error } = await supabase.from('tb_maestro_estados').insert({ nombre: nombre, activo: true });
  if (error) throw error;
};

// --- ELIMINAR (Desactivar) ---
export const deleteEjecutiva = async (id: number) => {
  const { error } = await supabase.from('tb_maestro_ejecutivas').update({ activo: false }).eq('id', id);
  if (error) throw error;
};
export const deleteUbicacion = async (id: number) => {
  const { error } = await supabase.from('tb_maestro_ubicaciones').update({ activo: false }).eq('id', id);
  if (error) throw error;
};
export const deleteEstado = async (id: number) => {
  const { error } = await supabase.from('tb_maestro_estados').update({ activo: false }).eq('id', id);
  if (error) throw error;
};

// --- RESTAURAR (Reactivar) - ¡NUEVO! ♻️ ---
export const restoreEjecutiva = async (id: number) => {
  const { error } = await supabase.from('tb_maestro_ejecutivas').update({ activo: true }).eq('id', id);
  if (error) throw error;
};
export const restoreUbicacion = async (id: number) => {
  const { error } = await supabase.from('tb_maestro_ubicaciones').update({ activo: true }).eq('id', id);
  if (error) throw error;
};
export const restoreEstado = async (id: number) => {
  const { error } = await supabase.from('tb_maestro_estados').update({ activo: true }).eq('id', id);
  if (error) throw error;
};