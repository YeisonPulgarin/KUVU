import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

const EMPRESA = {
  id: 1,
  nombre: 'Nido Rent',
  subdominio: 'nido',
  color_primario: '#0b3b5c',
  color_secundario: '#0d6e8e',
  color_texto: '#ffffff',
  logo_url: '',
  slogan: 'Tu hogar'
};

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let root: HTMLElement;
  let loginSpy: jasmine.Spy;
  let router: Router;

  beforeEach(async () => {
    loginSpy = jasmine.createSpy('login');
    const authStub = {
      isAuthenticated: () => false,
      login: loginSpy
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authStub }]
    }).compileComponents();

    sessionStorage.clear();
    sessionStorage.setItem('empresaPreseleccionada', JSON.stringify(EMPRESA));

    router = TestBed.inject(Router);
    router.resetConfig([]);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('PANTALLA 2', () => {
    it('should render the KUVU logo built for dark backgrounds', () => {
      const img = asElement(root.querySelector('.brand-logo-img'));
      expect(img.tagName).toBe('IMG');
      expect(img.getAttribute('src')).toBe('/logo-rediseno/logo-dark.png');
      expect(img.getAttribute('alt')).toBe('KUVU');
    });

    it('should render the credentials screen header', () => {
      const title = asElement(root.querySelector('.step-title'));
      expect(title.textContent).toContain('Inicia sesión');
    });

    it('should render email and documento fields', () => {
      const inputs = Array.from(root.querySelectorAll('.field-input')) as HTMLInputElement[];
      expect(inputs.length).toBe(2);

      const correo = component.correo();
      const documento = component.documento();
      expect(correo).toBe('');
      expect(documento).toBe('');
    });

    it('should restore the selected empresa from sessionStorage', () => {
      expect(component.empresaSeleccionada()?.nombre).toBe('Nido Rent');
      const badge = asElement(root.querySelector('.badge-nombre'));
      expect(badge.textContent).toContain('Nido Rent');
    });

    it('should render decorative extras without breaking the form', () => {
      const remember = asElement(root.querySelector('.extras-remember'));
      expect(remember).toBeTruthy();
      const link = asElement(root.querySelector('.extras-link'));
      expect(link.textContent).toContain('¿Olvidaste tu contraseña?');
    });

    it('should render the submit and back buttons', () => {
      const btn = asElement(root.querySelector('.btn-login'));
      expect(btn.textContent).toContain('Iniciar sesión');
      const back = asElement(root.querySelector('.back-btn'));
      expect(back.textContent).toContain('Cambiar de inmobiliaria');
    });

    it('should toggle the decorative recordarme signal without persisting', () => {
      expect(component.recordarme()).toBeFalse();
      const check = asElement(root.querySelector('.extras-check')) as HTMLInputElement;
      check.click();
      fixture.detectChanges();
      expect(component.recordarme()).toBeTrue();
      expect(sessionStorage.getItem('recordarme')).toBeNull();
    });
  });

  describe('onLogin()', () => {
    it('should warn when fields are empty', () => {
      component.onLogin();
      fixture.detectChanges();
      expect(component.error()).toContain('Ingresa tu correo');
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it('should call auth.login with correo, documento and empresa', () => {
      loginSpy.and.returnValue(of({ ok: true }));
      component.correo.set('a@b.com');
      component.documento.set('1128074279');
      component.onLogin();
      expect(loginSpy).toHaveBeenCalledWith('a@b.com', '1128074279', 1);
    });

    it('should navigate to /dashboard on success', () => {
      loginSpy.and.returnValue(of({ ok: true }));
      spyOn(router, 'navigate');
      component.correo.set('a@b.com');
      component.documento.set('1128074279');
      component.onLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show the 401 message when login fails', () => {
      loginSpy.and.returnValue(throwError(() => ({ status: 401 })));
      component.correo.set('a@b.com');
      component.documento.set('1128074279');
      component.onLogin();
      fixture.detectChanges();
      expect(component.error()).toContain('Correo o documento incorrecto');
      expect(component.cargando()).toBeFalse();
    });

    it('should show a connection message on other errors', () => {
      loginSpy.and.returnValue(throwError(() => ({ status: 500 })));
      component.correo.set('a@b.com');
      component.documento.set('1128074279');
      component.onLogin();
      fixture.detectChanges();
      expect(component.error()).toContain('Error de conexión');
    });
  });

  describe('volverAlLanding()', () => {
    it('should navigate back to /acceder', () => {
      spyOn(router, 'navigate');
      component.volverAlLanding();
      expect(router.navigate).toHaveBeenCalledWith(['/acceder']);
    });
  });
});