import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PreguntasFrecuentesComponent } from './preguntas-frecuentes.component';
import { faqGroups } from '../../../content';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

describe('PreguntasFrecuentesComponent', () => {
  let fixture: ComponentFixture<PreguntasFrecuentesComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [PreguntasFrecuentesComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PreguntasFrecuentesComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('shared site chrome', () => {
    it('should render the shared header and footer', () => {
      expect(root.querySelector('app-site-header')).toBeTruthy();
      expect(root.querySelector('app-site-footer')).toBeTruthy();
    });

    it('should pass the page navigation links to the header', () => {
      const links = Array.from(root.querySelectorAll('.nav-links .nav-item')) as HTMLElement[];
      const hrefs = links.map((l) => l.getAttribute('href'));
      expect(hrefs).toEqual(['/', '/nosotros', '/preguntas-frecuentes']);
    });
  });

  describe('meta', () => {
    it('should set the page title and description on init', () => {
      expect(document.title).toBe('Preguntas frecuentes | KUVU');
      const meta = document.querySelector('meta[name="description"]');
      expect(meta?.getAttribute('content')).toContain('KUVU');
    });
  });

  describe('content', () => {
    it('should render every FAQ group with its title', () => {
      const groups = Array.from(root.querySelectorAll('.faq-group')) as HTMLElement[];
      expect(groups.length).toBe(faqGroups.length);

      const titles = groups.map((g) => g.querySelector('.faq-group-title')?.textContent?.trim());
      faqGroups.forEach((group) => expect(titles).toContain(group.group));
    });

    it('should render every question with its answer visible', () => {
      const items = Array.from(root.querySelectorAll('.faq-item')) as HTMLElement[];
      const expectedCount = faqGroups.reduce((total, group) => total + group.items.length, 0);
      expect(items.length).toBe(expectedCount);

      const qas = items.map((item) => ({
        q: item.querySelector('.faq-q')?.textContent?.trim() ?? '',
        a: item.querySelector('.faq-a')?.textContent?.trim() ?? ''
      }));

      faqGroups.forEach((group) => {
        group.items.forEach((item) => {
          const match = qas.find((qa) => qa.q === item.q);
          expect(match).toBeTruthy();
          expect(match?.a).toBe(item.a);
        });
      });
    });

    it('should group each question under the expected group', () => {
      const groups = Array.from(root.querySelectorAll('.faq-group')) as HTMLElement[];
      groups.forEach((group, index) => {
        const questions = Array.from(group.querySelectorAll('.faq-q')) as HTMLElement[];
        const expected = faqGroups[index]?.items.map((i) => i.q);
        expect(questions.map((q) => q.textContent?.trim())).toEqual(expected);
      });
    });
  });

  describe('reveals', () => {
    it('should mark each FAQ group for reveal', () => {
      expect(root.querySelectorAll('.faq-group[data-reveal]').length).toBe(faqGroups.length);
    });
  });

  // breadcrumb-y-cta-legible, slice breadcrumb (CA-3, CA-6, CA-7).
  describe('breadcrumb', () => {
    it('should render "Inicio › Preguntas frecuentes" inside the page hero, before the h1', () => {
      const hero = asElement(root.querySelector('.page-hero'));
      const nav = asElement(hero.querySelector('nav[aria-label="Ruta de navegación"]'));
      const h1 = asElement(hero.querySelector('h1'));
      expect(nav.textContent?.replace(/\s+/g, ' ').trim()).toBe('Inicio › Preguntas frecuentes');
      expect(nav.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('should publish a single BreadcrumbList with two absolute items', () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scripts.length).toBe(1);
      const data = JSON.parse(scripts[0].textContent ?? '');
      expect(data['@type']).toBe('BreadcrumbList');
      expect(data.itemListElement.map((i: { name: string; item: string }) => [i.name, i.item])).toEqual([
        ['Inicio', `${location.origin}/`],
        ['Preguntas frecuentes', `${location.origin}/preguntas-frecuentes`]
      ]);
    });

    it('should remove the BreadcrumbList when the page is destroyed', () => {
      fixture.destroy();
      expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
    });
  });
});