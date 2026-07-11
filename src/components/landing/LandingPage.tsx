// src/components/landing/LandingPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DocwakaWordmark } from "@/components/layout/Logo";

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TICKER = [
  { bg: "#141414", color: "#fff",    t: "Document Routing"     },
  { bg: "#F7F7F7", color: "#141414", t: "Digital Signatures"   },
  { bg: "#141414", color: "#fff",    t: "Immutable Audit Trail" },
  { bg: "#F7F7F7", color: "#141414", t: "Role-Gated Access"    },
  { bg: "#141414", color: "#fff",    t: "57 Departments"        },
  { bg: "#F7F7F7", color: "#141414", t: "5-State Lifecycle"    },
  { bg: "#141414", color: "#fff",    t: "Five-Tier Hierarchy"   },
  { bg: "#F7F7F7", color: "#141414", t: "Real-Time Tracking"   },
];

// ─── Hero slides ──────────────────────────────────────────────────────────────
const SLIDES = [
  { h: "Track every\ndocument,\nevery step.",  s: "FUTO's official document routing and tracking platform — no paperwork chase." },
  { h: "Five roles.\nOne clear\nchain.",        s: "Every account approved by the tier above it. Access always scoped." },
  { h: "Nothing\nlost.\nEver.",                 s: "Every dispatch, signature, acceptance and delivery — written once, never changed." },
  { h: "Start in\nminutes.\nNot days.",          s: "Register, get approved by your administrator, and start routing immediately." },
];

// ─── Schools ──────────────────────────────────────────────────────────────────
const SCHOOLS = [
  { abbr: "SAAT",  name: "Agriculture & Agricultural Technology", depts: 8,  color: "#FFFBEB", tc: "#B45309" },
  { abbr: "SBMS",  name: "Basic Medical Sciences",                depts: 2,  color: "#FEF2F2", tc: "#991B1B" },
  { abbr: "SOBS",  name: "Biological Sciences",                   depts: 5,  color: "#ECFDF5", tc: "#047857" },
  { abbr: "SEET",  name: "Engineering & Engineering Technology",  depts: 9,  color: "#EFF6FF", tc: "#1D4ED8" },
  { abbr: "SESET", name: "Electrical Systems & Eng. Technology",  depts: 6,  color: "#EEF2FF", tc: "#4338CA" },
  { abbr: "SOES",  name: "Environmental Sciences",                depts: 7,  color: "#FDF4FF", tc: "#7E22CE" },
  { abbr: "SOHT",  name: "Health Technology",                     depts: 5,  color: "#FFF7ED", tc: "#C2410C" },
  { abbr: "SICT",  name: "Information & Communication Technology",depts: 4,  color: "#F0FDF4", tc: "#15803D" },
  { abbr: "SLIT",  name: "Logistics & Innovation Technology",     depts: 5,  color: "#F5F3FF", tc: "#6D28D9" },
  { abbr: "SOPS",  name: "Physical Sciences",                     depts: 6,  color: "#FEFCE8", tc: "#854D0E" },
  { abbr: "SPGS",  name: "Postgraduate Studies",                  depts: 1,  color: "#F8FAFC", tc: "#475569" },
  { abbr: "ADMIN", name: "Administrative Units",                  depts: 14, color: "#F7F7F7", tc: "#374151" },
];

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", t: "Dispatch",          b: "Send to any approved colleague across any department. Attach a file, add context, hit send." },
  { n: "02", t: "Sign",              b: "Recipient draws or types their signature directly in the browser before accepting." },
  { n: "03", t: "Accept or reject",  b: "Accept with a signature on record, or reject with a mandatory written reason." },
  { n: "04", t: "Confirm delivery",  b: "Recipient confirms physical delivery. Document status moves to Delivered — permanently." },
];

// ─── Roles ────────────────────────────────────────────────────────────────────
const ROLES = [
  { id: "sys",   l: "Sys Admin",   s: "Approves HOD + Dean",   b: "Root", d: "Oversees all roles, departments, and the full system-wide audit log." },
  { id: "hod",   l: "HOD",         s: "Approves Dept. Admin",  b: null,   d: "Head of Department — approves Dept. Admins within their faculty." },
  { id: "dean",  l: "Dean",        s: "Approves Dept. Admin",  b: null,   d: "Dean — approves Dept. Admins across their school." },
  { id: "dept",  l: "Dept. Admin", s: "Approves Staff",        b: null,   d: "Manages and approves Staff accounts within their department." },
  { id: "staff", l: "Staff",       s: "Sends & receives docs", b: null,   d: "Can send, receive, sign, accept, and reject documents." },
];

