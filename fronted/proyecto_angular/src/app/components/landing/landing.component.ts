import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Empresa {
  id: number;
  nombre: string;
  subdominio: string;
  color_primario: string;
  color_secundario: string;
  color_texto: string;
  logo_url: string;
  slogan: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  private http   = inject(HttpClient);
  private router = inject(Router);

  busqueda = signal('');
  empresas = signal<Empresa[]>([]);
  cargando = signal(true);

  empresasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.empresas();
    return this.empresas().filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      e.subdominio.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.http.get<Empresa[]>('http://localhost:3000/api/empresas')
      .subscribe({
        next:  (data) => { this.empresas.set(data); this.cargando.set(false); },
        error: ()     => this.cargando.set(false)
      });
  }

  seleccionar(empresa: Empresa): void {
    sessionStorage.setItem('empresaPreseleccionada', JSON.stringify(empresa));
    this.router.navigate(['/login']);
  }
}
