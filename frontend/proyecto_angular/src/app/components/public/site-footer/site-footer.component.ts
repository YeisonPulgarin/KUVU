import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { logo } from '../../../content/logo';
import { contactWhatsAppLink, siteInfo, siteNavLinks } from '../../../content/site';
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
  /** Contact email: the responsible-party value, or its placeholder while pending. */
  readonly email: RichText = [{ field: 'email' }];
  readonly year = new Date().getFullYear();
}
