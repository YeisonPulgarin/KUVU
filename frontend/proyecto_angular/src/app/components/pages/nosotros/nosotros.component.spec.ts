import { team } from '../../../content';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NosotrosComponent } from './nosotros.component';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

describe('NosotrosComponent', () => {
  let component: NosotrosComponent;
  let fixture: ComponentFixture<NosotrosComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [NosotrosComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NosotrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('shared site chrome', () => {
    it('should render the shared header and footer', () => {
      expect(root.querySelector('app-site-header')).toBeTruthy();
      expect(root.querySelector('app-site-footer')).toBeTruthy();
    });

    it('should show the single site navigation in the header', () => {
      const links = Array.from(root.querySelectorAll('.nav-links .nav-item')) as HTMLElement[];
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toEqual(['/', '/servicios', '/nosotros', '/preguntas-frecuentes', '/contacto']);
    });

    it('should use the shared public page layout', () => {
      expect(root.querySelector('app-public-page main')).toBeTruthy();
      expect(root.querySelector('h1.page-title')?.textContent?.trim()).toBe('Nosotros');
    });
  });

  describe('meta', () => {
    it('should set the page title and description on init', () => {
      expect(document.title).toBe('Nosotros | KUVU');
      const meta = document.querySelector('meta[name="description"]');
      expect(meta?.getAttribute('content')).toContain('KUVU');
    });
  });

  describe('content sections', () => {
    it('should render the three about sections', () => {
      const sections = Array.from(root.querySelectorAll('.about-section')) as HTMLElement[];
      expect(sections.length).toBe(3);
      const text = sections.map((s) => s.textContent ?? '').join(' ');
      expect(text).toContain('Quiénes somos');
      expect(text).toContain('Cómo operamos');
      expect(text).toContain('Con quién trabajamos');
    });

    it('should mention the real origin: three students at their university library', () => {
      expect(root.textContent).toContain('tres estudiantes universitarios');
      expect(root.textContent).toContain('biblioteca');
    });
  });

  describe('team photo', () => {
    it('should render the three team photos between the about sections and the origin', () => {
      const sections = Array.from(root.querySelectorAll('main > section')).map(
        (s) => s.classList[0]
      );
      const teamIndex = sections.indexOf('team');
      expect(teamIndex).toBeGreaterThan(sections.indexOf('about-sections'));
      expect(teamIndex).toBeLessThan(sections.indexOf('origin'));

      const imgs = Array.from(root.querySelectorAll('.team figure app-responsive-image picture img'));
      expect(imgs.length).toBe(3);
      expect(imgs.map((img) => img.getAttribute('src'))).toEqual([
        '/Imagenes_web/equipo-kuvu-1-1200.jpeg',
        '/Imagenes_web/equipo-kuvu-2-960.jpeg',
        '/Imagenes_web/equipo-kuvu-3-960.jpeg'
      ]);
      imgs.forEach((img) => expect(img.getAttribute('loading')).toBe('lazy'));
    });

    it('should give each photo its own descriptive alt text', () => {
      const alts = Array.from(root.querySelectorAll('.team picture img')).map((img) => img.getAttribute('alt'));
      expect(alts).toEqual(team.photos.map((p) => p.alt));
    });

    it('should describe the photo with a descriptive alt text that names no member', () => {
      const alt = asElement(root.querySelector('.team picture img')).getAttribute('alt') ?? '';
      expect(alt).toBe(team.photos[0].alt);
      expect(alt).not.toContain('Wilson');
      expect(alt).not.toContain('YCW');
    });

    it('should caption the photo with the members left to right', () => {
      const caption = asElement(root.querySelector('.team figcaption'));
      expect(caption.textContent?.trim()).toBe('Wilson Solano · Carlos Arciniegas · Yeison Pulgarin');
    });
  });

  describe('contact CTA', () => {
    it('should render a WhatsApp contact link with the pre-filled message', () => {
      const cta = asElement(root.querySelector('.btn-whatsapp'));
      expect(cta).toBeTruthy();
      expect(cta.getAttribute('href')).toContain('wa.me/573223192760');
      expect(cta.getAttribute('href')).toContain('?text=');
      expect(cta.getAttribute('target')).toBe('_blank');
      expect(cta.getAttribute('rel')).toContain('noopener');
      expect(cta.textContent?.trim()).toContain('WhatsApp');
    });

    it('should label the WhatsApp link for assistive tech', () => {
      const cta = asElement(root.querySelector('.btn-whatsapp'));
      expect(cta.getAttribute('aria-label')).toContain('WhatsApp');
    });
  });

  describe('editorial numbering', () => {
    it('should drop numbered eyebrows', () => {
      expect(root.querySelectorAll('main .section-eyebrow').length).toBe(0);
    });

    it('should close with a brand block CTA', () => {
      const sections = root.querySelectorAll('main > section');
      expect(sections[sections.length - 1].classList).toContain('block-brand');
    });

    it('should offer the contact form as a secondary link', () => {
      expect(root.querySelector('.cta-contact a.link-arrow')?.getAttribute('href')).toBe('/contacto');
    });
  });

  describe('reveals', () => {
    it('should mark about sections and origin paragraphs for reveal', () => {
      expect(root.querySelectorAll('.about-section[data-reveal]').length).toBe(3);
      expect(root.querySelectorAll('.origin .origin-paragraph[data-reveal]').length).toBe(3);
    });
  });

  // breadcrumb-y-cta-legible, slice breadcrumb (CA-3, CA-6, CA-7).
  describe('breadcrumb', () => {
    it('should render "Inicio › Nosotros" inside the page hero, before the h1', () => {
      const hero = asElement(root.querySelector('.page-hero'));
      const nav = asElement(hero.querySelector('nav[aria-label="Ruta de navegación"]'));
      const h1 = asElement(hero.querySelector('h1'));
      expect(nav.textContent?.replace(/\s+/g, ' ').trim()).toBe('Inicio › Nosotros');
      expect(nav.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('should publish a single BreadcrumbList with two absolute items', () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts.length).toBe(1);
      const data = JSON.parse(scripts[0].textContent ?? '');
      expect(data['@type']).toBe('BreadcrumbList');
      expect(data.itemListElement.map((i: { item: string }) => i.item)).toEqual([
        `${location.origin}/`,
        `${location.origin}/nosotros`
      ]);
    });

    it('should remove the BreadcrumbList when the page is destroyed', () => {
      fixture.destroy();
      expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
    });
  });
});