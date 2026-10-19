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
    const intro = root.querySelector('.legal-intro') as HTMLElement;
    expect(intro.firstElementChild).toBe(notice);
  });

  it('should show the effective date', () => {
    const updated = root.querySelector('.legal-updated') as HTMLElement;
    expect(updated.textContent).toContain('Última actualización: 18 de octubre de 2026');
    expect(updated.querySelector('mark')).toBeNull();
  });

  it('should show the filled phone and attention area without placeholder marks', () => {
    const text = (root.querySelector('#tratamiento-datos') as HTMLElement).textContent ?? '';
    expect(text).toContain('+57 322 319 2760');
    expect(text).toContain('Equipo KUVU — Protección de datos personales');
    const marks = Array.from(root.querySelectorAll('#tratamiento-datos mark')).map((m) => m.textContent);
    expect(marks).not.toContain('[TELÉFONO]');
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

  it('should show the responsible data as visible placeholders', () => {
    const marks = Array.from(root.querySelectorAll('#tratamiento-datos mark.placeholder')).map((m) => m.textContent);
    expect(marks).toContain('[RAZÓN SOCIAL]');
    expect(marks).toContain('[NIT]');
    expect(marks).toContain('[DOMICILIO]');
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
