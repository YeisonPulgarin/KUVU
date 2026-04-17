import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  auth       = inject(AuthService);
  data       = inject(DataService);
  sidebarSvc = inject(SidebarService);

  sidebarColapsado = this.sidebarSvc.colapsado;
  empresa  = this.auth.empresaActiva;
  usuario  = this.auth.usuarioActivo;
  cargando = this.data.cargando;
  esAdmin  = computed(() => this.usuario()?.idRol === 1);
  stats    = this.data.getEstadisticas();

  pagosRecientes = computed(() => {
    const todos = this.data.getPagos()();
    if (this.esAdmin()) return todos.slice(0, 5);
    return todos.filter(p => p.idArrendatario === this.usuario()?.idUsuario).slice(0, 5);
  });

  mantenUrgentes = computed(() => {
    const todos = this.data.getMantenimientos()()
      .filter(m => m.prioridad === 'urgente' && m.estado !== 'completado');
    if (this.esAdmin()) return todos;
    return todos.filter(m => m.idArrendatario === this.usuario()?.idUsuario);
  });

  statsArrendatario = computed(() => {
    const uid = this.usuario()?.idUsuario;
    const misContratos   = this.data.getContratos()().filter(c => c.idArrendatario === uid);
    const misMants       = this.data.getMantenimientos()().filter(m => m.idArrendatario === uid);
    const misPagos       = this.data.getPagos()().filter(p => p.idArrendatario === uid);
    return {
      contratos:        misContratos.length,
      mantenPendientes: misMants.filter(m => m.estado === 'pendiente').length,
      totalPagado:      misPagos.reduce((a, p) => a + Number(p.monto), 0),
    };
  });

  ngOnInit(): void {
    const empId = this.empresa()?.id;
    if (empId) this.data.cargarTodo(empId).subscribe({ error: err => console.error(err) });
  }

  formatCurrency(value: number = 0): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }
}
