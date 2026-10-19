import { ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  DOCUMENT,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions
} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { headerScrollOffset } from './scroll-offset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      // New page → top of the page; `/legal#cookies` → its section.
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(withFetch()),
    // The router scrolls to anchors with `window.scrollTo`, which ignores `scroll-padding-top`:
    // the offset keeps the target section below the sticky header.
    provideAppInitializer(() => {
      const doc = inject(DOCUMENT);
      inject(ViewportScroller).setOffset(() => headerScrollOffset(doc));
    })
  ]
};
