import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },

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
