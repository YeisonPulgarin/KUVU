import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SiteFooterComponent } from './site-footer.component';
import { logo } from '../../../content/logo';

describe('SiteFooterComponent', () => {
  let fixture: ComponentFixture<SiteFooterComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooterComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should render the brand name and tagline', () => {
    const name = root.querySelector('.footer-name');
    const tagline = root.querySelector('.footer-tagline');
    expect(name?.textContent).toContain('KUVU');
    expect(tagline?.textContent).toContain('Administración inmobiliaria');
  });

  it('should render the KUVU logo with the light variants by default', () => {
    const full = root.querySelector('.footer-logo--full') as HTMLElement;
    const responsive = root.querySelector('.footer-logo--responsive') as HTMLElement;
    expect(full.tagName).toBe('IMG');
    expect(full.getAttribute('src')).toBe(logo.light);
    expect(responsive.getAttribute('src')).toBe(logo.responsiveLight);
    expect(full.getAttribute('alt')).toBe('KUVU');
  });

  it('should swap the footer logo to the dark variants with the theme', () => {
    fixture.componentInstance.theme.toggle();
    fixture.detectChanges();
    const full = root.querySelector('.footer-logo--full');
    const responsive = root.querySelector('.footer-logo--responsive');
    expect(full?.getAttribute('src')).toBe(logo.dark);
    expect(responsive?.getAttribute('src')).toBe(logo.responsiveDark);
  });

  it('should render the public navigation links', () => {
    const links = Array.from(root.querySelectorAll('.footer-link')) as HTMLElement[];
    const hrefs = links.map((l) => l.getAttribute('href'));
    const labels = links.map((l) => l.textContent?.trim());

    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/nosotros');
    expect(hrefs).toContain('/preguntas-frecuentes');
    expect(hrefs).toContain('/acceder');

    expect(labels).toContain('Inicio');
    expect(labels).toContain('Nosotros');
    expect(labels).toContain('Preguntas frecuentes');
    expect(labels).toContain('Acceso');
  });

  it('should render the WhatsApp contact link', () => {
    const wa = root.querySelector('.footer-cta') as HTMLElement;
    expect(wa).toBeTruthy();
    expect(wa.getAttribute('href')).toContain('wa.me/573223192760');
    expect(wa.getAttribute('target')).toBe('_blank');
    expect(wa.getAttribute('rel')).toContain('noopener');
  });

  it('should render the copyright with the current year and brand', () => {
    const copy = root.querySelector('.footer-copy');
    expect(copy?.textContent).toContain(String(new Date().getFullYear()));
    expect(copy?.textContent).toContain('KUVU');
  });
});