import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  booleanAttribute,
  inject,
  input,
  output
} from '@angular/core';
import { Subscription } from 'rxjs';
import { desktop, motionChanges, reducedMotion } from './motion-preferences';
import { ScrollMotionService, ScrollRange } from './scroll-motion.service';

/**
 * `[appScrollProgress]`: registers the host in the ScrollMotionService and publishes its
 * scroll progress as `--p` (0–1) while it is in view. The value of the attribute picks the
 * range (`cover` by default, `contain` or `exit`).
 *
 * Nothing is registered with reduced motion, and with `desktopOnly` nothing is registered
 * below 1024 px either. When those conditions change, the target is registered or removed
 * and `--p` is cleared, so the element goes back to its neutral position.
 */
@Directive({ selector: '[appScrollProgress]', standalone: true })
export class ScrollProgressDirective implements AfterViewInit, OnDestroy {
  readonly range = input<ScrollRange | ''>('', { alias: 'appScrollProgress' });
  readonly desktopOnly = input(false, { transform: booleanAttribute });

  /** Progress of the host on each frame it is tracked (emitted outside the Angular zone). */
  readonly progressChange = output<number>();

  private readonly el: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly scroll = inject(ScrollMotionService);
  private readonly zone = inject(NgZone);
  private unregister?: () => void;
  private changes?: Subscription;

  ngAfterViewInit(): void {
    this.evaluate();
    this.zone.runOutsideAngular(() => {
      this.changes = motionChanges('reducedMotion', 'desktop').subscribe(() => this.evaluate());
    });
  }

  ngOnDestroy(): void {
    this.changes?.unsubscribe();
    this.stop();
  }

  private evaluate(): void {
    const enabled = !reducedMotion() && (!this.desktopOnly() || desktop());
    if (enabled && !this.unregister) {
      this.unregister = this.scroll.register({
        element: this.el,
        range: this.range() || 'cover',
        write: (progress) => {
          this.el.style.setProperty('--p', progress.toFixed(4));
          this.progressChange.emit(progress);
        }
      });
    } else if (!enabled) {
      this.stop();
    }
  }

  private stop(): void {
    if (!this.unregister) return;
    this.unregister();
    this.unregister = undefined;
    this.el.style.removeProperty('--p');
  }
}
