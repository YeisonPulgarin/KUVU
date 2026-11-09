import { Component, inject, OnInit, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Mantenimiento } from '../../models/index';
import { AppLayoutComponent } from '../shared/app-layout/app-layout.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { IconComponent } from '../shared/icon/icon.component';
import { ConfirmService } from '../shared/confirm/confirm.service';
import { ToastService } from '../shared/toast/toast.service';
import { badgeEstado, badgePrioridad } from '../shared/badges';
import { formatFecha } from '../shared/formato';

/** Success message per new status. */
const MENSAJE_ESTADO: Record<string, string> = {
  en_proceso: 'iniciado',
  completado: 'completado',
  cancelado: 'cancelado'
};

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent, ModalComponent, IconComponent],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.scss']
})
export class MantenimientoComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(DataService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  modal = viewChild(ModalComponent);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  // idRol 1 = Administrador global
  esAdmin = computed(() => this.usuario()?.idRol === 1);

  mostrarFormulario = signal(false);
  filtroEstado      = signal('');
  filtroPrioridad   = signal('');
  guardando         = signal(false);
  errorMsg          = signal('');
  intentoInvalido   = signal(false);
  /** Card whose status change or delete is in flight. */
  ocupadoId         = signal<number | null>(null);

  protected readonly badgeEstado = badgeEstado;
  protected readonly badgePrioridad = badgePrioridad;
  protected readonly formatFecha = formatFecha;

  form: Partial<Mantenimiento> = {};

  mantenimientos = computed(() => {
    const estado = this.filtroEstado();
    const prior  = this.filtroPrioridad();
    return this.data.getMantenimientos()()
      .filter(m => !estado || m.estado === estado)
      .filter(m => !prior  || m.prioridad === prior);
  });

  mantenimientosFiltrados = computed(() => {
    if (this.esAdmin()) return this.mantenimientos();
    const uid = this.usuario()?.idUsuario;
    return this.mantenimientos().filter(m => m.idArrendatario === uid);
  });

  stats = computed(() => {
    const lista = this.esAdmin()
      ? this.data.getMantenimientos()()
      : this.data.getMantenimientos()().filter(m => m.idArrendatario === this.usuario()?.idUsuario);
    return {
      pendientes:  lista.filter(m => m.estado === 'pendiente').length,
      en_proceso:  lista.filter(m => m.estado === 'en_proceso').length,
      completados: lista.filter(m => m.estado === 'completado').length,
      urgentes:    lista.filter(m => m.prioridad === 'urgente' && m.estado !== 'completado').length,
    };
  });

  locales = computed(() => this.data.getLocales()());

  localesDisponibles = computed(() => {
    if (this.esAdmin()) return this.locales();
    const uid = this.usuario()?.idUsuario;
    const contratos = this.data.getContratos()().filter(c => c.idArrendatario === uid);
    const idsLocales = new Set(contratos.map(c => c.idLocal));
    return this.locales().filter(l => idsLocales.has(l.idLocal));
  });

  usuarios = computed(() => this.data.getUsuarios()());

  // idRol 2 = Arrendatario global
  arrendatarios = computed(() => this.usuarios().filter(u => u.idRol === 2));

  ngOnInit(): void {
    const empId = this.empresa()?.id;
    if (empId) this.data.cargarSiVacio(empId);
    this.resetForm();
  }

  resetForm(): void {
    const esAdmin = this.esAdmin();
    this.form = {
      empresa_id:        this.empresa()?.id,
      idLocal:           undefined,
      idArrendatario:    esAdmin ? undefined : this.usuario()?.idUsuario,
      tipoMantenimiento: '',
      descripcion:       '',
      prioridad:         'normal',
      estado:            'pendiente',
      idAdministrador:   esAdmin ? this.usuario()?.idUsuario : undefined,
    };
  }

  /** Always opens a clean form (R4.2). */
  abrirFormulario(): void {
    this.resetForm();
    this.errorMsg.set('');
    this.intentoInvalido.set(false);
    this.mostrarFormulario.set(true);
  }

  /** Runs when the modal finished closing, whatever closed it. */
  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.errorMsg.set('');
    this.intentoInvalido.set(false);
    this.resetForm();
  }

  guardar(): void {
    if (this.guardando()) return;
    if (!this.form.tipoMantenimiento?.trim() || !this.form.idLocal || !this.form.descripcion?.trim()) {
      this.intentoInvalido.set(true);
      this.errorMsg.set('Completa el local, el tipo y la descripción.');
      return;
    }
    if (!this.form.idArrendatario) {
      this.intentoInvalido.set(true);
      this.errorMsg.set('Debes seleccionar un arrendatario.');
      return;
    }
    this.intentoInvalido.set(false);
    // Si es arrendatario, asignar el primer administrador de la empresa
    if (!this.esAdmin()) {
      const primerAdmin = this.usuarios().find(u => u.idRol === 1);
      this.form.idAdministrador = primerAdmin?.idUsuario ?? this.usuario()?.idUsuario;
    }

    this.guardando.set(true);
    this.errorMsg.set('');

    this.data.agregarMantenimiento(this.form as Mantenimiento)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.toast.exito(this.esAdmin() ? 'Mantenimiento registrado.' : 'Solicitud enviada.');
          this.modal()?.cerrar();
        },
        error: (err) => {
          this.errorMsg.set('No se pudo guardar. Verifica tu conexión e intenta de nuevo.');
          console.error('Error guardando mantenimiento', err);
        }
      });
  }

  cambiarEstado(m: Mantenimiento, nuevoEstado: Mantenimiento['estado']): void {
    if (!this.esAdmin() || this.ocupadoId() !== null) return;
    this.ocupadoId.set(m.idMantenimiento);
    this.data.actualizarEstadoMantenimiento(m.idMantenimiento, nuevoEstado, m.empresa_id)
      .pipe(finalize(() => this.ocupadoId.set(null)))
      .subscribe({
        next: () => this.toast.exito(`${m.tipoMantenimiento}: ${MENSAJE_ESTADO[nuevoEstado] ?? 'actualizado'}.`),
        error: () => this.toast.error(`No se pudo actualizar "${m.tipoMantenimiento}". Intenta de nuevo.`)
      });
  }

  /** Cancelling a request is a destructive status change: it asks first (R10). */
  async cancelarSolicitud(m: Mantenimiento): Promise<void> {
    if (!this.esAdmin() || this.ocupadoId() !== null) return;
    const confirmado = await this.confirm.confirmar({
      titulo: 'Cancelar solicitud',
      mensaje: `¿Cancelar "${m.tipoMantenimiento}" en ${this.getDireccionLocal(m.idLocal)}? La solicitud quedará cerrada como cancelada.`,
      confirmarTexto: 'Cancelar solicitud',
      cancelarTexto: 'Volver',
      variante: 'danger'
    });
    if (confirmado) this.cambiarEstado(m, 'cancelado');
  }

  async eliminar(m: Mantenimiento): Promise<void> {
    if (!this.esAdmin() || this.ocupadoId() !== null) return;
    const confirmado = await this.confirm.confirmar({
      titulo: 'Eliminar mantenimiento',
      mensaje: `¿Eliminar "${m.tipoMantenimiento}" en ${this.getDireccionLocal(m.idLocal)}? Esta acción no se puede deshacer.`,
      confirmarTexto: 'Eliminar',
      variante: 'danger'
    });
    if (!confirmado) return;

    this.ocupadoId.set(m.idMantenimiento);
    this.data.eliminarMantenimiento(m.idMantenimiento, m.empresa_id)
      .pipe(finalize(() => this.ocupadoId.set(null)))
      .subscribe({
        next: () => this.toast.exito(`"${m.tipoMantenimiento}" eliminado.`),
        error: () => this.toast.error(`No se pudo eliminar "${m.tipoMantenimiento}". Intenta de nuevo.`)
      });
  }

  getNombreUsuario(id: number): string {
    return this.usuarios().find(u => u.idUsuario === id)?.nombre?.split(' ').slice(0, 2).join(' ') ?? `Usuario ${id}`;
  }

  getDireccionLocal(id: number): string {
    return this.locales().find(l => l.idLocal === id)?.direccion ?? `Local ${id}`;
  }

}
