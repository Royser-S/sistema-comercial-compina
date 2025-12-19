import { supabase } from '@/lib/supabase';

export const loginUser = async (email: string, pass: string) => {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No se pudo obtener el usuario');

  const { data: roleData, error: roleError } = await supabase
    .from('tb_usuarios_roles')
    .select('rol')
    .eq('email', email)
    .single();

  if (roleError || !roleData) {
    throw new Error('El usuario no tiene un rol asignado en el sistema.');
  }

  return {
    user: authData.user,
    rol: roleData.rol 
  };
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};