import { Injectable, signal } from '@angular/core';

export type VarianteConfirmacion = 'danger' | 'warning' | 'neutral';

export interface OpcionesConfirmacion {
  titulo: string;
  /** Names what the action affects, e.g. the address of the local being deleted. */
  mensaje: string;
  confirmarTexto: string;
  cancelarTexto?: string;
  variante: VarianteConfirmacion;
}

export interface SolicitudConfirmacion extends OpcionesConfirmacion {
  id: number;
  resolver: (confirmado: boolean) => void;
}

/**
 * Confirmation dialog of the signed-in app, replacing the native confirm(). The request lives
 * in a signal that <app-confirm-host> renders; the promise resolves true on confirm and false
 * on cancel, Escape or backdrop. A new request cancels a pending one.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _solicitud = signal<SolicitudConfirmacion | null>(null);
  readonly solicitud = this._solicitud.asReadonly();
  private siguienteId = 0;

  confirmar(opciones: OpcionesConfirmacion): Promise<boolean> {
    this.responder(false);
    return new Promise<boolean>(resolve => {
      this._solicitud.set({ ...opciones, id: ++this.siguienteId, resolver: resolve });
    });
  }

  /** Resolves the pending request (if any) and clears it. */
  responder(confirmado: boolean): void {
    const actual = this._solicitud();
    if (!actual) return;
    this._solicitud.set(null);
    actual.resolver(confirmado);
  }
}
