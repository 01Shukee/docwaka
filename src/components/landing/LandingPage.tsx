// src/components/landing/LandingPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DocwakaWordmark } from "@/components/layout/Logo";

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

const SLIDES = [
  { h: "Track every\ndocument,\nevery step.",  s: "FUTO's official document routing and tracking platform — no paperwork chase." },
  { h: "Five roles.\nOne clear\nchain.",        s: "Every account approved by the tier above it. Access always scoped." },
  { h: "Nothing\nlost.\nEver.",                 s: "Every dispatch, signature, acceptance and delivery — written once, never changed." },
  { h: "Start in\nminutes.\nNot days.",          s: "Register, get approved by your administrator, and start routing immediately." },
];

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

const STEPS = [
  { n: "01", t: "Dispatch",          b: "Send to any approved colleague across any department. Attach a file, add context, hit send." },
  { n: "02", t: "Sign",              b: "Recipient draws or types their signature directly in the browser before accepting." },
  { n: "03", t: "Accept or reject",  b: "Accept with a signature on record, or reject with a mandatory written reason." },
  { n: "04", t: "Confirm delivery",  b: "Recipient confirms physical delivery. Document status moves to Delivered — permanently." },
];

const ROLES = [
  { id: "sys",   l: "Sys Admin",   s: "Approves HOD + Dean",   b: "Root", d: "Oversees all roles, departments, and the full system-wide audit log." },
  { id: "hod",   l: "HOD",         s: "Approves Dept. Admin",  b: null,   d: "Head of Department — approves Dept. Admins within their faculty." },
  { id: "dean",  l: "Dean",        s: "Approves Dept. Admin",  b: null,   d: "Dean — approves Dept. Admins across their school." },
  { id: "dept",  l: "Dept. Admin", s: "Approves Staff",        b: null,   d: "Manages and approves Staff accounts within their department." },
  { id: "staff", l: "Staff",       s: "Sends & receives docs", b: null,   d: "Can send, receive, sign, accept, and reject documents." },
];

const STATES = [
  { l: "Pending",   bg: "#FFFBEB", tc: "#B45309", dc: "#F59E0B", note: "Awaiting action"      },
  { l: "Accepted",  bg: "#ECFDF5", tc: "#047857", dc: "#10B981", note: "Signed & approved"    },
  { l: "Rejected",  bg: "#FEF2F2", tc: "#991B1B", dc: "#D92D20", note: "Declined with reason" },
  { l: "Delivered", bg: "#EFF6FF", tc: "#1D4ED8", dc: "#3B82F6", note: "Delivery confirmed"   },
];

const GCOLS = 18; const GROWS = 7; const GTOTAL = GCOLS * GROWS;
const GCOLORS = ["#141414","#D1D5DB","#9CA3AF","#6B7280","#E5E7EB"];

