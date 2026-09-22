import { Component, OnDestroy, OnInit, output, signal } from '@angular/core';

const DURACION_FASE_MS = 1000;
const TOTAL_FASES = 5;

@Component({
  selector: 'app-auth-intro',
  standalone: true,
  templateUrl: './auth-intro.component.html',
  styleUrls: ['./auth-intro.component.scss']
})
export class AuthIntroComponent implements OnInit, OnDestroy {
  fase = signal(0);
  completada = output<void>();
  particulas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  private timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    for (let i = 1; i <= TOTAL_FASES; i++) {
      this.timers.push(
        setTimeout(() => {
          this.fase.set(i);
          if (i === TOTAL_FASES) this.completada.emit();
        }, i * DURACION_FASE_MS)
      );
    }
  }

  ngOnDestroy(): void {
    this.timers.forEach((t) => clearTimeout(t));
  }
}