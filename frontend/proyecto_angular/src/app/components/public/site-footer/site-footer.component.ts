import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { logo } from '../../../content/logo';
import { academicNote, contactWhatsAppLink, siteInfo, siteNavLinks } from '../../../content/site';
import { responsible } from '../../../content/responsible';
import { legalIndex } from '../../../content/legal-index';
import type { RichText } from '../../../content/types';
import { RichTextComponent } from '../rich-text/rich-text.component';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterModule, RichTextComponent],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss']
})
export class SiteFooterComponent {
  readonly theme = inject(ThemeService);
  readonly logo = logo;
  readonly brandName = siteInfo.name;
  readonly tagline = siteInfo.tagline;
  readonly navLinks = siteNavLinks;
  readonly legalLinks = legalIndex;
  readonly whatsappLink = contactWhatsAppLink;
  /** Contact email, shown only if the responsible party has one. */
  readonly email: RichText = [{ field: 'email', prefix: 'Correo: ' }];
  readonly hasEmail = Boolean(responsible.email);
  readonly academicNote = academicNote;
  readonly year = new Date().getFullYear();
}
