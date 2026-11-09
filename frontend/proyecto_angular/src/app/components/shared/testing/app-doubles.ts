import { EnvironmentProviders, Provider, WritableSignal, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { ConfirmService } from '../confirm/confirm.service';
import { ToastService } from '../toast/toast.service';
import {
  ContratoArrendamiento, Local, Mantenimiento, PagoVariado, Usuario
} from '../../../models/index';

/** Test doubles of the services every signed-in screen uses. */
export interface AppDoubles {
  auth: {
    empresaActiva: WritableSignal<any>;
    usuarioActivo: WritableSignal<any>;
    logout: jasmine.Spy;
  };
  data: ReturnType<typeof crearDataDouble>;
  confirm: jasmine.SpyObj<ConfirmService>;
  toast: jasmine.SpyObj<ToastService>;
  providers: Array<Provider | EnvironmentProviders>;
}

export const ADMIN: Usuario = {
  idUsuario: 1, empresa_id: 1, nombre: 'Wilson Solano', documento: '1127723450', correo: 'wilson@amarilo.co', idRol: 1
};
export const ARRENDATARIO: Usuario = {
  idUsuario: 2, empresa_id: 1, nombre: 'Carlos Lesmes', documento: '21249773', correo: 'carlos@amarilo.co', idRol: 2,
  debe_cambiar_password: 1
};

function crearDataDouble() {
  const usuarios = signal<Usuario[]>([ADMIN, ARRENDATARIO]);
  const locales = signal<Local[]>([]);
  const contratos = signal<ContratoArrendamiento[]>([]);
  const mantenimientos = signal<Mantenimiento[]>([]);
  const pagos = signal<PagoVariado[]>([]);
  const ok = () => jasmine.createSpy().and.returnValue(of({ ok: true }));
  return {
    usuarios, locales, contratos, mantenimientos, pagos,
    cargando: signal(false),
    listo: signal(true),
    errorCarga: signal(false),
    esperandoDatos: signal(false),
    getUsuarios: () => usuarios,
    getLocales: () => locales,
    getContratos: () => contratos,
    getMantenimientos: () => mantenimientos,
    getPagos: () => pagos,
    getEstadisticas: () => signal({
      totalLocales: 0, totalContratos: 0, totalPagos: 0, totalRecaudado: 0,
      mantenPendientes: 0, mantenUrgentes: 0
    }),
    cargarSiVacio: jasmine.createSpy('cargarSiVacio'),
    cargarTodo: jasmine.createSpy('cargarTodo').and.returnValue(of({})),
    agregarLocal: ok(), actualizarLocal: ok(), eliminarLocal: ok(),
    agregarContrato: ok(), actualizarContrato: ok(), eliminarContrato: ok(),
    agregarPago: ok(), eliminarPago: ok(),
    agregarMantenimiento: ok(), actualizarEstadoMantenimiento: ok(), eliminarMantenimiento: ok(),
    agregarUsuario: ok(), actualizarUsuario: ok(), eliminarUsuario: ok(), restablecerPassword: ok()
  };
}

export function crearDobles(usuario: Usuario = ADMIN): AppDoubles {
  const auth = {
    empresaActiva: signal<any>({ id: 1, nombre: 'Amarilo', color_primario: '#F5A623', color_secundario: '#F0851A' }),
    usuarioActivo: signal<any>(usuario),
    logout: jasmine.createSpy('logout')
  };
  const data = crearDataDouble();
  const confirm = jasmine.createSpyObj<ConfirmService>('ConfirmService', ['confirmar', 'responder'], {
    solicitud: signal(null)
  });
  confirm.confirmar.and.resolveTo(true);
  const toast = jasmine.createSpyObj<ToastService>('ToastService', ['exito', 'error', 'cerrar'], {
    toasts: signal([])
  });
  return {
    auth, data, confirm, toast,
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: auth },
      { provide: DataService, useValue: data },
      { provide: ConfirmService, useValue: confirm },
      { provide: ToastService, useValue: toast }
    ]
  };
}

/** Lets the awaited confirmation and the synchronous `of()` responses settle. */
export async function esperar(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

/** Text of the buttons inside an element, trimmed. */
export function textosBotones(raiz: Element): string[] {
  return Array.from(raiz.querySelectorAll('button')).map(b => b.textContent!.trim());
}

/** True if the text has a pictographic emoji (the app uses SVG icons only). */
export function tieneEmoji(texto: string): boolean {
  return /\p{Extended_Pictographic}/u.test(texto);
}
