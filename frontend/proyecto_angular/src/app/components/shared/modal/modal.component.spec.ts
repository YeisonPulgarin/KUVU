import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ModalComponent, SALIDA_MAX_MS } from './modal.component';
import { MatchMediaStub } from '../../../motion/testing/match-media.stub';

@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `
    <button id="abrir" (click)="abierto.set(true)">Abrir</button>
    @if (abierto()) {
      <app-modal titulo="Nuevo local" (closed)="onClosed()">
        <div class="form-grid">
          <label for="campo-a">A</label><input id="campo-a" />
          <label for="campo-b">B</label><input id="campo-b" [attr.autofocus]="autofocusB ? '' : null" />
        </div>
      </app-modal>
    }
  `
})
class HostComponent {
  abierto = signal(false);
  cerrados = 0;
  autofocusB = false;
  modal = viewChild(ModalComponent);
  onClosed(): void {
    this.cerrados++;
    this.abierto.set(false);
  }
}

describe('ModalComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let media: MatchMediaStub;
  const el = () => fixture.nativeElement as HTMLElement;
  const dialog = () => el().querySelector('dialog') as HTMLDialogElement | null;

  function abrir(): void {
    const boton = el().querySelector<HTMLButtonElement>('#abrir')!;
    boton.focus();
    boton.click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    media = new MatchMediaStub({ reducedMotion: true }).install();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    media.restore();
    fixture.destroy();
    (fixture.nativeElement as HTMLElement).remove();
  });

  it('opens as a modal dialog named by its title', () => {
    abrir();
    const d = dialog()!;
    expect(d.open).toBeTrue();
    expect(d.matches(':modal')).toBeTrue();
    const titulo = document.getElementById(d.getAttribute('aria-labelledby')!)!;
    expect(titulo.textContent!.trim()).toBe('Nuevo local');
  });

  it('focuses the first field, or the [autofocus] one', () => {
    abrir();
    expect(document.activeElement!.id).toBe('campo-a');
    fixture.componentInstance.modal()!.cerrar();
    fixture.detectChanges();

    host.autofocusB = true;
    abrir();
    expect(document.activeElement!.id).toBe('campo-b');
  });

  it('has an accessible close button that closes and returns focus to the opener', () => {
    abrir();
    const cerrar = el().querySelector<HTMLButtonElement>('.modal__close')!;
    expect(cerrar.getAttribute('aria-label')).toBe('Cerrar');
    cerrar.click();
    fixture.detectChanges();
    expect(host.cerrados).toBe(1);
    expect(dialog()).toBeNull();
    expect(document.activeElement!.id).toBe('abrir');
  });

  it('closes on Escape (cancel event) and on a backdrop click, but not on inner clicks', () => {
    abrir();
    el().querySelector<HTMLInputElement>('#campo-a')!.click();
    expect(host.cerrados).toBe(0);

    const cancel = new Event('cancel', { cancelable: true });
    dialog()!.dispatchEvent(cancel);
    fixture.detectChanges();
    expect(cancel.defaultPrevented).toBeTrue();
    expect(host.cerrados).toBe(1);

    abrir();
    dialog()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(host.cerrados).toBe(2);
  });

  it('plays the exit animation before closing when motion is allowed', fakeAsync(() => {
    media.set('reducedMotion', false);
    abrir();
    const d = dialog()!;
    host.modal()!.cerrar();
    expect(d.dataset['state']).toBe('closing');
    expect(host.cerrados).toBe(0);

    d.dispatchEvent(new AnimationEvent('animationend'));
    expect(host.cerrados).toBe(1);
    tick(SALIDA_MAX_MS);
    expect(host.cerrados).toBe(1);
  }));

  it('closes after the fallback delay when no animationend arrives', fakeAsync(() => {
    media.set('reducedMotion', false);
    abrir();
    host.modal()!.cerrar();
    tick(SALIDA_MAX_MS - 1);
    expect(host.cerrados).toBe(0);
    tick(1);
    expect(host.cerrados).toBe(1);
  }));
});
