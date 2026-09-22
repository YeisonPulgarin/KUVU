---
name: ponytail-audit
description: "Audit the whole repo for over-engineering. A ranked list of what to delete, simplify, or replace with stdlib or native features. Útil al inicio de un proyecto heredado o antes de una sesión de refactor mayor."
homepage: https://github.com/DietrichGebert/ponytail
license: MIT
version: 1.0.0
---

ponytail-review, repo-wide. Scan the whole tree instead of a diff. Rank
findings biggest cut first.

> **Nota de integración SDD:** invocar antes de iniciar un cambio de refactor
> (suele ser el primer paso de la fase `sdd-explore` cuando la naturaleza del
> cambio es limpieza de deuda técnica). El output puede alimentar directamente
> el artifact `propose` con una lista priorizada de qué cortar.

## Tags

Same as ponytail-review:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Hunt

Deps the stdlib or platform already ships, single-implementation interfaces,
factories with one product, wrappers that only delegate, files exporting one
thing, dead flags and config, hand-rolled stdlib.

## Output

One line per finding, ranked: `<tag> <what to cut>. <replacement>. [path]`.
End with `net: -<N> lines, -<M> deps possible.` Nothing to cut: `Lean already. Ship.`

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
and performance are explicitly out of scope. Route them to a normal review
pass. Lists findings, applies nothing. One-shot.
"stop ponytail-audit" or "normal mode" to revert.
