import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Local } from '../../models/index';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-locales',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './locales.component.html',
  styleUrls: ['./locales.component.scss']
})
export class LocalesComponent implements OnInit {
  sidebarSvc   = inject(SidebarService);
  sidebarColapsado = this.sidebarSvc.colapsado;


  auth = inject(AuthService);
  data = inject(DataService);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  mostrarFormulario = signal(false);
  filtroDireccion   = signal('');
  localEditando     = signal<Local | null>(null);
  guardando         = signal(false);
  errorMsg          = signal('');

  form: Partial<Local> = {};

  locales = computed(() => {
    const filtro = this.filtroDireccion().toLowerCase();
    return this.data.getLocales()().filter(l =>
      l.direccion.toLowerCase().includes(filtro)
    );
  });

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
    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.localEditando.set(null);
    this.resetForm();
  }

  guardar(): void {
    if (!this.form.direccion) {
      this.errorMsg.set('La dirección es obligatoria.');
      return;
    }
    this.guardando.set(true);
    this.errorMsg.set('');

    const editando = this.localEditando();
    // ✅ FIX CRÍTICO: suscribir el observable
    const op = editando
      ? this.data.actualizarLocal(editando.idLocal, this.form)
      : this.data.agregarLocal(this.form as Local);

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

  eliminar(local: Local): void {
    if (!confirm(`¿Eliminar el local en "${local.direccion}"?`)) return;
    this.data.eliminarLocal(local.idLocal, local.empresa_id).subscribe({
      error: () => alert('No se puede eliminar: tiene contratos o pagos asociados.')
    });
  }

  formatCurrency(value: number = 0): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(value);
  }
}
