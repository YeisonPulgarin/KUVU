import type { NavItem } from './types';

/*
 * Lightweight index of `/legal`: anchors and titles only. The footer and the contact form
 * import this module, so the full legal texts (`legal.ts`) stay in the lazy `/legal` chunk.
 */

/** Anchor ids of the four documents, in display order. */
export const legalAnchors = {
  dataPolicy: 'tratamiento-datos',
  privacyNotice: 'aviso-privacidad',
  terms: 'terminos-uso',
  cookies: 'cookies'
} as const;

export const legalTitles = {
  dataPolicy: 'Política de tratamiento de datos personales',
  privacyNotice: 'Aviso de privacidad',
  terms: 'Términos de uso',
  cookies: 'Política de cookies y almacenamiento local'
} as const;

/** One entry per document, as `label` + `fragment` inside `/legal`. */
export const legalIndex: readonly (NavItem & { readonly fragment: string })[] = [
  { label: legalTitles.dataPolicy, href: '/legal', fragment: legalAnchors.dataPolicy },
  { label: legalTitles.privacyNotice, href: '/legal', fragment: legalAnchors.privacyNotice },
  { label: legalTitles.terms, href: '/legal', fragment: legalAnchors.terms },
  { label: legalTitles.cookies, href: '/legal', fragment: legalAnchors.cookies }
];
