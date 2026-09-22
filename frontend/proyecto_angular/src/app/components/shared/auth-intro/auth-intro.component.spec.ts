import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthIntroComponent } from './auth-intro.component';

describe('AuthIntroComponent', () => {
  let fixture: ComponentFixture<AuthIntroComponent>;
  let component: AuthIntroComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthIntroComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthIntroComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start at phase 0', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.fase()).toBe(0);
  }));

  it('should advance one phase per second and finish at phase 5', fakeAsync(() => {
    fixture.detectChanges();
    tick(1000);
    expect(component.fase()).toBe(1);
    tick(1000);
    expect(component.fase()).toBe(2);
    tick(1000);
    expect(component.fase()).toBe(3);
    tick(1000);
    expect(component.fase()).toBe(4);
    tick(1000);
    expect(component.fase()).toBe(5);
    tick(1000);
    expect(component.fase()).toBe(5);
  }));

  it('should emit completada when reaching phase 5', fakeAsync(() => {
    let completada = false;
    component.completada.subscribe(() => (completada = true));

    fixture.detectChanges();
    tick(5000);
    expect(completada).toBeTrue();
  }));

  it('should clear timers on destroy', fakeAsync(() => {
    fixture.detectChanges();
    fixture.destroy();
    tick(5000);
    expect(component.fase()).toBe(0);
  }));
});