"""Monta o protótipo em uma página única (CSS, JS e logos embutidos).

Uso:  python3 prototipo/build.py
Gera: prototipo/dist/index.html     (abre direto no navegador)
      prototipo/dist/artifact.html  (sem <html>/<head>, para publicar como Artifact)
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
DS = ROOT.parent / "raio-ds"
SRC, DIST = ROOT / "src", ROOT / "dist"


def svg_uri(name):
    data = (DS / "logos" / f"{name}.svg").read_bytes()
    return "data:image/svg+xml;base64," + base64.b64encode(data).decode()


tokens = (DS / "tokens.css").read_text()
tokens = re.sub(r"@import url\([^)]*\);\n?", "", tokens)  # a fonte entra por <link>
components = (DS / "components.css").read_text()
components = components.replace('url("logos/mark.svg")', f'url("{svg_uri("mark")}")')
components = components.replace('url("logos/logo-mono.svg")', f'url("{svg_uri("logo-mono")}")')

page = (SRC / "index.html").read_text()
page = (page.replace("/*TOKENS*/", tokens)
            .replace("/*COMPONENTS*/", components)
            .replace("/*APPCSS*/", (SRC / "app.css").read_text())
            .replace("/*LPCSS*/", (SRC / "lp.css").read_text())
            .replace("/*MOTIONCSS*/", (SRC / "motion.css").read_text())
            .replace("/*DATA*/", (SRC / "data.js").read_text())
            .replace("/*LP*/", (SRC / "lp.js").read_text())
            .replace("/*APP*/", (SRC / "app.js").read_text()))
for name in ("logo-blue-lime", "logo-lime-purple", "logo-lime"):
    page = page.replace("{{%s}}" % name, svg_uri(name))
assert "{{" not in page and "/*APP*/" not in page, "placeholder sem substituir"

DIST.mkdir(exist_ok=True)
(DIST / "artifact.html").write_text(page)
(DIST / "index.html").write_text(
    '<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    "</head>\n<body>\n" + page + "\n</body>\n</html>\n")
print(f"ok: {DIST / 'index.html'} ({len(page) // 1024} KB)")
