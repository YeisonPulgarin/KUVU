import { Component, inject, OnInit, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { ContratoArrendamiento } from '../../models/index';
import { AppLayoutComponent } from '../shared/app-layout/app-layout.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { StaggerDirective } from '../shared/stagger.directive';
import { IconComponent } from '../shared/icon/icon.component';
import { ConfirmService } from '../shared/confirm/confirm.service';
import { ToastService } from '../shared/toast/toast.service';
import { badgeVigencia } from '../shared/badges';
import { formatFecha } from '../shared/formato';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent, ModalComponent, IconComponent, SkeletonComponent, StaggerDirective],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(DataService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  // idRol 1 = Administrador global
  esAdmin = computed(() => this.usuario()?.idRol === 1);

  modal = viewChild(ModalComponent);

  mostrarFormulario = signal(false);
  contratoEditando  = signal<ContratoArrendamiento | null>(null);
  guardando         = signal(false);
  errorMsg          = signal('');
  /** Set after a save attempt with missing fields: marks them as invalid. */
  intentoInvalido   = signal(false);
  eliminandoId      = signal<number | null>(null);

  protected readonly badgeVigencia = badgeVigencia;
  protected readonly formatFecha = formatFecha;

  form: Partial<ContratoArrendamiento> = {};

  contratos = computed(() => {
    const todos = this.data.getContratos()();
    if (this.esAdmin()) return todos;
    const uid = this.usuario()?.idUsuario;
    return todos.filter(c => c.idArrendatario === uid);
  });

  locales       = computed(() => this.data.getLocales()());
  usuarios      = computed(() => this.data.getUsuarios()());
  // idRol 2 = Arrendatario global
  arrendatarios = computed(() => this.data.getUsuarios()().filter(u => u.idRol === 2));

  ngOnInit(): void {
    const empId = this.empresa()?.id;
    if (empId) this.data.cargarSiVacio(empId);
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      empresa_id:      this.empresa()?.id,
      fechaInicio:     '',
      fechaFin:        '',
      condiciones:     '',
      idLocal:         undefined,
      idArrendatario:  undefined,
      idAdministrador: this.usuario()?.idUsuario,
    };
  }

  /** New contract without argument, edit with one. Always starts from a clean state (R4.2). */
  abrirFormulario(c?: ContratoArrendamiento): void {
    this.contratoEditando.set(c ?? null);
    if (c) this.form = { ...c };
    else this.resetForm();
    this.errorMsg.set('');
    this.intentoInvalido.set(false);
    this.mostrarFormulario.set(true);
  }

  /** Runs when the modal finished closing, whatever closed it. */
  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.contratoEditando.set(null);
    this.errorMsg.set('');
    this.intentoInvalido.set(false);
    this.resetForm();
  }

  guardar(): void {
    if (!this.esAdmin() || this.guardando()) return;
    if (!this.form.fechaInicio || !this.form.fechaFin || !this.form.idLocal || !this.form.idArrendatario) {
      this.intentoInvalido.set(true);
      this.errorMsg.set('Completa el local, el arrendatario y las dos fechas.');
      return;
    }
    if (this.form.fechaFin < this.form.fechaInicio) {
      this.intentoInvalido.set(true);
      this.errorMsg.set('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    this.intentoInvalido.set(false);
    this.guardando.set(true);
    this.errorMsg.set('');

    const editando = this.contratoEditando();
    const op = editando
      ? this.data.actualizarContrato(editando.idContrato, this.form)
      : this.data.agregarContrato(this.form as ContratoArrendamiento);

    op.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(editando ? 'Contrato actualizado.' : 'Contrato creado.');
        this.modal()?.cerrar();
      },
      error: (err) => {
        this.errorMsg.set('No se pudo guardar el contrato. Verifica tu conexión e intenta de nuevo.');
        console.error('Error guardando contrato', err);
      }
    });
  }

  async eliminar(c: ContratoArrendamiento): Promise<void> {
    if (!this.esAdmin() || this.eliminandoId() !== null) return;
    const local = this.getDireccionLocal(c.idLocal);
    const arrendatario = this.getNombreArrendatario(c.idArrendatario);
    const confirmado = await this.confirm.confirmar({
      titulo: 'Eliminar contrato',
      mensaje: `¿Eliminar el contrato #${c.idContrato} de ${arrendatario} en "${local}"? Esta acción no se puede deshacer.`,
      confirmarTexto: 'Eliminar contrato',
      variante: 'danger'
    });
    if (!confirmado) return;

    this.eliminandoId.set(c.idContrato);
    this.data.eliminarContrato(c.idContrato, c.empresa_id)
      .pipe(finalize(() => this.eliminandoId.set(null)))
      .subscribe({
        next: () => this.toast.exito(`Contrato #${c.idContrato} eliminado.`),
        error: () => this.toast.error(
          `No se pudo eliminar el contrato #${c.idContrato}. Puede tener pagos asociados.`
        )
      });
  }

  getNombreArrendatario(id: number): string {
    return this.usuarios().find(u => u.idUsuario === id)?.nombre ?? `Usuario ${id}`;
  }

  getDireccionLocal(id: number): string {
    return this.locales().find(l => l.idLocal === id)?.direccion ?? `Local ${id}`;
  }

  estaVigente(fechaFin: string): boolean {
    return new Date(fechaFin) >= new Date();
  }
}
