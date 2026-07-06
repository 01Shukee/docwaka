// src/components/landing/LandingPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Colour tokens (mirrors CSS vars) ─────────────────────────────────────────
const C = {
  primary:   "#141414",
  secondary: "#707070",
  tertiary:  "#E5E7EB",
  surface:   "#F7F7F7",
  white:     "#FFFFFF",
  blue:      "#2563EB",   blueBg: "#EFF6FF",  blueText: "#1D4ED8",
  amber:     "#D97706",   amberBg: "#FFFBEB", amberText: "#92400E",
  green:     "#16A34A",   greenBg: "#F0FDF4", greenText: "#166534",
  red:       "#DC2626",   redBg:  "#FEF2F2",  redText:  "#991B1B",
  purple:    "#7C3AED",   purpleBg:"#F5F3FF", purpleText:"#5B21B6",
};

// ── Nav sidebar blocks ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { num: "01", label: "Document Routing", bg: C.primary,  fg: C.white   },
  { num: "02", label: "Role Hierarchy",   bg: "#1F2937",  fg: C.white   },
  { num: "03", label: "Audit & Tracking", bg: "#374151",  fg: C.white   },
  { num: "04", label: "Get Started",      bg: "#6B7280",  fg: C.white   },
];

// ── Hero slides ───────────────────────────────────────────────────────────────
const SLIDES = [
  { headline: "Track every\ndocument,\nevery step.",    sub: "FUTO's official document routing and tracking platform — dispatch, sign, approve, and confirm delivery.",         accentDot: C.blue   },
  { headline: "Five roles.\nOne clear\nchain.",         sub: "Every account is approved by the tier above it. From Sys Admin down to Staff — access is always scoped.",       accentDot: C.amber  },
  { headline: "Nothing\nlost.\nEver.",                  sub: "Every dispatched, signed, accepted, rejected, or delivered event is written once and never changed.",            accentDot: C.green  },
  { headline: "Start in\nminutes.\nNot days.",          sub: "Register, get approved by your department administrator, and start routing documents immediately.",              accentDot: C.purple },
];

// ── Doc state chips ───────────────────────────────────────────────────────────
const DOC_STATES = [
  { label: "Pending",   bg: C.amberBg,  tc: C.amberText,  dot: C.amber  },
  { label: "Accepted",  bg: C.greenBg,  tc: C.greenText,  dot: C.green  },
  { label: "Rejected",  bg: C.redBg,    tc: C.redText,    dot: C.red    },
  { label: "Delivered", bg: C.blueBg,   tc: C.blueText,   dot: C.blue   },
];

// ── Pillars ───────────────────────────────────────────────────────────────────
const PILLARS = [
  { bg: C.primary, fg: C.white,   accent: C.blue,   icon: "◎", title: "For People",  body: "Built for everyone in FUTO — from the Registrar to the newest staff member. No training required." },
  { bg: C.surface, fg: C.primary, accent: C.amber,  icon: "→", title: "By Design",   body: "Every flow is deliberate. Document states, approval chains, and audit events follow strict rules." },
  { bg: "#E5E7EB", fg: C.primary, accent: C.green,  icon: "♡", title: "With Care",   body: "Nothing gets lost. Nothing goes unrecorded. Every document tracked from dispatch to delivery." },
];

// ── Features ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "→", accent: C.blue,   title: "End-to-end routing",     body: "From dispatch to confirmed delivery. Every state logged, every transition visible." },
  { icon: "✎", accent: C.purple, title: "Digital signatures",     body: "Draw or type. Captured before acceptance, stored permanently against the document." },
  { icon: "◎", accent: C.green,  title: "Immutable audit trail",  body: "Every action written once, never changed. Fully searchable, role-scoped." },
  { icon: "▤", accent: C.amber,  title: "43 departments",         body: "All FUTO schools and administrative units pre-loaded and ready." },
  { icon: "◑", accent: C.red,    title: "Role-scoped access",     body: "Five tiers. Each sees only what their role permits." },
  { icon: "◻", accent: C.blue,   title: "Real-time inbox",        body: "Pending docs surface first. Badge counts tell you what needs action." },
];

// ── Role tree ─────────────────────────────────────────────────────────────────
const ROLES = [
  { id: "sys",   label: "Sys Admin",   sub: "Approves HOD + Dean",  badge: "Root", accent: C.red,    desc: "Oversees all roles, departments, and the full system-wide audit log." },
  { id: "hod",   label: "HOD",         sub: "Approves Dept. Admin", badge: null,   accent: C.amber,  desc: "Head of Department — approves Dept. Admins within their faculty." },
  { id: "dean",  label: "Dean",        sub: "Approves Dept. Admin", badge: null,   accent: C.amber,  desc: "Dean — approves Dept. Admins across their school." },
  { id: "dept",  label: "Dept. Admin", sub: "Approves Staff",       badge: null,   accent: C.blue,   desc: "Manages and approves Staff accounts within their department." },
  { id: "staff", label: "Staff",       sub: "Sends & receives",     badge: null,   accent: C.green,  desc: "Can send, receive, sign, accept, and reject documents." },
];

