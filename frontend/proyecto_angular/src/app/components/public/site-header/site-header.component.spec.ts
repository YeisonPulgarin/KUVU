import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SiteHeaderComponent } from './site-header.component';
import { pageNavLinks } from '../../../content/site';
import { logo } from '../../../content/logo';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

describe('SiteHeaderComponent', () => {
  let component: SiteHeaderComponent;
  let fixture: ComponentFixture<SiteHeaderComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SiteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('brand', () => {
    it('should render the KUVU full logo linking to the home route', () => {
      const link = asElement(root.querySelector('.logo-link'));
      const full = asElement(link.querySelector('.logo-img--full'));
      expect(full.tagName).toBe('IMG');
      expect(full.getAttribute('src')).toBe(logo.light);
      expect(full.getAttribute('alt')).toBe('KUVU');
      expect(link.getAttribute('href')).toBe('/');
    });

    it('should render the responsive logo variant next to the full one', () => {
      const link = asElement(root.querySelector('.logo-link'));
      const responsive = asElement(link.querySelector('.logo-img--responsive'));
      expect(responsive.tagName).toBe('IMG');
      expect(responsive.getAttribute('src')).toBe(logo.responsiveLight);
      expect(responsive.getAttribute('alt')).toBe('KUVU');
    });

    it('should swap both logo variants to dark when the theme is dark', () => {
      component.theme.toggle();
      fixture.detectChanges();
      const link = asElement(root.querySelector('.logo-link'));
      const full = link.querySelector('.logo-img--full');
      const responsive = link.querySelector('.logo-img--responsive');
      expect(full?.getAttribute('src')).toBe(logo.dark);
      expect(responsive?.getAttribute('src')).toBe(logo.responsiveDark);
    });

    it('should not render redundant text next to the logo', () => {
      expect(root.querySelector('.logo-text')).toBeNull();
    });
  });

  describe('theme toggle', () => {
    it('should render a theme toggle button with an aria-label', () => {
      const btn = asElement(root.querySelector('.nav-actions .theme-toggle'));
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toContain('modo');
    });

    it('should toggle the app theme when clicked', () => {
      const btn = asElement(root.querySelector('.nav-actions .theme-toggle'));
      btn.click();
      fixture.detectChanges();
      expect(component.isDark()).toBeTrue();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });
  });

  describe('access CTA', () => {
    it('should render the "Ingresar" CTA linking to /acceder', () => {
      const cta = asElement(root.querySelector('.nav-actions .btn-primary'));
      expect(cta).toBeTruthy();
      expect(cta.textContent?.trim()).toBe('Ingresar');
      expect(cta.getAttribute('href')).toBe('/acceder');
    });
  });

  describe('WhatsApp contact', () => {
    it('should render a WhatsApp link with the pre-filled message', () => {
      const wa = asElement(root.querySelector('.icon-btn.wa'));
      expect(wa).toBeTruthy();
      expect(wa.getAttribute('href')).toContain('wa.me/573223192760');
      expect(wa.getAttribute('target')).toBe('_blank');
      expect(wa.getAttribute('rel')).toContain('noopener');
    });
  });

  describe('hamburger button interaction', () => {
    it('should toggle the mobile menu when the hamburger is clicked', () => {
      const btn = asElement(root.querySelector('#hamburger-toggle'));
      expect(btn).toBeTruthy();

      btn.click();
      fixture.detectChanges();
      expect(component.isMobileMenuOpen).toBeTrue();

      btn.click();
      fixture.detectChanges();
      expect(component.isMobileMenuOpen).toBeFalse();
    });

    it('should reflect the open state in aria-expanded', () => {
      const btn = asElement(root.querySelector('#hamburger-toggle'));
      expect(btn.getAttribute('aria-expanded')).toBe('false');

      btn.click();
      fixture.detectChanges();
      expect(btn.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('mobile menu visibility', () => {
    it('should hide the mobile-menu element when closed', () => {
      const menu = asElement(root.querySelector('#mobile-menu'));
      expect(menu.classList.contains('hidden')).toBeTrue();
    });

    it('should show the mobile-menu element when open', () => {
      component.isMobileMenuOpen = true;
      fixture.detectChanges();
      const menu = asElement(root.querySelector('#mobile-menu'));
      expect(menu.classList.contains('hidden')).toBeFalse();
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

  describe('desktop navigation links', () => {
    it('should render the home anchor links by default', () => {
      const nav = asElement(root.querySelector('.nav-links'));
      const links = Array.from(nav.querySelectorAll('.nav-item')) as HTMLElement[];
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('#inicio');
      expect(hrefs).toContain('#que-es');
      expect(hrefs).toContain('#servicios');
      expect(hrefs).toContain('#companias');
    });

    it('should render routing links when pageNavLinks are provided', () => {
      fixture.componentRef.setInput('navLinks', pageNavLinks);
      fixture.detectChanges();

      const nav = asElement(root.querySelector('.nav-links'));
      const links = Array.from(nav.querySelectorAll('.nav-item')) as HTMLElement[];
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('/');
      expect(hrefs).toContain('/nosotros');
      expect(hrefs).toContain('/preguntas-frecuentes');
    });
  });
});