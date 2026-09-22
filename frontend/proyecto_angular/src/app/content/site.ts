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

export const contact: ContactInfo = {
  whatsappNumber: '573223192760',
  whatsappMessage: 'Hola, queremos información sobre KUVU, sus servicios y como vincularnos'
};

export function buildWhatsAppLink(phone: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

export const contactWhatsAppLink = buildWhatsAppLink(contact.whatsappNumber, contact.whatsappMessage);