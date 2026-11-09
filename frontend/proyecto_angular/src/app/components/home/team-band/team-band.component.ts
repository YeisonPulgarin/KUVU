import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../../directives/reveal.directive';
import { ScrollProgressDirective } from '../../../motion/scroll-progress.directive';
import { ResponsiveImageComponent } from '../../public/responsive-image/responsive-image.component';
import { headlines, team } from '../../../content';
import { HeadlineComponent } from '../../public/headline/headline.component';

/**
 * Sección "El equipo detrás de KUVU" de la home: la foto destacada del equipo en un marco
 * girado junto al titular, el lead, los nombres y el enlace a Nosotros. Se aplica como
 * atributo sobre el `<section>` de la home para que la sección siga siendo hija directa del
 * layout.
 *
 * La foto se abre con `data-reveal="clip"` y, en desktop sin movimiento reducido, se endereza
 * con el scroll (`[appScrollProgress]` con `desktopOnly`). Requiere el `ScrollMotionService`
 * que provee la home.
 */
@Component({
  selector: 'section[app-team-band]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, RevealDirective, ScrollProgressDirective, ResponsiveImageComponent, HeadlineComponent],
  templateUrl: './team-band.component.html',
  styleUrls: ['./team-band.component.scss']
})
export class TeamBandComponent {
  readonly team = team;
  readonly photo = team.photos[0];
  readonly members = team.members.join(' · ');
  readonly headline = headlines.equipo;
}
