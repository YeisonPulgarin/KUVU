import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Signal,
  afterNextRender,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../../../services/theme.service';
import { logo } from '../../../content/logo';
import { contactWhatsAppLink, siteInfo, siteNavLinks } from '../../../content/site';
import type { NavItem } from '../../../content/types';

/** Scroll offset, in px, after which the header switches to its compact state. */
export const HEADER_COMPACT_THRESHOLD = 24;

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
  host: { '[class.is-compact]': 'isCompact()' }
})
export class SiteHeaderComponent {
  readonly theme = inject(ThemeService);
  readonly isDark: Signal<boolean> = this.theme.isDark;
  readonly logo = logo;
  readonly whatsappLink = contactWhatsAppLink;
  readonly brandName = siteInfo.name;

  /** Single site navigation, the same on every public page. */
  readonly navLinks: readonly NavItem[] = siteNavLinks;

  readonly isMenuOpen = signal(false);
  readonly isCompact = signal(false);

  private readonly document = inject(DOCUMENT);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly menuPanel = viewChild<ElementRef<HTMLElement>>('menuPanel');

  constructor() {
    const destroyRef = inject(DestroyRef);

    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => this.closeMenu(false));

    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;
      const onScroll = () => this.isCompact.set(view.scrollY > HEADER_COMPACT_THRESHOLD);
      onScroll();
      view.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => view.removeEventListener('scroll', onScroll));
    });

    destroyRef.onDestroy(() => this.unlockScroll());
  }

  /** `/` only matches exactly; the other pages also match their sub-routes. */
  isExact(href: string): boolean {
    return href === '/';
  }

  toggleMenu(): void {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    this.isMenuOpen.set(true);
    this.document.body.style.overflow = 'hidden';
    // The panel becomes visible on the next change detection; focus its first link after it.
    setTimeout(() => {
      this.menuPanel()?.nativeElement.querySelector<HTMLElement>('a, button')?.focus();
    });
  }

  /** Closes the menu; `restoreFocus` returns focus to the menu button (not on navigation). */
  closeMenu(restoreFocus = true): void {
    if (!this.isMenuOpen()) return;
    this.isMenuOpen.set(false);
    this.unlockScroll();
    if (restoreFocus) {
      this.menuButton()?.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  private unlockScroll(): void {
    this.document.body.style.overflow = '';
  }
}
