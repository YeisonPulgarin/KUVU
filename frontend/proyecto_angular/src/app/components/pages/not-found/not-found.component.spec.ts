import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';
import { pageMeta } from '../../../content/pages';
import { PageMetaService } from '../../../services/page-meta.service';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => document.head.querySelector('meta[name="robots"]')?.remove());

  it('should explain that the page was not found', () => {
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Página no encontrada');
  });

  it('should publish its own title and robots noindex', () => {
    expect(document.title).toBe(pageMeta.notFound.title);
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });

  it('should link back to the home', () => {
    const home = root.querySelector('main a.btn-home') as HTMLAnchorElement;
    expect(home.getAttribute('href')).toBe('/');
    expect(home.textContent).toContain('Volver al inicio');
  });

  it('should keep the single site navigation in its header', () => {
    const hrefs = Array.from(root.querySelectorAll('app-site-header .nav-links a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/servicios', '/nosotros', '/preguntas-frecuentes', '/contacto']);
  });

  it('should not show a breadcrumb', () => {
    expect(root.querySelector('app-breadcrumb')).toBeNull();
  });

  it('should leave robots indexable again on the next page', () => {
    TestBed.inject(PageMetaService).setPage(pageMeta.home);
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });
});
