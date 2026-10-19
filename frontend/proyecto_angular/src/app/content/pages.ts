import type { PageKey, PageMeta } from './types';

/** SEO data of every public page. Titles and descriptions are unique across pages. */
export const pageMeta: Readonly<Record<PageKey, PageMeta>> = {
  home: {
    title: 'KUVU | Administración inmobiliaria multiempresa',
    description:
      'KUVU unifica la gestión de locales, contratos, pagos y mantenimientos de varias inmobiliarias en una sola plataforma, con acceso por rol.',
    path: '/'
  },
  servicios: {
    title: 'Servicios | KUVU',
    description:
      'Gestión de locales, contratos, pagos, mantenimientos y usuarios: los servicios de KUVU y sus beneficios para dueños, gerentes y equipos operativos.',
    path: '/servicios'
  },
  nosotros: {
    title: 'Nosotros | KUVU',
    description: 'Conocé quién es KUVU, cómo opera, con quién trabaja y el origen del proyecto.',
    path: '/nosotros'
  },
  preguntasFrecuentes: {
    title: 'Preguntas frecuentes | KUVU',
    description:
      'Respuestas a las preguntas más frecuentes sobre KUVU: qué es, cómo funciona, cómo se manejan los datos y si hay soporte.',
    path: '/preguntas-frecuentes'
  },
  contacto: {
    title: 'Contacto | KUVU',
    description:
      'Escribile al equipo KUVU: completá el formulario y te respondemos por WhatsApp.',
    path: '/contacto'
  },
  legal: {
    title: 'Legal | KUVU',
    description:
      'Política de tratamiento de datos personales, aviso de privacidad, términos de uso y política de cookies y almacenamiento local de KUVU.',
    path: '/legal'
  },
  notFound: {
    title: 'Página no encontrada | KUVU',
    description: 'La página que buscás no existe o cambió de dirección. Volvé al inicio de KUVU.',
    path: '/404',
    noindex: true
  }
};
