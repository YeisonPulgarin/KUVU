import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HEADER_COMPACT_THRESHOLD, SiteHeaderComponent } from './site-header.component';
import { siteNavLinks } from '../../../content/site';
import { logo } from '../../../content/logo';

@Component({ standalone: true, template: '' })
class BlankPage {}

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

describe('SiteHeaderComponent', () => {
  let component: SiteHeaderComponent;
  let fixture: ComponentFixture<SiteHeaderComponent>;
  let root: HTMLElement;
  let router: Router;

  // Leaves no theme behind: later specs read the default light theme.
  afterEach(() => {
    localStorage.removeItem('kuvu-theme');
    document.documentElement.classList.remove('dark');
  });

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.body.style.overflow = '';

    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [
        provideRouter(
          siteNavLinks.map((link) => ({ path: link.href.slice(1), component: BlankPage }))
        )
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SiteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
    document.body.style.overflow = '';
  });

  const desktopLinks = () =>
    Array.from(root.querySelectorAll('.nav-links .nav-item')) as HTMLAnchorElement[];

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('brand', () => {
    const logoImgs = () => Array.from(root.querySelectorAll('.logo-link img')) as HTMLImageElement[];

    it('should render a single symbol logo linking to the home route', () => {
      const link = asElement(root.querySelector('.logo-link'));
      const imgs = logoImgs();
      expect(imgs.length).toBe(1);
      expect(imgs[0].getAttribute('src')).toBe(logo.responsive);
      expect(imgs[0].getAttribute('alt')).toBe('KUVU');
      expect(link.getAttribute('href')).toBe('/');
    });

    it('should never render the full web logo, in light or dark theme', () => {
      const srcs = () => Array.from(root.querySelectorAll('img')).map((img) => img.getAttribute('src'));
      expect(srcs()).not.toContain(logo.web);
      component.theme.toggle();
      fixture.detectChanges();
      expect(srcs()).not.toContain(logo.web);
      expect(logoImgs().map((img) => img.getAttribute('src'))).toEqual([logo.responsive]);
    });

    it('should show the symbol logo on every viewport width (no breakpoint swap)', () => {
      expect(getComputedStyle(logoImgs()[0]).display).toBe('block');
    });
  });

  describe('single site navigation', () => {
    it('should render the five site pages in order, as routes and never as anchors', () => {
      const links = desktopLinks();
      expect(links.map((l) => l.textContent?.trim())).toEqual([
        'Inicio',
        'Servicios',
        'Nosotros',
        'Preguntas frecuentes',
        'Contacto'
      ]);
      expect(links.map((l) => l.getAttribute('href'))).toEqual([
        '/',
        '/servicios',
        '/nosotros',
        '/preguntas-frecuentes',
        '/contacto'
      ]);
      links.forEach((l) => expect(l.getAttribute('href')).not.toContain('#'));
    });

    it('should render the same links in the mobile menu', () => {
      const hrefs = Array.from(root.querySelectorAll('#mobile-menu .mobile-item')).map((a) =>
        a.getAttribute('href')
      );
      expect(hrefs).toEqual(siteNavLinks.map((l) => l.href));
    });

    it('should keep the "Ingresar" CTA, WhatsApp and the theme toggle', () => {
      const cta = asElement(root.querySelector('.nav-actions .btn-primary'));
      expect(cta.textContent?.trim()).toBe('Ingresar');
      expect(cta.getAttribute('href')).toBe('/acceder');
      const wa = asElement(root.querySelector('.icon-btn.wa'));
      expect(wa.getAttribute('href')).toContain('wa.me/573223192760');
      expect(wa.getAttribute('rel')).toContain('noopener');
      expect(root.querySelector('.nav-actions .theme-toggle')?.getAttribute('aria-label')).toContain('modo');
    });

    it('should toggle the app theme from the header', () => {
      asElement(root.querySelector('.nav-actions .theme-toggle')).click();
      fixture.detectChanges();
      expect(component.isDark()).toBeTrue();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });
  });

  describe('active page', () => {
    const current = () =>
      desktopLinks()
        .filter((l) => l.getAttribute('aria-current') === 'page')
        .map((l) => l.getAttribute('href'));

    it('should mark only Servicios as current on /servicios', fakeAsync(() => {
      router.navigateByUrl('/servicios');
      tick();
      fixture.detectChanges();
      expect(current()).toEqual(['/servicios']);
      expect(desktopLinks()[1].classList).toContain('is-active');
    }));

    it('should mark only Inicio as current on /, and not on other pages', fakeAsync(() => {
      router.navigateByUrl('/');
      tick();
      fixture.detectChanges();
      expect(current()).toEqual(['/']);

      router.navigateByUrl('/contacto');
      tick();
      fixture.detectChanges();
      expect(current()).toEqual(['/contacto']);
    }));

    it('should mark the current page in the mobile panel with is-active and aria-current', fakeAsync(() => {
      router.navigateByUrl('/nosotros');
      tick();
      fixture.detectChanges();
      const items = Array.from(root.querySelectorAll('#mobile-menu .mobile-item')) as HTMLAnchorElement[];
      const active = items.filter((a) => a.classList.contains('is-active'));
      expect(active.map((a) => a.getAttribute('href'))).toEqual(['/nosotros']);
      expect(active[0].getAttribute('aria-current')).toBe('page');
    }));
  });

  describe('compact state on scroll', () => {
    let scrollY = 0;

    beforeEach(() => {
      spyOnProperty(window, 'scrollY').and.callFake(() => scrollY);
    });

    it('should start in the initial state at the top of the page', () => {
      scrollY = 0;
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(root.classList).not.toContain('is-compact');
    });

    it('should become compact past the threshold and recover at the top', () => {
      scrollY = HEADER_COMPACT_THRESHOLD + 1;
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(root.classList).toContain('is-compact');

      scrollY = 0;
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(root.classList).not.toContain('is-compact');
    });

    // The blur must not sit on an ancestor of the fixed panel: it would become its containing
    // block and the panel would collapse to the 56px bar once the page is scrolled.
    it('should keep the mobile panel sized to the viewport when compact', () => {
      scrollY = HEADER_COMPACT_THRESHOLD + 200;
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(root.classList).toContain('is-compact');

      const header = asElement(root.querySelector('.site-header'));
      expect(getComputedStyle(header).backdropFilter).toBe('none');
      expect(getComputedStyle(header).filter).toBe('none');
      expect(getComputedStyle(header).transform).toBe('none');

      const panel = asElement(root.querySelector('#mobile-menu'));
      if (getComputedStyle(panel).display !== 'none') {
        const rect = panel.getBoundingClientRect();
        expect(rect.top).toBeCloseTo(56, 0);
        expect(rect.bottom).toBeCloseTo(window.innerHeight, 0);
      }
    });

    it('should keep the translucent blurred surface on the header background layer', () => {
      scrollY = HEADER_COMPACT_THRESHOLD + 1;
      window.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      const header = asElement(root.querySelector('.site-header'));
      const surface = getComputedStyle(header, '::before');
      expect(surface.content).not.toBe('none');
      if (CSS.supports('backdrop-filter', 'blur(1px)')) {
        expect(surface.backdropFilter).toContain('blur');
      }
    });
  });

  describe('mobile menu', () => {
    const button = () => asElement(root.querySelector('#hamburger-toggle'));
    const panel = () => asElement(root.querySelector('#mobile-menu'));

    const open = () => {
      button().click();
      fixture.detectChanges();
      flush();
    };

    it('should start closed, inert and hidden from assistive tech', () => {
      expect(button().getAttribute('aria-expanded')).toBe('false');
      expect(panel().classList).not.toContain('is-open');
      expect(panel().hasAttribute('inert')).toBeTrue();
      expect(panel().getAttribute('aria-hidden')).toBe('true');
    });

    it('should open: aria-expanded, body scroll locked, focus on the first link', fakeAsync(() => {
      open();
      expect(button().getAttribute('aria-expanded')).toBe('true');
      expect(button().getAttribute('aria-label')).toBe('Cerrar menú');
      expect(panel().classList).toContain('is-open');
      expect(panel().hasAttribute('inert')).toBeFalse();
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.activeElement).toBe(panel().querySelector('a'));
    }));

    it('should close with Escape, unlock scroll and return focus to the button', fakeAsync(() => {
      open();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(component.isMenuOpen()).toBeFalse();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(button());
    }));

    it('should close with the menu button', fakeAsync(() => {
      open();
      button().click();
      fixture.detectChanges();
      expect(component.isMenuOpen()).toBeFalse();
      expect(document.body.style.overflow).toBe('');
    }));

    it('should close when a link is chosen', fakeAsync(() => {
      open();
      asElement(panel().querySelector('.mobile-item')).click();
      tick();
      fixture.detectChanges();
      expect(component.isMenuOpen()).toBeFalse();
      expect(document.body.style.overflow).toBe('');
    }));

    it('should stay closed after navigating to another route', fakeAsync(() => {
      open();
      router.navigateByUrl('/nosotros');
      tick();
      fixture.detectChanges();
      expect(component.isMenuOpen()).toBeFalse();
    }));

    it('should keep the "Ingresar" action routed to /acceder', () => {
      const account = Array.from(panel().querySelectorAll('a')).find(
        (a) => a.textContent?.trim() === 'Ingresar'
      );
      expect(account?.getAttribute('href')).toBe('/acceder');
    });

    it('should index each entry for the staggered entrance', () => {
      const entries = Array.from(panel().querySelectorAll('.mobile-entry')) as HTMLElement[];
      expect(entries.map((e) => e.style.getPropertyValue('--i'))).toEqual(
        entries.map((_, i) => String(i))
      );
    });

    it('should release the body scroll lock when destroyed while open', fakeAsync(() => {
      open();
      fixture.destroy();
      expect(document.body.style.overflow).toBe('');
    }));
  });
});
