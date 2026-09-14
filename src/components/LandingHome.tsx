/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  User,
  Stethoscope,
  Building2,
  ArrowRight,
  ShieldCheck,
  Languages,
  Mic,
  FileText,
  Activity,
  HeartPulse,
  Sparkles,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { BhashiniLanguage, PatientProfile } from '../types';
import { getLocalizedStrings } from '../bhashiniLanguages';
import { AudioGuidanceButton } from './AudioGuidanceButton';

interface LandingHomeProps {
  language: BhashiniLanguage;
  onSelectPortal: (role: 'patient' | 'doctor' | 'hospital') => void;
  onOpenLanguageModal: () => void;
  onOpenHelpdesk: () => void;
}

export const LandingHome: React.FC<LandingHomeProps> = ({
  language,
  onSelectPortal,
  onOpenLanguageModal,
  onOpenHelpdesk,
}) => {
  const loc = getLocalizedStrings(language.code);

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-[#F8F5F2] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Top Language & Quick Voice Guidance Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-3xl border border-stone-200/70 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8E2D9]/50 hover:bg-[#E8E2D9] text-[#0C0A09] rounded-full border border-stone-200 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Languages className="w-4 h-4 text-[#52833C]" />
              <span>
                {language.nativeName} ({language.name})
              </span>
              <span className="text-[10px] bg-[#52833C] text-white px-2 py-0.5 rounded-full font-bold">
                22 Bhashini
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <AudioGuidanceButton
              contextType="landing"
              language={language}
              buttonLabel={loc.audioGuideLabel}
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-700 tracking-wide mb-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#52833C] mr-2 animate-pulse"></span>
            <span>{loc.nhmBadge}</span>
          </div>

          {/* Prominent Project Name */}
          <div className="pt-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#52833C] tracking-tight uppercase">
              SwasthyaSetuDesk
            </h2>
          </div>

          {/* Master Headline */}
          <h1 className="font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl text-[#0C0A09] leading-tight">
            {loc.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#71717A] max-w-2xl mx-auto leading-relaxed">
            {loc.heroSub}
          </p>
        </div>

        {/* 3-Column Metric Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-center space-y-1 transition-all hover:scale-[1.01]">
            <p className="text-4xl lg:text-5xl font-black text-[#52833C] tracking-tight">
              {loc.stat1Num}
            </p>
            <p className="text-xs sm:text-sm font-bold text-[#71717A] uppercase tracking-wider">
              {loc.stat1Label}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-center space-y-1 transition-all hover:scale-[1.01]">
            <p className="text-4xl lg:text-5xl font-black text-[#52833C] tracking-tight">
              {loc.stat2Num}
            </p>
            <p className="text-xs sm:text-sm font-bold text-[#71717A] uppercase tracking-wider">
              {loc.stat2Label}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-center space-y-1 transition-all hover:scale-[1.01]">
            <p className="text-4xl lg:text-5xl font-black text-[#52833C] tracking-tight">
              {loc.stat3Num}
            </p>
            <p className="text-xs sm:text-sm font-bold text-[#71717A] uppercase tracking-wider">
              {loc.stat3Label}
            </p>
          </div>
        </div>

        {/* 3 User Sign-In Cards (Patient, Doctor, Hospital Admin) */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              {loc.selectPortal}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              {loc.portalSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* 1. Patient Portal Card */}
            <div
              onClick={() => onSelectPortal('patient')}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/70 shadow-sm hover:shadow-md hover:border-[#52833C] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#52833C] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#52833C] bg-[#52833C]/10 px-2.5 py-0.5 rounded-full mb-1.5">
                    {loc.patientBadge}
                  </div>
                  <h4 className="text-lg font-black text-stone-900 group-hover:text-[#52833C] transition-colors">
                    {loc.patientTitle}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {loc.patientDesc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#52833C] group-hover:underline">
                  {loc.patientBtn}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#52833C] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 2. Doctor EMR Portal Card */}
            <div
              onClick={() => onSelectPortal('doctor')}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-200/70 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1.5">
                    {loc.doctorBadge}
                  </div>
                  <h4 className="text-lg font-black text-stone-900 group-hover:text-blue-700 transition-colors">
                    {loc.doctorTitle}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {loc.doctorDesc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 group-hover:underline">
                  {loc.doctorBtn}
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 3. Hospital Admin / HIS Portal Card */}
            <div
              onClick={() => onSelectPortal('hospital')}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-200/70 shadow-sm hover:shadow-md hover:border-purple-500 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full mb-1.5">
                    {loc.hisBadge}
                  </div>
                  <h4 className="text-lg font-black text-stone-900 group-hover:text-purple-700 transition-colors">
                    {loc.hisTitle}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {loc.hisDesc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700 group-hover:underline">
                  {loc.hisBtn}
                </span>
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-stone-500 border-t border-stone-200/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#52833C]" />
            <span>{loc.footer1}</span>
          </div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>{loc.footer2}</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-400" />
            <span>{loc.footer3}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
