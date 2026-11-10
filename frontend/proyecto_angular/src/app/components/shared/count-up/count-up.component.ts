import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked
} from '@angular/core';
import { reducedMotion } from '../../../motion/motion-preferences';
import { formatMoneda } from '../formato';

/** Length of the count. */
export const CONTEO_MS = 900;

const NUMERO = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** Fast start, soft landing (same family as `--ease-out-expo`). */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Indicator figure that counts from its previous value (0 at first) to the new one. The last
 * frame writes the exact value; with reduced motion it is written at once. Screen readers get
 * only the final value (the moving digits are aria-hidden).
 */
@Component({
  selector: 'app-count-up',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span aria-hidden="true">{{ texto() }}</span><span class="sr-only">{{ final() }}</span>`
})
export class CountUpComponent {
  readonly value = input.required<number>();
  readonly format = input<'number' | 'currency'>('number');

  protected readonly texto = signal('');
  protected readonly final = signal('');

  private actual = 0;
  private frame?: number;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelar());
    effect(() => {
      const destino = Number(this.value()) || 0;
      untracked(() => this.animarHasta(destino));
    });
  }

  private formatear(valor: number): string {
    return this.format() === 'currency' ? formatMoneda(Math.round(valor)) : NUMERO.format(Math.round(valor));
  }

  private animarHasta(destino: number): void {
    this.cancelar();
    this.final.set(this.formatear(destino));
    const desde = this.actual;
    if (reducedMotion() || desde === destino || typeof requestAnimationFrame !== 'function') {
      this.escribir(destino);
      return;
    }
    let inicio: number | undefined;
    const paso = (ahora: number) => {
      inicio ??= ahora;
      const t = Math.min(1, (ahora - inicio) / CONTEO_MS);
      this.escribir(t >= 1 ? destino : desde + (destino - desde) * easeOutExpo(t));
      this.frame = t >= 1 ? undefined : requestAnimationFrame(paso);
    };
    this.frame = requestAnimationFrame(paso);
  }

  private escribir(valor: number): void {
    this.actual = valor;
    this.texto.set(this.formatear(valor));
  }

  private cancelar(): void {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }
}
