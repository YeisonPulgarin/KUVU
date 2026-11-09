import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../../directives/reveal.directive';
import { ScrollProgressDirective } from '../../../motion/scroll-progress.directive';
import { ResponsiveImageComponent } from '../../public/responsive-image/responsive-image.component';
import { team } from '../../../content';

/**
 * Banda full-bleed "El equipo detrás de KUVU" de la home. Se aplica como atributo sobre
 * el `<section>` de la home para que la sección siga siendo hija directa del layout.
 *
 * La foto se abre con `data-reveal="clip"` y, en desktop sin movimiento reducido, se desplaza
 * levemente contra el scroll (`[appScrollProgress]` con `desktopOnly`). Requiere el
 * `ScrollMotionService` que provee la home.
 */
@Component({
  selector: 'section[app-team-band]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, RevealDirective, ScrollProgressDirective, ResponsiveImageComponent],
  templateUrl: './team-band.component.html',
  styleUrls: ['./team-band.component.scss']
})
export class TeamBandComponent {
  readonly team = team;
}
