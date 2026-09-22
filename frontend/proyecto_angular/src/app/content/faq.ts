import type { FaqGroup, FaqItem } from './types';

export const faqGroups: readonly FaqGroup[] = [
  {
    group: 'Sobre KUVU',
    items: [
      {
        q: '¿Qué es KUVU?',
        a: 'KUVU es un sistema de administración inmobiliaria que unifica la gestión de propiedades, contratos, pagos, mantenimientos y usuarios de una o varias compañías en una sola plataforma.'
      },
      {
        q: '¿Para quién es KUVU?',
        a: 'Para inmobiliarias y administradores de propiedades que manejan una o varias compañías y que hoy gestionan su operación con planillas y herramientas sueltas.'
      }
    ]
  },
  {
    group: 'Cómo funciona',
    items: [
      {
        q: '¿Qué necesito para empezar?',
        a: 'Crear la empresa administradora en la plataforma, configurar los roles del equipo y cargar los locales y contratos. Desde ahí, el día a día se opera en el mismo sistema.'
      },
      {
        q: '¿KUVU reemplaza las planillas?',
        a: 'Sí. Pagos, mora, contratos y mantenimientos se registran y controlan dentro de KUVU, con la información centralizada para todas tus compañías.'
      }
    ]
  },
  {
    group: 'Datos y soporte',
    items: [
      {
        q: '¿Cómo se manejan los datos de mi compañía?',
        a: 'KUVU administra la información con cuidado de los datos personales y acceso por rol: cada usuario ve únicamente lo que necesita para su tarea.'
      },
      {
        q: '¿Tengo soporte si necesito ayuda?',
        a: 'Sí. Contás con acompañamiento del equipo KUVU para la puesta en marcha y para el uso diario del sistema.'
      }
    ]
  }
];

export const homeFaqCount = 4;

export function homeFaqItems(): readonly FaqItem[] {
  const all = faqGroups.flatMap((group) => group.items);
  return all.slice(0, homeFaqCount);
}