import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LegalComponent } from './legal.component';
import { legalDocuments } from '../../../content/legal';
import { legalAnchors } from '../../../content/legal-index';
import { pageMeta } from '../../../content/pages';
import { PageMetaService } from '../../../services/page-meta.service';

describe('LegalComponent', () => {
  let fixture: ComponentFixture<LegalComponent>;
  let root: HTMLElement;
  let meta: PageMetaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    meta = TestBed.inject(PageMetaService);
    spyOn(meta, 'setPage').and.callThrough();
    fixture = TestBed.createComponent(LegalComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => meta.clearBreadcrumb());

  it('should publish its own page meta and the breadcrumb "Inicio › Legal"', () => {
    expect(meta.setPage).toHaveBeenCalledOnceWith(pageMeta.legal);
    expect(root.querySelector('app-breadcrumb [aria-current="page"]')?.textContent?.trim()).toBe('Legal');
  });

  it('should warn at the top that the texts are a base and not legal advice', () => {
    const notice = root.querySelector('.legal-notice') as HTMLElement;
    expect(notice.textContent).toContain('No constituyen asesoría legal');
    expect(notice.textContent).toContain(
      'KUVU es un proyecto académico desarrollado en la Universidad Cooperativa de Colombia.'
    );
    const intro = root.querySelector('.legal-intro') as HTMLElement;
    expect(intro.firstElementChild).toBe(notice);
  });

  it('should show the effective date', () => {
    const updated = root.querySelector('.legal-updated') as HTMLElement;
    expect(updated.textContent).toContain('Última actualización: 18 de octubre de 2026');
    expect(updated.querySelector('mark')).toBeNull();
  });

  it('should identify KUVU with its domicile, phone and attention area', () => {
    const text = (root.querySelector('#tratamiento-datos') as HTMLElement).textContent ?? '';
    expect(text).toContain('es KUVU, con domicilio en Bogotá D.C., Colombia.');
    expect(text).toContain('+57 322 319 2760');
    expect(text).toContain('Equipo KUVU — Protección de datos personales');
  });

  it('should not show a tax id, an address or an email, nor empty lines for them', () => {
    const text = root.textContent ?? '';
    expect(text).not.toContain('NIT');
    expect(text).not.toContain('Dirección:');
    expect(text).not.toContain('Correo electrónico:');
    const items = Array.from(root.querySelectorAll('#tratamiento-datos li'));
    items.forEach((li) => expect(li.textContent?.trim().length).toBeGreaterThan(0));
  });

  it('should render no placeholder marks anywhere', () => {
    expect(root.querySelector('mark')).toBeNull();
    expect(root.textContent).not.toMatch(/\[[A-ZÁÉÍÓÚ ]+\]/);
  });

  it('should send data rights requests to the contact form', () => {
    expect(root.querySelector('#tratamiento-datos a[href="/contacto"]')).toBeTruthy();
    expect(root.querySelector('#terminos-uso a[href="/contacto"]')).toBeTruthy();
  });

  it('should index the four documents with links to their anchors', () => {
    const links = Array.from(root.querySelectorAll('.legal-index a'));
    expect(links.length).toBe(4);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      Object.values(legalAnchors).map((anchor) => `/legal#${anchor}`)
    );
    expect(links.map((a) => a.querySelector('.legal-index-number')?.textContent)).toEqual([
      '01',
      '02',
      '03',
      '04'
    ]);
  });

  it('should render each document as a section with the anchor id and its title', () => {
    Object.values(legalAnchors).forEach((anchor, i) => {
      const doc = root.querySelector(`article#${anchor}`) as HTMLElement;
      expect(doc).withContext(anchor).toBeTruthy();
      expect(doc.querySelector('h2')?.textContent?.trim()).toBe(legalDocuments[i].title);
    });
  });

  it('should render every block heading of the data policy', () => {
    const headings = Array.from(root.querySelectorAll('#tratamiento-datos h3')).map((h) => h.textContent?.trim());
    expect<(string | undefined)[]>(headings).toEqual(legalDocuments[0].blocks.map((b) => b.heading));
  });

  it('should link the privacy notice to the data policy anchor', () => {
    expect(root.querySelector('#aviso-privacidad a[href="/legal#tratamiento-datos"]')).toBeTruthy();
  });

  it('should list the browser storage in the cookies section', () => {
    const items = Array.from(root.querySelectorAll('#cookies li')).map((li) => li.textContent ?? '');
    expect(items.length).toBe(3);
    expect(items[0]).toContain('Preferencia de tema');
  });
});
