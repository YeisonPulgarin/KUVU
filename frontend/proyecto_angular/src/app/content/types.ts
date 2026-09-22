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