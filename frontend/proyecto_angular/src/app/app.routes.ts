import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // Access flow, lazy: the public home does not pay for it in the initial bundle.
  {
    path: 'acceder',
    loadComponent: () =>
      import('./components/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },

  // ── Páginas públicas del sitio de marketing ──────────────
  {
    path: 'nosotros',
    title: 'Nosotros · KUVU',
    loadComponent: () =>
      import('./components/pages/nosotros/nosotros.component').then(m => m.NosotrosComponent)
  },
  {
    path: 'preguntas-frecuentes',
    title: 'Preguntas frecuentes · KUVU',
    loadComponent: () =>
      import('./components/pages/preguntas-frecuentes/preguntas-frecuentes.component').then(m => m.PreguntasFrecuentesComponent)
  },

  // ── Rutas accesibles para TODOS los usuarios autenticados ──
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contratos',
    loadComponent: () =>
      import('./components/contratos/contratos.component').then(m => m.ContratosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('./components/pagos/pagos.component').then(m => m.PagosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mantenimiento',
    loadComponent: () =>
      import('./components/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent),
    canActivate: [authGuard]
  },

  // ── Rutas solo para ADMINISTRADOR (idRol === 1) ─────────────
  {
    path: 'locales',
    loadComponent: () =>
      import('./components/locales/locales.component').then(m => m.LocalesComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: '/login' }
];
