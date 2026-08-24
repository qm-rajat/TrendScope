'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LocationConfig } from '@/types/trends';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentLocationSlug?: string;
  onSelectLocation?: (location: LocationConfig) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isDemo?: boolean;
  navigateOnSelect?: boolean;
}

export function DashboardLayout({
  children,
  currentLocationSlug = 'worldwide',
  onSelectLocation,
  onRefresh = () => {},
  isRefreshing = false,
  isDemo = true,
  navigateOnSelect = false,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Persistent Sidebar */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isDemo={isDemo}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          currentLocationSlug={currentLocationSlug}
          onSelectLocation={onSelectLocation}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          navigateOnSelect={navigateOnSelect}
        />

        <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#1E293B] py-6 px-4 lg:px-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">TrendScope</span>
              <span>—</span>
              <span>X Trends Intelligence Engine</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Powered by GetXAPI</span>
              <span>•</span>
              <span>Server-Side Cache: 300s TTL</span>
              <span>•</span>
              <span>SQLite Snapshot Architecture</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