// ── Footer grid ───────────────────────────────────────────────────────────────
const GCOLS = 20; const GROWS = 6; const GTOTAL = GCOLS * GROWS;
const GCOLORS = [C.primary, C.blue, C.amber, C.green, C.purple, "#D1D5DB", "#E5E7EB"];

export default function LandingPage() {
  const [slide,      setSlide]      = useState(0);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [gridCells,  setGridCells]  = useState<string[]>(Array(GTOTAL).fill(C.white));
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => { const t = setInterval(() => setSlide(s => (s + 1) % 4), 4000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setActiveStep(s => (s + 1) % 4), 3200); return () => clearInterval(t); }, []);
  useEffect(() => {
    const t = setInterval(() => {
      setGridCells(prev => {
        const next = [...prev];
        for (let i = 0; i < 4; i++) {
          const idx = Math.floor(Math.random() * GTOTAL);
          next[idx] = Math.random() > 0.5 ? GCOLORS[Math.floor(Math.random() * GCOLORS.length)] : C.white;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(t);
  }, []);

  const activeRoleData = ROLES.find(r => r.id === activeRole);
  const currentSlide   = SLIDES[slide];

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.surface, color: C.primary, minHeight: "100vh" }}>

      {/* ══ HERO — sidebar + full-bleed panel ══════════════════════════ */}
      <section style={{ display: "flex", height: "100vh", minHeight: 600, maxHeight: 900 }}>

        {/* Sidebar */}
        <aside style={{ width: 196, flexShrink: 0, background: C.white, display: "flex", flexDirection: "column" as const, padding: "24px 14px 20px", gap: 8, borderRight: `1px solid ${C.tertiary}` }}>
          {/* Logo */}
          <div style={{ padding: "0 4px 18px", borderBottom: `1px solid ${C.tertiary}`, marginBottom: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="DocWaka" width={22} height={22} />
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.6px", color: C.primary }}>docwaka.</span>
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Document Tracking</div>
          </div>

          {/* Nav blocks */}
          {NAV_ITEMS.map((item, i) => (
            <a key={item.num} href={`#section-${i + 1}`} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "11px 12px", borderRadius: 10, background: item.bg, color: item.fg, textDecoration: "none" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginBottom: 3 }}>{item.num}</div>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: "15px" }}>{item.label}</div>
              </div>
              <span style={{ fontSize: 13, opacity: 0.55, marginTop: 1 }}>↗</span>
            </a>
          ))}

          <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 42, background: C.primary, color: C.white, borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: "none", marginTop: 4 }}>
            Get started ↗
          </Link>
          <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 34, border: `1px solid ${C.tertiary}`, background: C.white, color: C.secondary, borderRadius: 9999, fontSize: 11, fontWeight: 500, textDecoration: "none" }}>
            Sign in
          </Link>
        </aside>

        {/* Hero panel */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: C.primary, transition: "background 600ms" }}>
          {/* Grid pattern */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

          {/* Tunnel rings */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8%", zIndex: 1 }}>
            <div style={{ position: "relative", width: 380, height: 380 }}>
              {[1, 0.83, 0.67, 0.53, 0.41, 0.31, 0.23, 0.16].map((scale, i) => (
                <div key={i} style={{ position: "absolute", inset: 0, border: `1px solid rgba(255,255,255,${0.04 + i * 0.035})`, borderRadius: 10, transform: `scale(${scale})` }} />
              ))}
              {/* Accent glow using slide colour */}
              <div style={{ position: "absolute", inset: "44%", background: currentSlide.accentDot, borderRadius: "50%", opacity: 0.4, boxShadow: `0 0 60px 30px ${currentSlide.accentDot}40`, transition: "background 600ms, box-shadow 600ms" }} />
            </div>
          </div>

          {/* Corner status labels with accent colours */}
          <div style={{ position: "absolute", top: 20, left: 20, zIndex: 3, display: "flex", gap: 6 }}>
            {DOC_STATES.slice(0, 2).map(s => (
              <div key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.12)" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 3, display: "flex", gap: 6 }}>
            {DOC_STATES.slice(2).map(s => (
              <div key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.12)" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Hero text */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column" as const, justifyContent: "flex-end", padding: "48px 56px" }}>
            {/* Slide dots with accent colours */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {SLIDES.map((sl, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 20 : 5, height: 5, borderRadius: 9999, background: i === slide ? sl.accentDot : "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", transition: "all 300ms", padding: 0 }} />
              ))}
            </div>

            <h1 style={{ fontSize: "clamp(44px,5.5vw,76px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-2px", color: C.white, marginBottom: 18, whiteSpace: "pre-line" as const }}>
              {currentSlide.headline}
            </h1>
            <p style={{ fontSize: 15, lineHeight: "25px", color: "rgba(255,255,255,0.55)", maxWidth: 420, marginBottom: 28 }}>
              {currentSlide.sub}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 48, padding: "0 26px", background: C.white, color: C.primary, borderRadius: 9999, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Start routing documents ↗
              </Link>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 48, padding: "0 22px", background: "rgba(255,255,255,0.08)", color: C.white, borderRadius: 9999, fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.18)" }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CARD GRID ══════════════════════════════════════════════════ */}
      <section id="section-1" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 12, minHeight: 360 }}>

          {/* Left — stat card */}
          <div style={{ background: C.white, border: `1px solid ${C.tertiary}`, borderRadius: 14, padding: 32, display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 16 }}>By the numbers</div>
              {/* Accent number */}
              <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-3px", lineHeight: 1, color: C.blue, marginBottom: 8 }}>43</div>
              <div style={{ fontSize: 14, color: C.secondary, lineHeight: "21px" }}>departments & units<br />across FUTO, pre-loaded.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 7, marginTop: 16 }}>
              {["Schools of Engineering", "Schools of Science", "Schools of Management", "Administrative Units"].map(d => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#9CA3AF" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.blue, opacity: 0.5, display: "inline-block", flexShrink: 0 }} />{d}
                </div>
              ))}
            </div>
          </div>

          {/* Middle dark card */}
          <div style={{ background: C.primary, borderRadius: 14, padding: 32, display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 20 }}>The platform</div>
              <h2 style={{ fontSize: 30, fontWeight: 700, lineHeight: "38px", letterSpacing: "-0.6px", color: C.white, marginBottom: 14 }}>
                A shared way<br />of working.
              </h2>
              <p style={{ fontSize: 13, lineHeight: "21px", color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
                docwaka. connects every department at FUTO through a single, transparent document workflow — from the first dispatch to confirmed physical delivery.
              </p>
              {/* Accent dots for each state */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DOC_STATES.map(s => (
                  <div key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(255,255,255,0.06)", borderRadius: 9999 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 18px", background: C.white, color: C.primary, borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: "none", width: "fit-content", marginTop: 20 }}>
              Join the platform ↗
            </Link>
          </div>

          {/* Right — doc states */}
          <div style={{ background: C.surface, border: `1px solid ${C.tertiary}`, borderRadius: 14, padding: 32 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 20 }}>Document lifecycle</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {[
                { s: "Draft",     bg: "#F9FAFB", tc: "#6B7280", dc: "#D1D5DB", note: "Not yet sent" },
                { s: "Pending",   bg: C.amberBg, tc: C.amberText, dc: C.amber, note: "Awaiting action" },
                { s: "Accepted",  bg: C.greenBg, tc: C.greenText, dc: C.green, note: "Signed & approved" },
                { s: "Rejected",  bg: C.redBg,   tc: C.redText,   dc: C.red,   note: "Declined" },
                { s: "Delivered", bg: C.blueBg,  tc: C.blueText,  dc: C.blue,  note: "Delivery confirmed" },
              ].map(st => (
                <div key={st.s} style={{ padding: "9px 12px", background: st.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.dc, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: st.tc }}>{st.s}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#9CA3AF" }}>{st.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PILLARS ══════════════════════════════════════════════════ */}
      <section id="section-2" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 24 }}>Our approach</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {PILLARS.map(p => (
            <div key={p.title} style={{ background: p.bg, borderRadius: 14, padding: 32, minHeight: 260, border: p.bg !== C.primary ? `1px solid ${C.tertiary}` : "none", display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}>
              {/* Accent icon background */}
              <div style={{ width: 44, height: 44, borderRadius: 10, background: p.bg === C.primary ? "rgba(255,255,255,0.08)" : p.accent + "18", border: `1px solid ${p.bg === C.primary ? "rgba(255,255,255,0.15)" : p.accent + "30"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 20, color: p.bg === C.primary ? C.white : p.accent }}>{p.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: p.fg, letterSpacing: "-0.3px", marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 13, lineHeight: "20px", color: p.fg === C.white ? "rgba(255,255,255,0.5)" : C.secondary }}>{p.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Wide CTA banner with accent */}
        <Link href="/register" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: "0 28px", height: 60, background: C.primary, color: C.white, borderRadius: 14, textDecoration: "none" }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" }}>Ready to get started? Create your account now.</span>
          <span style={{ fontSize: 18, color: C.amber }}>↗</span>
        </Link>
      </section>

      {/* ══ HOW IT WORKS + ROLE TREE ═════════════════════════════════ */}
      <section id="section-3" style={{ background: C.white, borderTop: `1px solid ${C.tertiary}`, borderBottom: `1px solid ${C.tertiary}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>

          {/* Steps */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 14 }}>Process</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, lineHeight: "43px", letterSpacing: "-0.8px", color: C.primary, marginBottom: 32 }}>From dispatch<br />to delivery.</h2>
            {[
              { n: "01", t: "Dispatch",         b: "Send to any approved colleague. Attach a file, add context, hit send.", accent: C.blue   },
              { n: "02", t: "Sign",             b: "The recipient draws or types their signature before accepting.",         accent: C.purple },
              { n: "03", t: "Accept or reject", b: "Accept with signature on record, or reject with a mandatory reason.",   accent: C.green  },
              { n: "04", t: "Confirm delivery", b: "Recipient confirms physical delivery. Status moves to Delivered.",      accent: C.amber  },
            ].map((step, i) => (
              <div key={step.n} onClick={() => setActiveStep(i)} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: i < 3 ? `1px solid #F3F4F6` : "none", cursor: "pointer" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${activeStep === i ? step.accent : C.tertiary}`, background: activeStep === i ? step.accent : "transparent", color: activeStep === i ? C.white : "#9CA3AF", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transition: "all 200ms" }}>{step.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.primary, marginBottom: 3 }}>{step.t}</div>
                  <div style={{ fontSize: 12, lineHeight: "19px", color: "#9CA3AF", maxHeight: activeStep === i ? 60 : 0, overflow: "hidden", opacity: activeStep === i ? 1 : 0, transition: "max-height 300ms ease, opacity 280ms" }}>{step.b}</div>
                </div>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${activeStep === i ? step.accent : C.tertiary}`, background: activeStep === i ? step.accent : "transparent", flexShrink: 0, marginTop: 4, transition: "all 200ms" }} />
              </div>
            ))}
          </div>

          {/* Role tree */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 14 }}>Role hierarchy</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, lineHeight: "43px", letterSpacing: "-0.8px", color: C.primary, marginBottom: 28 }}>Five tiers.<br />One authority.</h2>
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center" }}>
              <RoleNode role={ROLES[0]} active={activeRole === ROLES[0].id} onClick={() => setActiveRole(activeRole === ROLES[0].id ? null : ROLES[0].id)} />
              <div style={{ width: 1, height: 20, background: C.tertiary }} />
              <div style={{ position: "relative", width: 270 }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: C.tertiary }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {[ROLES[1], ROLES[2]].map(r => (
                    <div key={r.id} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center" }}>
                      <div style={{ width: 1, height: 20, background: C.tertiary }} />
                      <RoleNode role={r} active={activeRole === r.id} onClick={() => setActiveRole(activeRole === r.id ? null : r.id)} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ width: 1, height: 20, background: C.tertiary }} />
              <RoleNode role={ROLES[3]} active={activeRole === ROLES[3].id} onClick={() => setActiveRole(activeRole === ROLES[3].id ? null : ROLES[3].id)} />
              <div style={{ width: 1, height: 20, background: C.tertiary }} />
              <RoleNode role={ROLES[4]} active={activeRole === ROLES[4].id} onClick={() => setActiveRole(activeRole === ROLES[4].id ? null : ROLES[4].id)} />
            </div>
            <div style={{ marginTop: 18, padding: "12px 16px", background: C.surface, border: `1px solid ${C.tertiary}`, borderRadius: 10, fontSize: 12, color: C.primary, display: "flex", alignItems: "center", minHeight: 44 }}>
              {activeRoleData
                ? <><span style={{ width: 7, height: 7, borderRadius: "50%", background: activeRoleData.accent, display: "inline-block", marginRight: 8, flexShrink: 0 }} /><span><strong>{activeRoleData.label}</strong> — {activeRoleData.desc}</span></>
                : <span style={{ color: "#9CA3AF" }}>Click any role to learn more.</span>}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES GRID ════════════════════════════════════════════ */}
      <section id="section-4" style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 20 }}>Features</div>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.8px", color: C.primary, marginBottom: 36, lineHeight: "43px" }}>
          Everything the university needs.<br />Nothing it doesn&apos;t.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: C.tertiary, border: `1px solid ${C.tertiary}`, borderRadius: 14, overflow: "hidden" }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: C.white, padding: "28px 26px" }}>
              {/* Accent icon */}
              <div style={{ width: 36, height: 36, borderRadius: 8, background: f.accent + "12", border: `1px solid ${f.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 16, color: f.accent }}>{f.icon}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 6, letterSpacing: "-0.1px" }}>{f.title}</div>
              <div style={{ fontSize: 12, lineHeight: "19px", color: "#9CA3AF" }}>{f.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA SPLIT ════════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 64px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
        <div style={{ background: C.primary, borderRadius: 14, padding: "52px 40px", display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 14 }}>Ready?</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, lineHeight: "40px", letterSpacing: "-0.6px", color: C.white, marginBottom: 12 }}>Your documents<br />are already waiting.</h2>
            <p style={{ fontSize: 13, lineHeight: "21px", color: "rgba(255,255,255,0.4)", marginBottom: 28, maxWidth: 340 }}>Create an account, get approved by your department administrator, and start routing documents the right way.</p>
          </div>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 22px", background: C.white, color: C.primary, borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: "none", width: "fit-content" }}>
            Create your account →
          </Link>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.tertiary}`, borderRadius: 14, padding: "52px 40px", display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 14 }}>Already registered?</div>
            <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.4px", color: C.primary, marginBottom: 8, lineHeight: "34px" }}>Sign in to<br />your account.</h3>
            <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: "20px", marginBottom: 28 }}>Your inbox, outbox, and audit trail are waiting.</p>
          </div>
          <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 44, background: C.primary, color: C.white, borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Sign in →
          </Link>
        </div>
      </div>

      {/* ══ FOOTER — flickering grid ══════════════════════════════════ */}
      <footer style={{ background: C.surface, borderTop: `1px solid ${C.tertiary}`, position: "relative", overflow: "hidden" }}>
        <style>{`.marquee-track{display:flex;animation:marquee 30s linear infinite;white-space:nowrap;}`}</style>

        {/* Flicker grid */}
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `repeat(${GCOLS},1fr)`, gridTemplateRows: `repeat(${GROWS},1fr)`, zIndex: 0, pointerEvents: "none" }}>
          {gridCells.map((c, i) => <div key={i} style={{ background: c, transition: "background 300ms ease", opacity: 0.08 }} />)}
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "64px 32px 36px" }}>
          {/* Big wordmark */}
          <div style={{ fontSize: "clamp(56px,9vw,128px)", fontWeight: 800, color: C.primary, letterSpacing: "-5px", lineHeight: 0.9, marginBottom: 48, opacity: 0.85 }}>
            docwaka.
          </div>

          {/* Accent accent row under wordmark */}
          <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
            {[C.blue, C.amber, C.green, C.purple, C.red].map(c => (
              <div key={c} style={{ height: 3, flex: 1, background: c, borderRadius: 9999, opacity: 0.5 }} />
            ))}
          </div>

          {/* Footer meta */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, paddingTop: 20, borderTop: `1px solid ${C.tertiary}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: C.primary }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="DocWaka" width={18} height={18} />DocWaka
            </div>
            <p style={{ fontSize: 11, color: "#9CA3AF" }}>© {new Date().getFullYear()} Federal University of Technology Owerri — Document Workflow & Tracking System</p>
            <div style={{ display: "flex", gap: 14 }}>
              <Link href="/login"    style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "none" }}>Sign in</Link>
              <Link href="/register" style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "none" }}>Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── RoleNode ──────────────────────────────────────────────────────────────────
function RoleNode({ role, active, onClick }: { role: typeof ROLES[0]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      position: "relative", background: active ? role.accent : C.white,
      border: `1px solid ${active ? role.accent : C.tertiary}`,
      borderRadius: 10, padding: "10px 18px", textAlign: "center",
      minWidth: 106, cursor: "pointer",
      transform: active ? "translateY(-2px)" : "none",
      boxShadow: active ? `0 4px 16px ${role.accent}30` : "none",
      transition: "all 150ms", fontFamily: "inherit",
    }}>
      {role.badge && (
        <span style={{ position: "absolute", top: -8, right: -8, background: role.accent, color: C.white, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 9999 }}>
          {role.badge}
        </span>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: active ? C.white : C.primary, letterSpacing: "-0.2px" }}>{role.label}</div>
      <div style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.6)" : "#9CA3AF", marginTop: 2, whiteSpace: "nowrap" as const }}>{role.sub}</div>
    </button>
  );
}
