import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RichTextComponent } from './rich-text.component';
import { responsible } from '../../../content/responsible';
import type { Responsible, RichText } from '../../../content/types';

describe('RichTextComponent', () => {
  let fixture: ComponentFixture<RichTextComponent>;
  let root: HTMLElement;

  const renderText = (text: RichText) => {
    fixture.componentRef.setInput('text', text);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(RichTextComponent);
    root = fixture.nativeElement as HTMLElement;
  });

  it('should render plain text segments as text', () => {
    renderText(['Hola ', 'KUVU.']);
    expect(root.textContent).toBe('Hola KUVU.');
    expect(root.children.length).toBe(0);
  });

  it('should render a pending responsible field as a visible placeholder mark', () => {
    renderText(['Responsable: ', { field: 'legalName' }, '.']);
    const mark = root.querySelector('mark.placeholder');
    expect(mark?.textContent).toBe('[RAZÓN SOCIAL]');
    expect(root.textContent).toBe('Responsable: [RAZÓN SOCIAL].');
  });

  it('should render the real value, without a mark, once the field is filled', () => {
    const data = responsible as { -readonly [K in keyof Responsible]: Responsible[K] };
    data.email = 'datos@example.com';
    try {
      renderText(['Correo: ', { field: 'email' }]);
      expect(root.querySelector('mark')).toBeNull();
      expect(root.textContent).toBe('Correo: datos@example.com');
    } finally {
      data.email = null;
    }
  });

  it('should render internal links with their fragment', () => {
    renderText(['Ver la ', { link: '/legal', fragment: 'cookies', label: 'política' }]);
    const link = root.querySelector('a.rich-link') as HTMLAnchorElement;
    expect(link.textContent).toBe('política');
    expect(link.getAttribute('href')).toBe('/legal#cookies');
  });

  it('should never interpret text as HTML', () => {
    renderText(['<b>no</b>']);
    expect(root.querySelector('b')).toBeNull();
    expect(root.textContent).toBe('<b>no</b>');
  });
});
