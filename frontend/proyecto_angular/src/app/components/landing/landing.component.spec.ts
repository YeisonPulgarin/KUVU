import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';
import { INTRO_DURATION_MS, TURN_START_MS } from '../shared/auth-intro/auth-intro.component';
import { IntroStateService } from '../../services/intro-state.service';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

// Ordered by id (as GET /api/empresas returns them); deliberately not alphabetical.
const EMPRESAS = [
  { id: 1, nombre: 'Amarilo', subdominio: 'amarilo', color_primario: '#123', color_secundario: '#456', color_texto: '#fff', logo_url: '', slogan: 'Vive mejor', activo: true },
  { id: 2, nombre: 'Nido Rent', subdominio: 'nido', color_primario: '#234', color_secundario: '#567', color_texto: '#fff', logo_url: '', slogan: 'Tu hogar', activo: true },
  { id: 3, nombre: 'Balcones de San Soucci', subdominio: 'balcones', color_primario: '#345', color_secundario: '#678', color_texto: '#fff', logo_url: '', slogan: 'Vista al parque', activo: true },
  { id: 4, nombre: 'Mi Inmueble', subdominio: 'miinmueble', color_primario: '#456', color_secundario: '#789', color_texto: '#fff', logo_url: '', slogan: 'Tu espacio', activo: true }
];

function renderedNames(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('.empresa-row .emp-nombre'))
    .map(el => el.textContent?.trim() ?? '');
}

