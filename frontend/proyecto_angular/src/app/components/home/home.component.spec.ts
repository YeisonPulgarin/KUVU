import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomeComponent } from './home.component';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
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

    it('should render a theme toggle button in the navbar with an aria-label', () => {
      const btn = asElement(root.querySelector('.nav-actions .theme-toggle'));
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toContain('modo');
    });

    it('should toggle the dark class on the document when the toggle is clicked', () => {
      const btn = asElement(root.querySelector('.nav-actions .theme-toggle'));
      btn.click();
      fixture.detectChanges();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });

    it('should open the mobile menu when the hamburger is clicked', () => {
      const btn = asElement(root.querySelector('#hamburger-toggle'));
      btn.click();
      fixture.detectChanges();
      const menu = asElement(root.querySelector('#mobile-menu'));
      expect(menu.classList.contains('hidden')).toBeFalse();
    });
  });

  describe('scroll reveals', () => {
    it('should mark the services rows and the companies group for reveal', () => {
      expect(root.querySelectorAll('#servicios .service-row[data-reveal]').length).toBe(5);
      expect(root.querySelector('#companias .companies-list[data-reveal]')).toBeTruthy();
    });
  });

  describe('hero section', () => {
    it('should render a fullsize hero with a brand line, title and subtitle', () => {
      const hero = asElement(root.querySelector('.hero'));
      expect(hero).toBeTruthy();

      const brand = asElement(root.querySelector('.hero-brand'));
      expect(brand.textContent).toContain('KUVU');

      const title = asElement(root.querySelector('.hero-title'));
      expect(title.textContent).toContain('Administración inmobiliaria');

      const subtitle = asElement(root.querySelector('.hero-subtitle'));
      expect(subtitle.textContent).toContain('Gestioná locales, contratos, pagos y mantenimientos');
    });

    it('should not use an em-dash or en-dash in the hero title', () => {
      const title = asElement(root.querySelector('.hero-title'));
      expect(title.textContent).not.toContain('—');
      expect(title.textContent).not.toContain('–');
    });

    it('should not use italic emphasis in the hero', () => {
      const hero = asElement(root.querySelector('.hero'));
      expect(hero.querySelector('em, i')).toBeNull();
    });

    it('should link the hero CTA to /acceder with the "Ingresar" label', () => {
      const cta = asElement(root.querySelector('.hero-cta'));
      expect(cta).toBeTruthy();
      expect(cta.getAttribute('href')).toBe('/acceder');
      expect(cta.textContent?.trim()).toBe('Ingresar');
    });
  });

  describe('copy audit', () => {
    it('should not contain an em-dash or en-dash in any visible string', () => {
      const text = root.textContent ?? '';
      expect(text).not.toContain('—');
      expect(text).not.toContain('–');
    });

    it('should use the single access label "Ingresar" across the three CTAs', () => {
      const navbarCta = asElement(root.querySelector('.nav-actions .btn-primary'));
      const heroCta = asElement(root.querySelector('.hero-cta'));
      const finalCta = asElement(root.querySelector('.cta-final .cta-button'));

      [navbarCta, heroCta, finalCta].forEach((cta) => {
        expect(cta).toBeTruthy();
        expect(cta.textContent?.trim()).toBe('Ingresar');
        expect(cta.getAttribute('href')).toBe('/acceder');
      });
    });
  });

  describe('content sections', () => {
    it('should render the "Qué es KUVU" section', () => {
      const section = asElement(root.querySelector('#que-es'));
      expect(section).toBeTruthy();
      expect(section.textContent).toContain('KUVU es un sistema de administración de inmobiliarias');
    });

    it('should render the services section as a divided list of rows', () => {
      const section = asElement(root.querySelector('#servicios'));
      expect(section).toBeTruthy();

      const rows = Array.from(section.querySelectorAll('.service-row')) as HTMLElement[];
      expect(rows.length).toBe(5);

      const texts = rows.map((c) => c.textContent?.trim() ?? '');
      expect(texts.some((t) => t.includes('Gestión de locales'))).toBeTrue();
      expect(texts.some((t) => t.includes('Contratos'))).toBeTrue();
      expect(texts.some((t) => t.includes('Pagos'))).toBeTrue();
      expect(texts.some((t) => t.includes('Mantenimientos'))).toBeTrue();
      expect(texts.some((t) => t.includes('Usuarios'))).toBeTrue();
    });

    it('should not render the services as a grid of identical cards', () => {
      const section = asElement(root.querySelector('#servicios'));
      expect(section.querySelectorAll('.service-card').length).toBe(0);
    });

    it('should render the companies section with the four companies', () => {
      const section = asElement(root.querySelector('#companias'));
      expect(section).toBeTruthy();

      const items = Array.from(section.querySelectorAll('.company-item')) as HTMLElement[];
      const texts = items.map((i) => i.textContent?.trim() ?? '');
      expect(texts).toContain('Amarilo');
      expect(texts).toContain('Nido Rent');
      expect(texts).toContain('Balcones de San Soucci');
      expect(texts).toContain('Mi Inmueble');
    });

    it('should render a final CTA linking to /acceder', () => {
      const final = asElement(root.querySelector('.cta-final'));
      expect(final).toBeTruthy();
      expect(final.textContent).toContain('Listo para administrar tus inmobiliarias');

      const btn = asElement(final.querySelector('.cta-button'));
      expect(btn.getAttribute('href')).toBe('/acceder');
    });
  });

  describe('expanded sections', () => {
    it('should render the "Cómo funciona" section with four numbered steps', () => {
      const section = asElement(root.querySelector('#como-funciona'));
      expect(section).toBeTruthy();

      const steps = Array.from(section.querySelectorAll('.step')) as HTMLElement[];
      expect(steps.length).toBe(4);
      expect(steps[0].querySelector('.step-number')?.textContent?.trim()).toBe('1');
      expect(section.textContent).toContain('Creá tu empresa y tu equipo');
      expect(section.textContent).toContain('Centralizá la información');
    });

    it('should render the benefits section split by role', () => {
      const section = asElement(root.querySelector('#beneficios'));
      expect(section).toBeTruthy();

      const cards = Array.from(section.querySelectorAll('.role-card')) as HTMLElement[];
      expect(cards.length).toBe(2);
      expect(section.textContent).toContain('Dueño o gerente');
      expect(section.textContent).toContain('Equipo operativo');
    });

    it('should render the security highlights without internal mechanisms', () => {
      const section = asElement(root.querySelector('#seguridad'));
      expect(section).toBeTruthy();
      expect(section.querySelectorAll('.security-item').length).toBe(3);
      expect(section.textContent).toContain('Cuidado de los datos');
      expect(section.textContent).toContain('Acompañamiento');

      const text = (section.textContent ?? '').toLowerCase();
      ['cifrado', 'encriptad', 'servidor', 'base de datos', 'infraestructura'].forEach(
        (term) => expect(text).not.toContain(term)
      );
    });

    it('should render the origin section mentioning three students and the university library', () => {
      const section = asElement(root.querySelector('#origen'));
      expect(section).toBeTruthy();
      expect(section.textContent).toContain('tres estudiantes universitarios');
      expect(section.textContent).toContain('biblioteca');
    });

    it('should render a short FAQ linking to /preguntas-frecuentes', () => {
      const section = asElement(root.querySelector('#faq'));
      expect(section).toBeTruthy();

      const items = Array.from(section.querySelectorAll('.faq-item')) as HTMLElement[];
      expect(items.length).toBe(4);

      const link = asElement(section.querySelector('.faq-link'));
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('/preguntas-frecuentes');
      expect(link.textContent).toContain('preguntas frecuentes');
    });

    it('should keep the five new sections in the expected order', () => {
      const ids = Array.from(root.querySelectorAll('.home-layout section'))
        .map((el) => el.id)
        .filter((id) =>
          ['como-funciona', 'beneficios', 'seguridad', 'origen', 'faq'].includes(id)
        );
      expect(ids).toEqual(['como-funciona', 'beneficios', 'seguridad', 'origen', 'faq']);
    });
  });

  describe('navbar navigation links', () => {
    it('should point to the anchored sections in desktop nav', () => {
      const nav = asElement(root.querySelector('.nav-links'));
      const links = Array.from(nav.querySelectorAll('.nav-item')) as HTMLElement[];
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('#inicio');
      expect(hrefs).toContain('#que-es');
      expect(hrefs).toContain('#como-funciona');
      expect(hrefs).toContain('#servicios');
      expect(hrefs).toContain('#beneficios');
      expect(hrefs).toContain('#seguridad');
      expect(hrefs).toContain('#companias');
    });

    it('should keep the mobile drawer access action routed to /acceder with "Ingresar"', () => {
      const drawer = asElement(root.querySelector('#mobile-menu'));
      const account = Array.from(drawer.querySelectorAll('a')).find(
        (a: Element) => a.textContent?.trim() === 'Ingresar'
      );
      expect(account).toBeTruthy();
      expect(account?.getAttribute('href')).toBe('/acceder');
    });
  });

  describe('logo', () => {
    it('should render the KUVU light logo image instead of a CSS box', () => {
      const img = asElement(root.querySelector('.logo-img--full'));
      expect(img).toBeTruthy();
      expect(img.tagName).toBe('IMG');
      expect(img.getAttribute('src')).toBe('/logo-rediseno/logo-light.png');
      expect(img.getAttribute('alt')).toBe('KUVU');
    });

    it('should not render redundant KUVU text next to the logo', () => {
      expect(root.querySelector('.logo-text')).toBeNull();
    });
  });
});