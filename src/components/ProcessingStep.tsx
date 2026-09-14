/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Activity, FileText, Database, ArrowRight } from 'lucide-react';
import { BhashiniLanguage, PatientProfile, StructuredClinicalSummary } from '../types';
import { getLocalizedStrings } from '../bhashiniLanguages';

interface ProcessingStepProps {
  language: BhashiniLanguage;
  patient: PatientProfile;
  summary: StructuredClinicalSummary;
  onComplete: () => void;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  language,
  patient,
  summary,
  onComplete,
}) => {
  const [currentMicroStep, setCurrentMicroStep] = useState(0);
  const loc = getLocalizedStrings(language.code);

  const microSteps = [
    {
      title: loc.microStep1Title,
      detail: `${loc.microStep1Detail} (${language.name})`,
      icon: Activity,
    },
    {
      title: loc.microStep2Title,
      detail: loc.microStep2Detail,
      icon: FileText,
    },
    {
      title: loc.microStep3Title,
      detail: loc.microStep3Detail,
      icon: Database,
    },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentMicroStep(1), 700);
    const timer2 = setTimeout(() => setCurrentMicroStep(2), 1400);
    const timer3 = setTimeout(() => setCurrentMicroStep(3), 2100);
    const timer4 = setTimeout(() => onComplete(), 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div
      id="step-processing-container"
      className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-[#F8F5F2] min-h-[calc(100vh-140px)] animate-fadeIn"
    >
      {/* Centered Minimal Card with Warm Glow */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden space-y-8">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#F1D2A5]/30 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#52833C]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Section Eyebrow */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E8E2D9]/50 border border-stone-200 text-xs font-semibold text-stone-700 tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#52833C]" />
          <span>{loc.automatedClinicalSynthesis}</span>
        </div>

        {/* Green Animated Ring Spinner */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-stone-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#52833C] border-t-transparent animate-spin"></div>
          <div className="w-16 h-16 rounded-full bg-[#52833C]/10 flex items-center justify-center text-[#52833C]">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0C0A09] tracking-tight">
            {loc.synthesizingTitle}
          </h2>
          <p className="text-sm text-[#71717A] max-w-sm mx-auto">
            {loc.generatingIntakePackage}{' '}
            <strong className="text-stone-900 font-mono">{patient.abhaId}</strong>.
          </p>
        </div>

        {/* Rapid Micro-steps Checklist */}
        <div className="space-y-3 text-left pt-2">
          {microSteps.map((step, idx) => {
            const isCompleted = currentMicroStep > idx;
            const isCurrent = currentMicroStep === idx;
            const StepIcon = step.icon;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-stone-50/80 border-[#52833C]/30 text-stone-900'
                    : isCurrent
                    ? 'bg-white border-[#52833C] shadow-sm ring-1 ring-[#52833C]/20'
                    : 'bg-stone-50/40 border-stone-200/60 opacity-40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isCompleted
                      ? 'bg-[#52833C] text-white'
                      : isCurrent
                      ? 'bg-[#52833C]/10 text-[#52833C] animate-pulse'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold ${
                      isCompleted || isCurrent ? 'text-[#0C0A09]' : 'text-stone-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-[#71717A] truncate mt-0.5">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Bypass Button */}
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center text-xs font-semibold text-[#52833C] hover:text-[#436e30] transition-colors gap-1 pt-2 cursor-pointer"
        >
          <span>{loc.viewDoctorDashboardNow}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