describe('LandingComponent', () => {
  let fixture: ComponentFixture<LandingComponent>;
  let component: LandingComponent;
  let httpMock: HttpTestingController;
  let root: HTMLElement;
  let debeReproducir = false;
  let marcarSpy: jasmine.Spy;

  beforeEach(async () => {
    debeReproducir = false;
    marcarSpy = jasmine.createSpy('marcarComoReproducida');
    const introStateStub = {
      debeReproducirse: () => debeReproducir,
      marcarComoReproducida: marcarSpy
    };

    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: IntroStateService, useValue: introStateStub }
      ]
    }).compileComponents();

    sessionStorage.clear();
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3000/api/empresas').flush(EMPRESAS);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('intro', () => {
    function createWithIntro(): { f2: ComponentFixture<LandingComponent>; c2: LandingComponent; el: HTMLElement } {
      fixture.destroy();
      sessionStorage.clear();
      debeReproducir = true;
      const f2 = TestBed.createComponent(LandingComponent);
      const c2 = f2.componentInstance;
      f2.detectChanges();
      httpMock.expectOne('http://localhost:3000/api/empresas').flush(EMPRESAS);
      f2.detectChanges();
      return { f2, c2, el: f2.nativeElement as HTMLElement };
    }

    it('should start directly in SELECTION when debeReproducirse is false', () => {
      expect(component.estado()).toBe('SELECTION');
      expect(root.querySelector('app-auth-intro')).toBeNull();
      const container = asElement(root.querySelector('.landing-container'));
      expect(container.inert).toBeFalse();
      expect(container.classList).not.toContain('from-intro');
    });

    it('renders the selector under the intro, inert while the intro is active', fakeAsync(() => {
      const { f2, c2, el } = createWithIntro();
      expect(c2.estado()).toBe('INTRO');
      expect(el.querySelector('app-auth-intro')).toBeTruthy();
      const container = asElement(el.querySelector('.landing-container'));
      expect(container).toBeTruthy();
      expect(container.inert).toBeTrue();
      expect(el.querySelectorAll('.empresa-row').length).toBe(4);
      expect(asElement(el.querySelector('.landing-bg')).classList).toContain('is-intro-active');
      f2.destroy();
      tick(INTRO_DURATION_MS);
    }));

    it('keeps the photo, its overlay and the selector unrendered until the lift (D9)', fakeAsync(() => {
      const { f2, el } = createWithIntro();
      const [photo, overlay, container] = ['.bg-photo', '.bg-overlay', '.landing-container']
        .map((sel) => asElement(el.querySelector(sel)));
      const rendered = () => [
        getComputedStyle(photo).visibility,
        getComputedStyle(overlay).visibility,
        getComputedStyle(container).getPropertyValue('content-visibility')
      ];
      expect(rendered()).toEqual(['hidden', 'hidden', 'hidden']);
      tick(TURN_START_MS - 1);
      f2.detectChanges();
      expect(rendered()).toEqual(['hidden', 'hidden', 'hidden']);
      tick(1);
      f2.detectChanges();
      expect(rendered()).toEqual(['visible', 'visible', 'visible']);
      f2.destroy();
      tick(INTRO_DURATION_MS);
    }));

    it('renders the selector at once when the intro is skipped before the lift (D9)', fakeAsync(() => {
      const { f2, c2, el } = createWithIntro();
      tick(100);
      c2.completadaIntro();
      f2.detectChanges();
      expect(getComputedStyle(asElement(el.querySelector('.landing-container'))).getPropertyValue('content-visibility')).toBe('visible');
      f2.destroy();
      tick(INTRO_DURATION_MS);
    }));

    it('completadaIntro goes to SELECTION at once, releases inert and marks the intro as seen', fakeAsync(() => {
      const { f2, c2, el } = createWithIntro();
      c2.completadaIntro();
      expect(c2.estado()).toBe('SELECTION');
      f2.detectChanges();
      expect(marcarSpy).toHaveBeenCalledTimes(1);
      expect(el.querySelector('app-auth-intro')).toBeNull();
      const container = asElement(el.querySelector('.landing-container'));
      expect(container.inert).toBeFalse();
      expect(asElement(el.querySelector('.landing-bg')).classList).not.toContain('is-intro-active');
      f2.destroy();
    }));

    it('focuses the search input after the intro completes', fakeAsync(() => {
      const { f2, c2, el } = createWithIntro();
      const input = asElement(el.querySelector('.search-input'));
      expect(document.activeElement).not.toBe(input);
      c2.completadaIntro();
      TestBed.tick();
      expect(asElement(el.querySelector('.landing-container')).inert).toBeFalse();
      expect(document.activeElement).toBe(input);
      f2.destroy();
    }));

    it('completes when the intro emits completed after INTRO_DURATION_MS', fakeAsync(() => {
      const { f2, c2 } = createWithIntro();
      tick(INTRO_DURATION_MS - 1);
      expect(c2.estado()).toBe('INTRO');
      tick(1);
      expect(c2.estado()).toBe('SELECTION');
      expect(marcarSpy).toHaveBeenCalledTimes(1);
      f2.destroy();
    }));

    it('a click that skips the intro does not select a company', fakeAsync(() => {
      const { f2, c2, el } = createWithIntro();
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      asElement(el.querySelector('app-auth-intro')).click();
      tick(300);
      f2.detectChanges();
      expect(c2.estado()).toBe('SELECTION');
      expect(router.navigate).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('empresaPreseleccionada')).toBeNull();
      f2.destroy();
    }));
  });

  describe('volver al inicio', () => {
    function homeLinks(el: HTMLElement): HTMLAnchorElement[] {
      return [el.querySelector('a.back-home'), el.querySelector('a.brand-link')] as HTMLAnchorElement[];
    }

    it('renders a "Volver al inicio" link to the home (CA-1)', () => {
      const link = asElement(root.querySelector('a.back-home')) as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.textContent?.trim()).toBe('Volver al inicio');
      expect(link.getAttribute('href')).toBe('/');
    });

    it('places the link before the card, outside it', () => {
      const link = asElement(root.querySelector('a.back-home'));
      expect(link.closest('.landing-card')).toBeNull();
      expect(link.parentElement?.classList).toContain('landing-container');
      expect(link.compareDocumentPosition(asElement(root.querySelector('.landing-card'))) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('hides the chevron icon from assistive technology (CA-5)', () => {
      const icon = asElement(root.querySelector('a.back-home svg'));
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });

    it('makes the logo a home link with an accessible name (CA-2)', () => {
      const logoLink = asElement(root.querySelector('a.brand-link'));
      expect(logoLink.getAttribute('href')).toBe('/');
      expect(logoLink.getAttribute('aria-label')).toBe('KUVU, volver al inicio');
      expect(logoLink.querySelector('img.brand-logo-img')).toBeTruthy();
    });

    it('navigates to / when either link is activated (CA-3)', () => {
      const router = TestBed.inject(Router);
      const navigate = spyOn(router, 'navigateByUrl').and.resolveTo(true);
      for (const link of homeLinks(root)) {
        navigate.calls.reset();
        link.click();
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(router.serializeUrl(navigate.calls.mostRecent().args[0] as never)).toBe('/');
      }
      // Leaving /acceder does not pick a company.
      expect(sessionStorage.getItem('empresaPreseleccionada')).toBeNull();
    });

    it('keeps the search input as the initial focus target', () => {
      expect(asElement(root.querySelector('.search-input')).hasAttribute('autofocus')).toBeTrue();
    });

    it('leaves the links inert while the intro runs and operable after it (CA-4)', fakeAsync(() => {
      fixture.destroy();
      sessionStorage.clear();
      debeReproducir = true;
      const f2 = TestBed.createComponent(LandingComponent);
      f2.detectChanges();
      httpMock.expectOne('http://localhost:3000/api/empresas').flush(EMPRESAS);
      f2.detectChanges();
      const el = f2.nativeElement as HTMLElement;
      for (const link of homeLinks(el)) {
        expect(asElement(link.closest('.landing-container')).inert).toBeTrue();
      }
      f2.componentInstance.completadaIntro();
      f2.detectChanges();
      for (const link of homeLinks(el)) {
        expect(asElement(link.closest('.landing-container')).inert).toBeFalse();
      }
      f2.destroy();
      tick(INTRO_DURATION_MS);
    }));
  });

  describe('pantalla de seleccion', () => {
    it('should render the KUVU web logo, named by its home link', () => {
      const img = asElement(root.querySelector('.brand-logo-img'));
      expect(img.tagName).toBe('IMG');
      expect(img.getAttribute('src')).toBe('/logo-rediseno/Logo_Kuvu.png');
      // The link carries the accessible name; an empty alt avoids reading "KUVU" twice.
      expect(img.getAttribute('alt')).toBe('');
      expect(img.closest('a.brand-link')).toBeTruthy();
    });

    it('should render the new PANTALLA 1 copy', () => {
      const title = asElement(root.querySelector('.card-title'));
      expect(title.textContent).toContain('Bienvenido');
      const sub = asElement(root.querySelector('.card-sub'));
      expect(sub.textContent).toContain('Gestiona tu operación inmobiliaria');
      const label = asElement(root.querySelector('.card-label'));
      expect(label.textContent).toContain('Selecciona tu inmobiliaria');
    });

    it('should render the inmobiliarias in the order received (by id)', () => {
      expect(renderedNames(root)).toEqual(['Amarilo', 'Nido Rent', 'Balcones de San Soucci', 'Mi Inmueble']);
    });

    it('should keep the received order when filtering', () => {
      component.busqueda.set('i');
      fixture.detectChanges();
      expect(renderedNames(root)).toEqual(['Amarilo', 'Nido Rent', 'Balcones de San Soucci', 'Mi Inmueble']);

      component.busqueda.set('n');
      fixture.detectChanges();
      expect(renderedNames(root)).toEqual(['Nido Rent', 'Balcones de San Soucci', 'Mi Inmueble']);
    });

    it('should filter empresas by name', () => {
      component.busqueda.set('nido');
      fixture.detectChanges();
      const rows = Array.from(root.querySelectorAll('.empresa-row')) as HTMLElement[];
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Nido Rent');
    });

    it('should store the selection and navigate to /login without reloading', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      const rows = Array.from(root.querySelectorAll('.empresa-row')) as HTMLElement[];
      rows[0].click();
      fixture.detectChanges();

      expect(sessionStorage.getItem('empresaPreseleccionada')).toContain('Amarilo');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});