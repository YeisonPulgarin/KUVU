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
        a: 'Sí. Cuentas con acompañamiento del equipo KUVU para la puesta en marcha y para el uso diario del sistema.'
      }
    ]
  },
  {
    group: 'Contacto y datos',
    items: [
      {
        q: '¿Cómo me contacto con KUVU?',
        a: 'Desde la página de Contacto completas un formulario y se abre WhatsApp con tu mensaje listo para enviar. También puedes escribirnos directo por WhatsApp desde el encabezado o el pie de página.'
      },
      {
        q: '¿Cómo tratan mis datos personales?',
        a: 'Los usamos solo para responder tu solicitud y operar el servicio, conforme a la Ley 1581 de 2012. El detalle, junto con tus derechos y cómo ejercerlos, está en la Política de tratamiento de datos personales de la página Legal.'
      },
      {
        q: '¿Quién puede ingresar a la plataforma?',
        a: 'Solo los usuarios que su inmobiliaria da de alta: no hay registro abierto. Cada persona ingresa a su empresa y ve lo que su rol le permite.'
      },
      {
        q: '¿KUVU usa cookies?',
        a: 'No usa cookies de analítica, publicidad ni de terceros. Solo guarda en tu navegador tu preferencia de tema y los datos de la sesión iniciada; el detalle está en la política de cookies de la página Legal.'
      }
    ]
  }
];

export const homeFaqCount = 4;

export function homeFaqItems(): readonly FaqItem[] {
  const all = faqGroups.flatMap((group) => group.items);
  return all.slice(0, homeFaqCount);
}