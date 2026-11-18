# raio Design System

Extraído do Figma **Raio - Hacka**: showcase (frame `58:58`), component sets (frame `58:66`) e logos (frame `58:82`).

| Arquivo | Conteúdo |
|---|---|
| `tokens.json` | Tokens no formato W3C Design Tokens (cores, tipografia, raios, bordas, sombras, tamanhos) |
| `tokens.css` | Os mesmos tokens como CSS custom properties + camada semântica light/dark (`[data-theme="dark"]`) |
| `components.css` | Todos os componentes (ver tabela abaixo) |
| `tailwind/tailwind.config.js` | Configuração para Tailwind v3 |
| `tailwind/raio.css` | Configuração para Tailwind v4 (`@theme`) |
| `logos/` | Logos e ícones de app em SVG |
| `preview.html` | Logos e cada componente com todas as variantes, light e dark lado a lado |

## Logos

| Arquivo | Uso |
|---|---|
| `logo-blue-lime.svg` | Principal: símbolo lime + "raio" azul, sobre fundo claro |
| `logo-blue.svg` | Tudo azul, sobre fundo claro |
| `logo-lime-purple.svg` | Símbolo roxo + "raio" lime, sobre fundo escuro |
| `logo-lime.svg` | Tudo lime, sobre fundo escuro |
| `logo-mono.svg` | Uma cor só (`currentColor`) |
| `mark.svg` | Só o símbolo (`currentColor`) |
| `app-icon-lime.svg` · `app-icon-blue.svg` · `app-icon-white.svg` | Ícones de app 413×413, raio 50 |

O logo horizontal tem proporção 581×176. Versões em `currentColor` só pegam a cor do texto quando o SVG está inline. Num `<img>` elas ficam pretas, então use as classes de máscara do `components.css`:

```html
<span class="raio-mark" style="color: var(--raio-blue)"></span>
<span class="raio-logo-mono" style="color: #fff; width: 160px"></span>
```

## Tailwind

**v4** (CSS-first):

```css
@import "tailwindcss";
@import "./raio.css";
```

**v3**: copie `tailwind.config.js` e ajuste o `content` para os seus arquivos. No v4, também dá para usar esse arquivo com `@config "./tailwind.config.js";`.

O dark mode vem do atributo `data-theme="dark"` (variante `dark:`). As cores semânticas trocam sozinhas com o tema:

| Classe | Light | Dark |
|---|---|---|
| `bg-canvas` / `bg-surface` | `#F5F5F5` / `#FFF` | `#080810` / `#12121E` |
| `border-line` | `#E6E6E6` | `#28283C` |
| `text-fg` / `text-fg-muted` | `#282828` / `#A0A0A0` | `#FFF` / `#A0A0A0` |
| `bg-cta text-cta-fg` | azul / branco | lime / preto |
| `border-focus`, `ring-focus` | azul | lime |

As outras classes seguem os tokens: `bg-brand-blue|lime|purple`, `bg-ink-surface`, `text-display|h1|h2|h3|body|label|caption|overline`, `rounded-md|2xl|3xl|pill`, `shadow-card|modal|nav`, `h-btn|btn-lg|btn-sm|input|nav`, `size-avatar-lg|md|sm|xs`, `border-base` (1.5px) e `border-strong` (2px).

```html
<button class="h-btn px-6 rounded-md bg-cta text-cta-fg font-bold text-body-sm">Começar</button>
<label class="flex flex-col h-input px-2.5 justify-center rounded-md bg-surface border-base border-line focus-within:border-strong focus-within:border-focus">
  <span class="text-caption text-fg-muted">E-mail</span>
  <input class="bg-transparent outline-none text-body-sm text-fg">
</label>
```

> As escalas `text-sm` (13px) e `neutral-*` substituem os valores padrão do Tailwind com os mesmos nomes.

## Componentes

Cada componente segue as variantes do component set no Figma. O modo vem do ancestral com `data-theme="dark"`.

