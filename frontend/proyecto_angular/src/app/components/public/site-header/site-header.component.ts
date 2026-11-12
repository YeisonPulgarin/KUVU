import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Signal,
  afterNextRender,
  computed,
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
import { SectionSpyService } from './section-spy.service';
import { TAP_FEEDBACK_MS } from '../../../motion/tap-feedback';

const pathOf = (url: string) => url.split(/[?#]/)[0] || '/';

/** Pause between choosing an option of the mobile menu and closing the panel. */
export const MENU_TAP_FEEDBACK_MS = TAP_FEEDBACK_MS;

/** Scroll offset, in px, after which the header switches to its compact state. */
export const HEADER_COMPACT_THRESHOLD = 24;

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss', './scroll-trail.scss'],
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

  /** Mobile option just chosen: keeps its "chosen" look until the panel closes. */
  readonly pressedHref = signal<string | null>(null);
  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly router = inject(Router);
  private readonly spy = inject(SectionSpyService);
  private readonly path = signal(pathOf(this.router.url));

  /** Menu item of the current route: it carries `aria-current="page"`. */
  readonly pageHref = computed(() => {
    const path = this.path();
    return this.navLinks.find((link) =>
      this.isExact(link.href) ? path === link.href : path === link.href || path.startsWith(`${link.href}/`)
    )?.href ?? null;
  });

  /** Highlighted menu item: the section being read on the home, otherwise the route. */
  readonly activeHref = computed(() => this.spy.activeHref() ?? this.pageHref());

  /** Cumulative trail of the home sections already reached ("Inicio › Servicios › …"). */
  readonly trail = this.spy.trail;

  /** The trail shows once the header is compact, and never over the open mobile menu. */
  readonly showTrail = computed(() => this.isCompact() && !this.isMenuOpen() && this.trail().length > 0);

  private readonly document = inject(DOCUMENT);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly menuPanel = viewChild<ElementRef<HTMLElement>>('menuPanel');

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => {
        this.path.set(pathOf(this.router.url));
        // A chosen option already scheduled the close: let its feedback finish.
        if (this.closeTimer === undefined) {
          this.closeMenu(false);
        }
      });

    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;
      const onScroll = () => this.isCompact.set(view.scrollY > HEADER_COMPACT_THRESHOLD);
      onScroll();
      view.addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => view.removeEventListener('scroll', onScroll));
    });

    destroyRef.onDestroy(() => {
      this.cancelPendingClose();
      this.unlockScroll();
    });
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

  /**
   * An option of the mobile panel was chosen: the router navigates right away, the option keeps
   * its "chosen" state and the panel closes after MENU_TAP_FEEDBACK_MS.
   */
  chooseLink(href: string): void {
    this.cancelPendingClose();
    this.pressedHref.set(href);
    this.closeTimer = setTimeout(() => {
      this.closeTimer = undefined;
      this.closeMenu(false);
    }, MENU_TAP_FEEDBACK_MS);
  }

  /** Closes the menu; `restoreFocus` returns focus to the menu button (not on navigation). */
  closeMenu(restoreFocus = true): void {
    this.cancelPendingClose();
    this.pressedHref.set(null);
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

  private cancelPendingClose(): void {
    clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
  }

  private unlockScroll(): void {
    this.document.body.style.overflow = '';
  }
}
