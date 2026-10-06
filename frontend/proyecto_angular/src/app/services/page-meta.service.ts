import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import type { NavItem } from '../content/types';

const BREADCRUMB_SCRIPT_ID = 'kuvu-breadcrumb-jsonld';

@Injectable({ providedIn: 'root' })
export class PageMetaService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  setPage(title: string, description: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
  }

  /**
   * Publica un único `BreadcrumbList` (schema.org) en `<head>`. Las URLs son absolutas sobre
   * el origen en el que corre la app. Si ya hay uno, lo reemplaza.
   */
  setBreadcrumb(items: readonly NavItem[]): void {
    const origin = this.document.location.origin;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: origin + item.href
      }))
    };

    let script = this.document.getElementById(BREADCRUMB_SCRIPT_ID);
    if (!script) {
      script = this.document.createElement('script');
      script.id = BREADCRUMB_SCRIPT_ID;
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }
    // textContent, nunca innerHTML: el JSON no se interpreta como HTML.
    script.textContent = JSON.stringify(data);
  }

  clearBreadcrumb(): void {
    this.document.getElementById(BREADCRUMB_SCRIPT_ID)?.remove();
  }
}
