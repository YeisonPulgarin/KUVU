import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { finePointer, motionChanges, reducedMotion } from './motion-preferences';

/** Largest shift of a magnetic button, in px. Same value as the `--magnetic-max` token. */
export const MAGNETIC_MAX_PX = 6;

/** Share of the pointer's distance to the centre that the button follows. */
export const MAGNETIC_STRENGTH = 0.25;

const clamp = (value: number) => Math.min(MAGNETIC_MAX_PX, Math.max(-MAGNETIC_MAX_PX, value));

/**
 * `[appMagnetic]`: the host follows the pointer slightly (at most 6 px) and goes back to 0 when
 * the pointer leaves. The directive only publishes `--mx` / `--my`; the global `.magnetic` rule
 * applies them with `translate`, so focus ring, click area and the button's own `transform`
 * stay untouched.
 *
 * Listeners exist only with a fine pointer (mouse, trackpad) and without reduced motion; they
 * are added or removed when those conditions change.
 */
@Directive({ selector: '[appMagnetic]', standalone: true, host: { class: 'magnetic' } })
export class MagneticDirective implements AfterViewInit, OnDestroy {
  private readonly el: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private changes?: Subscription;
  private listening = false;
  private frame = 0;
  private next = { x: 0, y: 0 };

  private readonly onMove = (event: PointerEvent) => {
    const rect = this.el.getBoundingClientRect();
    this.next = {
      x: clamp((event.clientX - (rect.left + rect.width / 2)) * MAGNETIC_STRENGTH),
      y: clamp((event.clientY - (rect.top + rect.height / 2)) * MAGNETIC_STRENGTH)
    };
    if (!this.frame) {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.write(this.next.x, this.next.y);
      });
    }
  };

  private readonly onLeave = () => {
    this.cancelFrame();
    this.write(0, 0);
  };

  ngAfterViewInit(): void {
    this.evaluate();
    this.zone.runOutsideAngular(() => {
      this.changes = motionChanges('reducedMotion', 'finePointer').subscribe(() => this.evaluate());
    });
  }

  ngOnDestroy(): void {
    this.changes?.unsubscribe();
    this.detach();
  }

  private evaluate(): void {
    if (finePointer() && !reducedMotion()) {
      this.attach();
    } else {
      this.detach();
    }
  }

  private attach(): void {
    if (this.listening) return;
    this.listening = true;
    this.zone.runOutsideAngular(() => {
      this.el.addEventListener('pointermove', this.onMove, { passive: true });
      this.el.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  private detach(): void {
    if (!this.listening) return;
    this.listening = false;
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerleave', this.onLeave);
    this.cancelFrame();
    this.el.style.removeProperty('--mx');
    this.el.style.removeProperty('--my');
  }

  private cancelFrame(): void {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  private write(x: number, y: number): void {
    this.el.style.setProperty('--mx', `${x.toFixed(2)}px`);
    this.el.style.setProperty('--my', `${y.toFixed(2)}px`);
  }
}
