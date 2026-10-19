import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PublicPageComponent } from '../../public/public-page/public-page.component';
import { RichTextComponent } from '../../public/rich-text/rich-text.component';
import { PageMetaService } from '../../../services/page-meta.service';
// Imported directly (not from the content barrel) so the texts stay in this lazy chunk.
import { legalDocuments, legalLastUpdated, legalNotice } from '../../../content/legal';
import { pageMeta } from '../../../content/pages';
import { breadcrumbFor } from '../../../content/site';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterModule, PublicPageComponent, RichTextComponent],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit {
  private readonly meta = inject(PageMetaService);

  readonly breadcrumb = breadcrumbFor('/legal');
  readonly documents = legalDocuments;
  readonly notice = legalNotice;
  readonly lastUpdated = legalLastUpdated;

  ngOnInit(): void {
    this.meta.setPage(pageMeta.legal);
  }

  /** Two-digit number of a document in the index ("01", "02"…). */
  number(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
