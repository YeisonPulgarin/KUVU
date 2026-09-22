import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteHeaderComponent } from '../public/site-header/site-header.component';
import { SiteFooterComponent } from '../public/site-footer/site-footer.component';
import { RevealDirective } from '../../directives/reveal.directive';
import {
  benefitsByRole,
  companies,
  homeFaqItems,
  howItWorks,
  origin,
  securityHighlights,
  services
} from '../../content';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SiteHeaderComponent,
    SiteFooterComponent,
    RevealDirective
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  readonly services = services;
  readonly companies = companies;
  readonly howItWorks = howItWorks;
  readonly benefitsByRole = benefitsByRole;
  readonly securityHighlights = securityHighlights;
  readonly origin = origin;
  readonly homeFaqItems = homeFaqItems;
}