import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Loading placeholder of the signed-in screens, shown while `DataService.esperandoDatos()`.
 * `table` draws rows of bars, `cards` and `stats` draw cards. The shimmer runs only without
 * reduced motion (shared.styles.scss); assistive tech hears "Cargando…".
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', 'aria-busy': 'true' },
  template: `
    <span class="sr-only">{{ etiqueta() }}</span>
    <div class="skeleton skeleton--{{ variante() }}" aria-hidden="true">
      @for (i of items(); track i) {
        @if (variante() === 'table') {
          <div class="skeleton__row">
            <span class="skeleton__bar"></span><span class="skeleton__bar"></span>
            <span class="skeleton__bar"></span><span class="skeleton__bar"></span>
          </div>
        } @else {
          <div class="skeleton__card">
            @if (variante() === 'stats') {
              <span class="skeleton__bar skeleton__bar--alta"></span>
              <span class="skeleton__bar skeleton__bar--corta"></span>
            } @else {
              <span class="skeleton__bar"></span>
              <span class="skeleton__bar"></span>
              <span class="skeleton__bar skeleton__bar--corta"></span>
            }
          </div>
        }
      }
    </div>
  `
})
export class SkeletonComponent {
  readonly variante = input<'table' | 'cards' | 'stats'>('table');
  readonly cantidad = input(4);
  readonly etiqueta = input('Cargando…');
  protected readonly items = computed(() => Array.from({ length: this.cantidad() }, (_, i) => i));
}
