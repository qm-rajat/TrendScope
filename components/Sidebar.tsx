'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Flame,
  Globe2,
  TrendingUp,
  History,
  GitCompare,
  Settings,
  Database,
  X,
  Compass,
} from 'lucide-react';
import { ApiStatus } from './ApiStatus';
import { TrendScopeLogo } from './TrendScopeLogo';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDemo?: boolean;
}

export function Sidebar({ isMobileOpen = false, onCloseMobile, isDemo = true }: SidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: '/',
      label: 'Trending Now',
      icon: TrendingUp,
      badge: 'Live',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      active: pathname === '/' || pathname.startsWith('/trends'),
    },
    {
      href: '/countries',
      label: 'By Country',
      icon: Globe2,
      badge: '195',
      badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      active: pathname === '/countries',
    },
    {
      href: '/emerging',
      label: 'Emerging Radar',
      icon: Flame,
      badge: 'Velocity',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      active: pathname === '/emerging',
    },
    {
      href: '/history',
      label: 'Trend History',
      icon: History,
      active: pathname === '/history',
    },
    {
      href: '/compare',
      label: 'Country Compare',
      icon: GitCompare,
      active: pathname === '/compare',
    },
    {
      href: '/settings',
      label: 'Settings & Status',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  const quickCountries = [
    { name: 'Worldwide', slug: 'worldwide', flag: '🌐' },
    { name: 'India', slug: 'india', flag: '🇮🇳' },
    { name: 'United States', slug: 'usa', flag: '🇺🇸' },
    { name: 'United Kingdom', slug: 'uk', flag: '🇬🇧' },
    { name: 'Japan', slug: 'japan', flag: '🇯🇵' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B0F19] border-r border-[#1E293B] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative group-hover:scale-105 transition-transform">
              <TrendScopeLogo size={38} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">TrendScope</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">X Trends Intelligence</p>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Intelligence
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  href={link.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    link.active
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#141E33]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${link.active ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Countries Shortcuts */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Quick Locations
            </span>
            {quickCountries.map((c) => {
              const isCurrent =
                pathname === `/trends/${c.slug}` ||
                (pathname === '/' && c.slug === 'worldwide');
              return (
                <Link
                  key={c.slug}
                  id={`quick-link-${c.slug}`}
                  href={c.slug === 'worldwide' ? '/' : `/trends/${c.slug}`}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    isCurrent
                      ? 'bg-[#141E33] text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0F172A]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">/{c.slug}</span>
                </Link>
              );
            })}
          </div>

          {/* SQLite Architecture Banner */}
          <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>SQLite-Ready Storage</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Snapshots collected every 30 mins with automatic velocity computation.
            </p>
          </div>
        </div>

        {/* Footer Status & Auth */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0A0F1D] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Data Feed</span>
            <ApiStatus isDemo={isDemo} />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>TrendScope v1.0.0</span>
            <span className="text-cyan-400/80 font-mono">Next.js 15 App</span>
          </div>
        </div>
      </aside>
    </>
  );
}
