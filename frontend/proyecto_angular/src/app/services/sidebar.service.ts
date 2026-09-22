import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  colapsado = signal(false);
  toggle() { this.colapsado.update(v => !v); }
}
