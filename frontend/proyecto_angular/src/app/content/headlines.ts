import type { Headline } from './types';
import { origin } from './origin';
import { team } from './team';

/**
 * Titulares del sitio público partidos para resaltar una parte. Cada `parts` concatena
 * exactamente su `title`: el énfasis no cambia el texto.
 */
export const headlines = {
  hero: {
    title: 'Administración inmobiliaria para empresas que crecen',
    parts: ['Administración inmobiliaria para ', { text: 'empresas', em: 'tape' }, ' que crecen']
  },
  queEs: {
    title: '¿Qué es KUVU?',
    parts: ['¿Qué es ', { text: 'KUVU', em: 'accent' }, '?']
  },
  servicios: {
    title: 'Servicios',
    parts: [{ text: 'Servicios', em: 'accent' }]
  },
  seguridad: {
    title: 'Seguridad y soporte',
    parts: ['Seguridad y ', { text: 'soporte', em: 'accent' }]
  },
  equipo: {
    title: team.title,
    parts: ['El equipo detrás de ', { text: 'KUVU', em: 'tape' }]
  },
  origen: {
    title: origin.title,
    parts: ['El origen de ', { text: 'KUVU', em: 'accent' }]
  },
  faq: {
    title: 'Preguntas frecuentes',
    parts: ['Preguntas ', { text: 'frecuentes', em: 'accent' }]
  },
  ctaFinal: {
    title: '¿Listo para administrar tus inmobiliarias?',
    parts: ['¿Listo para administrar tus ', { text: 'inmobiliarias', em: 'tape' }, '?']
  },
  nosotros: {
    title: 'Nosotros',
    parts: [{ text: 'Nosotros', em: 'accent' }]
  },
  contacto: {
    title: 'Contacto',
    parts: [{ text: 'Contacto', em: 'accent' }]
  }
} as const satisfies Record<string, Headline>;

/** Texto plano de un titular partido. */
export const headlineText = (parts: Headline['parts']): string =>
  parts.map((p) => (typeof p === 'string' ? p : p.text)).join('');
