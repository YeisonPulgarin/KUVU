import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Live region of the toasts. Success is announced politely; errors carry role="alert".
 * Toasts slide in and out (ToastService times the exit); reduced motion shows them still.
 */
@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-region" aria-live="polite" aria-relevant="additions">
      @for (t of toasts.toasts(); track t.id) {
        <div class="toast toast--{{ t.tipo }}" [attr.role]="t.tipo === 'error' ? 'alert' : 'status'"
             [attr.data-state]="t.saliendo ? 'closing' : null">
          <app-icon class="toast__icon" [name]="t.tipo === 'error' ? 'alert-triangle' : 'check-circle'" />
          <p class="toast__text">{{ t.texto }}</p>
          <button type="button" class="toast__close" aria-label="Cerrar aviso" (click)="toasts.cerrar(t.id)">
            <app-icon name="x" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  protected readonly toasts = inject(ToastService);
}
