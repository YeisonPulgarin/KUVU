import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  input,
  output,
  viewChild
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { reducedMotion } from '../../../motion/motion-preferences';

let siguienteId = 0;

/** Longest exit animation (`--dur-fast` is 200 ms); after it the dialog closes anyway. */
export const SALIDA_MAX_MS = 300;

const ENFOCABLES = 'input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

/**
 * Modal dialog of the signed-in app, on a native <dialog> opened with showModal(): the
 * browser provides the top layer, the inert background and the focus trap.
 *
 * The parent renders it inside an `@if` and it opens on mount. Any close request (✕ button,
 * backdrop, Escape or `cerrar()` from the parent after saving) plays the exit animation and
 * then emits `closed`; the parent resets its state there and removes the modal.
 *
 * Initial focus: the projected `[autofocus]` element, else the first field. On close, focus
 * returns to the control that opened it.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog class="modal app-modal" [class.modal--lg]="size() === 'lg'"
            [attr.aria-labelledby]="tituloId"
            (cancel)="onCancel($event)" (close)="terminar()"
            (click)="onClick($event)" (animationend)="onAnimationEnd($event)">
      <div class="modal__header">
        <h2 [id]="tituloId">{{ titulo() }}</h2>
        <button type="button" class="modal__close" aria-label="Cerrar" (click)="cerrar()">
          <app-icon name="x" />
        </button>
      </div>
      <ng-content />
    </dialog>
  `
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  readonly titulo = input.required<string>();
  readonly size = input<'md' | 'lg'>('md');
  readonly closed = output<void>();

  protected readonly tituloId = `app-modal-titulo-${++siguienteId}`;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private disparador: HTMLElement | null = null;
  private cerrando = false;
  private terminado = false;
  private respaldo?: ReturnType<typeof setTimeout>;

  private get dialog(): HTMLDialogElement {
    return this.dialogRef().nativeElement;
  }

  ngAfterViewInit(): void {
    const activo = document.activeElement;
    this.disparador = activo instanceof HTMLElement ? activo : null;
    if (!this.dialog.open) this.dialog.showModal();
    const inicial =
      this.dialog.querySelector<HTMLElement>('[autofocus]') ??
      this.dialog.querySelector<HTMLElement>(ENFOCABLES);
    inicial?.focus();
  }

  /** Plays the exit animation (unless reduced motion) and then closes. */
  cerrar(): void {
    if (this.cerrando || this.terminado) return;
    this.cerrando = true;
    if (reducedMotion()) {
      this.terminar();
      return;
    }
    this.dialog.dataset['state'] = 'closing';
    this.respaldo = setTimeout(() => this.terminar(), SALIDA_MAX_MS);
  }

  protected onCancel(event: Event): void {
    // Escape: animate instead of the browser's instant close. When the browser does not let
    // the event be cancelled, the native `close` event still ends up in terminar().
    event.preventDefault();
    this.cerrar();
  }

  protected onClick(event: MouseEvent): void {
    // The dialog is the panel itself: a click whose target is the dialog hit the backdrop.
    if (event.target === this.dialog) this.cerrar();
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this.cerrando && event.target === this.dialog) this.terminar();
  }

  /** Closes the native dialog, gives focus back and notifies the parent, once. */
  protected terminar(): void {
    if (this.terminado) return;
    this.terminado = true;
    clearTimeout(this.respaldo);
    if (this.dialog.open) this.dialog.close();
    delete this.dialog.dataset['state'];
    if (this.disparador?.isConnected) this.disparador.focus();
    this.closed.emit();
  }

  ngOnDestroy(): void {
    clearTimeout(this.respaldo);
    // Removed by the parent without a close request: still give focus back.
    if (!this.terminado && this.disparador?.isConnected) this.disparador.focus();
  }
}
