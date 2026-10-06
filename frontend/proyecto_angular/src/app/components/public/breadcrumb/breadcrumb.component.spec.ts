import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';
import { PageMetaService } from '../../../services/page-meta.service';
import { breadcrumbFor, pageNavLinks } from '../../../content/site';

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let root: HTMLElement;
  let pageMeta: PageMetaService;
  const items = breadcrumbFor('/nosotros');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    pageMeta = TestBed.inject(PageMetaService);
    spyOn(pageMeta, 'setBreadcrumb').and.callThrough();
    spyOn(pageMeta, 'clearBreadcrumb').and.callThrough();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => pageMeta.clearBreadcrumb());

  it('should expose a named navigation landmark with an ordered list', () => {
    const nav = root.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Ruta de navegación');
    expect(nav?.querySelectorAll('ol > li').length).toBe(2);
  });

  it('should link "Inicio" to the home', () => {
    const link = root.querySelector('ol > li:first-child a') as HTMLAnchorElement;
    expect(link.textContent?.trim()).toBe('Inicio');
    expect(link.getAttribute('href')).toBe('/');
  });

  it('should render the current page as plain text marked aria-current', () => {
    const last = root.querySelector('ol > li:last-child') as HTMLElement;
    expect(last.querySelector('a')).toBeNull();
    const current = last.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Nosotros');
  });

  it('should show the › separator between items, hidden from assistive tech', () => {
    const separators = Array.from(root.querySelectorAll('.breadcrumb-separator'));
    expect(separators.length).toBe(1);
    expect(separators[0].textContent?.trim()).toBe('›');
    expect(separators[0].getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('ol > li:first-child .breadcrumb-separator')).toBeNull();
    expect(root.textContent?.replace(/\s+/g, ' ').trim()).toBe('Inicio › Nosotros');
  });

  it('should publish the same items as JSON-LD on init and clear them on destroy', () => {
    expect(pageMeta.setBreadcrumb).toHaveBeenCalledOnceWith(items);
    expect(document.querySelectorAll('script[type="application/ld+json"]').length).toBe(1);

    fixture.destroy();
    expect(pageMeta.clearBreadcrumb).toHaveBeenCalled();
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});

describe('breadcrumbFor', () => {
  it('should return Inicio and the requested page, taken from pageNavLinks', () => {
    expect(breadcrumbFor('/nosotros')).toEqual([pageNavLinks[0], { label: 'Nosotros', href: '/nosotros' }]);
    expect(breadcrumbFor('/preguntas-frecuentes').map((item) => item.label)).toEqual([
      'Inicio',
      'Preguntas frecuentes'
    ]);
  });

  it('should throw for routes that are not internal public pages', () => {
    expect(() => breadcrumbFor('/login')).toThrowError(/login/);
    expect(() => breadcrumbFor('/')).toThrowError();
  });
});
