import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { cambioPasswordGuard } from './auth.guard';

describe('cambioPasswordGuard', () => {
  const pendiente = signal<object | null>(null);
  const autenticado = signal(false);
  let router: jasmine.SpyObj<Router>;

  const run = () =>
    TestBed.runInInjectionContext(() => cambioPasswordGuard({} as never, {} as never));

  beforeEach(() => {
    pendiente.set(null);
    autenticado.set(false);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { cambioPendiente: pendiente, isAuthenticated: autenticado } },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('lets in a user with a pending change (no session yet)', () => {
    pendiente.set({ correo: 'a@b.co' });
    expect(run()).toBeTrue();
  });

  it('lets in an authenticated user (voluntary change)', () => {
    autenticado.set(true);
    expect(run()).toBeTrue();
  });

  it('sends anyone else to /login', () => {
    expect(run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
