import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
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
export class LandingComponent implements OnInit {
  private auth       = inject(AuthService);
  private router     = inject(Router);
  private introState = inject(IntroStateService);
  private injector   = inject(Injector);
  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  estado     = signal<LandingState>(this.introState.debeReproducirse() ? 'INTRO' : 'SELECTION');
  /** True when this visit starts with the intro; drives the selector's settle transition. */
  readonly startsWithIntro = this.estado() === 'INTRO';

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
    this.cargarEmpresas();
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
    this.estado.set('SELECTION');
    // The selector stops being inert on the next render; focus it right after.
    afterNextRender(
      () => this.searchInput()?.nativeElement.focus({ preventScroll: true }),
      { injector: this.injector }
    );
  }

  seleccionar(empresa: Empresa): void {
    sessionStorage.setItem('empresaPreseleccionada', JSON.stringify(empresa));
    this.router.navigate(['/login']);
  }
}