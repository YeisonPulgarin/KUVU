import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard básico: requiere estar autenticado
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};

// Guard: solo Administrador  (idRol === 1 con roles globales, siempre correcto)
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) { router.navigate(['/login']); return false; }
  if (auth.usuarioActivo()?.idRol === 1) return true;
  router.navigate(['/dashboard']);
  return false;
};

// Guard: pantalla de cambio de contraseña. Entra quien tiene un cambio pendiente (login con
// contraseña temporal, todavía sin sesión) o quien ya tiene sesión (cambio voluntario).
export const cambioPasswordGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.cambioPendiente() || auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};
