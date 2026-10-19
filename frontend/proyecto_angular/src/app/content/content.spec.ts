import {
  benefitsByRole,
  breadcrumbFor,
  buildWhatsAppLink,
  companies,
  contact,
  contactWhatsAppLink,
  faqGroups,
  homeFaqCount,
  homeFaqItems,
  howItWorks,
  legalAnchors,
  legalIndex,
  logo,
  pageMeta,
  responsible,
  isEmptyRichText,
  resolveRichText,
  academicNote,
  origin,
  securityHighlights,
  services,
  siteInfo,
  siteNavLinks,
  sitePages,
  team
} from './index';
import type { LegalDocument, ResponsibleField, RichText } from './index';
import {
  browserStorageUses,
  legalDocuments,
  legalLastUpdated,
  legalNotice,
  richTextToPlain
} from './legal';
import { contactConsent, contactErrors, contactSteps, contactSubjects } from './contact';
import * as contentBarrel from './index';

const plainOf = (doc: LegalDocument): string =>
  doc.blocks
    .flatMap((block) => [
      block.heading ?? '',
      ...block.paragraphs.map(richTextToPlain),
      ...(block.items ?? []).map(richTextToPlain)
    ])
    .join(' ');

const docById = (id: string): LegalDocument => {
  const doc = legalDocuments.find((d) => d.id === id);
  if (!doc) throw new Error(`missing legal document ${id}`);
  return doc;
};

const allRichTexts = (): RichText[] =>
  legalDocuments.flatMap((doc) =>
    doc.blocks.flatMap((block) => [...block.paragraphs, ...(block.items ?? [])])
  );

