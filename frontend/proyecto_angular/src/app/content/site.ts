import type { ContactInfo, NavItem, SiteInfo } from './types';

export const siteInfo: SiteInfo = {
  name: 'KUVU',
  tagline: 'Administración inmobiliaria para empresas que crecen'
};

export const navLinks: readonly NavItem[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Qué es KUVU', href: '#que-es' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Seguridad', href: '#seguridad' },
  { label: 'Compañías', href: '#companias' }
];

export const pageNavLinks: readonly NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' }
];

/**
 * Every public page of the site with its own route. It is the source for the site navigation
 * and for the breadcrumb, so labels and paths never diverge between them.
 */
export const sitePages: readonly NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Legal', href: '/legal' }
];

const siteNavOrder: readonly string[] = [
  '/',
  '/servicios',
  '/nosotros',
  '/preguntas-frecuentes',
  '/contacto'
];

/** Single navigation shown in the header of every public page. `/legal` lives in the footer. */
export const siteNavLinks: readonly NavItem[] = siteNavOrder.map((href) => {
  const page = sitePages.find((item) => item.href === href);
  if (!page) {
    throw new Error(`siteNavLinks: "${href}" is not declared in sitePages`);
  }
  return page;
});

export const contact: ContactInfo = {
  whatsappNumber: '573223192760',
  whatsappMessage: 'Hola, queremos información sobre KUVU, sus servicios y como vincularnos'
};

export function buildWhatsAppLink(phone: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

export const contactWhatsAppLink = buildWhatsAppLink(contact.whatsappNumber, contact.whatsappMessage);

/**
 * Ruta de dos niveles ("Inicio › Página") para el breadcrumb de una página pública interna.
 * Toma etiquetas y rutas de `sitePages`, así el breadcrumb no diverge del menú.
 */
export function breadcrumbFor(href: string): readonly NavItem[] {
  const home = sitePages.find((link) => link.href === '/');
  const page = sitePages.find((link) => link.href === href);
  if (!home || !page || page === home) {
    throw new Error(`breadcrumbFor: "${href}" no es una página pública interna de sitePages`);
  }
  return [home, page];
}
