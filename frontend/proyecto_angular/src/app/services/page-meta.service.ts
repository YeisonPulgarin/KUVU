import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import type { NavItem, PageMeta } from '../content/types';

const BREADCRUMB_SCRIPT_ID = 'kuvu-breadcrumb-jsonld';
const CANONICAL_SELECTOR = 'link[rel="canonical"]';

/** Image shared by every page in social previews (an existing site image). */
export const SHARE_IMAGE_PATH = '/Imagenes_web/equipo-ycw-1024.jpeg';

@Injectable({ providedIn: 'root' })
export class PageMetaService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /**
   * Publishes the SEO data of a page: title, description, Open Graph, Twitter card, canonical
   * and robots. Every tag is updated in place, so navigating never duplicates them.
   */
  setPage(page: PageMeta): void {
    const url = this.absolute(page.path);
    const image = this.absolute(SHARE_IMAGE_PATH);

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });

    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: 'es_CO' });
    this.meta.updateTag({ property: 'og:image', content: image });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    if (page.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.meta.removeTag('name="robots"');
    }

    this.setCanonical(url);
  }

  /** Publishes a single `<script type="application/ld+json">` with the given id, replacing it. */
  setJsonLd(id: string, data: object): void {
    let script = this.document.getElementById(id);
    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }
    // textContent, never innerHTML: the JSON is not parsed as HTML.
    script.textContent = JSON.stringify(data);
  }

  clearJsonLd(id: string): void {
    this.document.getElementById(id)?.remove();
  }

  /**
   * Publishes a single `BreadcrumbList` (schema.org) in `<head>`, with absolute URLs on the
   * origin the app runs on. Replaces the previous one, if any.
   */
  setBreadcrumb(items: readonly NavItem[]): void {
    this.setJsonLd(BREADCRUMB_SCRIPT_ID, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: this.absolute(item.href)
      }))
    });
  }

  clearBreadcrumb(): void {
    this.clearJsonLd(BREADCRUMB_SCRIPT_ID);
  }

  /** Absolute URL on the origin the app runs on (no production domain is declared). */
  absolute(path: string): string {
    return this.document.location.origin + path;
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>(CANONICAL_SELECTOR);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
