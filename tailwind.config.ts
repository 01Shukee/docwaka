import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── DESIGN.md: Mobbin Minimal Color Tokens ──────────────────────
      colors: {
        primary:    "#141414",
        secondary:  "#707070",
        tertiary:   "#E5E7EB",
        neutral:    "#FFFFFF",
        surface:    "#F7F7F7",
        "on-surface": "#141414",
        error:      "#D92D20",
        accent:     "#000000",
        background: "#FFFFFF",
        "text-base": "#141414",
      },

      // ── DESIGN.md: Typography ────────────────────────────────────────
      fontFamily: {
        sans: ["Saans", "DM Sans", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // headline-display
        "display":  ["56px", { lineHeight: "56px",  letterSpacing: "-0.6px",  fontWeight: "652" }],
        // headline-lg
        "headline-lg": ["43px", { lineHeight: "52px", letterSpacing: "0px" }],
        // headline-md
        "headline-md": ["33px", { lineHeight: "40px", letterSpacing: "0px" }],
        // headline-sm
        "headline-sm": ["26px", { lineHeight: "31px", letterSpacing: "0px" }],
        // body-lg
        "body-lg":  ["20px", { lineHeight: "30px", letterSpacing: "0px" }],
        // body-md
        "body-md":  ["16px", { lineHeight: "24px", letterSpacing: "0px" }],
        // body-sm
        "body-sm":  ["14px", { lineHeight: "20px", letterSpacing: "0px" }],
        // label-lg
        "label-lg": ["16px", { lineHeight: "20px", letterSpacing: "0px",    fontWeight: "600" }],
        // label-md
        "label-md": ["16px", { lineHeight: "20px", letterSpacing: "0px",    fontWeight: "456" }],
        // label-sm
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "500" }],
      },

      // ── DESIGN.md: Border Radius ─────────────────────────────────────
      borderRadius: {
        none: "0px",
        sm:   "4px",
        md:   "8px",
        lg:   "16px",
        xl:   "24px",
        full: "9999px",
      },

      // ── DESIGN.md: Spacing ───────────────────────────────────────────
      spacing: {
        xs:  "8px",
        sm:  "24px",
        md:  "40px",
        lg:  "80px",
        xl:  "120px",
      },

      // ── Component heights ────────────────────────────────────────────
      height: {
        "btn":   "44px",
        "input": "40px",
      },
    },
  },
  plugins: [],
};

export default config;
