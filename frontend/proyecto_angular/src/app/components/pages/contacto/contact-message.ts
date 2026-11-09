import { contactSubjects } from '../../../content/contact';

export interface ContactFormValue {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly phone: string;
  readonly subject: string;
  readonly message: string;
}

/**
 * WhatsApp text built from the contact form. Optional fields that are empty are left out.
 * Pure function: no storage, no network.
 */
export function buildContactMessage(value: ContactFormValue): string {
  const subject =
    contactSubjects.find((item) => item.value === value.subject)?.label ?? value.subject;

  const lines: [label: string, text: string][] = [
    ['Asunto', subject],
    ['Nombre', value.name],
    ['Empresa', value.company],
    ['Correo', value.email],
    ['Teléfono', value.phone]
  ];

  const header = lines
    .map(([label, text]) => [label, text.trim()] as const)
    .filter(([, text]) => text.length > 0)
    .map(([label, text]) => `${label}: ${text}`);

  return ['Hola, les escribo desde el sitio de KUVU.', ...header, '', value.message.trim()].join('\n');
}
