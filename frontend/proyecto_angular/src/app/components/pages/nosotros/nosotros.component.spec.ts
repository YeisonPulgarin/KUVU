import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NosotrosComponent } from './nosotros.component';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

describe('NosotrosComponent', () => {
  let component: NosotrosComponent;
  let fixture: ComponentFixture<NosotrosComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    await TestBed.configureTestingModule({
      imports: [NosotrosComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NosotrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
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
      expect(document.title).toBe('Nosotros | KUVU');
      const meta = document.querySelector('meta[name="description"]');
      expect(meta?.getAttribute('content')).toContain('KUVU');
    });
  });

  describe('content sections', () => {
    it('should render the three about sections', () => {
      const sections = Array.from(root.querySelectorAll('.about-section')) as HTMLElement[];
      expect(sections.length).toBe(3);
      const text = sections.map((s) => s.textContent ?? '').join(' ');
      expect(text).toContain('Quiénes somos');
      expect(text).toContain('Cómo operamos');
      expect(text).toContain('Con quién trabajamos');
    });

    it('should mention the real origin: three students at their university library', () => {
      expect(root.textContent).toContain('tres estudiantes universitarios');
      expect(root.textContent).toContain('biblioteca');
    });
  });

  describe('contact CTA', () => {
    it('should render a WhatsApp contact link with the pre-filled message', () => {
      const cta = asElement(root.querySelector('.btn-whatsapp'));
      expect(cta).toBeTruthy();
      expect(cta.getAttribute('href')).toContain('wa.me/573223192760');
      expect(cta.getAttribute('href')).toContain('?text=');
      expect(cta.getAttribute('target')).toBe('_blank');
      expect(cta.getAttribute('rel')).toContain('noopener');
      expect(cta.textContent?.trim()).toContain('WhatsApp');
    });

    it('should label the WhatsApp link for assistive tech', () => {
      const cta = asElement(root.querySelector('.btn-whatsapp'));
      expect(cta.getAttribute('aria-label')).toContain('WhatsApp');
    });
  });

  describe('reveals', () => {
    it('should mark about sections and origin paragraphs for reveal', () => {
      expect(root.querySelectorAll('.about-section[data-reveal]').length).toBe(3);
      expect(root.querySelectorAll('.origin .origin-paragraph[data-reveal]').length).toBe(3);
    });
  });
});