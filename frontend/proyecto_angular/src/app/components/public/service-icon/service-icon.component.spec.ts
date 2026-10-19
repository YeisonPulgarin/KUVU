import { TestBed } from '@angular/core/testing';
import { ServiceIconComponent } from './service-icon.component';
import { services } from '../../../content/services';
import type { Service } from '../../../content/types';

describe('ServiceIconComponent', () => {
  const renderIcon = (icon: Service['icon']) => {
    const fixture = TestBed.createComponent(ServiceIconComponent);
    fixture.componentRef.setInput('icon', icon);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [ServiceIconComponent] }));

  it('should draw a non-empty icon for every declared service', () => {
    services.forEach((service) => {
      const svg = renderIcon(service.icon).querySelector('svg');
      expect(svg).withContext(service.icon).toBeTruthy();
      expect(svg!.children.length).withContext(service.icon).toBeGreaterThan(0);
    });
  });

  it('should draw a different shape for each icon', () => {
    const shapes = services.map((s) => renderIcon(s.icon).querySelector('svg')!.innerHTML);
    expect(new Set(shapes).size).toBe(services.length);
  });

  it('should be decorative for assistive tech', () => {
    expect(renderIcon('building').getAttribute('aria-hidden')).toBe('true');
  });
});
