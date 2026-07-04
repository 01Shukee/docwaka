// src/components/layout/SidebarLink.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface SidebarLinkProps {
  href:       string;
  label:      string;
  icon:       LucideIcon;
  badge?:     number;
  exact?:     boolean;
}

/**
 * DESIGN.md: Navigation items are minimal text links — not boxed tabs.
 * Icons should be monochrome and mostly black or gray.
 *
 * Active state uses on-surface (#141414) text with surface (#F7F7F7) background.
 * Inactive state uses secondary (#707070) text, no background.
 */
export default function SidebarLink({
  href,
  label,
  icon: Icon,
  badge,
  exact = false,
}: SidebarLinkProps) {
  const pathname  = usePathname();
  const isActive  = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 px-3 py-2 rounded-md",
        "text-[14px] leading-5 font-medium transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isActive
          ? "bg-surface text-on-surface"
          : "text-secondary hover:text-on-surface hover:bg-surface/60",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon */}
      <Icon
        size={16}
        strokeWidth={isActive ? 2 : 1.75}
        className={isActive ? "text-primary" : "text-secondary group-hover:text-on-surface"}
      />

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Badge — e.g. pending inbox count */}
      {badge != null && badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-neutral text-[11px] font-semibold leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
