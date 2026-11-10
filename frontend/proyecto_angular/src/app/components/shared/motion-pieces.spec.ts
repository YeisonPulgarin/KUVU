import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatchMediaStub } from '../../motion/testing/match-media.stub';
import { AnimationFrameStub } from '../../motion/testing/animation-frame.stub';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { STAGGER_DURACION_MS, STAGGER_MAX_HIJOS, StaggerDirective } from './stagger.directive';
import { CONTEO_MS, CountUpComponent } from './count-up/count-up.component';

@Component({
  standalone: true,
  imports: [StaggerDirective],
  template: `<ul appStagger>@for (i of items; track i) { <li>{{ i }}</li> }</ul>`
})
class StaggerHost {
  items = Array.from({ length: 15 }, (_, i) => i);
}

@Component({
  standalone: true,
  imports: [CountUpComponent],
  template: `<app-count-up [value]="valor()" [format]="formato()" />`
})
class CountHost {
  valor = signal(1250);
  formato = signal<'number' | 'currency'>('number');
}

const limpio = (texto: string) => texto.replace(/\s/g, ' ').trim();

describe('motion pieces of the signed-in app', () => {
  let media: MatchMediaStub;

  afterEach(() => media.restore());

  describe('SkeletonComponent', () => {
    beforeEach(() => (media = new MatchMediaStub({ reducedMotion: false }).install()));

    it('announces loading and draws the requested rows', () => {
      const fixture = TestBed.createComponent(SkeletonComponent);
      fixture.componentRef.setInput('cantidad', 3);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute('role')).toBe('status');
      expect(host.getAttribute('aria-busy')).toBe('true');
      expect(host.querySelector('.sr-only')!.textContent).toBe('Cargando…');
      expect(host.querySelectorAll('.skeleton__row').length).toBe(3);
      expect(host.querySelector('.skeleton')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('draws cards for the stats variant', () => {
      const fixture = TestBed.createComponent(SkeletonComponent);
      fixture.componentRef.setInput('variante', 'stats');
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.querySelector('.skeleton--stats')).not.toBeNull();
      expect(host.querySelectorAll('.skeleton__card').length).toBe(4);
    });
  });

  describe('StaggerDirective', () => {
    function render(): HTMLElement {
      const fixture = TestBed.createComponent(StaggerHost);
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).querySelector('ul')!;
    }

    it('numbers the children (capped) and staggers only on the first paint', fakeAsync(() => {
      media = new MatchMediaStub({ reducedMotion: false }).install();
      const ul = render();
      const items = Array.from(ul.children) as HTMLElement[];
      expect(ul.classList).toContain('is-staggering');
      expect(items[0].style.getPropertyValue('--stagger-i')).toBe('0');
      expect(items[3].style.getPropertyValue('--stagger-i')).toBe('3');
      expect(items[14].style.getPropertyValue('--stagger-i')).toBe(String(STAGGER_MAX_HIJOS - 1));
      tick(STAGGER_DURACION_MS);
      expect(ul.classList).not.toContain('is-staggering');
    }));

    it('does nothing with reduced motion', () => {
      media = new MatchMediaStub({ reducedMotion: true }).install();
      const ul = render();
      expect(ul.classList).not.toContain('is-staggering');
      expect((ul.children[2] as HTMLElement).style.getPropertyValue('--stagger-i')).toBe('');
    });
  });

  describe('CountUpComponent', () => {
    let fixture: ComponentFixture<CountHost>;
    const visible = () => limpio((fixture.nativeElement as HTMLElement).querySelector('[aria-hidden="true"]')!.textContent!);
    const lector = () => limpio((fixture.nativeElement as HTMLElement).querySelector('.sr-only')!.textContent!);

    it('writes the final value at once with reduced motion', () => {
      media = new MatchMediaStub({ reducedMotion: true }).install();
      const frames = new AnimationFrameStub();
      fixture = TestBed.createComponent(CountHost);
      fixture.detectChanges();
      expect(visible()).toBe('1.250');
      expect(lector()).toBe('1.250');
      expect(frames.request).not.toHaveBeenCalled();
    });

    it('counts up frame by frame and lands on the exact value', () => {
      media = new MatchMediaStub({ reducedMotion: false }).install();
      const frames = new AnimationFrameStub();
      let ahora = 0;
      spyOn(performance, 'now').and.callFake(() => ahora);
      fixture = TestBed.createComponent(CountHost);
      fixture.detectChanges();
      expect(lector()).toBe('1.250');

      frames.flush();
      ahora = CONTEO_MS / 3;
      frames.flush();
      fixture.detectChanges();
      const intermedio = Number(visible().replace(/\./g, ''));
      expect(intermedio).toBeGreaterThan(0);
      expect(intermedio).toBeLessThan(1250);

      ahora = CONTEO_MS;
      frames.flush();
      fixture.detectChanges();
      expect(visible()).toBe('1.250');
      expect(frames.pending).toBe(0);
    });

    it('formats currency', () => {
      media = new MatchMediaStub({ reducedMotion: true }).install();
      fixture = TestBed.createComponent(CountHost);
      fixture.componentInstance.formato.set('currency');
      fixture.componentInstance.valor.set(1500000);
      fixture.detectChanges();
      expect(visible()).toContain('1.500.000');
      expect(visible()).toContain('$');
    });
  });
});
