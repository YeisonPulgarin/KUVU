import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TeamBandComponent } from './team-band.component';
import { ScrollMotionService } from '../../../motion/scroll-motion.service';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';

@Component({
  standalone: true,
  imports: [TeamBandComponent],
  providers: [ScrollMotionService],
  template: `<section id="equipo" app-team-band aria-labelledby="equipo-title"></section>`
})
class HostComponent {}

const BRAND_GREEN = 'rgb(47, 74, 47)';

describe('TeamBandComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let band: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    band = (fixture.nativeElement as HTMLElement).querySelector('#equipo') as HTMLElement;
  });

  // Regresión verify D-1: Tailwind v4 no emite --color-brand-700 al CSS global, así que la
  // banda debe resolver su verde con un fallback propio. Sin él, el fondo queda transparente
  // y el texto blanco es invisible en mobile, y el velo desaparece en desktop.
  it('should resolve the brand green even when --color-brand-700 is not defined globally', () => {
    const style = getComputedStyle(band);
    expect(style.getPropertyValue('--team-band-green').trim()).toBe('#2f4a2f');
    expect(style.backgroundColor).toBe(BRAND_GREEN);
  });

  it('should keep the text white over the band', () => {
    const title = band.querySelector('.team-band-title') as HTMLElement;
    expect(getComputedStyle(title).color).toBe('rgb(255, 255, 255)');
  });

  it('should frame the photo high enough to keep the YCW logo inside the crop', () => {
    const media = band.querySelector('.team-band-media') as HTMLElement;
    expect(getComputedStyle(media).getPropertyValue('--responsive-image-position').trim()).toBe(
      'center 10%'
    );
  });

  it('should draw the brand overlay on wide viewports', () => {
    const media = band.querySelector('.team-band-media') as HTMLElement;
    const overlay = getComputedStyle(media, '::after').backgroundImage;
    if (window.matchMedia('(min-width: 768px)').matches) {
      expect(overlay).toContain('linear-gradient');
    } else {
      expect(overlay).toBe('none');
    }
  });

  // home-animaciones, slice home (RF-05, RF-09, CA-12b).
  describe('photo motion', () => {
    let media: MatchMediaStub;
    let register: jasmine.Spy;

    function renderWith(initial: { desktop: boolean; reducedMotion: boolean }): HTMLElement {
      fixture.destroy();
      media = new MatchMediaStub(initial).install();
      register = spyOn(ScrollMotionService.prototype, 'register').and.callThrough();
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).querySelector('.team-band-media') as HTMLElement;
    }

    afterEach(() => media.restore());

    it('opens the photo with the clip-path reveal', () => {
      const photo = renderWith({ desktop: false, reducedMotion: false });
      expect(photo.getAttribute('data-reveal')).toBe('clip');
    });

    it('tracks the photo for parallax on desktop without reduced motion', () => {
      const photo = renderWith({ desktop: true, reducedMotion: false });
      expect(register).toHaveBeenCalledTimes(1);
      expect(register.calls.mostRecent().args[0].element).toBe(photo);
    });

    it('has no parallax below 1024 px or with reduced motion', () => {
      renderWith({ desktop: false, reducedMotion: false });
      expect(register).not.toHaveBeenCalled();
      media.restore();
      register.and.callThrough();
      fixture.destroy();
      media = new MatchMediaStub({ desktop: true, reducedMotion: true }).install();
      fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      expect(register).not.toHaveBeenCalled();
    });

    it('turns the parallax on and off when the viewport crosses 1024 px, back to neutral', () => {
      const photo = renderWith({ desktop: false, reducedMotion: false });
      media.set('desktop', true);
      expect(register).toHaveBeenCalledTimes(1);
      register.calls.mostRecent().args[0].write(0.9);
      expect(photo.style.getPropertyValue('--p')).toBe('0.9000');

      media.set('desktop', false);
      expect(photo.style.getPropertyValue('--p')).toBe('');
    });
  });
});