// ── Shared link style helpers (inline so no Tailwind class confusion) ─────────
const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 48, padding: "0 24px", borderRadius: 9999,
  background: "#141414", color: "#fff",
  fontSize: 14, fontWeight: 700, textDecoration: "none",
  border: "none", cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 48, padding: "0 20px", borderRadius: 9999,
  background: "rgba(255,255,255,0.08)", color: "#fff",
  fontSize: 14, fontWeight: 600, textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer",
};
const btnWhite: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 48, padding: "0 24px", borderRadius: 9999,
  background: "#fff", color: "#141414",
  fontSize: 14, fontWeight: 700, textDecoration: "none",
  border: "none", cursor: "pointer",
};

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

  const curSlide       = SLIDES[slide];
  const activeRoleData = ROLES.find(r => r.id === activeRole);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: "#141414", background: "#fff", scrollBehavior: "smooth" }}>

      {/* TICKER */}
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

      {/* NAV — links only, logo lives in the hero sidebar */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", maxWidth:1200, margin:"0 auto", padding:"16px 24px" }}>
        {/* Desktop links */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }} className="hidden sm:flex">
          <Link href="/login" style={{ fontSize:13, fontWeight:500, color:"#707070", padding:"8px 18px", borderRadius:9999, border:"1px solid #E5E7EB", textDecoration:"none", background:"#fff" }}>
            Sign in
          </Link>
          <Link href="/register" style={{ fontSize:13, fontWeight:700, color:"#fff", padding:"8px 18px", borderRadius:9999, background:"#141414", textDecoration:"none" }}>
            Get started →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v=>!v)}
          className="sm:hidden"
          aria-label="Menu"
          style={{ padding:8, background:"none", border:"none", cursor:"pointer", color:"#707070" }}
        >
          <div style={{ width:20, display:"flex", flexDirection:"column", gap:4 }}>
            <div style={{ height:2, background:"currentColor", borderRadius:2 }} />
            <div style={{ height:2, background:"currentColor", borderRadius:2 }} />
            <div style={{ height:2, background:"currentColor", borderRadius:2 }} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop:"1px solid #E5E7EB", background:"#fff", padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }} className="sm:hidden">
          <Link href="/login" onClick={()=>setMenuOpen(false)} style={{ display:"flex", alignItems:"center", justifyContent:"center", height:44, borderRadius:9999, border:"1px solid #E5E7EB", fontSize:14, fontWeight:500, color:"#707070", textDecoration:"none" }}>
            Sign in
          </Link>
          <Link href="/register" onClick={()=>setMenuOpen(false)} style={{ display:"flex", alignItems:"center", justifyContent:"center", height:44, borderRadius:9999, background:"#141414", fontSize:14, fontWeight:700, color:"#fff", textDecoration:"none" }}>
            Get started →
          </Link>
        </div>
      )}

      {/* HERO */}
      <section style={{ margin:"0 12px 16px", borderRadius:20, overflow:"hidden", background:"#141414", minHeight:"62vh" }}
        className="sm:mx-6 lg:mx-10">
        <div style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize:"40px 40px", position:"absolute", inset:0, pointerEvents:"none" }} />
        <div style={{ position:"relative", display:"flex", minHeight:"62vh" }} className="flex-col lg:flex-row">

          {/* Sidebar — desktop only, NO logo (already in nav) */}
          <aside className="hidden lg:flex" style={{ flexDirection:"column", width:210, flexShrink:0, borderRight:"1px solid rgba(255,255,255,0.1)", padding:20, gap:10 }}>
            <div style={{ marginBottom:4 }}>
              <DocwakaWordmark size={15} logoSize={44} variant="dark" />
            </div>
            {[
              { n:"01", l:"Coverage",       href:"#schools"   },
              { n:"02", l:"How it Works",   href:"#workflow"  },
              { n:"03", l:"Role Hierarchy", href:"#hierarchy" },
            ].map((item,i) => (
              <a
                key={item.n}
                href={item.href}
                style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"10px 12px", borderRadius:8, background:`rgba(255,255,255,${0.03 + i*0.02})`, border:"1px solid rgba(255,255,255,0.06)", textDecoration:"none", cursor:"pointer", transition:"background 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = `rgba(255,255,255,${0.03 + i*0.02})`; }}
              >
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", marginBottom:3 }}>{item.n}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{item.l}</div>
                </div>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>↗</span>
              </a>
            ))}
            <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:8 }}>
              <Link href="/register" style={{ ...btnWhite, height:40, fontSize:13 }}>Get started ↗</Link>
              <Link href="/login"    style={{ ...btnSecondary, height:36, fontSize:12, border:"1px solid rgba(255,255,255,0.12)" }}>Sign in</Link>
            </div>
          </aside>

          {/* Hero body */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px 20px 32px" }} className="sm:p-8 lg:p-10">
            {/* Slide dots */}
            <div style={{ display:"flex", gap:6, marginBottom:20 }}>
              {SLIDES.map((_,i) => (
                <button key={i} onClick={()=>setSlide(i)} style={{ width:i===slide?24:6, height:6, borderRadius:9999, background:i===slide?"#fff":"rgba(255,255,255,0.25)", border:"none", cursor:"pointer", transition:"all 300ms", padding:0 }} />
              ))}
            </div>

            <h1 style={{ fontSize:"clamp(38px,7vw,80px)", fontWeight:900, lineHeight:1.0, letterSpacing:"-2px", color:"#fff", whiteSpace:"pre-line", marginBottom:16, textShadow:"0 2px 32px rgba(0,0,0,0.4)" }}>
              {curSlide.h}
            </h1>
            <p style={{ color:"rgba(255,255,255,0.6)", marginBottom:28, maxWidth:460, fontSize:15, lineHeight:"26px" }}>
              {curSlide.s}
            </p>

            {/* CTA buttons */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:28 }}>
              <Link href="/register" style={{ ...btnWhite, fontSize:15 }}>Start routing documents ↗</Link>
              <Link href="/login"    style={{ ...btnSecondary, fontSize:14 }}>Sign in</Link>
            </div>

            {/* State pills */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {STATES.map(s => (
                <div key={s.l} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:9999, background:s.bg }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:s.dc, display:"inline-block" }} />
                  <span style={{ fontSize:11, fontWeight:700, color:s.tc }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SCHOOLS GRID */}
      <section id="schools" style={{ maxWidth:1200, margin:"0 auto", padding:"0 12px 16px", scrollMarginTop:24 }} className="sm:px-6 lg:px-10">
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
          <div>
            <p style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:4 }}>Coverage</p>
            <h2 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:800, letterSpacing:"-0.5px", lineHeight:"1.2" }}>
              11 schools.<br />
              <span style={{ color:"#9CA3AF" }}>57 departments. One platform.</span>
            </h2>
          </div>
          <p style={{ fontSize:13, color:"#9CA3AF", lineHeight:"20px", textAlign:"right" }} className="hidden sm:block">
            Every department, faculty, and<br />administrative unit at FUTO.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginBottom:12 }} className="sm:grid-cols-3 lg:grid-cols-4">
          {SCHOOLS.map(s => (
            <div key={s.abbr} style={{ background:s.color, border:"1px solid #E5E7EB", borderRadius:12, padding:14, display:"flex", flexDirection:"column", gap:6, transition:"transform 150ms" }}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="none")}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, fontWeight:800, color:s.tc, letterSpacing:"0.08em" }}>{s.abbr}</span>
                <span style={{ fontSize:18, fontWeight:800, color:s.tc }}>{s.depts}</span>
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:s.tc, lineHeight:"15px", opacity:0.8 }}>{s.name}</div>
              <div style={{ fontSize:10, color:s.tc, opacity:0.45 }}>{s.depts} dept{s.depts!==1?"s":""}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }} className="sm:grid-cols-3">
          {/* Dark card */}
          <div style={{ background:"#141414", borderRadius:12, padding:"24px 28px", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:180 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>One system, not eleven</p>
              <h3 style={{ fontSize:20, fontWeight:800, color:"#fff", lineHeight:"1.2", marginBottom:8 }}>Same rules,<br />every school.</h3>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:"18px" }}>A document from SAAT and one from SICT move through the exact same states, the exact same way. No department runs its own version of the process.</p>
            </div>
            <Link href="/register" style={{ marginTop:20, display:"inline-flex", alignItems:"center", height:36, padding:"0 16px", borderRadius:9999, background:"#fff", color:"#141414", fontSize:12, fontWeight:700, textDecoration:"none", width:"fit-content" }}>
              Join now ↗
            </Link>
          </div>

          {/* States card — spans 2 cols on sm+ */}
          <div style={{ background:"#F7F7F7", border:"1px solid #E5E7EB", borderRadius:12, padding:20 }} className="sm:col-span-2">
            <p style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Document lifecycle</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[{ l:"Draft", bg:"#F9FAFB", tc:"#6B7280", dc:"#D1D5DB", note:"Not yet dispatched" }, ...STATES].map(st => (
                <div key={st.l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", borderRadius:8, background:st.bg }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
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

      {/* HOW IT WORKS + ROLE TREE */}
      <section style={{ background:"#F7F7F7", borderTop:"1px solid #E5E7EB", borderBottom:"1px solid #E5E7EB" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 12px" }} className="sm:px-6 lg:px-10">
          <div style={{ display:"grid", gap:48 }} className="grid-cols-1 lg:grid-cols-2">

            {/* Steps */}
            <div id="workflow" style={{ scrollMarginTop:24 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Process</p>
              <h2 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:800, letterSpacing:"-0.5px", lineHeight:"1.2", marginBottom:24 }}>Four steps.<br />Zero lost documents.</h2>
              {STEPS.map((step,i) => (
                <div key={step.n} onClick={()=>setActiveStep(i)} style={{ display:"flex", gap:16, padding:"16px 0", borderBottom: i<3 ? "1px solid #EBEBEB" : "none", cursor:"pointer" }}>
                  <div style={{ fontSize:10, fontWeight:800, color: activeStep===i?"#141414":"#D1D5DB", minWidth:24, marginTop:3, transition:"color 200ms" }}>{step.n}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#141414", marginBottom:3 }}>{step.t}</div>
                    <div style={{ fontSize:12, lineHeight:"20px", color:"#9CA3AF", maxHeight: activeStep===i?80:0, overflow:"hidden", opacity: activeStep===i?1:0, transition:"max-height 300ms ease, opacity 280ms ease" }}>{step.b}</div>
                  </div>
                  <div style={{ width:16, height:16, borderRadius:"50%", border:`1.5px solid ${activeStep===i?"#141414":"#E5E7EB"}`, background: activeStep===i?"#141414":"transparent", flexShrink:0, marginTop:3, transition:"all 200ms" }} />
                </div>
              ))}
            </div>

            {/* Role tree */}
            <div id="hierarchy" style={{ scrollMarginTop:24 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Role hierarchy</p>
              <h2 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:800, letterSpacing:"-0.5px", lineHeight:"1.2", marginBottom:24 }}>Five tiers.<br />One chain of authority.</h2>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <RoleNode role={ROLES[0]} active={activeRole===ROLES[0].id} onClick={()=>setActiveRole(activeRole===ROLES[0].id?null:ROLES[0].id)} />
                <VLine />
                <div style={{ position:"relative", width:"100%", maxWidth:280 }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"#E5E7EB" }} />
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    {[ROLES[1],ROLES[2]].map(r=>(
                      <div key={r.id} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <VLine h={20} />
                        <RoleNode role={r} active={activeRole===r.id} onClick={()=>setActiveRole(activeRole===r.id?null:r.id)} />
                      </div>
                    ))}
                  </div>
                </div>
                <VLine />
                <RoleNode role={ROLES[3]} active={activeRole===ROLES[3].id} onClick={()=>setActiveRole(activeRole===ROLES[3].id?null:ROLES[3].id)} />
                <VLine />
                <RoleNode role={ROLES[4]} active={activeRole===ROLES[4].id} onClick={()=>setActiveRole(activeRole===ROLES[4].id?null:ROLES[4].id)} />
              </div>
              <div style={{ marginTop:16, padding:"12px 16px", background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, fontSize:13, minHeight:46, display:"flex", alignItems:"center" }}>
                {activeRoleData
                  ? <span><strong>{activeRoleData.l}</strong> — {activeRoleData.d}</span>
                  : <span style={{ color:"#9CA3AF" }}>Click any role to learn more.</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"48px 12px" }} className="sm:px-6 lg:px-10">
        <p style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>What actually changes</p>
        <h2 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:800, letterSpacing:"-0.5px", lineHeight:"1.2", marginBottom:24 }}>
          Three things stop happening<br /><span style={{ color:"#9CA3AF" }}>once you switch.</span>
        </h2>
        <div style={{ display:"grid", gap:10, marginBottom:10 }} className="grid-cols-1 sm:grid-cols-3">
          {[
            {
              bg:"#141414", fg:"#fff", accent:"rgba(255,255,255,0.5)", icon:"✎", n:"01",
              t:"\u201cWho signed off on this?\u201d",
              b:"Every acceptance is backed by a signature captured the moment it happened — drawn or typed, timestamped, and permanently attached to the document. Not a printed name. An actual record.",
            },
            {
              bg:"#F7F7F7", fg:"#141414", accent:"#707070", icon:"→", n:"02",
              t:"\u201cWhere is it stuck?\u201d",
              b:"Each handoff is logged the instant it happens. If a document is sitting in someone's inbox, you can see exactly who has it, since when, and what they're waiting on.",
            },
            {
              bg:"#E5E7EB", fg:"#141414", accent:"#707070", icon:"◉", n:"03",
              t:"\u201cDid it actually arrive?\u201d",
              b:"Approval isn't the finish line. The recipient has to confirm physical delivery before a document is marked Delivered — so approved and arrived are never confused again.",
            },
          ].map(p=>(
            <div key={p.t} style={{ background:p.bg, borderRadius:12, padding:"24px 28px", minHeight:220, display:"flex", flexDirection:"column", justifyContent:"space-between", border: p.bg!=="141414" ? "1px solid #D1D5DB" : "none" }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, fontWeight:800, color: p.bg==="#141414"?"rgba(255,255,255,0.3)":"#9CA3AF", letterSpacing:"0.1em" }}>{p.n}</span>
                <span style={{ fontSize:22, color:p.fg }}>{p.icon}</span>
              </div>
              <div style={{ marginTop:24 }}>
                <div style={{ fontSize:17, fontWeight:800, color:p.fg, letterSpacing:"-0.3px", marginBottom:10, fontStyle:"italic" }}>{p.t}</div>
                <div style={{ fontSize:12, lineHeight:"19px", color:p.accent }}>{p.b}</div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/register" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderRadius:12, background:"#141414", color:"#fff", textDecoration:"none" }}>
          <span style={{ fontSize:15, fontWeight:700 }}>See it working in your department.</span>
          <span style={{ fontSize:20 }}>↗</span>
        </Link>
      </section>

      {/* STATS BAND */}
      <div style={{ borderTop:"1px solid #E5E7EB", borderBottom:"1px solid #E5E7EB", overflow:"hidden" }}>
        <div style={{ display:"flex" }}>
          {[
            { n:"73",   l:"Depts & admin units" },
            { n:"11",   l:"Academic schools"    },
            { n:"5",    l:"Role tiers"          },
            { n:"100%", l:"Events traceable"    },
            { n:"0",    l:"Documents lost"      },
          ].map((s,i)=>(
            <div key={i} style={{ flex:1, borderRight: i<4?"1px solid #E5E7EB":"none", padding:"24px 8px", textAlign:"center", minWidth:0 }}>
              <div style={{ fontSize:"clamp(22px,4vw,44px)", fontWeight:800, letterSpacing:"-1px", color:"#141414", lineHeight:1 }}>{s.n}</div>
              <div style={{ fontSize:"clamp(9px,1.2vw,12px)", color:"#9CA3AF", marginTop:6, fontWeight:500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SPLIT */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"48px 12px" }} className="sm:px-6 lg:px-10">
        <div style={{ display:"grid", gap:10 }} className="grid-cols-1 sm:grid-cols-2">
          <div style={{ background:"#141414", borderRadius:12, padding:"32px 28px", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:220 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Ready?</p>
              <h2 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:800, color:"#fff", lineHeight:"1.2", marginBottom:10 }}>Your documents<br />are already waiting.</h2>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:"18px" }}>Register, get approved by your department administrator, and your first document can go out today.</p>
            </div>
            <Link href="/register" style={{ ...btnWhite, marginTop:20, width:"fit-content", height:44, fontSize:14 }}>
              Create your account →
            </Link>
          </div>
          <div style={{ background:"#F7F7F7", border:"1px solid #E5E7EB", borderRadius:12, padding:"32px 28px", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:220 }}>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Returning?</p>
              <h2 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:800, color:"#141414", lineHeight:"1.2", marginBottom:10 }}>Sign in to<br />your account.</h2>
              <p style={{ fontSize:12, color:"#9CA3AF", lineHeight:"18px" }}>Your inbox, outbox, and audit trail are waiting.</p>
            </div>
            <Link href="/login" style={{ ...btnPrimary, marginTop:20, height:44, fontSize:14 }}>
              Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"#F7F7F7", borderTop:"1px solid #E5E7EB", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, display:"grid", gridTemplateColumns:`repeat(${GCOLS},1fr)`, gridTemplateRows:`repeat(${GROWS},1fr)`, zIndex:0, pointerEvents:"none" }}>
          {grid.map((c,i) => <div key={i} style={{ background:c, transition:"background 280ms ease", opacity:0.1 }} />)}
        </div>
        <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"48px 16px 24px" }} className="sm:px-6 lg:px-10">
          <div style={{ fontSize:"clamp(48px,11vw,130px)", fontWeight:900, color:"#141414", letterSpacing:"-4px", lineHeight:0.9, opacity:0.9, marginBottom:40 }}>
            docwaka.
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:16, paddingTop:20, borderTop:"1px solid #E5E7EB" }}>
            <DocwakaWordmark size={13} logoSize={40} variant="light" />
            <p style={{ fontSize:11, color:"#9CA3AF" }}>© {new Date().getFullYear()} Federal University of Technology Owerri</p>
            <div style={{ display:"flex", gap:16 }}>
              <Link href="/login"    style={{ fontSize:11, color:"#9CA3AF", textDecoration:"none" }}>Sign in</Link>
              <Link href="/register" style={{ fontSize:11, color:"#9CA3AF", textDecoration:"none" }}>Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleNode({ role, active, onClick }: { role: typeof ROLES[0]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ position:"relative", background: active?"#141414":"#fff", border:`1px solid ${active?"#141414":"#E5E7EB"}`, borderRadius:10, padding:"10px 18px", textAlign:"center", minWidth:108, cursor:"pointer", transform: active?"translateY(-2px)":"none", boxShadow: active?"0 4px 16px rgba(20,20,20,0.14)":"none", transition:"all 150ms", fontFamily:"inherit" }}>
      {role.b && <span style={{ position:"absolute", top:-8, right:-8, background:"#141414", color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:9999 }}>{role.b}</span>}
      <div style={{ fontSize:12, fontWeight:700, color: active?"#fff":"#141414" }}>{role.l}</div>
      <div style={{ fontSize:10, color: active?"rgba(255,255,255,0.5)":"#9CA3AF", marginTop:2, whiteSpace:"nowrap" }}>{role.s}</div>
    </button>
  );
}

function VLine({ h = 28 }: { h?: number }) {
  return <div style={{ width:1, height:h, background:"#E5E7EB" }} />;
}