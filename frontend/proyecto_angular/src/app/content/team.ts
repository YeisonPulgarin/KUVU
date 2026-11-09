import type { SiteImage, TeamSection } from './types';

const members = ['Wilson Solano', 'Carlos Arciniegas', 'Yeison Pulgarin'] as const;

const photo = (n: 1 | 2 | 3, widths: readonly number[], width: number, height: number, alt: string): SiteImage => ({
  basePath: `/Imagenes_web/equipo-kuvu-${n}`,
  widths,
  width,
  height,
  alt
});

export const team: TeamSection = {
  title: 'El equipo detrás de KUVU',
  lead: 'Somos YCW Systems, los tres estudiantes universitarios que crearon KUVU en la biblioteca de su universidad.',
  linkLabel: 'Conoce al equipo',
  members,
  photos: [
    photo(
      1,
      [640, 1024, 1200],
      1200,
      1600,
      'Los tres estudiantes del equipo KUVU, de pie y sonrientes frente a un muro de ladrillo, con sus mochilas.'
    ),
    photo(
      2,
      [640, 960],
      960,
      1280,
      'El equipo KUVU frente a la fachada de ladrillo y vidrio de un edificio de la universidad, junto a un jardín.'
    ),
    photo(
      3,
      [640, 960],
      960,
      1280,
      'Los tres integrantes de KUVU en la acera, frente a un edificio de ventanales azules y una torre de ladrillo.'
    )
  ]
};
