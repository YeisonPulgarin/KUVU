import type { Responsible, RichText } from './types';

/**
 * Party responsible for personal data processing. Single source for `/legal`, the footer
 * and `/contacto`: changing a value here updates every place at once.
 *
 * KUVU is a fictitious company created for an academic project. Only data that cannot
 * belong to a real third party is set; a tax id, a physical address and an email with a
 * domain are left out on purpose (they could match a real person or company), and the
 * texts that would mention them omit the whole phrase.
 */
export const responsible: Responsible = {
  legalName: 'KUVU',
  domicile: 'Bogotá D.C., Colombia',
  // Same number as the WhatsApp already published in site.ts.
  phone: '+57 322 319 2760',
  attentionArea: 'Equipo KUVU — Protección de datos personales',
  effectiveDate: '18 de octubre de 2026'
};

/** Kind of piece a rich text resolves to once the responsible data is applied. */
export interface ResolvedSegment {
  readonly kind: 'text' | 'link';
  readonly text: string;
  readonly link?: string;
  readonly fragment?: string;
}

/**
 * Resolves a rich text against `responsible`: fields become text (with their prefix and
 * suffix) and absent fields disappear completely.
 */
export function resolveRichText(text: RichText): ResolvedSegment[] {
  const resolved: ResolvedSegment[] = [];
  for (const segment of text) {
    if (typeof segment === 'string') {
      resolved.push({ kind: 'text', text: segment });
    } else if ('field' in segment) {
      const value = responsible[segment.field];
      if (value) {
        resolved.push({
          kind: 'text',
          text: `${segment.prefix ?? ''}${value}${segment.suffix ?? ''}`
        });
      }
    } else {
      resolved.push({
        kind: 'link',
        text: segment.label,
        link: segment.link,
        fragment: segment.fragment
      });
    }
  }
  return resolved;
}

/** Whether a rich text renders nothing (for example, a line about an absent field). */
export function isEmptyRichText(text: RichText): boolean {
  return resolveRichText(text).every((segment) => segment.text.trim() === '');
}
