import { Injectable, OnDestroy, signal } from '@angular/core';
import { reducedMotion } from '../../../motion/motion-preferences';

export type TipoToast = 'exito' | 'error';

export interface Toast {
  id: number;
  tipo: TipoToast;
  texto: string;
  /** True while the exit animation plays, right before removal. */
  saliendo?: boolean;
}

/** Time on screen: errors stay longer so they can be read. */
export const DURACION_MS: Record<TipoToast, number> = { exito: 4000, error: 6000 };
/** Older toasts leave when a new one would exceed this. */
export const MAX_TOASTS = 3;
/** Exit animation (`--dur-fast`) before the toast leaves the list. */
export const SALIDA_TOAST_MS = 200;

/**
 * Feedback messages of the signed-in app (success and error), instead of native dialogs. Root
 * service: a toast raised right before navigating stays visible on the next screen, because
 * every screen's <app-layout> renders the same list.
 */
@Injectable({ providedIn: 'root' })
export class ToastService implements OnDestroy {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private siguienteId = 0;

  exito(texto: string): number {
    return this.mostrar('exito', texto);
  }

  error(texto: string): number {
    return this.mostrar('error', texto);
  }

  /** Starts the exit (animated unless reduced motion) and removes the toast. */
  cerrar(id: number): void {
    const toast = this._toasts().find(t => t.id === id);
    if (!toast || toast.saliendo) return;
    clearTimeout(this.timers.get(id));
    if (reducedMotion()) {
      this.quitar(id);
      return;
    }
    this._toasts.update(lista => lista.map(t => (t.id === id ? { ...t, saliendo: true } : t)));
    this.timers.set(id, setTimeout(() => this.quitar(id), SALIDA_TOAST_MS));
  }

  ngOnDestroy(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  private quitar(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this._toasts.update(lista => lista.filter(t => t.id !== id));
  }

  private mostrar(tipo: TipoToast, texto: string): number {
    const toast: Toast = { id: ++this.siguienteId, tipo, texto };
    // Leaving toasts no longer count: the oldest visible ones make room for the new one.
    const visibles = this._toasts().filter(t => !t.saliendo);
    visibles.slice(0, Math.max(0, visibles.length + 1 - MAX_TOASTS)).forEach(viejo => this.quitar(viejo.id));
    this._toasts.update(actual => [...actual, toast]);
    this.timers.set(toast.id, setTimeout(() => this.cerrar(toast.id), DURACION_MS[tipo]));
    return toast.id;
  }
}
