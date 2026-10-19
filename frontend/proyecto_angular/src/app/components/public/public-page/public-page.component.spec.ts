import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublicPageComponent } from './public-page.component';
import { breadcrumbFor } from '../../../content/site';
import { PageMetaService } from '../../../services/page-meta.service';

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

describe('PublicPageComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HostWithBreadcrumb, HostWithoutBreadcrumb],
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
});