// ─── Doc states ───────────────────────────────────────────────────────────────
const STATES = [
  { l: "Pending",   bg: "#FFFBEB", tc: "#B45309", dc: "#F59E0B", note: "Awaiting action"      },
  { l: "Accepted",  bg: "#ECFDF5", tc: "#047857", dc: "#10B981", note: "Signed & approved"    },
  { l: "Rejected",  bg: "#FEF2F2", tc: "#991B1B", dc: "#D92D20", note: "Declined with reason" },
  { l: "Delivered", bg: "#EFF6FF", tc: "#1D4ED8", dc: "#3B82F6", note: "Delivery confirmed"   },
];

// ─── Grid ─────────────────────────────────────────────────────────────────────
const GCOLS = 18; const GROWS = 7; const GTOTAL = GCOLS * GROWS;
const GCOLORS = ["#141414","#D1D5DB","#9CA3AF","#6B7280","#E5E7EB"];

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [slide,      setSlide]      = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [grid,       setGrid]       = useState<string[]>([]);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => { const t = setInterval(() => setSlide(s => (s+1)%4), 4000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setActiveStep(s => (s+1)%4), 3200); return () => clearInterval(t); }, []);
  useEffect(() => {
    setGrid(Array(GTOTAL).fill("#fff"));
    const t = setInterval(() => {
      setGrid(prev => {
        const next = [...prev];
        for (let i = 0; i < 5; i++) {
          const idx = Math.floor(Math.random() * GTOTAL);
          next[idx] = Math.random() > 0.4 ? GCOLORS[Math.floor(Math.random() * GCOLORS.length)] : "#fff";
        }
        return next;
      });
    }, 220);
    return () => clearInterval(t);
  }, []);

  const curSlide   = SLIDES[slide];
  const activeRoleData = ROLES.find(r => r.id === activeRole);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "#141414", background: "#fff" }}>

      {/* ═══ TICKER ════════════════════════════════════════════════════════ */}
      <div style={{ overflow: "hidden", borderBottom: "1px solid #E5E7EB", height: 40 }}>
        <style>{`@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .mq-t{display:flex;animation:mq 28s linear infinite;white-space:nowrap}.mq-t:hover{animation-play-state:paused}`}</style>
        <div className="mq-t" style={{ height: 40, alignItems: "center" }}>
          {[...TICKER,...TICKER].map((item,i) => (
            <div key={i} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"0 20px", height:40, background:item.bg, color:item.color, fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", borderRight:"1px solid #E5E7EB", flexShrink:0 }}>
              <span style={{ width:4, height:4, borderRadius:"50%", background:item.color, opacity:0.5, display:"inline-block" }} />
              {item.t}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ NAV ═══════════════════════════════════════════════════════════ */}
      <nav className="flex items-center justify-between px-4 sm:px-8 lg:px-10 py-4 max-w-6xl mx-auto">
        <DocwakaWordmark size={17} logoSize={52} variant="light" />
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/login"    className="text-[13px] font-medium text-secondary px-4 py-2 rounded-full border border-tertiary hover:bg-surface transition-colors no-underline">Sign in</Link>
          <Link href="/register" className="text-[13px] font-bold text-white px-4 py-2 rounded-full hover:opacity-85 transition-opacity no-underline" style={{ background:"#141414" }}>Get started →</Link>
        </div>
        <button onClick={() => setMenuOpen(v=>!v)} className="sm:hidden p-2 text-secondary" aria-label="Menu">
          <div className="w-5 space-y-1"><div className="h-0.5 bg-current"/><div className="h-0.5 bg-current"/><div className="h-0.5 bg-current"/></div>
        </button>
      </nav>

      {menuOpen && (
        <div className="sm:hidden border-t border-tertiary bg-white px-4 py-3 flex flex-col gap-2">
          <Link href="/login"    onClick={()=>setMenuOpen(false)} className="flex items-center justify-center h-11 rounded-full border border-tertiary text-[14px] font-medium text-secondary no-underline">Sign in</Link>
          <Link href="/register" onClick={()=>setMenuOpen(false)} className="flex items-center justify-center h-11 rounded-full text-[14px] font-bold text-white no-underline" style={{ background:"#141414" }}>Get started →</Link>
        </div>
      )}

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="mx-3 sm:mx-6 lg:mx-10 mb-4 rounded-2xl overflow-hidden" style={{ background:"#141414", minHeight:"62vh" }}>
        <div style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize:"40px 40px" }} className="absolute inset-0 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row" style={{ minHeight:"62vh" }}>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:flex flex-col w-[210px] shrink-0 border-r border-white/10 p-5 gap-2.5">
            <DocwakaWordmark size={15} logoSize={48} variant="dark" />
            <div className="mt-3 flex flex-col gap-2">
              {[{n:"01",l:"Document Routing"},{n:"02",l:"Role Hierarchy"},{n:"03",l:"Audit & Tracking"},{n:"04",l:"Get Started"}].map((item,i) => (
                <div key={item.n} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"10px 12px", borderRadius:8, background:`rgba(255,255,255,${0.03 + i*0.02})`, border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", marginBottom:3 }}>{item.n}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{item.l}</div>
                  </div>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>↗</span>
                </div>
              ))}
            </div>
            <Link href="/register" className="mt-auto flex items-center justify-center h-10 rounded-full text-[13px] font-bold text-on-surface hover:opacity-90 no-underline" style={{ background:"#fff" }}>Get started ↗</Link>
            <Link href="/login"    className="flex items-center justify-center h-9 rounded-full text-[12px] font-medium text-secondary no-underline" style={{ border:"1px solid rgba(255,255,255,0.12)" }}>Sign in</Link>
          </aside>

          {/* Hero body */}
          <div className="flex-1 flex flex-col justify-end p-5 sm:p-8 lg:p-10">
            {/* Slide dots */}
            <div className="flex gap-1.5 mb-5">
              {SLIDES.map((_,i) => (
                <button key={i} onClick={()=>setSlide(i)} style={{ width:i===slide?24:6, height:6, borderRadius:9999, background:i===slide?"#fff":"rgba(255,255,255,0.25)", border:"none", cursor:"pointer", transition:"all 300ms", padding:0 }} />
              ))}
            </div>

            <h1 className="text-white font-black mb-4 whitespace-pre-line" style={{ fontSize:"clamp(38px,7vw,80px)", lineHeight:1.0, letterSpacing:"-2px", textShadow:"0 2px 32px rgba(0,0,0,0.4)" }}>
              {curSlide.h}
            </h1>
            <p className="text-white/60 mb-7 text-[14px] sm:text-[16px] leading-6" style={{ maxWidth:460 }}>
              {curSlide.s}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 mb-7">
              <Link href="/register" className="flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14px] sm:text-[15px] font-bold text-on-surface hover:opacity-90 no-underline" style={{ background:"#fff" }}>
                Start routing documents ↗
              </Link>
              <Link href="/login" className="flex items-center justify-center gap-2 h-12 px-5 rounded-full text-[14px] font-semibold text-white no-underline" style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)" }}>
                Sign in
              </Link>
            </div>

            {/* State pills */}
            <div className="flex flex-wrap gap-2">
              {STATES.map(s => (
                <div key={s.l} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background:s.bg }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:s.dc, display:"inline-block" }} />
                  <span style={{ fontSize:11, fontWeight:700, color:s.tc }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCHOOLS GRID ══════════════════════════════════════════════════ */}
      <section className="px-3 sm:px-6 lg:px-10 pb-4 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">Coverage</p>
            <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight leading-tight">
              59 departments.<br />
              <span className="text-[#9CA3AF]">11 schools. One platform.</span>
            </h2>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[13px] text-[#9CA3AF] leading-5">Every department, faculty, and<br />administrative unit at FUTO.</p>
          </div>
        </div>

        {/* School cards — 2-col mobile, 4-col lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
          {SCHOOLS.map(s => (
            <div key={s.abbr} className="rounded-xl p-4 border border-[#E5E7EB] flex flex-col gap-2 hover:-translate-y-0.5 transition-transform" style={{ background:s.color }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize:10, fontWeight:800, color:s.tc, letterSpacing:"0.08em" }}>{s.abbr}</span>
                <span style={{ fontSize:18, fontWeight:800, color:s.tc }}>{s.depts}</span>
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:s.tc, lineHeight:"16px", opacity:0.8 }}>{s.name}</div>
              <div style={{ fontSize:10, color:s.tc, opacity:0.5 }}>{s.depts} dept{s.depts !== 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>

        {/* Three-col feature row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Dark CTA */}
          <div className="rounded-xl p-6 sm:p-7 flex flex-col justify-between sm:col-span-1" style={{ background:"#141414", minHeight:180 }}>
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mb-3">The platform</p>
              <h3 className="text-[20px] sm:text-[22px] font-bold text-white leading-tight mb-2">A shared way<br />of working.</h3>
              <p className="text-[12px] text-white/40 leading-5">docwaka. connects every department through a single, transparent workflow.</p>
            </div>
            <Link href="/register" className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12px] font-bold text-on-surface w-fit no-underline" style={{ background:"#fff" }}>
              Join now ↗
            </Link>
          </div>

          {/* States card */}
          <div className="rounded-xl border border-[#E5E7EB] p-5 sm:col-span-2" style={{ background:"#F7F7F7" }}>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] mb-3">Document lifecycle</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ l:"Draft", bg:"#F9FAFB", tc:"#6B7280", dc:"#D1D5DB", note:"Not yet dispatched" }, ...STATES].map(st => (
                <div key={st.l} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background:st.bg }}>
                  <div className="flex items-center gap-2">
                    <span style={{ width:6, height:6, borderRadius:"50%", background:st.dc, display:"inline-block", flexShrink:0 }} />
                    <span style={{ fontSize:12, fontWeight:700, color:st.tc }}>{st.l}</span>
                  </div>
                  <span style={{ fontSize:10, color:"#9CA3AF" }} className="hidden sm:block">{st.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section style={{ background:"#F7F7F7", borderTop:"1px solid #E5E7EB", borderBottom:"1px solid #E5E7EB" }}>
        <div className="px-4 sm:px-6 lg:px-10 py-10 sm:py-14 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

            {/* Steps */}
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.12em] mb-3">Process</p>
              <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight leading-tight text-[#141414] mb-6">
                Four steps.<br />Zero lost documents.
              </h2>
              {STEPS.map((step, i) => (
                <div key={step.n} onClick={() => setActiveStep(i)} className="flex gap-4 py-4 border-b border-[#EBEBEB] last:border-none cursor-pointer group">
                  <div style={{ fontSize:10, fontWeight:800, color: activeStep===i ? "#141414" : "#D1D5DB", minWidth:24, marginTop:3, transition:"color 200ms" }}>{step.n}</div>
                  <div className="flex-1">
                    <div style={{ fontSize:14, fontWeight:700, color:"#141414", marginBottom:3 }}>{step.t}</div>
                    <div style={{ fontSize:12, lineHeight:"20px", color:"#9CA3AF", maxHeight: activeStep===i ? 80 : 0, overflow:"hidden", opacity: activeStep===i ? 1 : 0, transition:"max-height 300ms ease, opacity 280ms ease" }}>{step.b}</div>
                  </div>
                  <div style={{ width:16, height:16, borderRadius:"50%", border:`1.5px solid ${activeStep===i ? "#141414" : "#E5E7EB"}`, background: activeStep===i ? "#141414" : "transparent", flexShrink:0, marginTop:3, transition:"all 200ms" }} />
                </div>
              ))}
            </div>

            {/* Role tree */}
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.12em] mb-3">Role hierarchy</p>
              <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight leading-tight text-[#141414] mb-6">
                Five tiers.<br />One chain of authority.
              </h2>
              <div className="flex flex-col items-center">
                <RoleNode role={ROLES[0]} active={activeRole===ROLES[0].id} onClick={() => setActiveRole(activeRole===ROLES[0].id ? null : ROLES[0].id)} />
                <VLine />
                <div className="relative w-full max-w-[280px]">
                  <div className="absolute top-0 left-0 right-0 h-px bg-[#E5E7EB]" />
                  <div className="flex justify-between">
                    {[ROLES[1],ROLES[2]].map(r => (
                      <div key={r.id} className="flex flex-col items-center">
                        <VLine h={20} />
                        <RoleNode role={r} active={activeRole===r.id} onClick={() => setActiveRole(activeRole===r.id ? null : r.id)} />
                      </div>
                    ))}
                  </div>
                </div>
                <VLine />
                <RoleNode role={ROLES[3]} active={activeRole===ROLES[3].id} onClick={() => setActiveRole(activeRole===ROLES[3].id ? null : ROLES[3].id)} />
                <VLine />
                <RoleNode role={ROLES[4]} active={activeRole===ROLES[4].id} onClick={() => setActiveRole(activeRole===ROLES[4].id ? null : ROLES[4].id)} />
              </div>
              <div className="mt-4 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[12px] sm:text-[13px] min-h-[48px] flex items-center">
                {activeRoleData
                  ? <span><strong>{activeRoleData.l}</strong> — {activeRoleData.d}</span>
                  : <span style={{ color:"#9CA3AF" }}>Click any role to learn more.</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PILLARS ═══════════════════════════════════════════════════════ */}
      <section className="px-3 sm:px-6 lg:px-10 py-10 sm:py-14 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">Our approach</p>
            <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight leading-tight">Built for the institution.<br /><span className="text-[#9CA3AF]">Designed for the people.</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
          {[
            { bg:"#141414", fg:"#fff",    accent:"rgba(255,255,255,0.5)", icon:"◎", n:"01", t:"For People",  b:"Built for everyone at FUTO — from the Registrar to the newest staff member. No training required." },
            { bg:"#F7F7F7", fg:"#141414", accent:"#707070",               icon:"→", n:"02", t:"By Design",   b:"Every flow is deliberate. Document states, approval chains, and events follow strict, predictable rules." },
            { bg:"#E5E7EB", fg:"#141414", accent:"#707070",               icon:"♡", n:"03", t:"With Care",   b:"Nothing gets lost. Nothing goes unrecorded. Every document tracked from dispatch to confirmed delivery." },
          ].map(p => (
            <div key={p.t} className="rounded-xl p-6 sm:p-7 flex flex-col justify-between" style={{ background:p.bg, minHeight:220, border: p.bg !== "#141414" ? "1px solid #D1D5DB" : "none" }}>
              <div className="flex items-center justify-between mb-auto">
                <span style={{ fontSize:10, fontWeight:800, color: p.bg === "#141414" ? "rgba(255,255,255,0.3)" : "#9CA3AF", letterSpacing:"0.1em" }}>{p.n}</span>
                <span style={{ fontSize:22, color:p.fg }}>{p.icon}</span>
              </div>
              <div className="mt-6">
                <div style={{ fontSize:20, fontWeight:800, color:p.fg, letterSpacing:"-0.4px", marginBottom:8 }}>{p.t}</div>
                <div style={{ fontSize:12, lineHeight:"20px", color:p.accent }}>{p.b}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width CTA band */}
        <Link href="/register" className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 rounded-xl text-white hover:opacity-90 transition-opacity no-underline" style={{ background:"#141414" }}>
          <span className="text-[14px] sm:text-[16px] font-bold leading-tight">Ready to get started?<span className="hidden sm:inline"> Create your account now.</span></span>
          <span style={{ fontSize:20, marginLeft:16 }}>↗</span>
        </Link>
      </section>

      {/* ═══ MARQUEE STATS BAND ════════════════════════════════════════════ */}
      <div style={{ borderTop:"1px solid #E5E7EB", borderBottom:"1px solid #E5E7EB", overflow:"hidden" }}>
        <div className="flex">
          {[
            { n:"73",   l:"Depts & admin units"  },
            { n:"11",   l:"Academic schools"      },
            { n:"5",    l:"Role tiers"            },
            { n:"5",    l:"Document states"       },
            { n:"100%", l:"Events traceable"      },
            { n:"0",    l:"Documents ever lost"   },
          ].map((s,i) => (
            <div key={i} className="flex-1 border-r border-[#E5E7EB] last:border-none py-6 sm:py-8 text-center px-2" style={{ minWidth:0 }}>
              <div style={{ fontSize:"clamp(24px,4vw,44px)", fontWeight:800, letterSpacing:"-1px", color:"#141414", lineHeight:1 }}>{s.n}</div>
              <div style={{ fontSize:"clamp(9px,1.2vw,12px)", color:"#9CA3AF", marginTop:6, fontWeight:500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CTA SPLIT ═════════════════════════════════════════════════════ */}
      <section className="px-3 sm:px-6 lg:px-10 py-10 sm:py-14 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="rounded-xl p-6 sm:p-8 flex flex-col justify-between" style={{ background:"#141414", minHeight:220 }}>
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mb-4">Ready?</p>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight mb-3">Your documents<br />are already waiting.</h2>
            <p className="text-[12px] text-white/40 leading-5">Create an account, get approved by your administrator, and start routing the right way.</p>
          </div>
          <Link href="/register" className="mt-6 inline-flex items-center justify-center h-11 px-5 rounded-full text-[13px] sm:text-[14px] font-bold text-on-surface w-fit hover:opacity-90 no-underline" style={{ background:"#fff" }}>
            Create your account →
          </Link>
        </div>
        <div className="rounded-xl p-6 sm:p-8 flex flex-col justify-between border border-[#E5E7EB]" style={{ background:"#F7F7F7", minHeight:220 }}>
          <div>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] mb-4">Returning?</p>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#141414] leading-tight mb-3">Sign in to<br />your account.</h2>
            <p className="text-[12px] text-[#9CA3AF] leading-5">Your inbox, outbox, and audit trail are waiting.</p>
          </div>
          <Link href="/login" className="mt-6 flex items-center justify-center h-11 rounded-full text-[13px] sm:text-[14px] font-bold text-white hover:opacity-90 no-underline" style={{ background:"#141414" }}>
            Sign in →
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER + FLICKER GRID ═════════════════════════════════════════ */}
      <footer style={{ background:"#F7F7F7", borderTop:"1px solid #E5E7EB", position:"relative", overflow:"hidden" }}>
        {/* Flicker grid */}
        <div style={{ position:"absolute", inset:0, display:"grid", gridTemplateColumns:`repeat(${GCOLS},1fr)`, gridTemplateRows:`repeat(${GROWS},1fr)`, zIndex:0, pointerEvents:"none" }}>
          {grid.map((c,i) => <div key={i} style={{ background:c, transition:"background 280ms ease", opacity:0.1 }} />)}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-6">
          {/* Giant wordmark */}
          <div className="font-black text-[#141414] mb-8 sm:mb-12" style={{ fontSize:"clamp(48px,11vw,130px)", letterSpacing:"-4px", lineHeight:0.9, opacity:0.9 }}>
            docwaka.
          </div>
          {/* Sub-footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-[#E5E7EB]">
            <DocwakaWordmark size={13} logoSize={40} variant="light" />
            <p style={{ fontSize:11, color:"#9CA3AF" }}>© {new Date().getFullYear()} Federal University of Technology Owerri</p>
            <div className="flex gap-4">
              <Link href="/login"    style={{ fontSize:11, color:"#9CA3AF", textDecoration:"none" }}>Sign in</Link>
              <Link href="/register" style={{ fontSize:11, color:"#9CA3AF", textDecoration:"none" }}>Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function RoleNode({ role, active, onClick }: { role: typeof ROLES[0]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ position:"relative", background: active ? "#141414" : "#fff", border:`1px solid ${active ? "#141414" : "#E5E7EB"}`, borderRadius:10, padding:"10px 18px", textAlign:"center", minWidth:108, cursor:"pointer", transform: active ? "translateY(-2px)" : "none", boxShadow: active ? "0 4px 16px rgba(20,20,20,0.14)" : "none", transition:"all 150ms", fontFamily:"inherit" }}>
      {role.b && <span style={{ position:"absolute", top:-8, right:-8, background:"#141414", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:9999 }}>{role.b}</span>}
      <div style={{ fontSize:12, fontWeight:700, color: active ? "#fff" : "#141414" }}>{role.l}</div>
      <div style={{ fontSize:10, color: active ? "rgba(255,255,255,0.5)" : "#9CA3AF", marginTop:2, whiteSpace:"nowrap" }}>{role.s}</div>
    </button>
  );
}

function VLine({ h = 28 }: { h?: number }) {
  return <div style={{ width:1, height:h, background:"#E5E7EB" }} />;
}