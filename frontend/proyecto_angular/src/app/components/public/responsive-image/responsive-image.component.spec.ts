import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsiveImageComponent } from './responsive-image.component';
import type { SiteImage } from '../../../content/types';
import { team } from '../../../content/team';

const sample: SiteImage = {
  basePath: '/Imagenes_web/muestra',
  widths: [640, 1024, 1536],
  width: 1536,
  height: 1024,
  alt: 'Foto de muestra'
};

describe('ResponsiveImageComponent', () => {
  let fixture: ComponentFixture<ResponsiveImageComponent>;
  let root: HTMLElement;

  const render = (inputs: Record<string, unknown>) => {
    fixture = TestBed.createComponent(ResponsiveImageComponent);
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  };

  const img = () => root.querySelector('picture img') as HTMLImageElement;
  const source = () => root.querySelector('picture source') as HTMLSourceElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ResponsiveImageComponent] }).compileComponents();
  });

  it('should offer a WebP source with one srcset entry per declared width', () => {
    render({ image: sample });
    expect(source().getAttribute('type')).toBe('image/webp');
    expect(source().getAttribute('srcset')).toBe(
      '/Imagenes_web/muestra-640.webp 640w, /Imagenes_web/muestra-1024.webp 1024w, /Imagenes_web/muestra-1536.webp 1536w'
    );
  });

  it('should fall back to a JPEG img with srcset and the largest width as src', () => {
    render({ image: sample });
    expect(img().getAttribute('srcset')).toBe(
      '/Imagenes_web/muestra-640.jpeg 640w, /Imagenes_web/muestra-1024.jpeg 1024w, /Imagenes_web/muestra-1536.jpeg 1536w'
    );
    expect(img().getAttribute('src')).toBe('/Imagenes_web/muestra-1536.jpeg');
  });

  it('should reserve layout space with the intrinsic width and height', () => {
    render({ image: sample });
    expect(img().getAttribute('width')).toBe('1536');
    expect(img().getAttribute('height')).toBe('1024');
  });

  it('should load lazily and decode asynchronously', () => {
    render({ image: sample });
    expect(img().getAttribute('loading')).toBe('lazy');
    expect(img().getAttribute('decoding')).toBe('async');
  });

  it('should apply the sizes input to both the source and the img', () => {
    render({ image: sample, sizes: '(min-width: 1152px) 1104px, 100vw' });
    expect(source().getAttribute('sizes')).toBe('(min-width: 1152px) 1104px, 100vw');
    expect(img().getAttribute('sizes')).toBe('(min-width: 1152px) 1104px, 100vw');
  });

  it('should default sizes to the full viewport width', () => {
    render({ image: sample });
    expect(img().getAttribute('sizes')).toBe('100vw');
  });

  it('should expose the alt text when the image conveys content', () => {
    render({ image: sample });
    expect(img().getAttribute('alt')).toBe('Foto de muestra');
  });

  it('should render an empty alt when marked as decorative', () => {
    render({ image: sample, decorative: true });
    expect(img().getAttribute('alt')).toBe('');
  });

  it('should switch to cover fit only when requested', () => {
    render({ image: sample });
    expect(img().classList).not.toContain('responsive-image__img--cover');
    render({ image: sample, fit: 'cover' });
    expect(img().classList).toContain('responsive-image__img--cover');
  });

  it('should resolve the team photo to the generated equipo-ycw files', () => {
    render({ image: team.image });
    expect(img().getAttribute('src')).toBe('/Imagenes_web/equipo-ycw-1536.jpeg');
    expect(source().getAttribute('srcset')).toContain('/Imagenes_web/equipo-ycw-640.webp 640w');
  });
});
