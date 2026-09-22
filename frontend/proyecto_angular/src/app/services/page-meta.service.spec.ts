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
});