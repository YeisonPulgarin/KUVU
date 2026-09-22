import { Component, Signal, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { logo } from '../../../content/logo';
import { contactWhatsAppLink, navLinks, siteInfo } from '../../../content/site';
import type { NavItem } from '../../../content/types';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss']
})
export class SiteHeaderComponent {
  readonly theme = inject(ThemeService);
  readonly isDark: Signal<boolean> = this.theme.isDark;
  readonly logo = logo;
  readonly whatsappLink = contactWhatsAppLink;
  readonly brandName = siteInfo.name;

  readonly navLinks = input<readonly NavItem[]>(navLinks);

  isMobileMenuOpen = false;

  isAnchor(href: string): boolean {
    return href.startsWith('#');
  }

  toggleMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}