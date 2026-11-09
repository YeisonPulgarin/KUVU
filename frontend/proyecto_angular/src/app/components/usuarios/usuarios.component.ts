import { Component, inject, OnInit, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Usuario } from '../../models/index';
import { AppLayoutComponent } from '../shared/app-layout/app-layout.component';
import { ModalComponent } from '../shared/modal/modal.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { StaggerDirective } from '../shared/stagger.directive';
import { IconComponent } from '../shared/icon/icon.component';
import { ConfirmService } from '../shared/confirm/confirm.service';
import { ToastService } from '../shared/toast/toast.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AppLayoutComponent, ModalComponent, IconComponent, SkeletonComponent, StaggerDirective],
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
    this.mostrarFormulario.set(true);
  }

  /** Runs when the modal finished closing, whatever closed it. */
  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.usuarioEditando.set(null);
    this.errorMsg.set('');
    this.intentoInvalido.set(false);
    this.resetForm();
  }

  guardar(): void {
    if (this.guardando()) return;
    if (!this.form.nombre?.trim() || !this.form.documento?.trim()) {
      this.intentoInvalido.set(true);
      this.errorMsg.set('Nombre y documento son obligatorios.');
      return;
    }
    this.intentoInvalido.set(false);
    this.guardando.set(true);
    this.errorMsg.set('');

    const editando = this.usuarioEditando();
    const op = editando
      ? this.data.actualizarUsuario(editando.idUsuario, this.form)
      : this.data.agregarUsuario(this.form as Usuario);

    op.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        this.toast.exito(editando ? 'Usuario actualizado.' : 'Usuario creado.');
        this.modal()?.cerrar();
      },
      error: (err) => {
        this.errorMsg.set('No se pudo guardar el usuario. Verifica tu conexión e intenta de nuevo.');
        console.error('Error guardando usuario', err);
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

  getInicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }

  getAvatarColor(id: number): string {
    const colores = ['#3A6FD8', '#38A169', '#D69E2E', '#E53E3E', '#805AD5', '#DD6B20'];
    return colores[id % colores.length];
  }
}
