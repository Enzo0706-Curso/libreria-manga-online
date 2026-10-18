#!/usr/bin/env python3
"""
build.py — Prepara los archivos para publicar (ejecutar ANTES de `firebase deploy`).

  1. Minifica  estilo.css -> estilo.min.css   y   fondo.css -> fondo.min.css
     (los .css normales siguen siendo los archivos que se editan).
  2. Actualiza en index.html el parametro ?v=<hash> de los CSS/JS locales.
     Como Firebase cachea estos archivos 1 año, el ?v= cambia SOLO cuando el
     contenido cambia, asi los visitantes reciben siempre la version nueva.

Uso:   python build.py
"""
import hashlib
import io
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))


def leer(nombre):
    with io.open(os.path.join(BASE, nombre), encoding="utf-8-sig", newline="") as f:
        return f.read()


def escribir(nombre, texto):
    with io.open(os.path.join(BASE, nombre), "w", encoding="utf-8", newline="") as f:
        f.write(texto)


def minificar_css(css):
    protegidos = []

    def guardar(m):
        protegidos.append(m.group(0))
        return "\x00%d\x00" % (len(protegidos) - 1)

    # Proteger strings y url(...) para no tocar su contenido
    css = re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|url\([^)]*\)', guardar, css)
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)       # comentarios
    css = re.sub(r"\s+", " ", css)                        # espacios/saltos
    css = re.sub(r"\s*([{};,>])\s*", r"\1", css)          # alrededor de { } ; , >
    css = re.sub(r":\s+", ":", css)                       # espacio tras ':'
    css = css.replace(";}", "}")
    css = css.strip()
    css = re.sub(r"\x00(\d+)\x00", lambda m: protegidos[int(m.group(1))], css)
    return css


def hash_archivo(nombre):
    with open(os.path.join(BASE, nombre), "rb") as f:
        return hashlib.md5(f.read()).hexdigest()[:8]


def main():
    for origen, destino in (("estilo.css", "estilo.min.css"), ("fondo.css", "fondo.min.css")):
        original = leer(origen)
        minificado = minificar_css(original)
        escribir(destino, minificado)
        print("%s: %d KB -> %s: %d KB" % (origen, len(original.encode("utf-8")) // 1024,
                                          destino, len(minificado.encode("utf-8")) // 1024))

    VERSION = "2.0"
    html = leer("index.html")
    for nombre in ("estilo.min.css", "fondo.min.css", "intro.js", "auth.js", "manga.js", "admin.js"):
        patron = r'((?:href|src)=")' + re.escape(nombre) + r'(?:\?v=[\w.\-]*)?(")'
        html, n = re.subn(patron, r"\g<1>" + nombre + "?v=" + VERSION + r"\g<2>", html)
        print("index.html: %s -> %d referencia(s) versionada(s) (?v=%s)" % (nombre, n, VERSION))
    escribir("index.html", html)
    print("Listo. Ahora puedes ejecutar: firebase deploy --only hosting:enzowukong-mangas")


if __name__ == "__main__":
    main()
