---
name: sds-git-release
description: Publicar un release en proyectos Go con GoReleaser — qué tocar, en qué orden, y cómo dejar las release notes listas para que goreleaser las tome del CHANGELOG.
version: 1.0.0
---

# sds-git-release — Publicar un release

> Esta skill cubre el flujo completo de cierre de una versión: actualizar `CHANGELOG.md`,
> escribir `release-notes.md`, crear el tag y dejar todo listo para que el workflow de CI
> publique el release en GitHub automáticamente.

---

## 1. Archivos que toca un release

| Archivo | Qué hacer |
|---------|-----------|
| `CHANGELOG.md` | Agregar sección `## [vX.Y.Z] — YYYY-MM-DD` al tope con los cambios agrupados |
| `release-notes.md` | Escribir **solo** la sección nueva (sin historial) — GoReleaser la consume vía `notes_file` |
| `.goreleaser.yaml` | No tocar salvo que haya cambio de config del build |

`release-notes.md` está en `.gitignore` — es efímero, se regenera en cada release, no se versiona.

---

## 2. Formato de `CHANGELOG.md`

Agregar al tope del archivo, después del encabezado `# Changelog`:

```markdown
## [vX.Y.Z] — YYYY-MM-DD

### Added
- Descripción de funcionalidad nueva (una línea por item).

### Changed
- Descripción de cambio en comportamiento existente.

### Fixed
- Descripción de bug corregido.

### Removed
- Descripción de lo que se eliminó.
```

Reglas:
- Solo incluir las secciones que apliquen (omitir `### Fixed` si no hubo fixes).
- Cada item empieza con mayúscula, sin punto final.
- Describir el **qué** y el **por qué** en una línea; si necesita más detalle, sub-bullets con `-`.
- No repetir información ya en commits — estas son notas para el usuario/consumidor, no para el autor.

---

## 3. Formato de `release-notes.md`

Mismo contenido que la sección nueva del CHANGELOG, **sin** el encabezado `## [vX.Y.Z]` ni la fecha — GoReleaser usa el nombre del tag para eso.

```markdown
### Added
- ...

### Changed
- ...

### Fixed
- ...
```

Si el release es pequeño (solo un fix o un cambio menor), un párrafo prose sin secciones también es válido:

```markdown
Corrige el crash en login cuando el token expira antes de que se complete el handshake OAuth.
```

---

## 4. Configuración de GoReleaser

El `.goreleaser.yaml` del proyecto **no** necesita configuración especial para las notas — se pasan como flag al comando. La sección `release` solo define el repo destino:

```yaml
release:
  github:
    owner: salomondevsystems
    name: sdd
  draft: false
```

Las notas se inyectan en el paso 6 del flujo con `--release-notes release-notes.md`.

---

## 5. Flujo paso a paso

```
1. Escribir CHANGELOG.md     — sección nueva al tope
2. Escribir release-notes.md — solo la sección nueva, sin heading de versión
3. Commit: "chore(release): vX.Y.Z"
4. Tag:    git tag vX.Y.Z -m "vX.Y.Z"
5. Push:   git push origin main && git push origin vX.Y.Z
6. Release: GITHUB_TOKEN=$(gh auth token) goreleaser release --clean --release-notes release-notes.md
```

**Nunca** hacer el tag antes del commit con el CHANGELOG — el tag debe apuntar al commit que ya tiene las notas.

GoReleaser no usa el keychain de `gh` por defecto — por eso se pasa el token explícitamente con `$(gh auth token)`. Requiere `gh` instalado y autenticado (`gh auth login`). Si el token no está disponible, el release falla antes de tocar GitHub.

---

## 6. Semantic versioning — cuándo subir qué

| Cambio | Versión |
|--------|---------|
| Fix de bug, sin cambio de API | `PATCH` — v0.3.x → v0.3.(x+1) |
| Feature nueva, sin breaking change | `MINOR` — v0.x.0 → v0.(x+1).0 |
| Breaking change en API o comportamiento | `MAJOR` — vx.0.0 → v(x+1).0.0 |

Para proyectos pre-1.0 (`v0.x.y`): MINOR para features, PATCH para fixes.

---

## 7. Verificación antes de publicar

Antes de crear el tag, confirmar:

- [ ] `go build ./...` sin errores
- [ ] `go test ./...` verde
- [ ] `CHANGELOG.md` tiene la sección nueva al tope
- [ ] `release-notes.md` existe y tiene solo las notas de esta versión
- [ ] El número de versión en el tag coincide con el que aparece en el CHANGELOG

---

## 8. Si algo sale mal

**El release se publicó con notas incorrectas:**
Editar el release directamente en GitHub UI → Edit release → actualizar la descripción.
No re-tagear — eso rompe los checksums de binarios ya descargados.

**El workflow de CI falló:**
Ver los logs en Actions. Si fue un error transitorio, re-run desde la UI de GitHub.
Si fue un error de config, corregir `.goreleaser.yaml`, hacer un nuevo commit y re-tagear con la versión correcta (o una patch bump si la anterior quedó publicada parcialmente).

**Se publicó el tag antes del commit con el CHANGELOG:**
```bash
# Mover el tag al commit correcto (solo si el release AÚN NO fue publicado en GitHub)
git tag -f vX.Y.Z
git push origin vX.Y.Z --force
```
Si el release ya está publicado en GitHub, no mover el tag — editar las notas directamente en la UI.
