# Fase Propose: Mejorar Home Page (extensión: contenido y hero fullsize)

## Intent
Posicionar la página de inicio de KUVU como la cara pública del producto: un sistema de
administración de inmobiliarias que brinda servicio a distintas compañías. El objetivo es que
un visitante entienda en segundos qué hace KUVU y para quién, y lo lleve a la acción
(acceder / contactar).

## Alcance (ampliado respecto al cambio original)
Extiende el cambio `mejorar-home` ya en curso. Se agrega:

- **Hero fullsize** — titular, subtítulo y CTA principal a pantalla completa.
- **Sección "¿Qué es KUVU?"** — descripción del sistema de administración inmobiliaria.
- **Sección "Servicios / Características"** — qué hace el sistema: gestión de locales,
  contratos, pagos, mantenimientos y usuarios.
- **Sección "Compañías que confían"** — las empresas a las que sirve (Amarilo, Nido Rent,
  Balcones de San Soucci, Mi Inmueble).
- **CTA final** — botón a login/acceder.
- **Ajuste del menú del navbar** — al contenido nuevo (enlaces a las secciones de la home +
  acciones de sesión).

Se **reemplaza** el contenido actual de la home ("Quienes Somos" + sidebar + banner) por la
nueva estructura de secciones.

Queda del cambio original (ya implementado y verificado):
- Integración de Tailwind CSS v4 (configurada y funcionando).
- Menú hamburguesa responsivo en el Navbar.
- Refactor de `home.component.scss` con `@apply`.
- Layout mobile-first.

## No-objetivos
- No se modifican otras vistas o componentes (Login, Dashboard, etc.) más allá de lo
  necesario para la home.
- No se agrega funcionalidad de negocio ni conexiones a API: el contenido es estático.
- No se implementan formularios de contacto ni backends de leads (solo CTA visual a
  `/acceder`).
- No se toca la arquitectura de Angular ni la estructura de carpetas.

## Approach
1. Mantener el navbar existente (logo, menú hamburguesa móvil, acciones) y ajustar los
   enlaces del menú a los anclajes de las nuevas secciones.
2. Reescribir el contenido del `home.component.html` con las secciones acordadas, usando un
   hero fullscreen y la grilla mobile-first existente.
3. Ampliar `home.component.scss` con `@apply` para los estilos de las secciones nuevas,
   usando la paleta de marca existente ($brand-green, tokens @theme) y el mismo sistema de
   espaciado Tailwind.
4. Mantener los tests unitarios existentes del componente y agregar cobertura si el HTML
   introduce estructura nueva verificable (enlaces, anclas, CTA).