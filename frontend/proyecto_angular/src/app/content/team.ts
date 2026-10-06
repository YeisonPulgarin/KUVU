import type { TeamSection } from './types';

const members = ['Wilson Solano', 'Carlos Arciniegas', 'Yeison Pulgarin'] as const;

export const team: TeamSection = {
  title: 'El equipo detrás de KUVU',
  lead: 'Somos YCW Systems, los tres estudiantes universitarios que crearon KUVU en la biblioteca de su universidad.',
  linkLabel: 'Conocé al equipo',
  members,
  image: {
    basePath: '/Imagenes_web/equipo-ycw',
    widths: [640, 1024, 1536],
    width: 1536,
    height: 1024,
    alt: 'El equipo YCW Systems, de izquierda a derecha: Wilson Solano, Carlos Arciniegas y Yeison Pulgarin, de traje frente al logo de YCW Systems.',
    caption: members.join(' · ')
  }
};
