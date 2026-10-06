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
  siteInfo,
  team
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

  describe('team', () => {
    it('should present the team section with its title and link label', () => {
      expect(team.title).toBe('El equipo detrás de KUVU');
      expect(team.linkLabel).toBe('Conocé al equipo');
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
});