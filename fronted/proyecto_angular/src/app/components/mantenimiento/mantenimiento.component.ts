import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Mantenimiento } from '../../models/index';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.scss']
})
export class MantenimientoComponent implements OnInit {
  sidebarSvc   = inject(SidebarService);
  sidebarColapsado = this.sidebarSvc.colapsado;


  auth = inject(AuthService);
  data = inject(DataService);

  empresa = this.auth.empresaActiva;
  usuario = this.auth.usuarioActivo;

  // idRol 1 = Administrador global
  esAdmin = computed(() => this.usuario()?.idRol === 1);

  mostrarFormulario = signal(false);
  filtroEstado      = signal('');
  filtroPrioridad   = signal('');
  guardando         = signal(false);
  errorMsg          = signal('');

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

  guardar(): void {
    if (!this.form.tipoMantenimiento || !this.form.idLocal) {
      this.errorMsg.set('Tipo de mantenimiento y local son obligatorios.');
      return;
    }
    if (!this.form.idArrendatario) {
      this.errorMsg.set('Debes seleccionar un arrendatario.');
      return;
    }
    // Si es arrendatario, asignar el primer administrador de la empresa
    if (!this.esAdmin()) {
      const primerAdmin = this.usuarios().find(u => u.idRol === 1);
      this.form.idAdministrador = primerAdmin?.idUsuario ?? this.usuario()?.idUsuario;
    }

    this.guardando.set(true);
    this.errorMsg.set('');

    this.data.agregarMantenimiento(this.form as Mantenimiento).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarFormulario.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMsg.set('Error al guardar. Verifica que el backend esté corriendo.');
        console.error(err);
      }
    });
  }

  cambiarEstado(m: Mantenimiento, nuevoEstado: Mantenimiento['estado']): void {
    if (!this.esAdmin()) return;
    this.data.actualizarEstadoMantenimiento(m.idMantenimiento, nuevoEstado, m.empresa_id)
      .subscribe({ error: err => console.error('Error cambiando estado:', err) });
  }

  getNombreUsuario(id: number): string {
    return this.usuarios().find(u => u.idUsuario === id)?.nombre?.split(' ').slice(0, 2).join(' ') ?? `Usuario ${id}`;
  }

  getDireccionLocal(id: number): string {
    return this.locales().find(l => l.idLocal === id)?.direccion ?? `Local ${id}`;
  }

  getPrioridadClass(p: string): string {
    return ({ baja: 'badge--green', normal: 'badge--yellow', urgente: 'badge--red' } as Record<string, string>)[p] ?? '';
  }

  getEstadoClass(e: string): string {
    return ({ pendiente: 'badge--yellow', en_proceso: 'badge--blue', completado: 'badge--green', cancelado: 'badge--gray' } as Record<string, string>)[e] ?? '';
  }
}
