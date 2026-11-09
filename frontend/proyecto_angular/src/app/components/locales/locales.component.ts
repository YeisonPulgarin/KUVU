import { Component, inject, OnInit, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Local } from '../../models/index';
import { AppLayoutComponent } from '../shared/app-layout/app-layout.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { StaggerDirective } from '../shared/stagger.directive';
import { IconComponent } from '../shared/icon/icon.component';
import { ConfirmService } from '../shared/confirm/confirm.service';
import { ToastService } from '../shared/toast/toast.service';
import { formatMoneda } from '../shared/formato';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent, ModalComponent, IconComponent, SkeletonComponent, StaggerDirective],
  templateUrl: './locales.component.html',
  styleUrls: ['./locales.component.scss']
})
export class LocalesComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(DataService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  modal = viewChild(ModalComponent);

  mostrarFormulario = signal(false);
  filtroDireccion   = signal('');
  localEditando     = signal<Local | null>(null);
  guardando         = signal(false);
  errorMsg          = signal('');
  /** Set after a save attempt without address: marks the field as invalid. */
  faltaDireccion    = signal(false);
  /** Row whose delete is in flight: its button shows the busy state. */
  eliminandoId      = signal<number | null>(null);

  form: Partial<Local> = {};

  locales = computed(() => {
    const filtro = this.filtroDireccion().toLowerCase();
    return this.data.getLocales()().filter(l =>
      l.direccion.toLowerCase().includes(filtro)
    );
  });

  private usuarios = computed(() => this.data.getUsuarios()());

  ngOnInit(): void {
    const empId = this.empresa()?.id;
    if (empId) this.data.cargarSiVacio(empId);
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      empresa_id:      this.empresa()?.id,
      direccion:       '',
      area:            undefined,
      valorArriendo:   undefined,
      // idAdministrador es el usuario logueado (siempre admin en esta ruta)
      idAdministrador: this.usuario()?.idUsuario,
    };
  }

  abrirFormulario(local?: Local): void {
    if (local) {
      this.localEditando.set(local);
      this.form = { ...local };
    } else {
      this.localEditando.set(null);
      this.resetForm();
    }
    this.errorMsg.set('');
    this.faltaDireccion.set(false);
    this.mostrarFormulario.set(true);
  }

  /** Runs when the modal finished closing, whatever closed it. */
  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.localEditando.set(null);
    this.errorMsg.set('');
    this.faltaDireccion.set(false);
    this.resetForm();
  }

  guardar(): void {
    if (this.guardando()) return;
    if (!this.form.direccion?.trim()) {
      this.faltaDireccion.set(true);
      this.errorMsg.set('La dirección es obligatoria.');
      return;
    }
    this.faltaDireccion.set(false);
    this.guardando.set(true);
    this.errorMsg.set('');

    const editando = this.localEditando();
    const op = editando
      ? this.data.actualizarLocal(editando.idLocal, this.form)
      : this.data.agregarLocal(this.form as Local);

    op.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(editando ? 'Local actualizado.' : 'Local creado.');
        this.modal()?.cerrar();
      },
      error: (err) => {
        this.errorMsg.set('No se pudo guardar el local. Verifica tu conexión e intenta de nuevo.');
        console.error('Error guardando local', err);
      }
    });
  }

  async eliminar(local: Local): Promise<void> {
    if (this.eliminandoId() !== null) return;
    const confirmado = await this.confirm.confirmar({
      titulo: 'Eliminar local',
      mensaje: `¿Eliminar el local de "${local.direccion}"? Esta acción no se puede deshacer.`,
      confirmarTexto: 'Eliminar local',
      variante: 'danger'
    });
    if (!confirmado) return;

    this.eliminandoId.set(local.idLocal);
    this.data.eliminarLocal(local.idLocal, local.empresa_id)
      .pipe(finalize(() => this.eliminandoId.set(null)))
      .subscribe({
        next: () => this.toast.exito(`Local de "${local.direccion}" eliminado.`),
        error: () => this.toast.error(
          `No se pudo eliminar el local de "${local.direccion}". Puede tener contratos o pagos asociados.`
        )
      });
  }

  nombreAdministrador(id: number): string {
    return this.usuarios().find(u => u.idUsuario === id)?.nombre ?? `Administrador ${id}`;
  }

  formatCurrency(value: number = 0): string {
    return formatMoneda(value);
  }
}
