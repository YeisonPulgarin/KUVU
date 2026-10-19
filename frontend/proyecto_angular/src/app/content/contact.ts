/*
 * Texts of `/contacto`. Not exported from the content barrel: only the lazy `/contacto` page
 * imports this module.
 */
import { legalAnchors, legalTitles } from './legal-index';
import type { ContactStep, ContactSubject, RichText } from './types';

export const contactPage = {
  title: 'Contacto',
  lead: 'Cuéntanos qué necesitas y te respondemos por WhatsApp.',
  submitLabel: 'Enviar y abrir WhatsApp',
  successMessage:
    'Abrimos WhatsApp con tu mensaje listo. Envíalo desde ahí y te respondemos a la brevedad.',
  popupBlockedMessage:
    'Tu navegador no abrió WhatsApp. Puedes escribirnos directamente desde este enlace:',
  directChannelsTitle: 'Otros canales',
  stepsTitle: 'Qué pasa cuando envías'
} as const;

export const contactSubjects: readonly ContactSubject[] = [
  { value: 'conocer', label: 'Quiero conocer KUVU' },
  { value: 'vincular', label: 'Vincular mi inmobiliaria' },
  { value: 'soporte', label: 'Soporte de mi cuenta' },
  { value: 'otro', label: 'Otro' }
];

export const contactSteps: readonly ContactStep[] = [
  {
    title: 'Se arma tu mensaje',
    description: 'Con los datos del formulario preparamos un mensaje listo para enviar.'
  },
  {
    title: 'Se abre WhatsApp',
    description: 'WhatsApp se abre en una pestaña nueva con el mensaje escrito; solo tienes que enviarlo.'
  },
  {
    title: 'El equipo te responde',
    description: 'Una persona del equipo KUVU lee tu mensaje y te responde por el mismo canal.'
  }
];

export const contactConsent: RichText = [
  'Autorizo a KUVU a tratar mis datos personales para responder esta solicitud, conforme a la ',
  { link: '/legal', fragment: legalAnchors.dataPolicy, label: legalTitles.dataPolicy },
  '.'
];

export const contactFieldLabels = {
  name: 'Nombre',
  company: 'Empresa (opcional)',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  subject: 'Asunto',
  message: 'Mensaje'
} as const;

export const contactErrors = {
  nameRequired: 'Escribe tu nombre.',
  emailOrPhoneRequired: 'Déjanos un correo o un teléfono para responderte.',
  emailInvalid: 'El correo no tiene un formato válido.',
  phoneInvalid: 'El teléfono solo puede tener números, espacios y el signo +.',
  subjectRequired: 'Elige un asunto.',
  messageRequired: 'Escribe tu mensaje.',
  consentRequired: 'Necesitamos tu autorización para tratar tus datos.'
} as const;
