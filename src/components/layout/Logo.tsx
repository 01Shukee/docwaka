// src/components/layout/Logo.tsx

interface LogoProps {
  size?:    number;
  variant?: "light" | "dark";
}

export default function DocwakaLogo({ size = 44, variant = "light" }: LogoProps) {
  if (variant === "dark") {
    return (
      <div style={{
        width: size + 10, height: size + 10,
        borderRadius: 8, background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, padding: 3,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="docwaka." width={size} height={size}
          style={{ objectFit: "contain", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="docwaka." width={size} height={size}
        style={{ objectFit: "contain", display: "block", mixBlendMode: "multiply" }} />
    </div>
  );
}

// ── Wordmark ───────────────────────────────────────────────────────────────────

interface WordmarkProps {
  size?:     number;
  variant?:  "light" | "dark";
  logoSize?: number;
}

export function DocwakaWordmark({ size = 17, variant = "light", logoSize }: WordmarkProps) {
  // Default logo is ~2.5× the text size so it has visual weight
  const ls = logoSize ?? Math.round(size * 2.5);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <DocwakaLogo size={ls} variant={variant} />
      <span style={{
        fontSize: size, fontWeight: 900,
        letterSpacing: "-0.5px", lineHeight: 1,
        color: variant === "dark" ? "#fff" : "#141414",
      }}>
        docwaka<span style={{ color: "#3B82F6" }}>.</span>
      </span>
    </div>
  );
}