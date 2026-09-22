import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../services/auth.service';

function asElement(node: unknown): HTMLElement {
  return node as HTMLElement;
}

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let root: HTMLElement;

  beforeEach(async () => {
    const authStub = {
      empresaActiva: signal(null),
      usuarioActivo: signal(null),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('should render the KUVU logo built for dark backgrounds', () => {
    const img = asElement(root.querySelector('.navbar__logo-img'));
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toBe('/logo-rediseno/logo-dark.png');
    expect(img.getAttribute('alt')).toBe('KUVU');
  });
});