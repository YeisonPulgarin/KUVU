import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { NotFoundComponent } from './components/pages/not-found/not-found.component';
import { ServiciosComponent } from './components/pages/servicios/servicios.component';
import { ContactoComponent } from './components/pages/contacto/contacto.component';
import { LegalComponent } from './components/pages/legal/legal.component';
import { PageMetaService } from './services/page-meta.service';

describe('app routes', () => {
  const route = (path: string) => routes.find((r) => r.path === path);

  it('should declare the public pages as lazy routes, without a route title', () => {
    ['servicios', 'nosotros', 'preguntas-frecuentes', 'contacto', 'legal'].forEach((path) => {
      const found = route(path);
      expect(found).withContext(path).toBeDefined();
      expect(found!.loadComponent).withContext(path).toEqual(jasmine.any(Function));
      expect(found!.component).withContext(path).toBeUndefined();
      expect(found!.title).withContext(path).toBeUndefined();
    });
  });

  it('should load the access flow lazily', () => {
    expect(route('acceder')!.loadComponent).toEqual(jasmine.any(Function));
    expect(route('login')!.loadComponent).toEqual(jasmine.any(Function));
  });

  it('should end with a lazy wildcard that does not redirect to /login', () => {
    const wildcard = routes[routes.length - 1];
    expect(wildcard.path).toBe('**');
    expect(wildcard.redirectTo).toBeUndefined();
    expect(wildcard.loadComponent).toEqual(jasmine.any(Function));
  });

  it('should keep the guards on the management routes', () => {
    ['dashboard', 'contratos', 'pagos', 'mantenimiento', 'locales', 'usuarios'].forEach((path) => {
      expect(route(path)!.canActivate?.length).withContext(path).toBe(1);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      spyOn(window, 'open').and.returnValue(null);
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    });

    afterEach(() => {
      const meta = TestBed.inject(PageMetaService);
      meta.clearBreadcrumb();
      document.head.querySelector('meta[name="robots"]')?.remove();
    });

    it('should render the 404 page for an unknown URL and stay on it', async () => {
      const harness = await RouterTestingHarness.create();
      const page = await harness.navigateByUrl('/no-existe', NotFoundComponent);
      expect(page).toBeInstanceOf(NotFoundComponent);
      expect(TestBed.inject(Location).path()).toBe('/no-existe');
      expect(TestBed.inject(Router).url).not.toContain('/login');
    });

    it('should resolve the new public pages to their components', async () => {
      const harness = await RouterTestingHarness.create();
      expect(await harness.navigateByUrl('/servicios', ServiciosComponent)).toBeInstanceOf(ServiciosComponent);
      expect(await harness.navigateByUrl('/contacto', ContactoComponent)).toBeInstanceOf(ContactoComponent);
      expect(await harness.navigateByUrl('/legal', LegalComponent)).toBeInstanceOf(LegalComponent);
    });
  });
});
