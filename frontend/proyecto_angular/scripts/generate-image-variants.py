"""Genera las variantes responsive de una imagen para public/Imagenes_web/.

Uso:
    python scripts/generate-image-variants.py <origen> <nombre-base> [--keep-original-as-max]

Escribe {nombre-base}-{ancho}.webp y .jpeg para cada ancho de WIDTHS que no supere el
ancho del original, conservando el aspecto. Con --keep-original-as-max, la variante JPEG
del ancho original es una copia byte a byte del archivo de origen (sin recomprimir).
Requiere Python 3 y Pillow con soporte WebP.
"""

import argparse
import shutil
import sys
from pathlib import Path

from PIL import Image

WIDTHS = (640, 1024, 1536)
WEBP_QUALITY = 80
JPEG_QUALITY = 82
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "Imagenes_web"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("source", type=Path)
    parser.add_argument("base_name")
    parser.add_argument("--keep-original-as-max", action="store_true")
    args = parser.parse_args()

    with Image.open(args.source) as original:
        image = original.convert("RGB")
    width, height = image.size
    targets = [w for w in WIDTHS if w <= width]
    if not targets:
        print(f"El original mide {width}px, menos que el ancho mínimo {WIDTHS[0]}px", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for target in targets:
        resized = image if target == width else image.resize(
            (target, round(height * target / width)), Image.Resampling.LANCZOS
        )
        stem = OUT_DIR / f"{args.base_name}-{target}"
        resized.save(stem.with_suffix(".webp"), "WEBP", quality=WEBP_QUALITY, method=6)
        jpeg_path = stem.with_suffix(".jpeg")
        if target == width and args.keep_original_as_max and args.source.suffix.lower() in (".jpg", ".jpeg"):
            shutil.copyfile(args.source, jpeg_path)
        else:
            resized.save(jpeg_path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        print(f"{stem.name}: {resized.size[0]}x{resized.size[1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