| Componente (Figma) | Variantes no Figma | Classes |
|---|---|---|
| **Button** | Type: Primary / Accent / Ghost / Outline × Mode | `.raio-btn` + `--primary` `--accent` `--ghost` `--outline` `--cta`; tamanhos `--lg` (52) `--sm` (36) `--block` |
| **Badge** | Color: Blue / Lime / Purple / Neutral | `.raio-badge` + `--blue` `--lime` `--purple` `--neutral` |
| **Tag** | Color: Blue / Lime / Purple / Neutral | `.raio-badge.raio-tag` + cor, com `<button class="raio-tag__remove">×</button>` |
| **Input** | State: Default / Focus / Error / Filled × Mode | `.raio-input` com `.raio-input__label` + `<input>`; `--error`, `--select`; o foco é automático via `:focus-within` |
| **Avatar** | Size: Large 56 / Medium 44 / Small 32 / XSmall 24 × Color | `.raio-avatar` + `--md` `--sm` `--xs` + `--lime` `--purple` |
| **Card/Service** | Mode | `.raio-card` com `__head` `__icon` `__title` `__meta` `__text` `__divider` `__actions` |
| **Navbar** | Mode | `.raio-nav` com `__logo` `__links` + `.raio-btn--cta`; `--rounded` para a versão do showcase |
| **Modal** | Mode | `.raio-modal` com `__head` `__close` `__body` `__field` |
| Checkbox / Radio *(showcase)* | — | `.raio-check` com `input[type=checkbox|radio]` |
| Alert *(showcase)* | — | `.raio-alert` + `--success` `--warning` `--error` |

`.raio-btn--cta` é o botão principal da marca: azul no light e lime no dark, como no Navbar, no Card e no Modal.

```html
<label class="raio-input raio-input--error">
  <span class="raio-input__label">E-mail</span>
  <input value="joao@" aria-invalid="true">
</label>
```

## Resumo dos tokens

- **Fonte:** Space Grotesk (400 / 500 / 700)
- **Marca:** blue `#0451FF` · lime `#CEFF05` · purple `#D785FE`
- **Neutros:** `#000` · `#282828` · `#808080` · `#A0A0A0` · `#D9D9D9` · `#E6E6E6` · `#F5F5F5` · `#FFF`
- **Dark:** bg `#080810` · surface `#12121E` · border `#28283C`
- **Feedback:** success `#33B233`/`#E5FFE5` · warning `#FFB200`/`#FFF7E0` · error `#FF4D4D`/`#FFEBEB` · erro de campo `#DC3232`
- **Escala tipográfica:** 64 · 48 · 36 · 28 · 24 · 18 · 16 · 14 · 13 · 12 · 11
- **Raios:** 5 · 6 · 8 · 10 · 12 · 16 · 20 · pill
- **Regra do dark mode:** foco, outline, logo e CTA trocam de blue para lime.

## Observações sobre o arquivo Figma

- O Figma **não tem variáveis nem estilos publicados**: as cores e fontes estão aplicadas direto nas camadas. Os tokens foram inferidos dos valores usados.
- **Onde o showcase e os componentes divergem, o CSS segue os componentes:**
  - Botão: 48px de altura com borda de 2px (o showcase usa 52px). O tamanho de 52px ficou disponível como `--lg`.
  - Avatar roxo: texto preto (no showcase é branco).
  - Erro do Input: `#DC3232` com borda de 2px (no showcase é `#FF3333` com 1.5px).
  - Navbar: sem cantos arredondados e com borda de 1px (no showcase tem 12px de raio). A versão arredondada está em `--rounded`.
  - Sombras de Card e Modal são mais leves que as do showcase.
- **Badge e Tag** estão com `height: 100px` fixo no Figma, o que deixa o componente oval. Parece um erro: usei 28px, como no showcase.
- No light, os campos do **Modal** têm fundo `#E6E6E6`, diferente do componente Input, que é branco. Mantive como está no Figma.
- O `stat-badge` do dark mode tem fundo `#1ACC4D` com texto `#33E566`, que quase não se distinguem. Apliquei o fundo com 18% de opacidade.
- Há valores quase duplicados (3 vermelhos de erro, `#999` × `#A0A0A0`, `#D9D9D9` × `#E6E6E6`). Vale unificar.
