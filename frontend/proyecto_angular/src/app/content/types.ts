export interface SiteInfo {
  readonly name: string;
  readonly tagline: string;
}

export interface ContactInfo {
  readonly whatsappNumber: string;
  readonly whatsappMessage: string;
}

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface Service {
  readonly title: string;
  readonly description: string;
  readonly icon: 'building' | 'file' | 'card' | 'wrench' | 'users';
}

export interface Company {
  readonly name: string;
  readonly className: string;
}

export interface HowStep {
  readonly title: string;
  readonly description: string;
}

export interface BenefitRole {
  readonly role: string;
  readonly title: string;
  readonly description: string;
  readonly points: readonly string[];
}

export interface SecurityHighlight {
  readonly title: string;
  readonly description: string;
}

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

export interface FaqGroup {
  readonly group: string;
  readonly items: readonly FaqItem[];
}

export interface AboutSection {
  readonly title: string;
  readonly body: string;
}

export interface OriginSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

/**
 * Imagen responsive servida desde `public/`. Los archivos siguen la convención
 * `{basePath}-{ancho}.{webp|jpeg}` (ver `scripts/generate-image-variants.py`).
 */
export interface SiteImage {
  readonly basePath: string;
  readonly widths: readonly number[];
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption?: string;
}

export interface TeamSection {
  readonly title: string;
  readonly lead: string;
  readonly linkLabel: string;
  readonly members: readonly string[];
  readonly image: SiteImage;
}

/** Keys of every public page that publishes its own meta tags. */
export type PageKey =
  | 'home'
  | 'servicios'
  | 'nosotros'
  | 'preguntasFrecuentes'
  | 'contacto'
  | 'legal'
  | 'notFound';

/** Per-page SEO data consumed by `PageMetaService.setPage`. */
export interface PageMeta {
  readonly title: string;
  readonly description: string;
  /** Path relative to the site origin, used for canonical and og:url. */
  readonly path: string;
  readonly noindex?: boolean;
}

/**
 * Data of the party responsible for personal data processing (Ley 1581 de 2012).
 * `null` means the real value is still pending and is rendered as a visible placeholder.
 */
export interface Responsible {
  readonly legalName: string | null;
  readonly taxId: string | null;
  readonly domicile: string | null;
  readonly address: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly attentionArea: string | null;
  readonly effectiveDate: string | null;
}

export type ResponsibleField = keyof Responsible;

/** One piece of rich text: plain text, a responsible-party field, or an internal link. */
export type RichSegment =
  | string
  | { readonly field: ResponsibleField }
  | { readonly link: string; readonly fragment?: string; readonly label: string };

export type RichText = readonly RichSegment[];

export interface LegalBlock {
  readonly heading?: string;
  readonly paragraphs: readonly RichText[];
  readonly items?: readonly RichText[];
}

export interface LegalDocument {
  /** Stable anchor id inside `/legal`. */
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly LegalBlock[];
}

export interface ContactSubject {
  readonly value: string;
  readonly label: string;
}

export interface ContactStep {
  readonly title: string;
  readonly description: string;
}
