'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, Globe, Check, MapPin } from 'lucide-react';
import { LocationConfig } from '@/types/trends';
import { LOCATIONS, normalizeLocationSlug } from '@/lib/locations';

interface CountrySelectorProps {
  currentLocationSlug: string;
  onSelectLocation?: (location: LocationConfig) => void;
  navigateOnSelect?: boolean;
  className?: string;
}

export function CountrySelector({
  currentLocationSlug,
  onSelectLocation,
  navigateOnSelect = false,
  className = '',
}: CountrySelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalized = normalizeLocationSlug(currentLocationSlug);
  const selectedLocation =
    LOCATIONS.find((loc) => loc.slug === normalized) || LOCATIONS[0];

  // Filter locations based on search query
  const filteredLocations = LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.region && loc.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationConfig) => {
    setIsOpen(false);
    setSearchQuery('');
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
    if (navigateOnSelect) {
      if (loc.slug === 'worldwide') {
        router.push('/');
      } else {
        router.push(`/trends/${loc.slug}`);
      }
    }
  };


  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="btn-country-selector-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#15203B] border border-[#1E293B] hover:border-blue-500/50 text-slate-100 text-sm font-medium transition-all shadow-sm cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-base">{selectedLocation.flag || '📍'}</span>
        <span className="font-semibold text-slate-100">{selectedLocation.name}</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
          {selectedLocation.code}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="country-selector-menu"
          className="absolute left-0 mt-2 w-72 max-h-96 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-md"
        >
          {/* Search Header */}
          <div className="p-3 border-b border-[#1E293B] bg-[#0B1120]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-country-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#141E33] border border-[#1E2D4A] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Popular Pills */}
          {!searchQuery && (
            <div className="px-3 py-2 border-b border-[#1E293B]/60 bg-[#0D1527]/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 block">
                Popular Locations
              </span>
              <div className="flex flex-wrap gap-1">
                {LOCATIONS.filter((l) => l.popular).map((loc) => (
                  <button
                    key={loc.slug}
                    onClick={() => handleSelect(loc)}
                    className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                      loc.slug === selectedLocation.slug
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-[#141E33] hover:bg-[#1E2D4A] text-slate-300'
                    }`}
                  >
                    <span>{loc.flag}</span>
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locations List */}
          <div className="overflow-y-auto p-1.5 max-h-60 divide-y divide-[#1E293B]/30">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = loc.slug === selectedLocation.slug;
                return (
                  <button
                    key={loc.slug}
                    id={`btn-select-location-${loc.slug}`}
                    onClick={() => handleSelect(loc)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 font-semibold'
                        : 'hover:bg-[#141E33] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{loc.flag || '📍'}</span>
                      <div>
                        <div className="text-slate-100 font-medium flex items-center gap-1.5">
                          {loc.name}
                          {loc.popular && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400">
                              Hot
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{loc.region || 'Worldwide'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{loc.code}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <MapPin className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                No locations match &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-[#1E293B] bg-[#0B1120] text-center">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400" /> Powered by GetXAPI Trends Feed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
