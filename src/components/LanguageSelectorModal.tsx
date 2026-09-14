/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Search, Check, X, Sparkles } from 'lucide-react';
import { BHASHINI_22_LANGUAGES, getLocalizedStrings } from '../bhashiniLanguages';
import { BhashiniLanguage } from '../types';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: BhashiniLanguage;
  onSelectLanguage: (lang: BhashiniLanguage) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const loc = getLocalizedStrings(selectedLanguage.code);

  if (!isOpen) return null;

  const filteredLanguages = BHASHINI_22_LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.script.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterRegion === 'ALL') return matchesSearch;
    if (filterRegion === 'NORTH') {
      return (
        matchesSearch &&
        (lang.region.includes('North') ||
          lang.region.includes('Punjab') ||
          lang.region.includes('Kashmir') ||
          lang.region.includes('Hindi'))
      );
    }
    if (filterRegion === 'SOUTH') {
      return (
        matchesSearch &&
        (lang.region.includes('Tamil') ||
          lang.region.includes('Andhra') ||
          lang.region.includes('Karnataka') ||
          lang.region.includes('Kerala'))
      );
    }
    if (filterRegion === 'EAST_NE') {
      return (
        matchesSearch &&
        (lang.region.includes('Bengal') ||
          lang.region.includes('Assam') ||
          lang.region.includes('Odisha') ||
          lang.region.includes('Manipur') ||
          lang.region.includes('Bihar') ||
          lang.region.includes('Jharkhand') ||
          lang.region.includes('Sikkim'))
      );
    }
    if (filterRegion === 'WEST') {
      return (
        matchesSearch &&
        (lang.region.includes('Maharashtra') ||
          lang.region.includes('Gujarat') ||
          lang.region.includes('Goa'))
      );
    }
    return matchesSearch;
  });

  return (
    <div
      id="bhashini-language-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="bhashini-language-modal-content"
        className="w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-fadeIn"
      >
        {/* Modal Header */}
        <div className="bg-[#0C0A09] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#52833C]/20 text-[#52833C] border border-[#52833C]/30 rounded-2xl flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {loc.langModalTitle}
                </h3>
                <span className="bg-[#52833C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  22 Official Languages
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {loc.langModalSubtitle}
              </p>
            </div>
          </div>

          <button
            id="close-language-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Region Filters */}
        <div className="p-4 bg-[#F8F5F2] border-b border-stone-200 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="language-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={loc.searchLangPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#52833C] focus:ring-2 focus:ring-[#52833C]/20"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { id: 'ALL', label: loc.allRegionsTab },
              { id: 'NORTH', label: loc.northRegionTab },
              { id: 'SOUTH', label: loc.southRegionTab },
              { id: 'EAST_NE', label: loc.eastRegionTab },
              { id: 'WEST', label: loc.westRegionTab },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterRegion(tab.id)}
                className={`px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
                  filterRegion === tab.id
                    ? 'bg-[#52833C] text-white border-[#52833C] shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-select-${lang.code}`}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#52833C]/10 border-[#52833C] shadow-sm ring-1 ring-[#52833C]'
                      : 'bg-[#F8F5F2] border-stone-200/80 hover:border-[#52833C] hover:bg-stone-100'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#0C0A09] truncate">
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold uppercase">
                        {lang.code}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A] truncate font-medium">
                      {lang.name} • {lang.region}
                    </p>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#52833C] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-stone-400 font-mono shrink-0">
                      {lang.script}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="py-12 text-center text-stone-500 text-sm">
              No languages match your search query. Try typing in English or native script.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F5F2] border-t border-stone-200 flex items-center justify-between text-xs text-[#71717A] shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#52833C]" />
            <span>Digital India Bhashini Multilingual Speech API</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
