/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CreditCard,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Building2,
  Phone,
  Languages,
  Sparkles,
  Lock,
  Camera,
  ScanLine,
} from 'lucide-react';
import { BhashiniLanguage, PatientProfile, AuthMode } from '../types';
import { getLocalizedStrings } from '../bhashiniLanguages';
import { AudioGuidanceButton } from './AudioGuidanceButton';
import { AbhaCameraScanner, ScannedAbhaProfile } from './AbhaCameraScanner';

interface IdentifyStepProps {
  language: BhashiniLanguage;
  patient: PatientProfile;
  onUpdatePatient: (updated: Partial<PatientProfile>) => void;
  onNext: () => void;
  onOpenLanguageModal: () => void;
}

export const IdentifyStep: React.FC<IdentifyStepProps> = ({
  language,
  patient,
  onUpdatePatient,
  onNext,
  onOpenLanguageModal,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('abha');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedNotification, setScannedNotification] = useState<string | null>(null);
  const [tempAbha, setTempAbha] = useState(patient.abhaId || '');
  const [tempAadhaar, setTempAadhaar] = useState(patient.aadhaarLast4 ? `XXXX-XXXX-${patient.aadhaarLast4}` : '');
  const [tempName, setTempName] = useState(patient.name || '');
  const [tempAge, setTempAge] = useState<number | ''>(patient.age || '');
  const [tempGender, setTempGender] = useState<'Male' | 'Female' | 'Other'>(patient.gender || 'Male');
  const [tempPhone, setTempPhone] = useState(patient.phone || '');
  const [consentChecked, setConsentChecked] = useState(patient.consentAudioGranted || false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loc = getLocalizedStrings(language.code);

  const handleScanSuccess = (scanned: ScannedAbhaProfile) => {
    setTempAbha(scanned.abhaId);
    setTempName(scanned.name);
    setTempAge(scanned.age);
    setTempGender(scanned.gender);
    setTempPhone(scanned.phone);
    setConsentChecked(true);
    setErrorMessage(null);
    setScannedNotification(`Scanned ABHA Card for ${scanned.name} (${scanned.abhaId})`);

    onUpdatePatient({
      abhaId: scanned.abhaId,
      name: scanned.name,
      age: scanned.age,
      gender: scanned.gender,
      phone: scanned.phone,
      aadhaarLast4: '0000',
      address: scanned.address,
      consentAudioGranted: true,
      dpdpConsentTimestamp: new Date().toISOString(),
    });
  };

  const handleProceed = () => {
    if (!consentChecked) {
      setErrorMessage('Please accept the DPDP Act 2023 & ABDM consent to proceed.');
      return;
    }
    setErrorMessage(null);

    const finalAbha = tempAbha.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalName = tempName.trim() || (authMode === 'abha' ? 'Ayushman Patient' : 'OPD Patient');
    const finalAge = typeof tempAge === 'number' && tempAge > 0 ? tempAge : 35;
    const finalPhone = tempPhone.trim() || '+91 98765 00000';

    onUpdatePatient({
      abhaId: finalAbha,
      name: finalName,
      age: finalAge,
      gender: tempGender,
      phone: finalPhone,
      aadhaarLast4: tempAadhaar ? tempAadhaar.slice(-4) : '0000',
      consentAudioGranted: true,
      dpdpConsentTimestamp: new Date().toISOString(),
    });
    onNext();
  };

  return (
    <div
      id="step-welcome-container"
      className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-[#F8F5F2] overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto w-full space-y-12">
        {/* Top Language & Quick Controls Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-3xl border border-stone-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              id="identify-lang-btn"
              type="button"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8E2D9]/40 hover:bg-[#E8E2D9] text-[#0C0A09] rounded-full border border-stone-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
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
              promptText={`${loc.audioPromptIdentify} ${loc.audioPromptConsent}`}
              language={language}
              buttonLabel={loc.audioGuideLabel}
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-700 tracking-wide mb-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#52833C] mr-2 animate-pulse"></span>
            <span>{loc.nhmBadge}</span>
          </div>

          {/* Prominent Project Name Displayed in Middle Above Headline */}
          <div className="pt-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#52833C] tracking-tight uppercase">
              SwasthyaSetuDesk
            </h2>
          </div>

          {/* Master Headline */}
          <h1 className="font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-[#0C0A09] leading-tight">
            {loc.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#71717A] max-w-2xl mx-auto leading-relaxed">
            {loc.heroSub}
          </p>
        </div>

        {/* 3-Column Stat Counters (Matching Reference Design) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center space-y-1 transition-all hover:scale-[1.01]">
            <p className="text-4xl lg:text-5xl font-black text-[#52833C] tracking-tight">
              {loc.stat1Num}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#71717A] uppercase tracking-wider">
              {loc.stat1Label}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center space-y-1 transition-all hover:scale-[1.01]">
            <p className="text-4xl lg:text-5xl font-black text-[#52833C] tracking-tight">
              {loc.stat2Num}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#71717A] uppercase tracking-wider">
              {loc.stat2Label}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center space-y-1 transition-all hover:scale-[1.01]">
            <p className="text-4xl lg:text-5xl font-black text-[#52833C] tracking-tight">
              {loc.stat3Num}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#71717A] uppercase tracking-wider">
              {loc.stat3Label}
            </p>
          </div>
        </div>

        {/* Primary Intake Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 max-w-2xl mx-auto">
          {/* Header & Modes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#52833C]"></span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0C0A09]">
                  {loc.patientIdentTitle}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#52833C] bg-[#52833C]/10 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                {loc.abdmMilestoneBadge}
              </span>
            </div>

            {/* Fast Track ABHA Card QR Scan Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-[#52833C] to-emerald-800 rounded-3xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Fastest 1-Second Check-In
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    Scan Physical / Digital ABHA QR
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Point camera at health card QR for rapid zero-type sign-in.
                  </p>
                </div>
              </div>
              <button
                id="btn-scan-qr-banner"
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-emerald-50 text-[#52833C] font-black rounded-2xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-[#52833C]" />
                <span>Scan with Camera</span>
              </button>
            </div>

            {scannedNotification && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#52833C] text-xs rounded-2xl font-bold flex items-center justify-between gap-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#52833C] shrink-0" />
                  <span>{scannedNotification}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScannedNotification(null)}
                  className="text-stone-400 hover:text-stone-600 font-normal text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Authentication Mode Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#F8F5F2] p-1.5 rounded-full border border-stone-200">
              <button
                id="tab-auth-abha"
                type="button"
                onClick={() => setAuthMode('abha')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'abha'
                    ? 'bg-[#52833C] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>{loc.tabAbha}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
              >
                <Camera className="w-3.5 h-3.5 text-[#52833C] shrink-0" />
                <span>Scan QR</span>
              </button>

              <button
                id="tab-auth-aadhaar"
                type="button"
                onClick={() => setAuthMode('aadhaar')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'aadhaar'
                    ? 'bg-[#52833C] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>{loc.tabAadhaar}</span>
              </button>

              <button
                id="tab-auth-register"
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#52833C] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>{loc.tabInstant}</span>
              </button>
            </div>
          </div>

          {/* Mode Inputs */}
          {authMode === 'abha' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0C0A09] uppercase tracking-wider block">
                  {loc.abhaAddressLabel}
                </label>
                <div className="relative">
                  <input
                    id="abha-id-input"
                    type="text"
                    value={tempAbha}
                    onChange={(e) => setTempAbha(e.target.value)}
                    placeholder={loc.abhaPlaceholder}
                    className="w-full pl-5 pr-12 py-4 bg-[#F8F5F2] border border-stone-200 rounded-full text-base sm:text-lg font-mono font-bold text-[#0C0A09] placeholder:text-stone-400 focus:bg-white focus:border-[#52833C] focus:ring-2 focus:ring-[#52833C]/20 outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <User className="w-5 h-5 text-[#52833C]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {authMode === 'aadhaar' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#0C0A09] uppercase tracking-wider block">
                  {loc.aadhaar12DigitLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={tempAadhaar}
                      onChange={(e) => setTempAadhaar(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full px-5 py-3.5 bg-[#F8F5F2] border border-stone-200 rounded-full text-base font-mono font-bold text-[#0C0A09] focus:bg-white focus:border-[#52833C] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="py-3.5 px-4 bg-[#0C0A09] hover:bg-stone-800 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                  >
                    {otpSent ? loc.verifyOtpBtn : loc.sendOtpBtn}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="p-4 bg-[#52833C]/10 border border-[#52833C]/30 rounded-2xl space-y-2">
                  <p className="text-xs text-stone-900 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#52833C]" />
                    {loc.uidaiOtpNotice}
                  </p>
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="w-36 px-4 py-2 bg-white border border-[#52833C] rounded-full font-mono text-center font-black text-lg text-stone-900"
                  />
                </div>
              )}
            </div>
          )}

          {authMode === 'register' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#0C0A09] block mb-1">
                    {loc.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8F5F2] border border-stone-200 rounded-full font-bold text-stone-900 text-sm focus:border-[#52833C] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0C0A09] block mb-1">
                    {loc.ageLabel} &amp; {loc.genderLabel}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempAge}
                      onChange={(e) => setTempAge(Number(e.target.value))}
                      className="w-16 px-3 py-3 bg-[#F8F5F2] border border-stone-200 rounded-full font-bold text-stone-900 text-sm text-center"
                    />
                    <select
                      value={tempGender}
                      onChange={(e) => setTempGender(e.target.value as any)}
                      className="flex-1 px-3 py-3 bg-[#F8F5F2] border border-stone-200 rounded-full font-bold text-stone-900 text-xs"
                    >
                      <option value="Male">{loc.maleLabel}</option>
                      <option value="Female">{loc.femaleLabel}</option>
                      <option value="Other">{loc.otherLabel}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DPDP Act 2023 Consent Checkbox */}
          <div className="p-4 bg-[#F8F5F2] rounded-2xl border border-stone-200 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => {
                  setConsentChecked(e.target.checked);
                  if (e.target.checked) setErrorMessage(null);
                }}
                className="mt-1 w-4 h-4 accent-[#52833C] rounded cursor-pointer"
              />
              <span className="text-xs text-[#71717A] leading-relaxed select-none">
                {loc.dpdpConsentCheckboxText}
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary CTA Button */}
          <button
            id="begin-intake-btn"
            type="button"
            onClick={handleProceed}
            className="w-full rounded-full bg-[#52833C] hover:bg-[#436e30] text-white font-semibold text-base px-6 py-4 flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#52833C]/20 cursor-pointer"
          >
            <span>{loc.beginIntakeBtn}</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* ABHA QR Scanner Modal */}
      <AbhaCameraScanner
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        language={language}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
