/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCode,
  Send,
  Trash2,
  Lock,
  ArrowRight,
  Stethoscope,
  AlertTriangle,
  Copy,
  Check,
  Activity,
  Sparkles,
} from 'lucide-react';
import {
  BhashiniLanguage,
  PatientProfile,
  StructuredClinicalSummary,
  RedFlagAlert,
} from '../types';
import { getLocalizedStrings } from '../bhashiniLanguages';
import { AudioGuidanceButton } from './AudioGuidanceButton';

interface SummaryRouteStepProps {
  language: BhashiniLanguage;
  patient: PatientProfile;
  summary: StructuredClinicalSummary;
  redFlagAlert: RedFlagAlert;
  onProceedToDoctor: () => void;
  onZeroRetentionPurge: () => void;
}

export const SummaryRouteStep: React.FC<SummaryRouteStepProps> = ({
  language,
  patient,
  summary,
  redFlagAlert,
  onProceedToDoctor,
  onZeroRetentionPurge,
}) => {
  const [activeTab, setActiveTab] = useState<'clinical' | 'fhir_json'>('clinical');
  const [isCopied, setIsCopied] = useState(false);

  const loc = getLocalizedStrings(language.code);

  const handleCopyFhir = () => {
    navigator.clipboard.writeText(summary.fhirBundleJson);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      id="step-summary-container"
      className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-[#F8F5F2] overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Top Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-700 tracking-wide mb-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#52833C] mr-2"></span>
            <span>{loc.abdmEncryptedEyebrow}</span>
          </div>

          <h1 className="font-extrabold tracking-tight text-4xl sm:text-5xl text-[#0C0A09]">
            {loc.summaryHeroTitle}
          </h1>

          <p className="text-base text-[#71717A] leading-relaxed">
            {loc.summaryHeroSub}
          </p>
        </div>

        {/* RED FLAG BANNER IF PRESENT */}
        {redFlagAlert.isTriggered && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-3xl flex items-center justify-between gap-4 text-red-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide">
                  {loc.emergencyAlertTitle}: {redFlagAlert.title}
                </p>
                <p className="text-xs font-medium text-red-800">
                  {loc.actionRequired} • {redFlagAlert.description}
                </p>
              </div>
            </div>
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              {loc.statHighPriority}
            </span>
          </div>
        )}

        {/* View Switcher: Clinical Structured Summary vs HL7 FHIR Bundle */}
        <div className="bg-white rounded-3xl border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-[#F8F5F2] border-b border-stone-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('clinical')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'clinical'
                    ? 'bg-[#52833C] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {loc.structuredSummaryTab}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fhir_json')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'fhir_json'
                    ? 'bg-[#52833C] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{loc.fhirBundleTab}</span>
              </button>
            </div>

            {activeTab === 'fhir_json' && (
              <button
                type="button"
                onClick={handleCopyFhir}
                className="px-4 py-1.5 bg-white hover:bg-stone-100 rounded-full border border-stone-300 text-xs font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#52833C]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? loc.copiedNotice : loc.copyJsonBtn}</span>
              </button>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {activeTab === 'clinical' ? (
              <div className="space-y-6">
                {/* Patient Header Card */}
                <div id="opd-token-card" className="p-4 bg-[#F8F5F2] rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-base font-extrabold text-[#0C0A09]">{patient.name}</p>
                    <p className="text-xs text-[#71717A]">
                      {patient.age} Y / {patient.gender} • ABHA: <strong className="text-stone-900">{patient.abhaId}</strong>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#52833C] bg-[#52833C]/10 px-3 py-1 rounded-full">
                    OPD Cabin #104 (Cardiology)
                  </span>
                </div>

                {/* Chief Complaint */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">{loc.chiefComplaintLabel}</h3>
                  <p className="text-lg font-bold text-[#0C0A09]">{summary.chiefComplaint}</p>
                </div>

                {/* HPI Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">{loc.locationRadiation}</span>
                    <span className="font-bold text-stone-900 mt-0.5 block">
                      {summary.socrates.site || 'Chest'} &rarr; {summary.socrates.radiation || 'Left Arm'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">{loc.onsetSeverity}</span>
                    <span className="font-bold text-stone-900 mt-0.5 block">
                      {summary.socrates.onset || 'Acute'} • {loc.painScoreLabel}: {summary.socrates.severity}/10
                    </span>
                  </div>
                </div>

                {/* Full HPI */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">{loc.hpiNarrativeLabel}</h3>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    {summary.hpi}
                  </p>
                </div>
              </div>
            ) : (
              <pre className="p-4 bg-stone-900 text-emerald-400 rounded-2xl text-xs font-mono max-h-96 overflow-y-auto select-all">
                {summary.fhirBundleJson}
              </pre>
            )}
          </div>
        </div>

        {/* DPDP Zero-Retention Privacy Seal */}
        <div className="p-4 bg-white border border-stone-200/60 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#52833C]/10 text-[#52833C] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0C0A09]">
                {loc.dpdpTitle}
              </p>
              <p className="text-[11px] text-[#71717A]">
                {loc.dpdpSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onZeroRetentionPurge}
            className="text-xs font-bold text-stone-600 hover:text-red-600 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loc.purgeMemoryBtn}</span>
          </button>
        </div>

        {/* Bottom CTA Button */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-print-token-slip"
            type="button"
            onClick={onProceedToDoctor}
            className="rounded-full bg-[#52833C] hover:bg-[#436e30] text-white font-semibold text-sm sm:text-base px-8 py-3.5 flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#52833C]/20 cursor-pointer"
          >
            <span>{loc.proceedDoctorConsultBtn}</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
