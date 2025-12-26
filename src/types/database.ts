// 1. Tablas Hijas
export interface DetalleProducto {
  id: number;
  nombre_producto: string;
  cantidad: number;
}

export interface GaleriaProyecto {
  id: number;
  imagen_url: string;
  nombre_archivo: string;
}

// 2. Tablas Maestras (AQUÍ ESTABA EL ERROR, FALTABAN LOS ID)
export interface Ejecutiva { 
  id: number;              // <--- Agregado
  nombre_completo: string; 
  activo: boolean; // <--- ¡Esto faltaba!
}

export interface Estado { 
  id: number;              // <--- Agregado
  nombre: string; 
  activo: boolean; // <--- ¡Esto faltaba!
}

export interface Ubicacion { 
  id: number;              // <--- Agregado
  nombre: string; 
  activo: boolean; // <--- ¡Esto faltaba!
}

// 3. El Proyecto
export interface Proyecto {
  id: number;
  fecha_mes_anio: string;
  
  // Nombres y Textos
  nombre_proyecto: string;
  nombre_empresa: string;
  motivo_compra: string;   
  innovador: string;       
  
  // Lógica Kit
  es_kit: boolean;
  nombre_kit?: string;

  // Relaciones
  ejecutiva_id: number;
  ubicacion_id: number;
  estado_id: number;

  ejecutiva?: Ejecutiva;
  estado?: Estado;
  ubicacion?: Ubicacion;
  
  // Listas
  tb_detalle_productos?: DetalleProducto[];
  tb_galeria_proyectos?: GaleriaProyecto[];
}