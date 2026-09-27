// src/components/ui/DvdLoadingScreen.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import DocwakaLogo from "@/components/layout/Logo";

interface DvdLoadingScreenProps {
  /** Optional message shown beneath the bouncing logo */
  label?: string;
  /** Background color — defaults to dark to match the hero panel */
  background?: string;
  /** Logo pixel size */
  logoSize?: number;
}

/**
 * Full-screen loading state where the docwaka. logo bounces around the
 * viewport edges like the classic DVD screensaver — changing direction
 * on every wall hit, using requestAnimationFrame for smooth 60fps motion.
 *
 * Usage:
 *   {loading && <DvdLoadingScreen label="Loading your documents…" />}
 */
export default function DvdLoadingScreen({
  label,
  background = "#141414",
  logoSize   = 56,
}: DvdLoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);
  const posRef        = useRef({ x: 40, y: 40 });
  const velRef         = useRef({ x: 2.4, y: 2.0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let frameId: number;

    const tick = () => {
      const container = containerRef.current;
      const logo      = logoRef.current;
      if (!container || !logo) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const bounds = container.getBoundingClientRect();
      const maxX   = bounds.width  - logoSize;
      const maxY   = bounds.height - logoSize;

      const pos = posRef.current;
      const vel = velRef.current;

      pos.x += vel.x;
      pos.y += vel.y;

      // Bounce off walls — flip velocity, clamp position
      if (pos.x <= 0)   { pos.x = 0;   vel.x = Math.abs(vel.x); }
      if (pos.x >= maxX) { pos.x = maxX; vel.x = -Math.abs(vel.x); }
      if (pos.y <= 0)   { pos.y = 0;   vel.y = Math.abs(vel.y); }
      if (pos.y >= maxY) { pos.y = maxY; vel.y = -Math.abs(vel.y); }

      logo.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [mounted, logoSize]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background,
        overflow: "hidden",
      }}
    >
      {/* Faint grid pattern to match the hero aesthetic */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Bounce container fills the viewport */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
        <div
          ref={logoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: logoSize,
            height: logoSize,
            willChange: "transform",
          }}
        >
          <div
            style={{
              width: logoSize,
              height: logoSize,
              borderRadius: 10,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
            }}
          >
            <DocwakaLogo size={Math.round(logoSize * 0.72)} variant="light" />
          </div>
        </div>
      </div>

      {/* Optional caption, fixed at bottom center */}
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.04em",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {label}
          </p>
        </div>
      )}

      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {label ?? "Loading"}
      </span>
    </div>
  );
}
