import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { SiteImage } from '../../../content/types';

type ImageFormat = 'webp' | 'jpeg';

/**
 * Renderiza un `SiteImage` como `<picture>`: WebP con respaldo JPEG, `srcset` por ancho,
 * dimensiones intrínsecas para reservar espacio y carga diferida.
 */
@Component({
  selector: 'app-responsive-image',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <picture class="responsive-image">
      <source type="image/webp" [attr.srcset]="webpSrcset()" [attr.sizes]="sizes()" />
      <img
        class="responsive-image__img"
        [class.responsive-image__img--cover]="fit() === 'cover'"
        [src]="fallbackSrc()"
        [attr.srcset]="jpegSrcset()"
        [attr.sizes]="sizes()"
        [attr.width]="image().width"
        [attr.height]="image().height"
        [alt]="decorative() ? '' : image().alt"
        loading="lazy"
        decoding="async"
      />
    </picture>
  `,
  styleUrls: ['./responsive-image.component.scss']
})
export class ResponsiveImageComponent {
  readonly image = input.required<SiteImage>();
  readonly sizes = input('100vw');
  readonly decorative = input(false);
  readonly fit = input<'cover' | 'contain'>('contain');

  readonly webpSrcset = computed(() => this.srcset('webp'));
  readonly jpegSrcset = computed(() => this.srcset('jpeg'));
  readonly fallbackSrc = computed(() => {
    const { basePath, widths } = this.image();
    return `${basePath}-${Math.max(...widths)}.jpeg`;
  });

  private srcset(format: ImageFormat): string {
    const { basePath, widths } = this.image();
    return widths.map((w) => `${basePath}-${w}.${format} ${w}w`).join(', ');
  }
}
