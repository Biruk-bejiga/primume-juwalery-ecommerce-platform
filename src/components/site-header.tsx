"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { brandName, navLinks } from "@/lib/constants";
import type { UserSession } from "@/lib/types";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [user, setUser] = useState<UserSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [hasAdminKey, setHasAdminKey] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as { user: UserSession | null };
        setUser(data.user || null);
      } catch {
        setUser(null);
      } finally {
        setSessionLoaded(true);
      }
    }

    loadSession().catch(() => {
      setSessionLoaded(true);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_api_key");
    setHasAdminKey(Boolean(saved));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const headerLinks = useMemo(() => {
    const links: Array<{ label: string; href: string }> = [
      ...navLinks,
      { label: "Track Order", href: "/track-order" }
    ];

    if (sessionLoaded && user) {
      links.push({ label: "Wishlist", href: "/wishlist" });
      links.push({ label: "Account", href: "/account" });
    } else if (sessionLoaded) {
      links.push({ label: "Login", href: "/auth?mode=login" });
      links.push({ label: "Sign up", href: "/auth?mode=register" });
    }

    links.push({ label: hasAdminKey ? "Admin" : "Admin Login", href: hasAdminKey ? "/admin" : "/admin/login" });
    return links;
  }, [hasAdminKey, sessionLoaded, user]);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-2xl tracking-wide text-ink">
          {brandName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {headerLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  active ? "text-brand-700" : "text-ink/80 hover:text-brand-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {sessionLoaded && user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm font-medium text-ink/80 transition hover:text-brand-600"
            >
              Logout
            </button>
          ) : null}
        </nav>

        <Link
          href="/cart"
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-brand-400"
        >
          <ShoppingBag size={16} />
          <span>Cart</span>
          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{itemCount}</span>
        </Link>
      </div>

      <div className="border-t border-amber-100/70 bg-white/80 md:hidden">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 overflow-x-auto px-4 py-2">
          {headerLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] ${
                  active ? "text-brand-700" : "text-ink/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {sessionLoaded && user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-ink/70"
            >
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
