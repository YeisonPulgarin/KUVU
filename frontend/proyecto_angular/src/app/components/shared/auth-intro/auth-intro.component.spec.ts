import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthIntroComponent, INTRO_DURATION_MS, SOUND_START_MS, TURN_START_MS } from './auth-intro.component';
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
    it('dura 2900 ms: no emite completed a los 2899 ms y si a los 2900 ms', fakeAsync(() => {
      expect(INTRO_DURATION_MS).toBe(2900);
      fixture.detectChanges();
      tick(INTRO_DURATION_MS - 1);
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
    it('reproduce el sonido una sola vez a los SOUND_START_MS, con la hoja ya en movimiento', fakeAsync(() => {
      expect(SOUND_START_MS).toBeGreaterThan(TURN_START_MS);
      fixture.detectChanges();
      tick(SOUND_START_MS - 1);
      expect(sound.play).not.toHaveBeenCalled();
      tick(1);
      expect(sound.play).toHaveBeenCalledTimes(1);
      tick(INTRO_DURATION_MS);
      expect(sound.play).toHaveBeenCalledTimes(1);
    }));

    it('detiene el sonido al saltar', fakeAsync(() => {
      fixture.detectChanges();
      tick(SOUND_START_MS + 100);
      component.skip();
      expect(sound.stop).toHaveBeenCalled();
      tick(300);
    }));

    it('no reproduce el sonido si se salta antes de que empiece', fakeAsync(() => {
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
      tick(INTRO_DURATION_MS);
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
      tick(INTRO_DURATION_MS - 100);
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
      tick(INTRO_DURATION_MS);
      const event = pressKey('Enter');
      expect(event.defaultPrevented).toBeFalse();
      expect(emissions).toBe(1);
    }));
  });

  describe('coreografia CSS real', () => {
    const STEP_MS = 10;

    function rootAnimation(): { root: HTMLElement; anim: CSSAnimation } {
      fixture.detectChanges();
      const root = host.querySelector('.strip-root') as HTMLElement;
      const anim = root.getAnimations()
        .find((a) => (a as CSSAnimation).animationName.endsWith('turn-page')) as CSSAnimation;
      expect(anim).withContext('animacion turn-page en la franja raiz').toBeDefined();
      anim.pause();
      return { root, anim };
    }

    function angleAt(root: HTMLElement, anim: CSSAnimation, t: number): number {
      anim.currentTime = t;
      const m = new DOMMatrixReadOnly(getComputedStyle(root).transform);
      return (Math.atan2(-m.m13, m.m11) * 180) / Math.PI;
    }

    function firstTime(root: HTMLElement, anim: CSSAnimation, test: (deg: number) => boolean): number {
      for (let t = 0; t <= INTRO_DURATION_MS; t += STEP_MS) {
        if (test(angleAt(root, anim, t))) return t;
      }
      return Number.POSITIVE_INFINITY;
    }

    afterEach(() => fixture.destroy());

    it('la animacion de la hoja dura lo mismo que la intro', () => {
      const { anim } = rootAnimation();
      expect(anim.effect!.getComputedTiming().duration).toBe(INTRO_DURATION_MS);
    });

    it('la hoja empieza a levantarse a <= 1 s, en TURN_START_MS (R2.2.3)', () => {
      const { root, anim } = rootAnimation();
      const lift = firstTime(root, anim, (deg) => deg < -0.5);
      expect(lift).toBeLessThanOrEqual(1000);
      expect(Math.abs(lift - TURN_START_MS)).toBeLessThanOrEqual(50);
    });

    it('el pase visible dura >= 1,2 s y la intro cierra <= 250 ms despues de que la hoja sale de vista (R2.2.1, R2.2.2)', () => {
      const { root, anim } = rootAnimation();
      const lift = firstTime(root, anim, (deg) => deg < -0.5);
      const outOfView = firstTime(root, anim, (deg) => deg <= -90);
      expect(outOfView - lift).toBeGreaterThanOrEqual(1200);
      expect(INTRO_DURATION_MS - outOfView).toBeLessThanOrEqual(250);
      expect(INTRO_DURATION_MS - outOfView).toBeGreaterThanOrEqual(0);
    });

    it('lo que se ve: el selector empieza a descubrirse y queda descubierto con >= 1,2 s entre ambos (R2.2.1, R2.2.2)', () => {
      fixture.detectChanges();
      const animations = host.getAnimations({ subtree: true });
      animations.forEach((a) => a.pause());
      const hostWidth = host.getBoundingClientRect().width;
      const parts = Array.from(host.querySelectorAll('.strip-front, .strip-back'));
      const sheetRight = (t: number) => {
        animations.forEach((a) => (a.currentTime = t));
        return Math.max(...parts.map((el) => el.getBoundingClientRect().right));
      };
      let revealStart = Number.POSITIVE_INFINITY;
      let revealEnd = Number.POSITIVE_INFINITY;
      for (let t = 0; t <= INTRO_DURATION_MS; t += STEP_MS) {
        const right = sheetRight(t);
        if (revealStart === Number.POSITIVE_INFINITY && right < hostWidth * 0.98) revealStart = t;
        if (right <= hostWidth * 0.02) { revealEnd = t; break; }
      }
      expect(revealStart).toBeLessThan(revealEnd);
      expect(revealEnd - revealStart).toBeGreaterThanOrEqual(1200);
      expect(INTRO_DURATION_MS - revealEnd).toBeLessThanOrEqual(250);
    });

    it('la camara se aleja con el ancho: perspectiva >= 5 veces el ancho del host (R2.2.1 en desktop)', () => {
      fixture.detectChanges();
      const stage = host.querySelector('.stage') as HTMLElement;
      const perspective = parseFloat(getComputedStyle(stage).perspective);
      expect(perspective).toBeGreaterThanOrEqual(2200);
      expect(perspective).toBeGreaterThanOrEqual(5 * host.getBoundingClientRect().width - 1);
    });

    it('el giro es mas lento al comienzo del tramo visible que al final (R2.2.1)', () => {
      const { root, anim } = rootAnimation();
      const lift = firstTime(root, anim, (deg) => deg < -0.5);
      const outOfView = firstTime(root, anim, (deg) => deg <= -90);
      const mid = Math.round((lift + outOfView) / 2);
      const firstHalf = Math.abs(angleAt(root, anim, mid) - angleAt(root, anim, lift));
      const secondHalf = Math.abs(angleAt(root, anim, outOfView) - angleAt(root, anim, mid));
      expect(firstHalf).toBeLessThan(secondHalf);
    });
  });

  describe('dibujo y franjas', () => {
    afterEach(() => fixture.destroy());

    it('el trazo de la casa escala con el SVG: sin non-scaling-stroke (R2.5)', () => {
      fixture.detectChanges();
      const paths = Array.from(host.querySelectorAll('.page-house path')) as SVGPathElement[];
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((path) => {
        const style = getComputedStyle(path);
        expect(style.getPropertyValue('vector-effect')).not.toBe('non-scaling-stroke');
        expect(path.getAttribute('pathLength')).toBe('1');
      });
    });

    it('cada franja solapa 1 px a la anterior y su tajada queda alineada (R2.6)', () => {
      fixture.detectChanges();
      // .page carries a max-width in the shared site styles; the intro must not use it.
      expect(host.querySelector('.page')).toBeNull();
      const px = (el: Element, prop: 'left' | 'width') => parseFloat(getComputedStyle(el)[prop]);
      const strips = Array.from(host.querySelectorAll('.strip')) as HTMLElement[];
      const width = px(strips[0], 'width');
      const hostWidth = px(host, 'width');
      expect(width * 6 - 5).toBeGreaterThanOrEqual(hostWidth);
      expect(width * 6 - 5).toBeLessThanOrEqual(hostWidth + 1.5);
      strips.slice(1).forEach((strip) => {
        expect(px(strip, 'width')).toBeCloseTo(width, 2);
        expect(px(strip, 'left')).toBeCloseTo(width - 1, 2);
      });
      strips.forEach((strip, k) => {
        const page = strip.querySelector(':scope > .strip-front > .sheet-face') as HTMLElement;
        expect(px(page, 'left')).toBeCloseTo(-k * (width - 1), 2);
        expect(px(page, 'width')).toBeGreaterThanOrEqual(hostWidth);
      });
    });
  });

  describe('presentacion en capa plana (D9)', () => {
    afterEach(() => fixture.destroy());

    function animationNamed(el: Element, name: string): CSSAnimation {
      const anim = el.getAnimations()
        .find((a) => (a as CSSAnimation).animationName.endsWith(name)) as CSSAnimation;
      expect(anim).withContext(`animacion ${name}`).toBeDefined();
      anim.pause();
      return anim;
    }

    it('la casa se dibuja solo en la capa plana, despues del primer raster y antes del levante', () => {
      fixture.detectChanges();
      const overlayPaths = Array.from(host.querySelectorAll('.presentation .page-house path'));
      expect(overlayPaths.length).toBe(7);
      overlayPaths.forEach((path) => {
        const timing = animationNamed(path, 'draw-house').effect!.getComputedTiming();
        expect(timing.delay).toBeGreaterThanOrEqual(100);
        expect((timing.delay as number) + (timing.duration as number)).toBeLessThanOrEqual(TURN_START_MS);
      });
      const stripPaths = Array.from(host.querySelectorAll('.sheet-face .page-house path'));
      expect(stripPaths.length).toBe(6 * 7);
      stripPaths.forEach((path) => {
        expect(path.getAnimations().length).withContext('las copias de las franjas no repintan el trazo').toBe(0);
        expect(parseFloat(getComputedStyle(path).strokeDashoffset || '0')).toBe(0);
      });
    });

    it('la capa plana cede a las copias de las franjas en el mismo instante del levante', () => {
      fixture.detectChanges();
      const overlay = host.querySelector('.presentation') as HTMLElement;
      const out = animationNamed(overlay, 'hand-over-out');
      const copies = Array.from(host.querySelectorAll('.sheet-face .page-house, .sheet-face .page-logo'));
      expect(copies.length).toBe(12);
      const ins = copies.map((el) => animationNamed(el, 'hand-over-in'));
      const at = (t: number) => {
        out.currentTime = t;
        ins.forEach((a) => (a.currentTime = t));
        return {
          overlay: parseFloat(getComputedStyle(overlay).opacity),
          copies: copies.map((el) => parseFloat(getComputedStyle(el).opacity))
        };
      };
      const before = at(TURN_START_MS - 1);
      expect(before.overlay).toBe(1);
      before.copies.forEach((o) => expect(o).toBe(0));
      const after = at(TURN_START_MS);
      expect(after.overlay).toBe(0);
      after.copies.forEach((o) => expect(o).toBe(1));
    });
  });

  describe('sombreado continuo', () => {
    afterEach(() => fixture.destroy());

    it('cada franja continua la rampa de sombra de la anterior, sin escalones de tono (R2.6)', () => {
      fixture.detectChanges();
      const alphas = (el: Element): number[] =>
        Array.from(getComputedStyle(el).backgroundImage.matchAll(/rgba\(([^)]+)\)/g))
          .map((m) => parseFloat(m[1].split(',')[3]));
      const shades = Array.from(host.querySelectorAll('.strip-shade'));
      expect(shades.length).toBe(6);
      const ramps = shades.map(alphas);
      ramps.forEach((ramp, k) => {
        expect(ramp.length).withContext(`franja ${k}`).toBe(2);
        expect(ramp[1]).withContext(`franja ${k} oscurece hacia el borde libre`).toBeGreaterThan(ramp[0]);
        if (k > 0) {
          expect(ramp[0]).withContext(`franja ${k} empieza donde termina la ${k - 1}`).toBeCloseTo(ramps[k - 1][1], 3);
        }
      });
    });
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
      tick(INTRO_DURATION_MS);
    }));

    it('el foco inicial queda en el boton "Saltar"', fakeAsync(() => {
      fixture.detectChanges();
      expect(document.activeElement).toBe(skipButton());
      tick(INTRO_DURATION_MS);
    }));

    it('el boton mide al menos 44x44 px', fakeAsync(() => {
      fixture.detectChanges();
      const rect = skipButton().getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
      tick(INTRO_DURATION_MS);
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
      tick(INTRO_DURATION_MS);
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
      tick(INTRO_DURATION_MS);
    }));

    it('no contiene restos de la casa 3D por ensamblaje', fakeAsync(() => {
      fixture.detectChanges();
      expect(host.querySelector('.pieza, .casa, .blueprint, .particula, .glow-interior')).toBeNull();
      tick(INTRO_DURATION_MS);
    }));
  });
});
