import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, MENSAJE_ACCESO } from '../../services/auth.service';

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
    it('should render the KUVU web logo', () => {
      const img = asElement(root.querySelector('.brand-logo-img'));
      expect(img.tagName).toBe('IMG');
      expect(img.getAttribute('src')).toBe('/logo-rediseno/Logo_Kuvu.png');
      expect(img.getAttribute('alt')).toBe('KUVU');
    });

    it('should render the credentials screen header', () => {
      const title = asElement(root.querySelector('.step-title'));
      expect(title.textContent).toContain('Inicia sesión');
    });

    it('should render email, documento and password fields', () => {
      const inputs = Array.from(root.querySelectorAll('.field-input')) as HTMLInputElement[];
      expect(inputs.length).toBe(3);
      const pw = inputs[2];
      expect(pw.type).toBe('password');
      expect(pw.getAttribute('autocomplete')).toBe('current-password');

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

    it('should render the remember checkbox and the forgot-password button', () => {
      const remember = asElement(root.querySelector('.extras-remember'));
      expect(remember).toBeTruthy();
      const link = asElement(root.querySelector('.extras-link'));
      expect(link.tagName).toBe('BUTTON');
      expect(link.textContent).toContain('¿Olvidaste tu contraseña?');
    });

    it('should explain that the administrator resets a forgotten password', () => {
      const link = asElement(root.querySelector('.extras-link'));
      expect(root.querySelector('.login-ayuda')).toBeNull();
      link.click();
      fixture.detectChanges();
      expect(link.getAttribute('aria-expanded')).toBe('true');
      expect(asElement(root.querySelector('.login-ayuda')).textContent).toContain('administrador');
    });

    it('should toggle the password visibility', () => {
      const pw = root.querySelectorAll('.field-input')[2] as HTMLInputElement;
      const toggle = asElement(root.querySelector('.field-toggle'));
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
      toggle.click();
      fixture.detectChanges();
      expect(pw.type).toBe('text');
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
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
    function fill(): void {
      component.correo.set('a@b.com');
      component.documento.set('1128074279');
      component.password.set('Tejado#Azul42');
    }

    it('should warn when fields are empty', () => {
      component.onLogin();
      fixture.detectChanges();
      expect(component.error()).toBe('Ingresa tu correo, número de documento y contraseña.');
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it('should require the password too', () => {
      component.correo.set('a@b.com');
      component.documento.set('1128074279');
      component.onLogin();
      expect(component.error()).toContain('contraseña');
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it('should call auth.login with correo, documento, password and empresa', () => {
      loginSpy.and.returnValue(of({ ok: true, requiereCambioPassword: false }));
      fill();
      component.onLogin();
      expect(loginSpy).toHaveBeenCalledWith('a@b.com', '1128074279', 'Tejado#Azul42', 1, jasmine.objectContaining({ id: 1 }));
    });

    it('should go to the password change when the password is temporary', () => {
      loginSpy.and.returnValue(of({ ok: true, requiereCambioPassword: true }));
      spyOn(router, 'navigate');
      fill();
      component.onLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/cambiar-contrasena']);
      expect(component.password()).toBe('');
    });

    it('should navigate to /dashboard on success', () => {
      loginSpy.and.returnValue(of({ ok: true, requiereCambioPassword: false }));
      spyOn(router, 'navigate');
      fill();
      component.onLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show the generic access message on 401 and clear the password', () => {
      loginSpy.and.returnValue(throwError(() => ({ status: 401 })));
      fill();
      component.onLogin();
      fixture.detectChanges();
      expect(component.error()).toBe(MENSAJE_ACCESO);
      expect(component.password()).toBe('');
      expect(component.cargando()).toBeFalse();
    });

    it('should show a connection message on other errors', () => {
      loginSpy.and.returnValue(throwError(() => ({ status: 500 })));
      fill();
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