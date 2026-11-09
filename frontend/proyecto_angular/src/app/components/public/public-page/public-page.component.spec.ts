import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicPageComponent } from './public-page.component';
import { breadcrumbFor } from '../../../content/site';
import { PageMetaService } from '../../../services/page-meta.service';
import { headlines } from '../../../content';

@Component({
  standalone: true,
  imports: [PublicPageComponent],
  template: `
    <app-public-page pageTitle="Servicios" lead="Todo en un lugar" [breadcrumb]="crumbs">
      <section class="projected">contenido</section>
    </app-public-page>
  `
})
class HostWithBreadcrumb {
  crumbs = breadcrumbFor('/servicios');
}

@Component({
  standalone: true,
  imports: [PublicPageComponent],
  template: `<app-public-page pageTitle="Página no encontrada"></app-public-page>`
})
class HostWithoutBreadcrumb {}

@Component({
  standalone: true,
  imports: [PublicPageComponent],
  template: `<app-public-page [pageTitle]="faq.title" [titleParts]="faq.parts"></app-public-page>`
})
class HostWithParts {
  faq = headlines.faq;
}

describe('PublicPageComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HostWithBreadcrumb, HostWithoutBreadcrumb, HostWithParts],
      providers: [provideRouter([])]
    })
  );

  afterEach(() => TestBed.inject(PageMetaService).clearBreadcrumb());

  it('should frame the page with header, main content and footer, in that order', () => {
    const fixture = TestBed.createComponent(HostWithBreadcrumb);
    fixture.detectChanges();
    const layout = (fixture.nativeElement as HTMLElement).querySelector('.page-layout')!;
    const tags = Array.from(layout.children).map((child) => child.tagName.toLowerCase());
    expect(tags).toEqual(['app-site-header', 'main', 'app-site-footer']);
  });

  it('should render the title, lead, breadcrumb and projected content', () => {
    const fixture = TestBed.createComponent(HostWithBreadcrumb);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1.page-title')?.textContent?.trim()).toBe('Servicios');
    expect(root.querySelector('.page-lead')?.textContent?.trim()).toBe('Todo en un lugar');
    expect(root.querySelector('app-breadcrumb [aria-current="page"]')?.textContent?.trim()).toBe(
      'Servicios'
    );
    expect(root.querySelector('main .projected')?.textContent).toBe('contenido');
  });

  it('should omit the breadcrumb and the lead when not given', () => {
    const fixture = TestBed.createComponent(HostWithoutBreadcrumb);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-breadcrumb')).toBeNull();
    expect(root.querySelector('.page-lead')).toBeNull();
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Página no encontrada');
  });

  it('should give the layout the site root and a single display h1', () => {
    const fixture = TestBed.createComponent(HostWithBreadcrumb);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.page-layout')?.classList).toContain('site-root');
    const h1s = root.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].classList).toContain('display-title');
  });

  it('should render split title parts with the full title text once', () => {
    const fixture = TestBed.createComponent(HostWithParts);
    fixture.detectChanges();
    const h1 = (fixture.nativeElement as HTMLElement).querySelector('h1.page-title') as HTMLElement;
    expect(h1.textContent).toBe('Preguntas frecuentes');
    expect(h1.querySelector('em')?.textContent).toBe('frecuentes');
  });
});
