/**
 * raio Design System — Tailwind v3 (também funciona no v4 com `@config "./tailwind.config.js";`)
 * Gerado a partir de ../tokens.json
 *
 * Dark mode por atributo: <html data-theme="dark">  →  classes `dark:`
 * As cores semânticas (bg-surface, text-fg, border-line…) trocam sozinhas
 * entre light e dark porque apontam para as variáveis de ../tokens.css.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // --- Primitivas ---
        brand: {
          blue: "#0451FF",
          lime: "#CEFF05",
          purple: "#D785FE",
        },
        neutral: {
          black: "#000000",
          800: "#282828",
          500: "#808080",
          400: "#A0A0A0",
          350: "#999999",
          300: "#D9D9D9",
          200: "#E6E6E6",
          100: "#F5F5F5",
          white: "#FFFFFF",
        },
        ink: {
          // superfícies do dark mode
          bg: "#080810",
          surface: "#12121E",
          border: "#28283C",
        },
        success: { DEFAULT: "#33B233", bg: "#E5FFE5", bright: "#33E566", strong: "#1ACC4D" },
        warning: { DEFAULT: "#FFB200", bg: "#FFF7E0" },
        error: { DEFAULT: "#FF4D4D", bg: "#FFEBEB", field: "#DC3232", input: "#FF3333" },

        // --- Semânticas (mudam com o tema; precisam de tokens.css) ---
        canvas: "var(--raio-bg)",
        surface: "var(--raio-surface)",
        line: "var(--raio-border)",
        fg: {
          DEFAULT: "var(--raio-text)",
          muted: "var(--raio-text-muted)",
          secondary: "var(--raio-text-secondary)",
        },
        focus: "var(--raio-focus)",
        cta: { DEFAULT: "var(--raio-cta-bg)", fg: "var(--raio-cta-fg)" },
      },

      fontFamily: {
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },

      fontSize: {
        // [tamanho, { lineHeight, fontWeight, letterSpacing }]
        display: ["64px", { lineHeight: "1.1", fontWeight: "700" }],
        h1: ["48px", { lineHeight: "1.1", fontWeight: "700" }],
        h2: ["36px", { lineHeight: "1.15", fontWeight: "700" }],
        h3: ["28px", { lineHeight: "1.2", fontWeight: "500" }],
        section: ["24px", { lineHeight: "1.25", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1.5" }],
        "body-sm": ["14px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.4" }],
        label: ["12px", { lineHeight: "1.3", fontWeight: "500" }],
        caption: ["11px", { lineHeight: "1.3", fontWeight: "500" }],
        overline: ["11px", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "1.5px" }],
      },

      borderRadius: {
        xs: "5px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        pill: "100px",
        "app-icon": "50px", // ícone de app 413px; em outros tamanhos use ~12% do lado
      },

      borderWidth: {
        DEFAULT: "1px",
        base: "1.5px",
        strong: "2px",
      },

      boxShadow: {
        nav: "0 2px 4px rgba(0,0,0,0.06)",
        card: "0 4px 8px rgba(0,0,0,0.08)",
        "card-dark": "0 4px 8px rgba(0,0,0,0.30)",
        modal: "0 24px 30px rgba(0,0,0,0.15)",
        "modal-dark": "0 24px 30px rgba(0,0,0,0.50)",
      },

      height: {
        "btn-lg": "52px",
        btn: "48px",
        "btn-sm": "36px",
        "btn-xs": "32px",
        input: "56px",
        "input-sm": "44px",
        nav: "64px",
        badge: "28px",
      },

      size: {
        control: "20px",
        "avatar-lg": "56px",
        "avatar-md": "44px",
        "avatar-sm": "32px",
        "avatar-xs": "24px",
      },
    },
  },
  plugins: [],
};
