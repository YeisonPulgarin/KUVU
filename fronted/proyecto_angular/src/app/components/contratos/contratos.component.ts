import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { ContratoArrendamiento } from '../../models/index';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  sidebarSvc   = inject(SidebarService);
  sidebarColapsado = this.sidebarSvc.colapsado;


  auth = inject(AuthService);
  data = inject(DataService);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  // idRol 1 = Administrador global
  esAdmin = computed(() => this.usuario()?.idRol === 1);

  mostrarFormulario = signal(false);
  contratoEditando  = signal<ContratoArrendamiento | null>(null);
  guardando         = signal(false);
  errorMsg          = signal('');

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

  editarContrato(c: ContratoArrendamiento): void {
    this.contratoEditando.set(c);
    this.form = { ...c };
    this.errorMsg.set('');
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.contratoEditando.set(null);
    this.resetForm();
  }

  guardar(): void {
    if (!this.esAdmin()) return;
    if (!this.form.fechaInicio || !this.form.fechaFin || !this.form.idLocal || !this.form.idArrendatario) {
      this.errorMsg.set('Todos los campos son obligatorios.');
      return;
    }
    this.guardando.set(true);
    this.errorMsg.set('');

    const editando = this.contratoEditando();
    const op = editando
      ? this.data.actualizarContrato(editando.idContrato, this.form)
      : this.data.agregarContrato(this.form as ContratoArrendamiento);

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
