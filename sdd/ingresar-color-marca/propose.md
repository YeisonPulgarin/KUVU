# Propose — ingresar-color-marca

## Intent
El botón "Ingresar" del sitio público es siempre el azul de marca KUVU, aunque el visitante
haya entrado antes a la app de una empresa con otro color, vuelva al sitio o recargue.

## Alcance
- El color de cada empresa se aplica solo dentro de la app interna (`<app-layout>`), no en
  el documento entero.
- Sitio público, `/acceder` y `/login` usan siempre los tokens azules de `:root`.
- Test de regresión: empresa amarilla con sesión activa → "Ingresar" azul.

## No-objetivos
- Cambiar los colores de las empresas o cómo se ven en la app interna.
- Cambiar el estilo de `.btn-primary` o del botón "Ingresar".
- Cerrar sesión al visitar el sitio público.

## Approach
`AuthService` deja de escribir variables en `<html>` y expone el tema calculado de la empresa;
`AppLayoutComponent` lo publica como variables CSS en su propio host.
