import { ContactFormValue, buildContactMessage } from './contact-message';

describe('buildContactMessage', () => {
  const base: ContactFormValue = {
    name: 'Ana Pérez',
    company: 'Inmobiliaria Andes',
    email: 'ana@example.com',
    phone: '+57 300 000 0000',
    subject: 'vincular',
    message: 'Queremos conocer la plataforma.'
  };

  it('should include subject label, name, company, email, phone and message', () => {
    const text = buildContactMessage(base);
    expect(text).toContain('Asunto: Vincular mi inmobiliaria');
    expect(text).toContain('Nombre: Ana Pérez');
    expect(text).toContain('Empresa: Inmobiliaria Andes');
    expect(text).toContain('Correo: ana@example.com');
    expect(text).toContain('Teléfono: +57 300 000 0000');
    expect(text.endsWith('Queremos conocer la plataforma.')).toBeTrue();
  });

  it('should leave out empty optional fields', () => {
    const text = buildContactMessage({ ...base, company: '  ', email: '' });
    expect(text).not.toContain('Empresa:');
    expect(text).not.toContain('Correo:');
    expect(text).toContain('Teléfono: +57 300 000 0000');
  });

  it('should trim the values it includes', () => {
    const text = buildContactMessage({ ...base, name: '  Ana  ', message: '  Hola  ' });
    expect(text).toContain('Nombre: Ana\n');
    expect(text.endsWith('\nHola')).toBeTrue();
  });

  it('should keep the order: greeting, data lines, blank line, message', () => {
    const lines = buildContactMessage({ ...base, company: '', phone: '' }).split('\n');
    expect(lines).toEqual([
      'Hola, les escribo desde el sitio de KUVU.',
      'Asunto: Vincular mi inmobiliaria',
      'Nombre: Ana Pérez',
      'Correo: ana@example.com',
      '',
      'Queremos conocer la plataforma.'
    ]);
  });
});
