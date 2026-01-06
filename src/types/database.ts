// 1. Tablas Hijas
export interface DetalleProducto {
  id: number;
  nombre_producto: string;
  cantidad: number;

  ubicacion_id?: number | null; 
  ubicacion?: {     
    nombre: string;
  };

}

export interface GaleriaProyecto {
  id: number;
  imagen_url: string;
  nombre_archivo: string;
}


export interface Ejecutiva { 
  id: number;              
  nombre_completo: string; 
  activo: boolean; 
}

export interface Estado { 
  id: number;             
  nombre: string; 
  activo: boolean; 
}

export interface Ubicacion { 
  id: number;             
  nombre: string; 
  activo: boolean; 
}

export interface Proyecto {
  id: number;
  fecha_mes_anio: string;
  
  nombre_proyecto: string;
  nombre_empresa: string;
  motivo_compra: string;   
  innovador: string;       
  
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