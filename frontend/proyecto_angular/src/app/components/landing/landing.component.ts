import { Component, OnDestroy, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IntroStateService } from '../../services/intro-state.service';
import { AuthService } from '../../services/auth.service';
import { AuthIntroComponent } from '../shared/auth-intro/auth-intro.component';
import { Empresa } from '../../models/empresa.model';

type LandingState = 'INTRO' | 'SELECTION';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule, CommonModule, AuthIntroComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  private auth       = inject(AuthService);
  private router     = inject(Router);
  private introState = inject(IntroStateService);

  estado     = signal<LandingState>(this.introState.debeReproducirse() ? 'INTRO' : 'SELECTION');
  transicionando = signal(false);

  busqueda = signal('');
  empresas = signal<Empresa[]>([]);
  cargando = signal(true);

  private timeout?: ReturnType<typeof setTimeout>;

  empresasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.empresas();
    return this.empresas().filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      e.subdominio.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  ngOnDestroy(): void {
    if (this.timeout) clearTimeout(this.timeout);
  }

  private cargarEmpresas(): void {
    this.auth.cargarEmpresas()
      .subscribe({
        next:  (data) => { this.empresas.set(data); this.cargando.set(false); },
        error: ()     => this.cargando.set(false)
      });
  }

  completadaIntro(): void {
    this.introState.marcarComoReproducida();
    this.transicionando.set(true);
    this.timeout = setTimeout(() => this.estado.set('SELECTION'), 650);
  }

  seleccionar(empresa: Empresa): void {
    sessionStorage.setItem('empresaPreseleccionada', JSON.stringify(empresa));
    this.router.navigate(['/login']);
  }
}