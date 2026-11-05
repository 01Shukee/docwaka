import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Mobbin Minimal base ─────────────────────────────────────────
        primary:      "#141414",
        secondary:    "#707070",
        tertiary:     "#E5E7EB",
        neutral:      "#FFFFFF",
        surface:      "#F7F7F7",
        "on-surface": "#141414",
        error:        "#DC2626",
        background:   "#FFFFFF",
        "text-base":  "#141414",

        // ── Complementary accent palette ────────────────────────────────
        // Used sparingly for status, highlights, and interactive accents.
        // All are desaturated enough to stay editorial / minimal.
        accent: {
          blue:   "#2563EB",   // Dispatched, info, links
          amber:  "#D97706",   // Pending, warning
          green:  "#16A34A",   // Accepted, Delivered, success
          red:    "#DC2626",   // Rejected, error, destructive
          purple: "#7C3AED",   // Signed (signature events)
        },
        "accent-blue-bg":   "#EFF6FF",
        "accent-amber-bg":  "#FFFBEB",
        "accent-green-bg":  "#F0FDF4",
        "accent-red-bg":    "#FEF2F2",
        "accent-purple-bg": "#F5F3FF",
      },

      fontFamily: {
        sans: ["Saans", "DM Sans", "Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        "display":       ["56px", { lineHeight: "56px",  letterSpacing: "-0.6px",  fontWeight: "652" }],
        "headline-lg":   ["43px", { lineHeight: "52px",  letterSpacing: "0px" }],
        "headline-md":   ["33px", { lineHeight: "40px",  letterSpacing: "0px" }],
        "headline-sm":   ["26px", { lineHeight: "31px",  letterSpacing: "0px" }],
        "body-lg":       ["20px", { lineHeight: "30px",  letterSpacing: "0px" }],
        "body-md":       ["16px", { lineHeight: "24px",  letterSpacing: "0px" }],
        "body-sm":       ["14px", { lineHeight: "20px",  letterSpacing: "0px" }],
        "label-lg":      ["16px", { lineHeight: "20px",  letterSpacing: "0px",    fontWeight: "600" }],
        "label-md":      ["16px", { lineHeight: "20px",  letterSpacing: "0px",    fontWeight: "500" }],
        "label-sm":      ["12px", { lineHeight: "16px",  letterSpacing: "0.04em", fontWeight: "500" }],
      },

      borderRadius: {
        none: "0px",
        sm:   "4px",
        md:   "8px",
        lg:   "16px",
        xl:   "24px",
        full: "9999px",
      },

      spacing: {
        xs: "8px",
        sm: "24px",
        md: "40px",
        lg: "80px",
        xl: "120px",
      },

      height: {
        btn:   "44px",
        input: "40px",
      },
    },
  },
  plugins: [],
};

export default config;
