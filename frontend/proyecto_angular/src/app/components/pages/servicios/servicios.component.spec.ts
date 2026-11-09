import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiciosComponent } from './servicios.component';
import { benefitsByRole, services } from '../../../content';
import { pageMeta } from '../../../content/pages';
import { PageMetaService } from '../../../services/page-meta.service';

describe('ServiciosComponent', () => {
  let fixture: ComponentFixture<ServiciosComponent>;
  let root: HTMLElement;
  let meta: PageMetaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    meta = TestBed.inject(PageMetaService);
    spyOn(meta, 'setPage').and.callThrough();
    fixture = TestBed.createComponent(ServiciosComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => meta.clearBreadcrumb());

  it('should publish its own page meta', () => {
    expect(meta.setPage).toHaveBeenCalledOnceWith(pageMeta.servicios);
    expect(document.title).toBe(pageMeta.servicios.title);
  });

  it('should show the title and the breadcrumb "Inicio › Servicios"', () => {
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Servicios');
    expect(root.querySelector('app-breadcrumb [aria-current="page"]')?.textContent?.trim()).toBe(
      'Servicios'
    );
  });

  it('should list every service with title, description and icon', () => {
    const cards = Array.from(root.querySelectorAll('.service-card'));
    expect(cards.length).toBe(services.length);
    cards.forEach((card, i) => {
      expect(card.querySelector('h3')?.textContent?.trim()).toBe(services[i].title);
      expect(card.querySelector('p')?.textContent?.trim()).toBe(services[i].description);
      expect(card.querySelector('app-service-icon svg')).toBeTruthy();
    });
  });

  it('should list every benefit by role with its points', () => {
    const cards = Array.from(root.querySelectorAll('.role-card'));
    expect(cards.length).toBe(benefitsByRole.length);
    cards.forEach((card, i) => {
      expect(card.querySelector('.role-title')?.textContent?.trim()).toBe(benefitsByRole[i].title);
      expect(card.querySelectorAll('.role-points li').length).toBe(benefitsByRole[i].points.length);
    });
  });

  it('should close with a secondary "Contactar" link to /contacto', () => {
    const cta = root.querySelector('main a.btn-secondary') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/contacto');
    expect(cta.textContent).toContain('Contactar');
    expect(cta.querySelector('.link-arrow-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('main .btn-primary')).toBeNull();
  });

  it('should number its sections correlatively from 01, hidden from assistive tech', () => {
    const eyebrows = Array.from(root.querySelectorAll('main .section-eyebrow'));
    expect(eyebrows.map((e) => e.textContent?.trim())).toEqual(['01', '02', '03']);
    eyebrows.forEach((e) => expect(e.getAttribute('aria-hidden')).toBe('true'));
  });

  it('should reveal its cards on scroll', () => {
    expect(root.querySelectorAll('.service-card[data-reveal]').length).toBe(services.length);
  });
});
