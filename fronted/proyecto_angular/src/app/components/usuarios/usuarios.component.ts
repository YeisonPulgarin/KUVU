import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Usuario } from '../../models/index';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  sidebarSvc   = inject(SidebarService);
  sidebarColapsado = this.sidebarSvc.colapsado;


  auth = inject(AuthService);
  data = inject(DataService);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  mostrarFormulario = signal(false);
  filtroRol         = signal(0);
  filtroBusqueda    = signal('');
  usuarioEditando   = signal<Usuario | null>(null);
  guardando         = signal(false);
  errorMsg          = signal('');

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
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.usuarioEditando.set(null);
    this.resetForm();
  }

  guardar(): void {
    if (!this.form.nombre || !this.form.documento) {
      this.errorMsg.set('Nombre y documento son obligatorios.');
      return;
    }
    this.guardando.set(true);
    this.errorMsg.set('');

    const editando = this.usuarioEditando();
    const op = editando
      ? this.data.actualizarUsuario(editando.idUsuario, this.form)
      : this.data.agregarUsuario(this.form as Usuario);

    op.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMsg.set('Error al guardar. Verifica que el backend esté corriendo.');
        console.error(err);
      }
    });
  }

  eliminar(u: Usuario): void {
    if (u.idUsuario === this.usuario()?.idUsuario) {
      alert('No puedes eliminarte a ti mismo.');
      return;
    }
    if (!confirm(`¿Eliminar al usuario "${u.nombre}"?`)) return;
    this.data.eliminarUsuario(u.idUsuario, u.empresa_id).subscribe({
      error: () => alert('No se puede eliminar: tiene contratos o pagos asociados.')
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
