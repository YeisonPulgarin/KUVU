import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactoComponent } from './contacto.component';
import { contactErrors, contactSteps, contactSubjects } from '../../../content/contact';
import { pageMeta } from '../../../content/pages';
import { PageMetaService } from '../../../services/page-meta.service';

describe('ContactoComponent', () => {
  let fixture: ComponentFixture<ContactoComponent>;
  let component: ContactoComponent;
  let root: HTMLElement;
  let meta: PageMetaService;
  let openSpy: jasmine.Spy;

  const input = (id: string) => root.querySelector(`#${id}`) as HTMLInputElement;

  const type = (id: string, value: string) => {
    const el = input(id);
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('blur'));
  };

  const fillValid = () => {
    type('contact-name', 'Ana Pérez');
    type('contact-email', 'ana@example.com');
    const select = root.querySelector('#contact-subject') as HTMLSelectElement;
    select.value = 'conocer';
    select.dispatchEvent(new Event('change'));
    type('contact-message', 'Queremos una demo.');
    const consent = input('contact-consent');
    consent.click();
    fixture.detectChanges();
  };

  const submit = () => {
    (root.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ContactoComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    meta = TestBed.inject(PageMetaService);
    spyOn(meta, 'setPage').and.callThrough();
    openSpy = spyOn(window, 'open').and.returnValue({ opener: window } as unknown as Window);
    fixture = TestBed.createComponent(ContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => meta.clearBreadcrumb());

  it('should publish its own page meta and breadcrumb', () => {
    expect(meta.setPage).toHaveBeenCalledOnceWith(pageMeta.contacto);
    expect(root.querySelector('app-breadcrumb [aria-current="page"]')?.textContent?.trim()).toBe('Contacto');
  });

  it('should label every field', () => {
    ['contact-name', 'contact-company', 'contact-email', 'contact-phone', 'contact-subject', 'contact-message', 'contact-consent'].forEach(
      (id) => expect(root.querySelector(`label[for="${id}"]`)).withContext(id).toBeTruthy()
    );
  });

  it('should offer the closed list of subjects', () => {
    const options = Array.from(root.querySelectorAll('#contact-subject option:not([disabled])'));
    expect(options.map((o) => o.textContent?.trim())).toEqual(contactSubjects.map((s) => s.label));
  });

  it('should start with the consent unchecked', () => {
    expect(input('contact-consent').checked).toBeFalse();
    expect(component.form.controls.consent.value).toBeFalse();
  });

  it('should link the consent text to the data policy', () => {
    const link = root.querySelector('label[for="contact-consent"] a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/legal#tratamiento-datos');
  });

  it('should not send and should flag every missing field on an empty submit', () => {
    submit();
    expect(openSpy).not.toHaveBeenCalled();
    const errorText = root.textContent ?? '';
    expect(errorText).toContain(contactErrors.nameRequired);
    expect(errorText).toContain(contactErrors.emailOrPhoneRequired);
    expect(errorText).toContain(contactErrors.subjectRequired);
    expect(errorText).toContain(contactErrors.messageRequired);
    expect(errorText).toContain(contactErrors.consentRequired);
  });

  it('should tie each error to its field with aria-invalid and aria-describedby', () => {
    submit();
    const name = input('contact-name');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector(`#${name.getAttribute('aria-describedby')}`)?.textContent).toContain(
      contactErrors.nameRequired
    );
    const email = input('contact-email');
    expect(email.getAttribute('aria-describedby')).toContain('contact-reach-error');
    expect(input('contact-consent').getAttribute('aria-describedby')).toBe('contact-consent-error');
  });

  it('should not send without the consent even when everything else is valid', () => {
    fillValid();
    input('contact-consent').click();
    fixture.detectChanges();
    submit();
    expect(openSpy).not.toHaveBeenCalled();
    expect(root.textContent).toContain(contactErrors.consentRequired);
  });

  it('should reject a malformed email even if there is a phone', () => {
    fillValid();
    type('contact-phone', '+57 300 000 0000');
    type('contact-email', 'ana@');
    fixture.detectChanges();
    submit();
    expect(openSpy).not.toHaveBeenCalled();
    expect(root.textContent).toContain(contactErrors.emailInvalid);
  });

  it('should accept a phone instead of an email', () => {
    fillValid();
    type('contact-email', '');
    type('contact-phone', '300 000 0000');
    fixture.detectChanges();
    submit();
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('should open WhatsApp in a new tab with the composed message and confirm it', () => {
    fillValid();
    submit();
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target] = openSpy.calls.mostRecent().args as [string, string];
    expect(target).toBe('_blank');
    expect(url.startsWith('https://wa.me/573223192760?text=')).toBeTrue();
    const text = decodeURIComponent(url.split('?text=')[1]);
    expect(text).toContain('Asunto: Quiero conocer KUVU');
    expect(text).toContain('Nombre: Ana Pérez');
    expect(text).toContain('Correo: ana@example.com');
    expect(text).not.toContain('Empresa:');
    expect(text).not.toContain('Teléfono:');
    expect(text).toContain('Queremos una demo.');

    const status = root.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(status.querySelector('.status--ok')).toBeTruthy();
  });

  it('should cut the opener of the new tab', () => {
    const tab = { opener: window } as unknown as Window;
    openSpy.and.returnValue(tab);
    fillValid();
    submit();
    expect(tab.opener).toBeNull();
  });

  it('should offer the direct WhatsApp link when the browser blocks the new tab', () => {
    openSpy.and.returnValue(null);
    fillValid();
    submit();
    const status = root.querySelector('[aria-live="polite"] .status--warn') as HTMLElement;
    expect(status).toBeTruthy();
    expect(status.querySelector('a')?.getAttribute('href')).toContain('https://wa.me/573223192760?text=');
  });

  it('should neither store the data in the browser nor log it', () => {
    const log = spyOn(console, 'log');
    fillValid();
    submit();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(log).not.toHaveBeenCalled();
  });

  it('should show the other channels and the three numbered steps', () => {
    expect(root.querySelector('.channel-wa')?.getAttribute('href')).toContain('wa.me/573223192760');
    expect(root.querySelector('.channel-email')).toBeNull();
    expect(root.querySelector('mark')).toBeNull();
    expect(root.querySelector('.channel-phone')?.textContent).toContain('+57 322 319 2760');
    const steps = Array.from(root.querySelectorAll('.steps .step'));
    expect(steps.length).toBe(contactSteps.length);
    expect(steps.map((s) => s.querySelector('.step-number')?.textContent?.trim())).toEqual(['1', '2', '3']);
  });
});
