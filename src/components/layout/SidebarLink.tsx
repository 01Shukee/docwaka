// src/components/layout/SidebarLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Icon } from "@tabler/icons-react";

interface SidebarLinkProps {
  href:         string;
  label:        string;
  icon:         Icon;
  badge?:       number;
  exact?:       boolean;
  onClick?:     () => void;
  accentClass?: string;
}

export default function SidebarLink({
  href, label, icon: Icon, badge, exact = false, onClick, accentClass = "",
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 px-3 py-2 rounded-md",
        "text-[14px] font-medium transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "bg-surface text-on-surface"
          : `text-secondary hover:text-on-surface hover:bg-surface/60 ${accentClass}`,
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon
        size={16}
        stroke={isActive ? 2 : 1.5}
        className={isActive ? "text-[#3B82F6]" : "text-secondary group-hover:text-on-surface"}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}