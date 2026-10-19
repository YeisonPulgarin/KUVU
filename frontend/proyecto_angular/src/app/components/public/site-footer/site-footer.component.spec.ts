import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteFooterComponent } from './site-footer.component';
import { logo } from '../../../content/logo';
import { siteNavLinks } from '../../../content/site';
import { legalAnchors } from '../../../content/legal-index';

describe('SiteFooterComponent', () => {
  let fixture: ComponentFixture<SiteFooterComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooterComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  const column = (heading: string): HTMLElement => {
    const found = Array.from(root.querySelectorAll('.footer-col')).find(
      (col) => col.querySelector('.footer-heading')?.textContent?.trim() === heading
    );
    expect(found).withContext(heading).toBeTruthy();
    return found as HTMLElement;
  };

  it('should render the brand block with logos, name and tagline', () => {
    expect(root.querySelector('.footer-name')?.textContent).toContain('KUVU');
    expect(root.querySelector('.footer-tagline')?.textContent).toContain('Administración inmobiliaria');
    expect(root.querySelector('.footer-logo--full')?.getAttribute('src')).toBe(logo.web);
    expect(root.querySelector('.footer-logo--responsive')?.getAttribute('src')).toBe(logo.responsive);
  });

  it('should keep both footer logos unchanged when the theme is dark', () => {
    fixture.componentInstance.theme.toggle();
    fixture.detectChanges();
    expect(root.querySelector('.footer-logo--full')?.getAttribute('src')).toBe(logo.web);
  });

  it('should list the site navigation in the Sitio column, plus Acceso', () => {
    const hrefs = Array.from(column('Sitio').querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([...siteNavLinks.map((l) => l.href), '/acceder']);
  });

  it('should link the four legal documents to their anchors in /legal', () => {
    const links = Array.from(column('Legal').querySelectorAll('a'));
    expect(links.length).toBe(4);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      Object.values(legalAnchors).map((anchor) => `/legal#${anchor}`)
    );
  });

  it('should offer WhatsApp and the contact form in the Contacto column', () => {
    const col = column('Contacto');
    const wa = col.querySelector('.footer-cta') as HTMLAnchorElement;
    expect(wa.getAttribute('href')).toContain('wa.me/573223192760');
    expect(wa.getAttribute('target')).toBe('_blank');
    expect(wa.getAttribute('rel')).toContain('noopener');
    expect(col.querySelector('a[href="/contacto"]')).toBeTruthy();
  });

  it('should show the email as a visible placeholder and never as an invented mailto', () => {
    const email = root.querySelector('.footer-email') as HTMLElement;
    expect(email.querySelector('mark.placeholder')?.textContent).toBe('[CORREO DE CONTACTO]');
    expect(root.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('should not render social links nor empty "#" links', () => {
    expect(root.querySelector('a[href="#"]')).toBeNull();
    const external = Array.from(root.querySelectorAll('a[href^="http"]')).map((a) => a.getAttribute('href'));
    external.forEach((href) => expect(href).toContain('wa.me'));
  });

  it('should render the copyright with the current year and brand', () => {
    const copy = root.querySelector('.footer-copy');
    expect(copy?.textContent).toContain(String(new Date().getFullYear()));
    expect(copy?.textContent).toContain('KUVU');
  });
});
