import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';
import { IntroStateService } from '../../services/intro-state.service';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

const EMPRESAS = [
  { id: 1, nombre: 'Amarilo', subdominio: 'amarilo', color_primario: '#123', color_secundario: '#456', color_texto: '#fff', logo_url: '', slogan: 'Vive mejor', activo: true },
  { id: 2, nombre: 'Nido Rent', subdominio: 'nido', color_primario: '#234', color_secundario: '#567', color_texto: '#fff', logo_url: '', slogan: 'Tu hogar', activo: true }
];

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
    it('should start directly in SELECTION when debeReproducirse is false', () => {
      expect(component.estado()).toBe('SELECTION');
    });

    it('should go SELECTION -> INTRO -> SELECTION when intro runs', fakeAsync(() => {
      fixture.destroy();
      sessionStorage.clear();
      debeReproducir = true;
      const f2 = TestBed.createComponent(LandingComponent);
      const c2 = f2.componentInstance;
      f2.detectChanges();
      httpMock.expectOne('http://localhost:3000/api/empresas').flush(EMPRESAS);
      f2.detectChanges();

      expect(c2.estado()).toBe('INTRO');
      const introEl = asElement(f2.nativeElement.querySelector('app-auth-intro'));
      expect(introEl).toBeTruthy();

      c2.completadaIntro();
      f2.detectChanges();
      expect(marcarSpy).toHaveBeenCalled();
      expect(c2.transicionando()).toBeTrue();

      tick(700);
      f2.detectChanges();
      expect(c2.estado()).toBe('SELECTION');
      expect(f2.nativeElement.querySelector('app-auth-intro')).toBeNull();
    }));
  });

  describe('pantalla de seleccion', () => {
    it('should render the KUVU logo built for dark backgrounds', () => {
      const img = asElement(root.querySelector('.brand-logo-img'));
      expect(img.tagName).toBe('IMG');
      expect(img.getAttribute('src')).toBe('/logo-rediseno/logo-dark.png');
      expect(img.getAttribute('alt')).toBe('KUVU');
    });

    it('should render the new PANTALLA 1 copy', () => {
      const title = asElement(root.querySelector('.card-title'));
      expect(title.textContent).toContain('Bienvenido');
      const sub = asElement(root.querySelector('.card-sub'));
      expect(sub.textContent).toContain('Gestiona tu operación inmobiliaria');
      const label = asElement(root.querySelector('.card-label'));
      expect(label.textContent).toContain('Selecciona tu inmobiliaria');
    });

    it('should render the inmobiliarias list', () => {
      const rows = Array.from(root.querySelectorAll('.empresa-row')) as HTMLElement[];
      expect(rows.length).toBe(2);
      const nombres = rows.map(r => r.querySelector('.emp-nombre')?.textContent?.trim() ?? '');
      expect(nombres).toContain('Amarilo');
      expect(nombres).toContain('Nido Rent');
    });

    it('should filter empresas by name', () => {
      const input = asElement(root.querySelector('.search-input'));
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