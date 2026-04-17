import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);

  // Lifecycle: restaurar sesión al cargar la app
  ngOnInit(): void {
    this.auth.restaurarSesion();
  }
}
