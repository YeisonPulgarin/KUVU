import { Component, OnInit, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { PublicPageComponent } from '../../public/public-page/public-page.component';
import { RichTextComponent } from '../../public/rich-text/rich-text.component';
import { RevealDirective } from '../../../directives/reveal.directive';
import { PageMetaService } from '../../../services/page-meta.service';
import {
  contactConsent,
  contactErrors,
  contactFieldLabels,
  contactPage,
  contactSteps,
  contactSubjects
} from '../../../content/contact';
import { pageMeta } from '../../../content/pages';
import {
  breadcrumbFor,
  buildWhatsAppLink,
  contact,
  contactWhatsAppLink
} from '../../../content/site';
import type { RichText } from '../../../content/types';
import { buildContactMessage } from './contact-message';

/** Digits, spaces, dashes, parentheses and an optional leading +; 7 to 20 characters. */
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;

/** At least one of `email` or `phone` must have a value. */
export const emailOrPhone: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const email = String(group.get('email')?.value ?? '').trim();
  const phone = String(group.get('phone')?.value ?? '').trim();
  return email || phone ? null : { emailOrPhone: true };
};

const trimmedRequired: ValidatorFn = (control) =>
  String(control.value ?? '').trim() ? null : { required: true };

type SubmitState = 'idle' | 'sent' | 'blocked';
type ContactControl = 'name' | 'company' | 'email' | 'phone' | 'subject' | 'message' | 'consent';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [ReactiveFormsModule, PublicPageComponent, RichTextComponent, RevealDirective],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss']
})
export class ContactoComponent implements OnInit {
  private readonly meta = inject(PageMetaService);
  private readonly document = inject(DOCUMENT);

  readonly breadcrumb = breadcrumbFor('/contacto');
  readonly page = contactPage;
  readonly labels = contactFieldLabels;
  readonly errors = contactErrors;
  readonly subjects = contactSubjects;
  readonly steps = contactSteps;
  readonly consent = contactConsent;
  readonly whatsappLink = contactWhatsAppLink;
  readonly email: RichText = [{ field: 'email' }];

  readonly form = inject(FormBuilder).nonNullable.group(
    {
      name: ['', trimmedRequired],
      company: [''],
      email: ['', Validators.email],
      phone: ['', Validators.pattern(PHONE_PATTERN)],
      subject: ['', Validators.required],
      message: ['', trimmedRequired],
      consent: [false, Validators.requiredTrue]
    },
    { validators: emailOrPhone }
  );

  readonly submitted = signal(false);
  readonly state = signal<SubmitState>('idle');
  /** Link offered when the browser blocks the new tab. */
  readonly fallbackLink = signal<string | null>(null);

  ngOnInit(): void {
    this.meta.setPage(pageMeta.contacto);
  }

  /** Whether a control's error is shown: after submitting or after leaving the field. */
  showError(name: ContactControl): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  showReachError(): boolean {
    const { email, phone } = this.form.controls;
    return (
      this.form.hasError('emailOrPhone') &&
      (this.submitted() || (email.touched && phone.touched))
    );
  }

  /** `aria-describedby` of the email and phone inputs. */
  reachDescribedBy(name: 'email' | 'phone'): string | null {
    const ids = [
      this.showError(name) ? `contact-${name}-error` : '',
      this.showReachError() ? 'contact-reach-error' : ''
    ].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  }

  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.state.set('idle');
      return;
    }

    const url = buildWhatsAppLink(contact.whatsappNumber, buildContactMessage(this.form.getRawValue()));
    // Without the `noopener` feature (it makes `open` always return null), then the opener is
    // cut by hand: a null result means the browser blocked the new tab.
    const opened = this.document.defaultView?.open(url, '_blank') ?? null;
    if (opened) {
      opened.opener = null;
    }
    this.fallbackLink.set(url);
    this.state.set(opened ? 'sent' : 'blocked');
  }
}
