import { TestBed } from '@angular/core/testing';
import { PageMetaService } from './page-meta.service';

describe('PageMetaService', () => {
  let service: PageMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageMetaService);
  });

  it('should set the document title', () => {
    service.setPage('Nosotros | KUVU', 'La historia de KUVU');
    expect(document.title).toBe('Nosotros | KUVU');
  });

  it('should set the meta description', () => {
    service.setPage('Nosotros | KUVU', 'La historia de KUVU');
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('La historia de KUVU');
  });

  it('should update the page when setPage is called again', () => {
    service.setPage('Nosotros | KUVU', 'Primera');
    service.setPage('Preguntas frecuentes | KUVU', 'Segunda');
    expect(document.title).toBe('Preguntas frecuentes | KUVU');
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute('content')).toBe('Segunda');
  });

  describe('breadcrumb JSON-LD', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Nosotros', href: '/nosotros' }
    ];
    const scripts = () =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]')) as HTMLScriptElement[];

    afterEach(() => service.clearBreadcrumb());

    it('should publish a BreadcrumbList with absolute URLs on the current origin', () => {
      service.setBreadcrumb(items);
      const found = scripts();
      expect(found.length).toBe(1);
      expect(found[0].parentElement).toBe(document.head);
      const data = JSON.parse(found[0].textContent ?? '');
      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('BreadcrumbList');
      expect(data.itemListElement).toEqual([
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${location.origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Nosotros', item: `${location.origin}/nosotros` }
      ]);
    });

    it('should keep a single script when called again, with the latest items', () => {
      service.setBreadcrumb(items);
      service.setBreadcrumb([items[0], { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' }]);
      const found = scripts();
      expect(found.length).toBe(1);
      expect(JSON.parse(found[0].textContent ?? '').itemListElement[1].name).toBe('Preguntas frecuentes');
    });

    it('should remove the script on clear, and tolerate clearing twice', () => {
      service.setBreadcrumb(items);
      service.clearBreadcrumb();
      service.clearBreadcrumb();
      expect(scripts().length).toBe(0);
    });

    it('should not touch title or description', () => {
      service.setPage('Nosotros | KUVU', 'Descripción');
      service.setBreadcrumb(items);
      expect(document.title).toBe('Nosotros | KUVU');
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Descripción');
    });
  });
});