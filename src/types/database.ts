// Define la estructura de una Ejecutiva
export interface Ejecutiva {
  id: number;
  nombre_completo: string;
  activo: boolean;
}

// Define la estructura de un Estado
export interface Estado {
  id: number;
  nombre: string;
}

// Define la estructura de una Ubicación
export interface Ubicacion {
  id: number;
  nombre: string;
}

// Define la estructura principal del Proyecto (La Cotización)
export interface Proyecto {
  id: number;
  fecha_mes_anio: string; // Se guardará como YYYY-MM-DD
  ejecutiva_id: number;
  nombre_proyecto: string;
  nombre_empresa: string;
  es_kit: boolean;
  nombre_kit?: string; // El ? significa que es opcional
  motivo_compra: string;
  innovador: string;
  estado_id: number;
  ubicacion_id: number;
  // Estos campos vienen de las relaciones (Join)
  ejecutiva?: Ejecutiva;
  estado?: Estado;
  ubicacion?: Ubicacion;
}