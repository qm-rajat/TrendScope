'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LOCATIONS } from '@/lib/locations';
import { Search, Globe2, ArrowRight, MapPin } from 'lucide-react';

export default function CountriesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = ['all', 'Global', 'Asia', 'Europe', 'North America', 'South America', 'Middle East', 'Africa', 'Oceania'];

  const filteredLocations = LOCATIONS.filter((loc) => {
    if (selectedRegion !== 'all' && loc.region !== selectedRegion) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        (loc.region && loc.region.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <DashboardLayout currentLocationSlug="worldwide" navigateOnSelect={true}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1E293B]/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Global Locations Directory
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono">
              {LOCATIONS.length} Tracked
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Select any country or territory to monitor live X/Twitter trending hashtags and velocity metrics.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="input-countries-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search countries, ISO codes, or regions..."
            className="w-full pl-9 pr-4 py-2 bg-[#070B14] border border-[#1E2D4A] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {regions.map((reg) => (
            <button
              key={reg}
              id={`btn-region-${reg.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#141E33] hover:bg-[#1E2D4A] text-slate-300'
              }`}
            >
              {reg === 'all' ? 'All Regions' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((loc) => {
            const href = loc.slug === 'worldwide' ? '/' : `/trends/${loc.slug}`;
            return (
              <Link
                key={loc.slug}
                id={`card-location-${loc.slug}`}
                href={href}
                className="p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] hover:border-blue-500/50 hover:bg-[#121B33] transition-all shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-[#141E33] border border-[#1E2D4A] inline-block">
                      {loc.flag || '📍'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {loc.code}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm">
                    {loc.name}
                  </h3>
                  <span className="text-xs text-slate-400">{loc.region || 'Global'}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200">
                  <span>View Trends</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            No countries match your search &quot;{searchQuery}&quot;.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
