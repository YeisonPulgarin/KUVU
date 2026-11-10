// Background photo of the access screens (/login, /cambiar-contrasena) per company subdomain.
const BG_MAP: Record<string, string> = {
  'kuvu':        'kuvu.webp',
  'amarilo':     'amarilo.webp',
  'balcones':    'balcones.webp',
  'miinmueble':  'miinmueble.webp',
  'nido':        'nido-rent.webp',
};

export function loginBackgroundUrl(subdominio: string | null | undefined): string {
  const file = BG_MAP[(subdominio ?? '').toLowerCase()] ?? 'kuvu.webp';
  return `/login-backgrounds/${file}`;
}
