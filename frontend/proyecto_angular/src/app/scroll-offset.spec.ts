import { ViewportScroller } from '@angular/common';
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { ANCHOR_GAP, FALLBACK_SCROLL_OFFSET, headerScrollOffset } from './scroll-offset';

describe('headerScrollOffset', () => {
  let header: HTMLElement | null = null;

  afterEach(() => header?.remove());

  const addHeader = (height: number) => {
    header = document.createElement('app-site-header');
    header.style.display = 'block';
    header.style.height = `${height}px`;
    document.body.appendChild(header);
  };

  it('should be the header height plus the gap', () => {
    addHeader(80);
    expect(headerScrollOffset(document)).toEqual([0, 80 + ANCHOR_GAP]);
  });

  it('should follow the compact header height', () => {
    addHeader(56);
    expect(headerScrollOffset(document)).toEqual([0, 56 + ANCHOR_GAP]);
  });

  it('should fall back to the scroll-padding value when the header has no height', () => {
    addHeader(0);
    expect(headerScrollOffset(document)).toEqual([0, FALLBACK_SCROLL_OFFSET]);
  });

  it('should be zero on pages without the public header', () => {
    expect(headerScrollOffset(document)).toEqual([0, 0]);
  });
});

describe('app config anchor scrolling', () => {
  it('should register the header offset on the viewport scroller at startup', async () => {
    const scroller = jasmine.createSpyObj<ViewportScroller>('ViewportScroller', [
      'setOffset',
      'scrollToPosition',
      'scrollToAnchor',
      'getScrollPosition',
      'setHistoryScrollRestoration'
    ]);
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, { provide: ViewportScroller, useValue: scroller }]
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(scroller.setOffset).toHaveBeenCalledTimes(1);
    const offset = scroller.setOffset.calls.mostRecent().args[0] as () => [number, number];
    expect(typeof offset).toBe('function');
    expect(offset()).toEqual(headerScrollOffset(document));
  });
});
