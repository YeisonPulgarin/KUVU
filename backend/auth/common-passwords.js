// auth/common-passwords.js — embedded blocklist, compared in lower case.
//
// Two groups: the most common passwords in public leak rankings, and the variants that
// satisfy the composition rules (upper, lower, digit, symbol) people reach for first,
// including the product and the demo companies' names.
const COMMON = [
  '123456', '123456789', '12345678', '1234567890', '12345', '1234567', 'qwerty', 'password',
  '111111', '123123', 'abc123', '000000', '1q2w3e4r', 'iloveyou', 'qwerty123', 'admin',
  'welcome', 'monkey', 'dragon', 'letmein', 'football', 'baseball', 'sunshine', 'princess',
  'master', 'shadow', 'superman', 'michael', 'charlie', 'trustno1', 'passw0rd', 'qwertyuiop',
  'asdfghjkl', 'zxcvbnm', '1qaz2wsx', 'contraseña', 'contrasena', 'clave', 'colombia',
  'bogota', 'medellin', 'teamo', 'tequiero', 'hola123', 'administrador', 'usuario',
  'password1', 'password12', 'password123', 'admin123', 'welcome1', 'qwerty1', 'abcd1234',
  'aa123456', 'abc12345', '987654321', '654321', '696969', '7777777', '88888888',

  'password1!', 'password1*', 'password1.', 'password123!', 'password123*', 'password@123',
  'p@ssw0rd', 'p@ssw0rd1', 'p@ssw0rd!', 'p@ssword1', 'p@ssword123', 'passw0rd!', 'passw0rd1!',
  'qwerty1!', 'qwerty12!', 'qwerty123!', 'qwerty123*', 'qwerty123.', 'qwerty@123', 'qwerty#123',
  'welcome1!', 'welcome123!', 'welcome@123', 'admin123!', 'admin123*', 'admin@123', 'admin#123',
  'admin2024!', 'admin2025!', 'admin2026!', 'abc123!', 'abc123*', 'abc12345!', 'abcd1234!',
  'abcd@1234', 'aa123456!', 'iloveyou1!', 'letmein1!', 'monkey123!', 'dragon123!',
  'football1!', 'sunshine1!', 'princess1!', 'superman1!', 'master123!', 'shadow123!',
  'changeme1!', 'changeme123!', 'temporal1!', 'temporal123!', 'temporal2026!', 'secreto1!',
  'contraseña1!', 'contraseña123!', 'contrasena1!', 'contrasena123!', 'contraseña1*',
  'clave123!', 'clave123*', 'clave2026!', 'micontraseña1!', 'micontrasena1!', 'miclave123!',
  'colombia1!', 'colombia123!', 'colombia2026!', 'colombia2025!', 'bogota123!', 'bogota2026!',
  'medellin123!', 'teamo123!', 'tequiero1!', 'hola123!', 'hola1234!', 'holamundo1!',
  'usuario1!', 'usuario123!', 'administrador1!', 'administrador123!',
  'summer2024!', 'summer2025!', 'summer2026!', 'winter2025!', 'winter2026!', 'spring2026!',
  'enero2026!', 'febrero2026!', 'marzo2026!', 'abril2026!', 'mayo2026!', 'junio2026!',
  'julio2026!', 'agosto2026!', 'septiembre2026!', 'octubre2026!', 'noviembre2026!',
  'diciembre2026!', 'qwertyuiop1!', 'asdfghjkl1!', 'zxcvbnm1!', '1qaz2wsx!', '1qaz@wsx',
  '1q2w3e4r!', '1q2w3e4r5t!', 'q1w2e3r4!', 'aa1234567!', 'a1234567!', 'a12345678!',
  'abc@1234', 'test123!', 'test1234!', 'demo123!', 'demo1234!', 'prueba123!', 'prueba1234!',

  'kuvu123!', 'kuvu1234!', 'kuvu2025!', 'kuvu2026!', 'kuvu@2026', 'kuvu@123', 'kuvu#2026',
  'amarilo1!', 'amarilo123!', 'amarilo2026!', 'nidorent1!', 'nidorent123!', 'nidorent2026!',
  'nido123!', 'nido2026!', 'balcones1!', 'balcones123!', 'balcones2026!', 'miinmueble1!',
  'miinmueble123!', 'miinmueble2026!', 'inmueble123!', 'arriendo123!', 'arriendo2026!',
  'arrendapp1!', 'arrendapp123!', 'arrendatario1!', 'arrendatario123!',
];

module.exports = new Set(COMMON);
