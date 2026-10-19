import type { Responsible, ResponsibleField } from './types';

/**
 * Party responsible for personal data processing. Single source for `/legal`, the footer
 * and `/contacto`: filling a value here updates every place at once.
 *
 * Every field is `null` until the real data is provided; a `null` field is rendered as a
 * visible placeholder (see `placeholderLabel`). No value is invented.
 */
export const responsible: Responsible = {
  legalName: null,
  taxId: null,
  domicile: null,
  address: null,
  email: null,
  phone: null,
  attentionArea: null,
  effectiveDate: null
};

/** Text shown, between brackets, while a field is still pending. */
export const placeholderLabel: Readonly<Record<ResponsibleField, string>> = {
  legalName: 'RAZÓN SOCIAL',
  taxId: 'NIT',
  domicile: 'DOMICILIO',
  address: 'DIRECCIÓN',
  email: 'CORREO DE CONTACTO',
  phone: 'TELÉFONO',
  attentionArea: 'ÁREA RESPONSABLE DE CONSULTAS Y RECLAMOS',
  effectiveDate: 'FECHA DE VIGENCIA'
};

/** Value of a field, or its bracketed placeholder when the value is pending. */
export function responsibleText(field: ResponsibleField): string {
  return responsible[field] ?? `[${placeholderLabel[field]}]`;
}
