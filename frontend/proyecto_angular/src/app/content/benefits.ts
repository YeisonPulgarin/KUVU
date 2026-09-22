import type { BenefitRole } from './types';

export const benefitsByRole: readonly BenefitRole[] = [
  {
    role: 'Dueño o gerente',
    title: 'Vista consolidada y control',
    description:
      'Tomás decisiones con la operación de todas tus compañías en un solo lugar.',
    points: [
      'Control de pagos y mora con la información centralizada',
      'Visibilidad de locales, contratos y mantenimientos por compañía',
      'El equipo operativo trabaja sobre la misma base de datos real'
    ]
  },
  {
    role: 'Equipo operativo',
    title: 'Menos procesos manuales',
    description:
      'El día a día de la administración se hace desde un solo sistema.',
    points: [
      'Registro de pagos, mantenimientos y contratos sin planillas dispersas',
      'Acceso por rol: cada persona ve lo que necesita para su tarea',
      'Historial por propiedad para responder sin buscar entre archivos'
    ]
  }
];