import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { ConfirmService, VarianteConfirmacion } from './confirm.service';
import { ModalComponent } from '../modal/modal.component';
import { IconComponent, IconName } from '../icon/icon.component';

const ICONO: Record<VarianteConfirmacion, IconName> = {
  danger: 'trash',
  warning: 'alert-triangle',
  neutral: 'info'
};

/**
 * Renders the pending ConfirmService request in an <app-modal>. The answer is recorded on
 * click and delivered when the exit animation ends; closing any other way answers "no".
 * Initial focus goes to the least destructive button (Cancelar).
 */
@Component({
  selector: 'app-confirm-host',
  standalone: true,
  imports: [ModalComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (s of solicitudes(); track s.id) {
      <app-modal [titulo]="s.titulo" (closed)="alCerrar()">
        <div class="confirm__body confirm--{{ s.variante }}">
          <span class="confirm__icon"><app-icon [name]="icono[s.variante]" /></span>
          <p class="confirm__mensaje">{{ s.mensaje }}</p>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn-secondary" autofocus (click)="elegir(false)">
            {{ s.cancelarTexto ?? 'Cancelar' }}
          </button>
          <button type="button" class="btn-solid--{{ s.variante }}" (click)="elegir(true)">
            {{ s.confirmarTexto }}
          </button>
        </div>
      </app-modal>
    }
  `
})
export class ConfirmHostComponent {
  private readonly confirm = inject(ConfirmService);
  private readonly modal = viewChild(ModalComponent);
  private respuesta = false;

  protected readonly icono = ICONO;
  protected readonly solicitudes = computed(() => {
    const s = this.confirm.solicitud();
    return s ? [s] : [];
  });

  protected elegir(confirmado: boolean): void {
    this.respuesta = confirmado;
    this.modal()?.cerrar();
  }

  protected alCerrar(): void {
    const confirmado = this.respuesta;
    this.respuesta = false;
    this.confirm.responder(confirmado);
  }
}
