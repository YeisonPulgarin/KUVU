import type { Service } from './types';

export const services: readonly Service[] = [
  {
    title: 'Gestión de locales',
    description:
      'Registro y administración de propiedades comerciales y residenciales de todas tus compañías.',
    icon: 'building'
  },
  {
    title: 'Contratos',
    description:
      'Armado, seguimiento y renovación de contratos de arriendo con fechas y estados claros.',
    icon: 'file'
  },
  {
    title: 'Pagos',
    description:
      'Registro de pagos de arriendos y servicios, con control de mora y soportes asociados.',
    icon: 'card'
  },
  {
    title: 'Mantenimientos',
    description:
      'Solicitudes y seguimiento de mantenimientos por propiedad, con historial por unidad.',
    icon: 'wrench'
  },
  {
    title: 'Usuarios',
    description:
      'Perfiles y permisos por compañía: cada empresa administra su equipo y sus datos.',
    icon: 'users'
  }
];