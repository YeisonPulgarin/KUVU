import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BackToTopComponent],
  template: `<router-outlet></router-outlet><app-back-to-top />`,
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);

  // Lifecycle: restaurar sesión al cargar la app
  ngOnInit(): void {
    this.auth.restaurarSesion();
  }
}
