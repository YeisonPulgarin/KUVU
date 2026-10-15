import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthIntroComponent } from './auth-intro.component';
import { PageTurnSoundService } from '../../../services/page-turn-sound.service';

describe('AuthIntroComponent', () => {
  let fixture: ComponentFixture<AuthIntroComponent>;
  let component: AuthIntroComponent;
  let host: HTMLElement;
  let sound: jasmine.SpyObj<PageTurnSoundService>;
  let emissions: number;

  beforeEach(async () => {
    sound = jasmine.createSpyObj<PageTurnSoundService>('PageTurnSoundService', ['play', 'stop']);
    await TestBed.configureTestingModule({
      imports: [AuthIntroComponent],
      providers: [{ provide: PageTurnSoundService, useValue: sound }]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthIntroComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    emissions = 0;
    component.completed.subscribe(() => emissions++);
  });

  function pressKey(key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return event;
  }

  function skipButton(): HTMLButtonElement {
    return host.querySelector('button.skip') as HTMLButtonElement;
  }

  describe('duracion', () => {
    it('no emite completed a los 1999 ms y si a los 2000 ms', fakeAsync(() => {
      fixture.detectChanges();
      tick(1999);
      expect(emissions).toBe(0);
      tick(1);
      expect(emissions).toBe(1);
    }));

    it('emite una sola vez aunque pase mas tiempo', fakeAsync(() => {
      fixture.detectChanges();
      tick(6000);
      expect(emissions).toBe(1);
    }));
  });

  describe('sonido', () => {
    it('reproduce el sonido una sola vez a los 950 ms', fakeAsync(() => {
      fixture.detectChanges();
      tick(949);
      expect(sound.play).not.toHaveBeenCalled();
      tick(1);
      expect(sound.play).toHaveBeenCalledTimes(1);
      tick(2000);
      expect(sound.play).toHaveBeenCalledTimes(1);
    }));

    it('detiene el sonido al saltar', fakeAsync(() => {
      fixture.detectChanges();
      tick(1200);
      component.skip();
      expect(sound.stop).toHaveBeenCalled();
      tick(300);
    }));

    it('no reproduce el sonido si se salta antes de los 950 ms', fakeAsync(() => {
      fixture.detectChanges();
      tick(400);
      component.skip();
      tick(3000);
      expect(sound.play).not.toHaveBeenCalled();
    }));
  });

  describe('salto', () => {
    it('un clic en cualquier punto del host salta y emite en <= 300 ms', fakeAsync(() => {
      fixture.detectChanges();
      tick(500);
      const outside = jasmine.createSpy('documentClick');
      document.addEventListener('click', outside);

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      host.querySelector('.stage')!.dispatchEvent(event);

      expect(event.defaultPrevented).toBeTrue();
      expect(outside).not.toHaveBeenCalled();
      expect(emissions).toBe(0);
      tick(300);
      expect(emissions).toBe(1);
      document.removeEventListener('click', outside);
    }));

    for (const key of ['Escape', 'Enter', ' ']) {
      it(`la tecla "${key}" salta, evita la accion por defecto y emite en <= 300 ms`, fakeAsync(() => {
        fixture.detectChanges();
        tick(300);
        const event = pressKey(key);
        expect(event.defaultPrevented).toBeTrue();
        tick(300);
        expect(emissions).toBe(1);
      }));
    }

    it('otras teclas no saltan la intro', fakeAsync(() => {
      fixture.detectChanges();
      const event = pressKey('a');
      expect(event.defaultPrevented).toBeFalse();
      tick(1000);
      expect(emissions).toBe(0);
      expect(component.isSkipping()).toBeFalse();
      tick(1000);
    }));

    it('el boton "Saltar" salta sin propagar el clic y emite en <= 300 ms', fakeAsync(() => {
      fixture.detectChanges();
      tick(100);
      const outside = jasmine.createSpy('documentClick');
      document.addEventListener('click', outside);
      skipButton().click();
      expect(outside).not.toHaveBeenCalled();
      tick(300);
      expect(emissions).toBe(1);
      document.removeEventListener('click', outside);
    }));

    it('aplica el fade de salida (is-skipping) mientras sale', fakeAsync(() => {
      fixture.detectChanges();
      expect(host.classList).not.toContain('is-skipping');
      component.skip();
      fixture.detectChanges();
      expect(host.classList).toContain('is-skipping');
      tick(180);
      expect(emissions).toBe(1);
    }));

    it('emite una sola vez si el salto coincide con el timer de fin', fakeAsync(() => {
      fixture.detectChanges();
      tick(1900);
      component.skip();
      tick(1000);
      expect(emissions).toBe(1);
    }));

    it('emite una sola vez ante saltos dobles', fakeAsync(() => {
      fixture.detectChanges();
      tick(200);
      host.click();
      pressKey('Escape');
      skipButton().click();
      tick(1000);
      expect(emissions).toBe(1);
    }));

    it('tras terminar no intercepta teclas', fakeAsync(() => {
      fixture.detectChanges();
      tick(2000);
      const event = pressKey('Enter');
      expect(event.defaultPrevented).toBeFalse();
      expect(emissions).toBe(1);
    }));
  });

  describe('limpieza', () => {
    it('ngOnDestroy cancela los timers y detiene el sonido', fakeAsync(() => {
      fixture.detectChanges();
      tick(500);
      fixture.destroy();
      tick(3000);
      expect(emissions).toBe(0);
      expect(sound.play).not.toHaveBeenCalled();
      expect(sound.stop).toHaveBeenCalled();
    }));
  });

  describe('accesibilidad y markup', () => {
    it('el boton es nativo, type=button, con nombre "Saltar introduccion" y texto visible', fakeAsync(() => {
      fixture.detectChanges();
      const button = skipButton();
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-label')).toBe('Saltar introducción');
      expect(button.textContent?.trim()).toBe('Saltar');
      expect(button.closest('[aria-hidden="true"]')).toBeNull();
      tick(2000);
    }));

    it('el foco inicial queda en el boton "Saltar"', fakeAsync(() => {
      fixture.detectChanges();
      expect(document.activeElement).toBe(skipButton());
      tick(2000);
    }));

    it('el boton mide al menos 44x44 px', fakeAsync(() => {
      fixture.detectChanges();
      const rect = skipButton().getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
      tick(2000);
    }));

    it('las capas decorativas quedan ocultas a lectores de pantalla', fakeAsync(() => {
      fixture.detectChanges();
      const stage = host.querySelector('.stage') as HTMLElement;
      expect(stage.getAttribute('aria-hidden')).toBe('true');
      const decorative = host.querySelectorAll('.sheet, .cast-shadow, .page-house, .page-logo');
      decorative.forEach((el) => expect(stage.contains(el)).toBeTrue());
      const imgs = Array.from(host.querySelectorAll('img'));
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => expect(img.getAttribute('alt')).toBe(''));
      tick(2000);
    }));

    it('la hoja tiene 6 franjas anidadas, cada una con su tajada del frente', fakeAsync(() => {
      fixture.detectChanges();
      const strips = Array.from(host.querySelectorAll('.strip')) as HTMLElement[];
      expect(strips.length).toBe(6);
      strips.slice(1).forEach((strip, k) => {
        expect(strip.parentElement).toBe(strips[k]);
      });
      strips.forEach((strip, k) => {
        expect(strip.style.getPropertyValue('--i')).toBe(String(k));
        const front = strip.querySelector(':scope > .strip-front') as HTMLElement;
        expect(front.querySelector('svg.page-house')).not.toBeNull();
        const logo = front.querySelector('img.page-logo') as HTMLImageElement;
        expect(logo.getAttribute('src')).toBe('/logo-rediseno/Logo_Kuvu.png');
        expect(strip.querySelector(':scope > .strip-back')).not.toBeNull();
      });
      tick(2000);
    }));

    it('no contiene restos de la casa 3D por ensamblaje', fakeAsync(() => {
      fixture.detectChanges();
      expect(host.querySelector('.pieza, .casa, .blueprint, .particula, .glow-interior')).toBeNull();
      tick(2000);
    }));
  });
});
