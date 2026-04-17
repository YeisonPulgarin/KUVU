export interface Rol {
  idRol: number;
  empresa_id: number;
  nombreRol: string;
}

export interface Usuario {
  idUsuario: number;
  empresa_id: number;
  nombre: string;
  documento: string;
  telefono?: string;
  correo?: string;
  idRol: number;
  nombreRol?: string;
}

export interface Local {
  idLocal: number;
  empresa_id: number;
  direccion: string;
  area?: number;
  valorArriendo?: number;
  idAdministrador: number;
  nombreAdministrador?: string;
  estado?: 'disponible' | 'ocupado' | 'mantenimiento';
}

export interface ContratoArrendamiento {
  idContrato: number;
  empresa_id: number;
  fechaInicio: string;
  fechaFin: string;
  condiciones?: string;
  idLocal: number;
  idArrendatario: number;
  idAdministrador: number;
  direccionLocal?: string;
  nombreArrendatario?: string;
  nombreAdministrador?: string;
}

export interface Mantenimiento {
  idMantenimiento: number;
  empresa_id: number;
  idLocal: number;
  idArrendatario: number;
  tipoMantenimiento: string;
  descripcion: string;
  prioridad: 'baja' | 'normal' | 'urgente';
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  idAdministrador: number;
  fecha_creacion?: string;
  direccionLocal?: string;
  nombreArrendatario?: string;
}

export interface PagoVariado {
  idPagoVariado: number;
  empresa_id: number;
  fechaPago: string;
  monto: number;
  tipo: 'Arriendo' | 'Multa' | 'Otro';
  descripcion?: string;
  metodoPago: string;
  idArrendatario: number;
  idAdministrador: number;
  idLocal: number;
  idContrato?: number;
  fecha_creacion?: string;
  nombreArrendatario?: string;
  direccionLocal?: string;
}