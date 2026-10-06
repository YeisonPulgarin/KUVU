import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RevealDirective } from '../../../directives/reveal.directive';
import { ResponsiveImageComponent } from '../../public/responsive-image/responsive-image.component';
import { team } from '../../../content';

/**
 * Banda full-bleed "El equipo detrás de KUVU" de la home. Se aplica como atributo sobre
 * el `<section>` de la home para que la sección siga siendo hija directa del layout.
 */
@Component({
  selector: 'section[app-team-band]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, RevealDirective, ResponsiveImageComponent],
  templateUrl: './team-band.component.html',
  styleUrls: ['./team-band.component.scss']
})
export class TeamBandComponent {
  readonly team = team;
}
