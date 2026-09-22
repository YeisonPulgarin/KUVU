import { Component, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { logo } from '../../../content/logo';
import { contactWhatsAppLink, pageNavLinks, siteInfo } from '../../../content/site';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss']
})
export class SiteFooterComponent {
  readonly theme = inject(ThemeService);
  readonly isDark: Signal<boolean> = this.theme.isDark;
  readonly logo = logo;
  readonly brandName = siteInfo.name;
  readonly tagline = siteInfo.tagline;
  readonly navLinks = pageNavLinks;
  readonly whatsappLink = contactWhatsAppLink;
  readonly year = new Date().getFullYear();
}