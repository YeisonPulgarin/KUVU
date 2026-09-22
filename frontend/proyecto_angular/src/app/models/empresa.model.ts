export interface Empresa {
  id: number;
  nombre: string;
  subdominio: string;
  color_primario: string;
  color_secundario: string;
  color_texto: string;
  logo_url: string;
  slogan: string;
  activo: boolean;
  created_at?: string;
}