describe('content modules', () => {
  describe('site', () => {
    it('should expose the brand name and tagline', () => {
      expect(siteInfo.name).toBe('KUVU');
      expect(siteInfo.tagline.length).toBeGreaterThan(10);
    });

    it('should not export the old anchor or page navigation lists', () => {
      const exported = Object.keys(contentBarrel);
      expect(exported).not.toContain('navLinks');
      expect(exported).not.toContain('pageNavLinks');
    });

    it('should carry the contact WhatsApp number and a pre-filled message', () => {
      expect(contact.whatsappNumber).toBe('573223192760');
      expect(contact.whatsappMessage).toContain('KUVU');
      expect(contact.whatsappMessage.length).toBeGreaterThan(10);
    });

    it('should build a wa.me link encoding the message', () => {
      const link = buildWhatsAppLink(contact.whatsappNumber, contact.whatsappMessage);
      expect(link).toContain(`https://wa.me/${contact.whatsappNumber}`);
      expect(link).toContain('?text=');
    });

    it('should expose a ready-to-use contact link consistent with the helper', () => {
      expect(contactWhatsAppLink).toBe(
        buildWhatsAppLink(contact.whatsappNumber, contact.whatsappMessage)
      );
      expect(contactWhatsAppLink).toContain('%20');
    });
  });

  describe('services', () => {
    it('should list exactly the five services with name and description', () => {
      expect(services.length).toBe(5);
      services.forEach((service) => {
        expect(service.title.trim().length).toBeGreaterThan(0);
        expect(service.description.trim().length).toBeGreaterThan(0);
        expect(['building', 'file', 'card', 'wrench', 'users']).toContain(service.icon);
      });
    });
  });

  describe('companies', () => {
    it('should list the four companies with a style hook', () => {
      expect(companies.map((c) => c.name)).toEqual([
        'Amarilo',
        'Nido Rent',
        'Balcones de San Soucci',
        'Mi Inmueble'
      ]);
      companies.forEach((company) => expect(company.className.length).toBeGreaterThan(0));
    });
  });

  describe('howItWorks', () => {
    it('should expose at least three ordered steps', () => {
      expect(howItWorks.length).toBeGreaterThanOrEqual(3);
      howItWorks.forEach((step) => {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.description.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('benefits', () => {
    it('should separate owner/manager from operations roles', () => {
      expect(benefitsByRole.length).toBe(2);
      const roles = benefitsByRole.map((b) => b.role);
      expect(roles.some((r) => /due\u00f1o|gerente/i.test(r))).toBeTrue();
      expect(roles.some((r) => /equipo/i.test(r))).toBeTrue();
    });

    it('should give each role a headline, description and points', () => {
      benefitsByRole.forEach((benefit) => {
        expect(benefit.title.trim().length).toBeGreaterThan(0);
        expect(benefit.description.trim().length).toBeGreaterThan(0);
        expect(benefit.points.length).toBeGreaterThanOrEqual(2);
        benefit.points.forEach((point) => expect(point.trim().length).toBeGreaterThan(0));
      });
    });
  });

  describe('security', () => {
    it('should highlight responsibility without exposing internal mechanisms', () => {
      expect(securityHighlights.length).toBeGreaterThanOrEqual(3);
      const allText = securityHighlights
        .flatMap((h) => [h.title, h.description])
        .join(' ')
        .toLowerCase();
      expect(allText).not.toContain('cifrado');
      expect(allText).not.toContain('encript');
      expect(allText).not.toContain('servidor');
      expect(allText).not.toContain('infraestructura');
      securityHighlights.forEach((h) => expect(h.title.trim().length).toBeGreaterThan(0));
    });
  });

  describe('origin', () => {
    it('should tell the real origin: three students at their university library', () => {
      const text = origin.paragraphs.join(' ').toLowerCase();
      expect(text).toContain('tres estudiantes');
      expect(text).toContain('biblioteca');
      expect(origin.title.length).toBeGreaterThan(0);
    });

    it('should not claim invented figures or awards', () => {
      const text = origin.paragraphs.join(' ').toLowerCase();
      expect(text).not.toMatch(/\d+\s*\+?\s*(clientes|empresas|contratos|años)/);
    });
  });

  describe('team', () => {
    it('should present the team section with its title and link label', () => {
      expect(team.title).toBe('El equipo detrás de KUVU');
      expect(team.linkLabel).toBe('Conoce al equipo');
      expect(team.lead.trim().length).toBeGreaterThan(0);
    });

    it('should list the members left to right as they appear in the photo', () => {
      expect(team.members).toEqual(['Wilson Solano', 'Carlos Arciniegas', 'Yeison Pulgarin']);
      expect(team.image.caption).toBe('Wilson Solano · Carlos Arciniegas · Yeison Pulgarin');
    });

    it('should declare the photo under /Imagenes_web/ without spaces', () => {
      expect(team.image.basePath).toBe('/Imagenes_web/equipo-ycw');
      expect(team.image.basePath).not.toMatch(/\s|%20/);
    });

    it('should declare ascending widths that never exceed the intrinsic width', () => {
      const { widths, width } = team.image;
      expect(widths.length).toBeGreaterThanOrEqual(2);
      expect([...widths].sort((a, b) => a - b)).toEqual([...widths]);
      widths.forEach((w) => expect(w).toBeLessThanOrEqual(width));
      expect(widths[widths.length - 1]).toBe(width);
    });

    it('should keep the 3:2 aspect ratio of the original photo', () => {
      expect(team.image.width / team.image.height).toBeCloseTo(1.5, 2);
    });

    it('should describe the photo naming YCW and the three members', () => {
      const alt = team.image.alt;
      expect(alt).toContain('YCW');
      team.members.forEach((member) => expect(alt).toContain(member));
    });
  });

  describe('logo', () => {
    it('should expose the web and responsive logos under /logo-rediseno/', () => {
      expect(logo.web).toBe('/logo-rediseno/Logo_Kuvu.png');
      expect(logo.responsive).toBe('/logo-rediseno/Logo_Responsive.png');
    });

    it('should keep the two logos distinct', () => {
      const variants = Object.values(logo);
      expect(new Set(variants).size).toBe(2);
    });
  });

  describe('faq', () => {
    it('should group questions with visible answers', () => {
      expect(faqGroups.length).toBeGreaterThanOrEqual(3);
      faqGroups.forEach((group) => {
        expect(group.group.trim().length).toBeGreaterThan(0);
        expect(group.items.length).toBeGreaterThan(0);
        group.items.forEach((item) => {
          expect(item.q.trim().length).toBeGreaterThan(0);
          expect(item.a.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('should expose a home subset of between three and five items', () => {
      expect(homeFaqCount).toBeGreaterThanOrEqual(3);
      expect(homeFaqCount).toBeLessThanOrEqual(5);
      expect(homeFaqItems().length).toBe(homeFaqCount);
    });
  });

  describe('site pages and navigation', () => {
    it('should declare every public page once, with Legal included', () => {
      const hrefs = sitePages.map((page) => page.href);
      expect(hrefs).toEqual([
        '/',
        '/servicios',
        '/nosotros',
        '/preguntas-frecuentes',
        '/contacto',
        '/legal'
      ]);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });

    it('should expose the single site navigation with the five pages in order', () => {
      expect(siteNavLinks.map((link) => link.label)).toEqual([
        'Inicio',
        'Servicios',
        'Nosotros',
        'Preguntas frecuentes',
        'Contacto'
      ]);
      siteNavLinks.forEach((link) => {
        expect(link.href.startsWith('/')).toBeTrue();
        expect(link.href).not.toContain('#');
        expect(sitePages).toContain(link);
      });
    });

    it('should keep Legal out of the header navigation', () => {
      expect(siteNavLinks.some((link) => link.href === '/legal')).toBeFalse();
    });

    it('should build breadcrumbs for the new internal pages from sitePages', () => {
      expect(breadcrumbFor('/servicios').map((item) => item.label)).toEqual(['Inicio', 'Servicios']);
      expect(breadcrumbFor('/contacto').map((item) => item.label)).toEqual(['Inicio', 'Contacto']);
      expect(breadcrumbFor('/legal').map((item) => item.label)).toEqual(['Inicio', 'Legal']);
    });
  });

  describe('page meta', () => {
    const entries = Object.entries(pageMeta);

    it('should declare meta for the seven public pages', () => {
      expect(Object.keys(pageMeta).sort()).toEqual(
        ['contacto', 'home', 'legal', 'nosotros', 'notFound', 'preguntasFrecuentes', 'servicios'].sort()
      );
    });

    it('should never repeat a title or a description', () => {
      const titles = entries.map(([, meta]) => meta.title);
      const descriptions = entries.map(([, meta]) => meta.description);
      expect(new Set(titles).size).toBe(titles.length);
      expect(new Set(descriptions).size).toBe(descriptions.length);
    });

    it('should brand every title and give every page a real description and path', () => {
      entries.forEach(([, meta]) => {
        expect(meta.title).toContain('KUVU');
        expect(meta.description.length).toBeGreaterThan(40);
        expect(meta.path.startsWith('/')).toBeTrue();
      });
    });

    it('should mark only the not-found page as noindex', () => {
      const noindex = entries.filter(([, meta]) => meta.noindex).map(([key]) => key);
      expect(noindex).toEqual(['notFound']);
    });

    it('should use the same paths as the site pages', () => {
      sitePages.forEach((page) => {
        expect(entries.some(([, meta]) => meta.path === page.href)).toBeTrue();
      });
    });
  });

  describe('responsible party', () => {
    const fields = Object.keys(responsible) as ResponsibleField[];

    it('should name the fictitious company with data that cannot belong to a third party', () => {
      expect(responsible.legalName).toBe('KUVU');
      expect(responsible.domicile).toBe('Bogotá D.C., Colombia');
      expect(responsible.phone).toBe('+57 322 319 2760');
      expect(responsible.phone.replace(/\D/g, '')).toBe(contact.whatsappNumber);
      expect(responsible.attentionArea).toBe('Equipo KUVU — Protección de datos personales');
      expect(responsible.effectiveDate).toBe('18 de octubre de 2026');
    });

    it('should not invent a tax id, a physical address or an email', () => {
      expect(fields).not.toContain('taxId');
      expect(fields).not.toContain('address');
      expect(fields).not.toContain('email');
      expect(responsible.taxId).toBeUndefined();
      expect(responsible.address).toBeUndefined();
      expect(responsible.email).toBeUndefined();
    });

    it('should leave out an absent field with its whole phrase', () => {
      const text = resolveRichText(['KUVU', { field: 'taxId', prefix: ', NIT ' }, '.'])
        .map((s) => s.text)
        .join('');
      expect(text).toBe('KUVU.');
      expect(isEmptyRichText([{ field: 'email', prefix: 'Correo: ' }])).toBeTrue();
      expect(isEmptyRichText([{ field: 'phone', prefix: 'Tel: ' }])).toBeFalse();
    });
  });

  describe('legal documents', () => {
    it('should publish the four documents with their stable anchors, in order', () => {
      expect(legalDocuments.map((doc) => doc.id)).toEqual([
        'tratamiento-datos',
        'aviso-privacidad',
        'terminos-uso',
        'cookies'
      ]);
      expect<string[]>(Object.values(legalAnchors)).toEqual(legalDocuments.map((doc) => doc.id));
      legalDocuments.forEach((doc) => {
        expect(doc.title.trim().length).toBeGreaterThan(0);
        expect(doc.blocks.length).toBeGreaterThan(0);
      });
    });

    it('should keep the light index in sync with the documents', () => {
      expect(legalIndex.map((entry) => entry.fragment)).toEqual(legalDocuments.map((doc) => doc.id));
      expect(legalIndex.map((entry) => entry.label)).toEqual(legalDocuments.map((doc) => doc.title));
      legalIndex.forEach((entry) => expect(entry.href).toBe('/legal'));
    });

    it('should keep the full legal and contact texts out of the content barrel', () => {
      const exported = Object.keys(contentBarrel);
      ['legalDocuments', 'legalNotice', 'contactSubjects', 'contactConsent'].forEach((name) =>
        expect(exported).not.toContain(name)
      );
    });

    it('should warn that the texts are a base and not legal advice', () => {
      expect(richTextToPlain(legalNotice)).toContain('No constituyen asesoría legal');
    });

    it('should show the effective date from the responsible data', () => {
      expect(legalLastUpdated).toContain(jasmine.objectContaining({ field: 'effectiveDate' }));
    });

    it('should say honestly that KUVU is an academic project', () => {
      expect(academicNote).toBe(
        'KUVU es un proyecto académico desarrollado en la Universidad Cooperativa de Colombia.'
      );
      expect(richTextToPlain(legalNotice)).toContain(academicNote);
    });

    it('should cover the thirteen minimum points of the data policy', () => {
      const headings = docById('tratamiento-datos').blocks.map((block) => block.heading);
      expect(headings).toEqual([
        'Identificación del responsable',
        'Marco normativo',
        'Definiciones',
        'Datos que tratamos y finalidades',
        'Principios del tratamiento',
        'Derechos del titular',
        'Autorización',
        'Datos sensibles y de menores',
        'Área responsable y canales de atención',
        'Procedimiento para consultas y reclamos',
        'Seguridad de la información',
        'Transferencias y transmisiones',
        'Vigencia'
      ]);
    });

    it('should cite the governing rules and the response terms', () => {
      const text = plainOf(docById('tratamiento-datos'));
      expect(text).toContain('Ley Estatutaria 1581 de 2012');
      expect(text).toContain('Decreto 1377 de 2013');
      expect(text).toContain('diez (10) días hábiles');
      expect(text).toContain('quince (15) días hábiles');
      expect(text).toContain('Superintendencia de Industria y Comercio');
    });

    it('should identify the responsible party from the responsible data', () => {
      const identification = docById('tratamiento-datos').blocks[0];
      const segments = [...identification.paragraphs, ...(identification.items ?? [])].flat();
      const used: ResponsibleField[] = ['legalName', 'domicile', 'phone'];
      used.forEach((name) => expect(segments).toContain(jasmine.objectContaining({ field: name })));
    });

    it('should offer the contact form and WhatsApp as channels to exercise data rights', () => {
      const area = docById('tratamiento-datos').blocks.find(
        (b) => b.heading === 'Área responsable y canales de atención'
      )!;
      const segments = area.paragraphs.flat();
      expect(segments).toContain(jasmine.objectContaining({ link: '/contacto' }));
      expect(segments).toContain(jasmine.objectContaining({ field: 'phone' }));
    });

    it('should leave no incomplete sentence once absent fields are omitted', () => {
      const rendered = allRichTexts()
        .filter((text) => text.some((segment) => typeof segment !== 'string' && 'field' in segment))
        .filter((text) => !isEmptyRichText(text))
        .map((text) =>
          resolveRichText(text)
            .map((s) => s.text)
            .join('')
        );
      rendered.forEach((line) => {
        expect(line).not.toMatch(/:\s*$/);
        expect(line).not.toMatch(/\b(a|en|del|con|NIT|correo)\s*[.,]/i);
        expect(line).not.toMatch(/\s{2,}|\s[.,]/);
      });
    });

    it('should separate the data KUVU handles on behalf of each real estate company', () => {
      const text = plainOf(docById('tratamiento-datos'));
      expect(text).toContain('por cuenta de la inmobiliaria');
      expect(text).toContain('encargado');
    });

    it('should link the privacy notice to the full data policy', () => {
      const segments = docById('aviso-privacidad').blocks.flatMap((b) => b.paragraphs).flat();
      expect(segments).toContain(
        jasmine.objectContaining({ link: '/legal', fragment: 'tratamiento-datos' })
      );
    });

    it('should name Colombian law as applicable in the terms of use', () => {
      expect(plainOf(docById('terminos-uso'))).toContain('República de Colombia');
    });

    it('should state there is no open sign-up in the terms of use', () => {
      expect(plainOf(docById('terminos-uso'))).toContain('No hay registro abierto');
    });

    it('should list exactly the browser storage the site uses', () => {
      expect(browserStorageUses).toEqual([
        'Preferencia de tema',
        'Sesión iniciada',
        'Empresa preseleccionada'
      ]);
      const text = plainOf(docById('cookies'));
      browserStorageUses.forEach((name) => expect(text).toContain(name));
      expect(text).toContain('no usa cookies de analítica, de publicidad ni de terceros');
    });

    it('should only use internal links and known responsible fields', () => {
      // Fields of the Responsible model, present or optional.
      const known: string[] = [
        ...Object.keys(responsible),
        'taxId',
        'address',
        'email'
      ];
      allRichTexts()
        .flat()
        .forEach((segment) => {
          if (typeof segment === 'string') return;
          if ('field' in segment) {
            expect(known).toContain(segment.field);
          } else {
            expect(segment.link.startsWith('/')).toBeTrue();
            expect(segment.label.trim().length).toBeGreaterThan(0);
          }
        });
    });
  });

  describe('contact', () => {
    it('should offer the four closed subjects', () => {
      expect(contactSubjects.map((s) => s.label)).toEqual([
        'Quiero conocer KUVU',
        'Vincular mi inmobiliaria',
        'Soporte de mi cuenta',
        'Otro'
      ]);
      const values = contactSubjects.map((s) => s.value);
      expect(new Set(values).size).toBe(values.length);
    });

    it('should explain the three steps after sending', () => {
      expect(contactSteps.length).toBe(3);
      expect(contactSteps.map((s) => s.title).join(' ')).toContain('WhatsApp');
    });

    it('should link the consent text to the data policy', () => {
      expect(contactConsent).toContain(
        jasmine.objectContaining({ link: '/legal', fragment: 'tratamiento-datos' })
      );
      expect(richTextToPlain(contactConsent)).toContain('Autorizo a KUVU');
    });

    it('should have a message for every validation error', () => {
      Object.values(contactErrors).forEach((message) =>
        expect(message.trim().length).toBeGreaterThan(0)
      );
    });
  });

  describe('faq — contact and data', () => {
    const group = () => faqGroups.find((g) => g.group === 'Contacto y datos');

    it('should add at least three contact and data questions', () => {
      expect(group()).toBeDefined();
      expect(group()!.items.length).toBeGreaterThanOrEqual(3);
    });

    it('should stay consistent with /legal and /contacto without inventing figures', () => {
      const text = group()!.items.map((item) => `${item.q} ${item.a}`).join(' ');
      expect(text).toContain('Ley 1581 de 2012');
      expect(text).toContain('Contacto');
      expect(text).toContain('No usa cookies');
      expect(text).not.toMatch(/\$|precio|\d+\s*(%|clientes|empresas|días)/i);
    });

    it('should keep the home subset at four questions', () => {
      expect(homeFaqItems().length).toBe(4);
    });
  });

  describe('register', () => {
    it('should address the reader with Colombian tuteo, never voseo', () => {
      const text = JSON.stringify([
        contentBarrel,
        legalDocuments,
        legalNotice,
        contactConsent,
        contactErrors,
        contactSteps,
        contactSubjects
      ]);
      const voseo =
        /(?<!\p{L})(conocé|querés|podés|tenés|sabés|necesitás|buscás|encontrás|usás|trabajás|contás|completás|escribí|elegí|creá|registrá|operá|centralizá|gestioná|ingresá|resolvé|volvé|tomás|configurás|asignás|cargás|contanos|escribinos|escribile|dejanos|envialo|contactanos|vos)(?!\p{L})/iu;
      expect(text.match(voseo)).toBeNull();
      // The detector itself catches accented forms.
      expect('Conocé al equipo'.match(voseo)).not.toBeNull();
    });
  });
});

