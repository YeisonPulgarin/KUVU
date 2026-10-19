import { TestBed } from '@angular/core/testing';
import { PageMetaService, SHARE_IMAGE_PATH } from './page-meta.service';
import { team } from '../content/team';
import type { PageMeta } from '../content/types';

describe('PageMetaService', () => {
  let service: PageMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageMetaService);
  });

  const nosotros: PageMeta = { title: 'Nosotros | KUVU', description: 'La historia de KUVU', path: '/nosotros' };
  const faq: PageMeta = {
    title: 'Preguntas frecuentes | KUVU',
    description: 'Segunda',
    path: '/preguntas-frecuentes'
  };
  const notFound: PageMeta = { title: 'No encontrada | KUVU', description: 'x', path: '/404', noindex: true };

  const metaContent = (selector: string) =>
    Array.from(document.head.querySelectorAll(`meta[${selector}]`)).map((m) => m.getAttribute('content'));

  afterEach(() => {
    document.head.querySelector('link[rel="canonical"]')?.remove();
    document.head.querySelector('meta[name="robots"]')?.remove();
  });

  it('should set the document title and the meta description', () => {
    service.setPage(nosotros);
    expect(document.title).toBe('Nosotros | KUVU');
    expect(metaContent('name="description"')).toEqual(['La historia de KUVU']);
  });

  it('should publish Open Graph and Twitter card tags with absolute URLs', () => {
    service.setPage(nosotros);
    expect(metaContent('property="og:title"')).toEqual(['Nosotros | KUVU']);
    expect(metaContent('property="og:description"')).toEqual(['La historia de KUVU']);
    expect(metaContent('property="og:type"')).toEqual(['website']);
    expect(metaContent('property="og:url"')).toEqual([`${location.origin}/nosotros`]);
    expect(metaContent('property="og:locale"')).toEqual(['es_CO']);
    expect(metaContent('property="og:image"')).toEqual([`${location.origin}${SHARE_IMAGE_PATH}`]);
    expect(metaContent('name="twitter:card"')).toEqual(['summary_large_image']);
    expect(metaContent('name="twitter:title"')).toEqual(['Nosotros | KUVU']);
  });

  it('should share an image that exists among the site images', () => {
    expect(SHARE_IMAGE_PATH).toBe(`${team.image.basePath}-1024.jpeg`);
    expect(team.image.widths).toContain(1024);
  });

  it('should update every tag in place when navigating, without duplicates', () => {
    service.setPage(nosotros);
    service.setPage(faq);
    expect(document.title).toBe('Preguntas frecuentes | KUVU');
    expect(metaContent('name="description"')).toEqual(['Segunda']);
    expect(metaContent('property="og:title"')).toEqual(['Preguntas frecuentes | KUVU']);
    expect(metaContent('property="og:url"')).toEqual([`${location.origin}/preguntas-frecuentes`]);
    expect(metaContent('name="twitter:description"')).toEqual(['Segunda']);
  });

  it('should keep a single canonical link pointing to the current page', () => {
    service.setPage(nosotros);
    service.setPage(faq);
    const links = document.head.querySelectorAll('link[rel="canonical"]');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe(`${location.origin}/preguntas-frecuentes`);
  });

  it('should add robots noindex only for noindex pages and remove it afterwards', () => {
    service.setPage(notFound);
    expect(metaContent('name="robots"')).toEqual(['noindex']);
    service.setPage(nosotros);
    expect(metaContent('name="robots"')).toEqual([]);
  });

  describe('generic JSON-LD', () => {
    afterEach(() => service.clearJsonLd('test-jsonld'));

    it('should publish one script per id, replacing its data, as text', () => {
      service.setJsonLd('test-jsonld', { '@type': 'Organization', name: '<b>KUVU</b>' });
      service.setJsonLd('test-jsonld', { '@type': 'WebSite', name: 'KUVU' });
      const scripts = document.head.querySelectorAll('#test-jsonld');
      expect(scripts.length).toBe(1);
      expect(scripts[0].getAttribute('type')).toBe('application/ld+json');
      expect(JSON.parse(scripts[0].textContent ?? '')['@type']).toBe('WebSite');
      expect(scripts[0].children.length).toBe(0);
    });

    it('should remove the script on clear, and tolerate clearing twice', () => {
      service.setJsonLd('test-jsonld', {});
      service.clearJsonLd('test-jsonld');
      service.clearJsonLd('test-jsonld');
      expect(document.getElementById('test-jsonld')).toBeNull();
    });
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
      service.setPage({ title: 'Nosotros | KUVU', description: 'Descripción', path: '/nosotros' });
      service.setBreadcrumb(items);
      expect(document.title).toBe('Nosotros | KUVU');
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Descripción');
    });
  });
});