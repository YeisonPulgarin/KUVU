import { Component, inject, OnInit, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CredencialesAdmin, DataService } from '../../services/data.service';
import { ReglaPassword, cumplePolitica, evaluarPassword } from '../../services/password-policy';
import { Usuario } from '../../models/index';
import { AppLayoutComponent } from '../shared/app-layout/app-layout.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { IconComponent } from '../shared/icon/icon.component';
import { ConfirmService } from '../shared/confirm/confirm.service';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent, ModalComponent, IconComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  auth = inject(AuthService);
  data = inject(DataService);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  modal = viewChild(ModalComponent);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  mostrarFormulario = signal(false);
  filtroRol         = signal(0);
  filtroBusqueda    = signal('');
  usuarioEditando   = signal<Usuario | null>(null);
  guardando         = signal(false);
  errorMsg          = signal('');
  intentoInvalido   = signal(false);
  eliminandoId      = signal<number | null>(null);

  form: Partial<Usuario> = {};
  // Creation only: the new user's temporary password and the administrator's own password,
  // which the API asks for to authorize the operation. Never stored: cleared on close.
  passwordTemporal = signal('');
  adminPassword    = signal('');
  reglasServidor   = signal<ReglaPassword[]>([]);

  // Password reset for another user.
  restableciendo      = signal<Usuario | null>(null);
  resetTemporal       = signal('');
  resetAdminPassword  = signal('');
  resetGuardando      = signal(false);
  resetError          = signal('');
  resetReglasServidor = signal<ReglaPassword[]>([]);

  reglasTemporal = computed(() =>
    evaluarPassword(this.passwordTemporal(), { correo: this.correoForm(), documento: this.documentoForm() })
  );
  reglasReset = computed(() => {
    const u = this.restableciendo();
    return evaluarPassword(this.resetTemporal(), { correo: u?.correo, documento: u?.documento });
  });
  // The form object is not a signal; these mirror the two fields the policy depends on.
  correoForm    = signal('');
  documentoForm = signal('');

  usuarios = computed(() => {
    const rol      = this.filtroRol();
    const busqueda = this.filtroBusqueda().toLowerCase();
    return this.data.getUsuarios()()
      .filter(u => !rol || u.idRol === rol)
      .filter(u => !busqueda ||
        u.nombre.toLowerCase().includes(busqueda) ||
        u.correo?.toLowerCase().includes(busqueda) ||
        u.documento.includes(busqueda)
      );
  });

  // idRol 1 = Administrador  |  idRol 2 = Arrendatario  (globales)
  admins        = computed(() => this.data.getUsuarios()().filter(u => u.idRol === 1));
  arrendatarios = computed(() => this.data.getUsuarios()().filter(u => u.idRol === 2));

  ngOnInit(): void {
    const empId = this.empresa()?.id;
    if (empId) this.data.cargarSiVacio(empId);
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      empresa_id: this.empresa()?.id,
      nombre:     '',
      documento:  '',
      telefono:   '',
      correo:     '',
      idRol:      2,          // Arrendatario por defecto
    };
  }

  abrirFormulario(u?: Usuario): void {
    if (u) {
      this.usuarioEditando.set(u);
      this.form = { ...u };
    } else {
      this.usuarioEditando.set(null);
      this.resetForm();
    }
    this.errorMsg.set('');
    this.intentoInvalido.set(false);
    this.limpiarPasswords();
    this.sincronizarPolitica();
    this.mostrarFormulario.set(true);
  }

  /** Keeps the live policy in sync with the e-mail and document typed in the form. */
  sincronizarPolitica(): void {
    this.correoForm.set(this.form.correo ?? '');
    this.documentoForm.set(this.form.documento ?? '');
  }

  /** Runs when the modal finished closing, whatever closed it. */
  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.usuarioEditando.set(null);
    this.errorMsg.set('');
    this.intentoInvalido.set(false);
    this.limpiarPasswords();
    this.resetForm();
  }

  private limpiarPasswords(): void {
    this.passwordTemporal.set('');
    this.adminPassword.set('');
    this.reglasServidor.set([]);
  }

  private credencialesAdmin(password: string): CredencialesAdmin {
    const yo = this.usuario();
    return {
      correo: yo?.correo ?? '',
      documento: yo?.documento ?? '',
      password,
      empresa_id: yo?.empresa_id ?? this.empresa()?.id ?? 0,
    };
  }

  /** Message for a rejected password operation (create or reset). */
  private mensajeError(err: any, reglas: (r: ReglaPassword[]) => void): string {
    if (err?.status === 400 && Array.isArray(err.error?.reglas)) {
      reglas(err.error.reglas);
      return 'La contraseña temporal no cumple la política.';
    }
    if (err?.status === 401) {
      return 'Tu contraseña de administrador no es correcta, o tu cuenta está bloqueada temporalmente.';
    }
    if (err?.status === 403) {
      return err.error?.error ?? 'No tienes permiso para esta operación.';
    }
    return 'No se pudo guardar. Verifica tu conexión e intenta de nuevo.';
  }

  guardar(): void {
    if (this.guardando()) return;
    if (!this.form.nombre?.trim() || !this.form.documento?.trim()) {
      this.intentoInvalido.set(true);
      this.errorMsg.set('Nombre y documento son obligatorios.');
      return;
    }
    const editando = this.usuarioEditando();
    if (!editando) {
      this.sincronizarPolitica();
      if (!cumplePolitica(this.passwordTemporal(), { correo: this.form.correo, documento: this.form.documento })) {
        this.intentoInvalido.set(true);
        this.errorMsg.set('La contraseña temporal no cumple la política.');
        return;
      }
      if (!this.adminPassword()) {
        this.intentoInvalido.set(true);
        this.errorMsg.set('Escribe tu contraseña para confirmar que eres administrador.');
        return;
      }
    }
    this.intentoInvalido.set(false);
    this.guardando.set(true);
    this.errorMsg.set('');
    this.reglasServidor.set([]);

    const op = editando
      ? this.data.actualizarUsuario(editando.idUsuario, this.form)
      : this.data.agregarUsuario(this.form, this.passwordTemporal(), this.credencialesAdmin(this.adminPassword()));

    op.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(editando ? 'Usuario actualizado.' : 'Usuario creado.');
        this.modal()?.cerrar();
      },
      error: (err) => {
        this.adminPassword.set('');
        this.errorMsg.set(editando
          ? 'No se pudo guardar el usuario. Verifica tu conexión e intenta de nuevo.'
          : this.mensajeError(err, r => this.reglasServidor.set(r)));
      }
    });
  }

  /** The signed-in administrator cannot delete their own user (R2.5). */
  esYo(u: Usuario): boolean {
    return u.idUsuario === this.usuario()?.idUsuario;
  }

  async eliminar(u: Usuario): Promise<void> {
    if (this.esYo(u) || this.eliminandoId() !== null) return;
    const confirmado = await this.confirm.confirmar({
      titulo: 'Eliminar usuario',
      mensaje: `¿Eliminar a ${u.nombre} (CC ${u.documento})? Perderá el acceso a ${this.empresa()?.nombre ?? 'la empresa'}.`,
      confirmarTexto: 'Eliminar usuario',
      variante: 'danger'
    });
    if (!confirmado) return;

    this.eliminandoId.set(u.idUsuario);
    this.data.eliminarUsuario(u.idUsuario, u.empresa_id)
      .pipe(finalize(() => this.eliminandoId.set(null)))
      .subscribe({
        next: () => this.toast.exito(`${u.nombre} eliminado.`),
        error: () => this.toast.error(
          `No se pudo eliminar a ${u.nombre}. Puede tener contratos o pagos asociados.`
        )
      });
  }

  // ── Restablecer contraseña ────────────────────────────────────
  abrirRestablecer(u: Usuario): void {
    if (this.esYo(u)) return;
    this.resetTemporal.set('');
    this.resetAdminPassword.set('');
    this.resetError.set('');
    this.resetReglasServidor.set([]);
    this.restableciendo.set(u);
  }

  /** Runs when the reset modal finished closing. */
  cerrarRestablecer(): void {
    this.restableciendo.set(null);
    this.resetTemporal.set('');
    this.resetAdminPassword.set('');
    this.resetError.set('');
    this.resetReglasServidor.set([]);
  }

  restablecer(): void {
    const u = this.restableciendo();
    if (!u || this.resetGuardando()) return;
    if (!cumplePolitica(this.resetTemporal(), { correo: u.correo, documento: u.documento })) {
      this.resetError.set('La contraseña temporal no cumple la política.');
      return;
    }
    if (!this.resetAdminPassword()) {
      this.resetError.set('Escribe tu contraseña para confirmar que eres administrador.');
      return;
    }
    this.resetGuardando.set(true);
    this.resetError.set('');
    this.resetReglasServidor.set([]);

    this.data.restablecerPassword(u.idUsuario, u.empresa_id, this.resetTemporal(), this.credencialesAdmin(this.resetAdminPassword()))
      .pipe(finalize(() => this.resetGuardando.set(false)))
      .subscribe({
        next: () => {
          this.toast.exito(`Contraseña de ${u.nombre} restablecida. Deberá cambiarla al ingresar.`);
          this.modal()?.cerrar();
        },
        error: (err) => {
          this.resetAdminPassword.set('');
          this.resetError.set(this.mensajeError(err, r => this.resetReglasServidor.set(r)));
        }
      });
  }

  getInicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }

  getAvatarColor(id: number): string {
    const colores = ['#3A6FD8', '#38A169', '#D69E2E', '#E53E3E', '#805AD5', '#DD6B20'];
    return colores[id % colores.length];
  }
}
