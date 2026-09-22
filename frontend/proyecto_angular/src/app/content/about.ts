import type { AboutSection, OriginSection } from './types';
import { origin } from './origin';

export const aboutSections: readonly AboutSection[] = [
  {
    title: 'Quiénes somos',
    body: 'KUVU es un sistema de administración inmobiliaria para empresas que gestionan varias compañías a la vez. Nuestra plataforma unifica la gestión de propiedades, contratos y operaciones diarias para que cada administradora trabaje desde un solo lugar, con datos centralizados y acceso por rol.'
  },
  {
    title: 'Cómo operamos',
    body: 'Trabajamos con el día a día real de la inmobiliaria: registro de locales, armado y seguimiento de contratos de arriendo, control de pagos y mora, y seguimiento de mantenimientos por propiedad. Toda esa información se centraliza en una misma base de datos, así la compañía y su equipo operan sobre una sola versión de la verdad.'
  },
  {
    title: 'Con quién trabajamos',
    body: 'Colaboramos con inmobiliarias y administradores de propiedades que manejan una o varias compañías y que hoy sostienen su operación con planillas, archivos y herramientas sueltas. Nuestro acompañamiento cubre tanto la puesta en marcha como el uso diario del sistema.'
  }
];

export const aboutOrigin: OriginSection = origin;