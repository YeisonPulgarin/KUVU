import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RichTextComponent } from './rich-text.component';
import type { RichText } from '../../../content/types';

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

  it('should render a present responsible field with its prefix and suffix', () => {
    renderText(['Responsable: ', { field: 'legalName', suffix: ' (Colombia)' }, '.']);
    expect(root.textContent).toBe('Responsable: KUVU (Colombia).');
  });

  it('should leave out an absent field together with its surrounding phrase', () => {
    renderText(['KUVU', { field: 'taxId', prefix: ', identificado con NIT ' }, ', en Bogotá.']);
    expect(root.textContent).toBe('KUVU, en Bogotá.');
    expect(root.textContent).not.toContain('NIT');
  });

  it('should never render placeholder marks', () => {
    renderText(['Correo', { field: 'email', prefix: ': ' }]);
    expect(root.querySelector('mark')).toBeNull();
    expect(root.textContent).toBe('Correo');
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
