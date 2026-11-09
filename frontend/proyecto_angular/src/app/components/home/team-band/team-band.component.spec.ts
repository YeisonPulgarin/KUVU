import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TeamBandComponent } from './team-band.component';
import { ScrollMotionService } from '../../../motion/scroll-motion.service';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';
import { team } from '../../../content';

@Component({
  standalone: true,
  imports: [TeamBandComponent],
  providers: [ScrollMotionService],
  template: `<section id="equipo" app-team-band aria-labelledby="equipo-title"></section>`
})
class HostComponent {}


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

  it('should show the featured team photo with its descriptive alt text', () => {
    const img = band.querySelector('.team-band-media app-responsive-image picture img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/Imagenes_web/equipo-kuvu-1-1200.jpeg');
    expect(img.getAttribute('alt')).toBe(team.photos[0].alt);
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('should frame the photo with a border and a hard shadow over the tinted surface', () => {
    const media = getComputedStyle(band.querySelector('.team-band-media') as HTMLElement);
    expect(media.borderTopWidth).toBe('2px');
    expect(media.boxShadow).toContain('8px 8px 0px');
    expect(getComputedStyle(band).backgroundColor).toBe('rgb(232, 239, 232)');
  });

  it('should title the section in display type, emphasizing KUVU, and list the members', () => {
    const title = band.querySelector('h2#equipo-title') as HTMLElement;
    expect(title.textContent).toBe(team.title);
    expect(title.querySelector('.tape')?.textContent).toBe('KUVU');
    expect(band.querySelector('.team-band-caption')?.textContent?.trim()).toBe(team.members.join(' · '));
    expect(band.querySelector('a.team-band-link')?.getAttribute('href')).toBe('/nosotros');
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

    it('tracks the photo on desktop without reduced motion', () => {
      const photo = renderWith({ desktop: true, reducedMotion: false });
      expect(register).toHaveBeenCalledTimes(1);
      expect(register.calls.mostRecent().args[0].element).toBe(photo);
    });

    it('does not track the photo below 1024 px or with reduced motion', () => {
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

    it('turns the tracking on and off when the viewport crosses 1024 px, back to neutral', () => {
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
