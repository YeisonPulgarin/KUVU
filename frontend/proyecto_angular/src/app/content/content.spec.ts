import {
  benefitsByRole,
  buildWhatsAppLink,
  companies,
  contact,
  contactWhatsAppLink,
  faqGroups,
  homeFaqCount,
  homeFaqItems,
  howItWorks,
  logo,
  navLinks,
  origin,
  securityHighlights,
  services,
  siteInfo
} from './index';

describe('content modules', () => {
  describe('site', () => {
    it('should expose the brand name and tagline', () => {
      expect(siteInfo.name).toBe('KUVU');
      expect(siteInfo.tagline.length).toBeGreaterThan(10);
    });

    it('should define nav links with anchor and page targets', () => {
      expect(navLinks.length).toBeGreaterThanOrEqual(4);
      navLinks.forEach((link) => {
        expect(link.label.trim().length).toBeGreaterThan(0);
        expect(link.href.startsWith('#')).toBeTrue();
      });
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

  describe('logo', () => {
    it('should expose the four logo variants under /logo-rediseno/', () => {
      expect(logo.light).toBe('/logo-rediseno/logo-light.png');
      expect(logo.dark).toBe('/logo-rediseno/logo-dark.png');
      expect(logo.responsiveLight).toBe('/logo-rediseno/logo-responsive-light.png');
      expect(logo.responsiveDark).toBe('/logo-rediseno/logo-responsive-dark.png');
    });

    it('should keep the four variants distinct', () => {
      const variants = Object.values(logo);
      expect(new Set(variants).size).toBe(4);
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
});