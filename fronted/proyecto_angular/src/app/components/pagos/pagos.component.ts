import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { PagoVariado } from '../../models/index';
import { SidebarService } from '../../services/sidebar.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss']
})
export class PagosComponent implements OnInit {
  sidebarSvc        = inject(SidebarService);
  sidebarColapsado  = this.sidebarSvc.colapsado;
  auth              = inject(AuthService);
  data              = inject(DataService);

  empresa  = this.auth.empresaActiva;
  usuario  = this.auth.usuarioActivo;
  esAdmin  = computed(() => this.usuario()?.idRol === 1);

  mostrarPasarela = signal(false);
  filtroTipo      = signal('');
  errorMsg        = signal('');

  pagos = computed(() => {
    const tipo  = this.filtroTipo();
    const todos = this.esAdmin()
      ? this.data.getPagos()()
      : this.data.getPagos()().filter(p => p.idArrendatario === this.usuario()?.idUsuario);
    return tipo ? todos.filter(p => p.tipo === tipo) : todos;
  });

  totalFiltrado = computed(() =>
    this.pagos().reduce((acc, p) => acc + Number(p.monto), 0)
  );

  locales   = computed(() => this.data.getLocales()());
  usuarios  = computed(() => this.data.getUsuarios()());
  contratos = computed(() => this.data.getContratos()());

  contratoActivo = computed(() => {
    if (this.esAdmin()) return null;
    const uid = this.usuario()?.idUsuario;
    return this.contratos().find(c => c.idArrendatario === uid) ?? null;
  });

  ngOnInit(): void {
    const empId = this.empresa()?.id;
    if (empId) this.data.cargarSiVacio(empId);
  }

  irAPasarelaPago(): void { this.mostrarPasarela.set(true); }

  getValorArriendo(): number {
    const contrato = this.contratoActivo();
    if (!contrato) return 0;
    const local = this.locales().find(l => l.idLocal === contrato.idLocal);
    return Number(local?.valorArriendo ?? 0);
  }

  confirmarPago(): void {
    const contrato = this.contratoActivo();
    if (!contrato) { alert('No tienes un contrato activo para realizar el pago.'); return; }
    const primerAdmin = this.usuarios().find(u => u.idRol === 1);
    const pago: PagoVariado = {
      empresa_id:      this.empresa()!.id,
      fechaPago:       new Date().toISOString().split('T')[0],
      monto:           this.getValorArriendo(),
      tipo:            'Arriendo',
      descripcion:     `Pago de arriendo - Local ${contrato.idLocal}`,
      metodoPago:      'Tarjeta',
      idArrendatario:  this.usuario()!.idUsuario,
      idAdministrador: primerAdmin?.idUsuario ?? this.usuario()!.idUsuario,
      idLocal:         contrato.idLocal,
      idContrato:      contrato.idContrato,
    } as PagoVariado;
    this.data.agregarPago(pago).subscribe({
      next: () => { this.mostrarPasarela.set(false); alert('✅ ¡Pago realizado exitosamente!'); },
      error: () => alert('Error al procesar el pago. Intenta de nuevo.')
    });
  }

  // ── PDF de reporte (admin y arrendatario) ───────────────────
  generarPDF(): void {
    const usuario   = this.usuario();
    const empresa   = this.empresa();
    const misPagos  = this.pagos();
    const contrato  = this.contratoActivo();
    const local     = contrato ? this.locales().find(l => l.idLocal === contrato.idLocal) : null;

    const totalPagado = misPagos.reduce((a, p) => a + Number(p.monto), 0);
    const alDia       = contrato !== null;

    const filas = misPagos.map(p => `
      <tr>
        <td>${this.formatFecha(p.fechaPago)}</td>
        <td>${p.tipo}</td>
        <td>${p.descripcion || '—'}</td>
        <td>${p.metodoPago}</td>
        <td style="text-align:right;font-weight:600;">${this.formatCurrency(p.monto)}</td>
      </tr>`).join('');

    const html = `
      <!DOCTYPE html><html lang="es"><head>
      <meta charset="UTF-8"/>
      <title>Reporte de Pagos</title>
      <style>
        body { font-family: Arial, sans-serif; color: #1a202c; padding: 40px; font-size: 13px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 15px; font-weight: 500; color: #4a5568; margin-bottom: 24px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
        .info-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .info-box label { font-size: 11px; color: #718096; display: block; margin-bottom: 4px; }
        .info-box strong { font-size: 14px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .badge--ok  { background: #c6f6d5; color: #22543d; }
        .badge--nok { background: #fed7d7; color: #742a2a; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #2B4C8C; color: #fff; padding: 9px 10px; text-align: left; font-size: 12px; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:last-child td { border-bottom: none; }
        .total-row td { font-weight: 700; background: #ebf4ff; }
        .footer { margin-top: 32px; font-size: 11px; color: #a0aec0; text-align: center; }
      </style></head><body>
      <h1>📄 Reporte de Pagos</h1>
      <h2>${empresa?.nombre ?? ''} — Generado el ${new Date().toLocaleDateString('es-CO')}</h2>
      <div class="info-grid">
        <div class="info-box">
          <label>${this.esAdmin() ? 'Administrador' : 'Arrendatario'}</label>
          <strong>${usuario?.nombre ?? ''}</strong>
        </div>
        ${!this.esAdmin() ? `
        <div class="info-box">
          <label>Estado de cuenta</label>
          <span class="badge ${alDia ? 'badge--ok' : 'badge--nok'}">${alDia ? '✅ Al día' : '⚠️ Sin contrato activo'}</span>
        </div>
        <div class="info-box">
          <label>Local arrendado</label>
          <strong>${local?.direccion ?? 'N/A'}</strong>
        </div>` : ''}
        <div class="info-box">
          <label>Total pagado</label>
          <strong>${this.formatCurrency(totalPagado)}</strong>
        </div>
      </div>
      <table>
        <thead><tr>
          <th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Método</th><th>Monto</th>
        </tr></thead>
        <tbody>${filas || '<tr><td colspan="5" style="text-align:center;color:#a0aec0;">Sin pagos registrados</td></tr>'}</tbody>
        <tfoot><tr class="total-row">
          <td colspan="4" style="text-align:right;">Total:</td>
          <td style="text-align:right;">${this.formatCurrency(totalPagado)}</td>
        </tr></tfoot>
      </table>
      <div class="footer">Documento generado automáticamente por ${empresa?.nombre ?? 'ArrendApp'}</div>
      </body></html>`;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => ventana.print(), 400);
    }
  }

  getNombreArrendatario(id: number): string {
    return this.usuarios().find(u => u.idUsuario === id)?.nombre?.split(' ').slice(0, 2).join(' ') ?? `Usuario ${id}`;
  }

  getDireccionLocal(id: number): string {
    const local = this.locales().find(l => l.idLocal === id);
    if (!local?.direccion) return `Local ${id}`;
    return local.direccion.length > 30 ? local.direccion.substring(0, 30) + '...' : local.direccion;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatCurrency(value: number = 0): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(value);
  }

  getBadgeClass(tipo: string): string {
    return ({ 'Arriendo': 'badge--blue', 'Multa': 'badge--red', 'Otro': 'badge--gray' } as Record<string, string>)[tipo] ?? 'badge--gray';
  }

  getMetodoIcon(metodo: string): string {
    return ({ 'Efectivo': '💵', 'Transferencia': '🏦', 'Tarjeta': '💳' } as Record<string, string>)[metodo] ?? '💰';
  }
}