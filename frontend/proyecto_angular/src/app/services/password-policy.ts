// password-policy.ts — local mirror of the backend password policy, for live feedback.
// The backend is the authority: the blocklist of common passwords lives only there and
// its rejection arrives as a 400 with the `COMUN` rule.

export interface ReglaPassword {
  codigo: string;
  mensaje: string;
}

export interface EstadoRegla extends ReglaPassword {
  cumple: boolean;
}

export interface ContextoPassword {
  correo?: string | null;
  documento?: string | null;
  actual?: string | null;
}

const MIN = 8;
const MAX = 64;
const MAX_BYTES = 72;

/** Every local rule with its current state, in display order. */
export function evaluarPassword(password: string, ctx: ContextoPassword = {}): EstadoRegla[] {
  const pw = password ?? '';
  const length = [...pw].length;
  const lower = pw.toLowerCase();
  const correo = (ctx.correo ?? '').trim().toLowerCase();
  const local = correo.split('@')[0] ?? '';
  const documento = (ctx.documento ?? '').trim().toLowerCase();

  const reglas: EstadoRegla[] = [
    {
      codigo: 'LONGITUD',
      mensaje: `Entre ${MIN} y ${MAX} caracteres`,
      cumple: length >= MIN && length <= MAX && new TextEncoder().encode(pw).length <= MAX_BYTES,
    },
    { codigo: 'MAYUSCULA', mensaje: 'Una letra mayúscula', cumple: /\p{Lu}/u.test(pw) },
    { codigo: 'MINUSCULA', mensaje: 'Una letra minúscula', cumple: /\p{Ll}/u.test(pw) },
    { codigo: 'NUMERO', mensaje: 'Un número', cumple: /\p{Nd}/u.test(pw) },
    { codigo: 'SIMBOLO', mensaje: 'Un símbolo (por ejemplo ! # $ * .)', cumple: /[^\p{L}\p{Nd}]/u.test(pw) },
    {
      codigo: 'CONTIENE_DATOS',
      mensaje: 'Sin tu correo ni tu número de documento',
      cumple:
        pw.length > 0 &&
        !(correo && (lower.includes(correo) || (local.length >= 4 && lower.includes(local)))) &&
        !(documento && lower.includes(documento)),
    },
  ];

  if (ctx.actual) {
    reglas.push({ codigo: 'IGUAL_ACTUAL', mensaje: 'Distinta de la actual', cumple: pw.length > 0 && pw !== ctx.actual });
  }
  return reglas;
}

export function cumplePolitica(password: string, ctx: ContextoPassword = {}): boolean {
  return evaluarPassword(password, ctx).every((r) => r.cumple);
}
