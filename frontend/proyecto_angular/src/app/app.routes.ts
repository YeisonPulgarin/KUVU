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

  // ── Public site pages ───────────────────────────────────
  // No route `title`: each page publishes its title and meta with PageMetaService
  // (content/pages.ts), so the title never diverges from og:title.
  {
    path: 'servicios',
    loadComponent: () =>
      import('./components/pages/servicios/servicios.component').then(m => m.ServiciosComponent)
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('./components/pages/nosotros/nosotros.component').then(m => m.NosotrosComponent)
  },
  {
    path: 'preguntas-frecuentes',
    loadComponent: () =>
      import('./components/pages/preguntas-frecuentes/preguntas-frecuentes.component').then(m => m.PreguntasFrecuentesComponent)
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./components/pages/contacto/contacto.component').then(m => m.ContactoComponent)
  },
  {
    path: 'legal',
    loadComponent: () =>
      import('./components/pages/legal/legal.component').then(m => m.LegalComponent)
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

  // Any URL without a route: public 404 page.
  {
    path: '**',
    loadComponent: () =>
      import('./components/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
