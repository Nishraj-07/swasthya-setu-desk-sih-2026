/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Stethoscope, ClipboardList, Sparkles, ShieldCheck } from 'lucide-react';

interface PatientWelcomeChoiceProps {
  patientName: string;
  onSelectAction: (action: 'consultation' | 'reports') => void;
}

export const PatientWelcomeChoice: React.FC<PatientWelcomeChoiceProps> = ({ patientName, onSelectAction }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 p-8 sm:p-12 max-w-3xl mx-auto my-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5" />
        <span>SwasthyaSetuDesk Kiosk Mode</span>
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2">
        Namaste, {patientName}
      </h2>
      <p className="text-stone-600 mb-10 text-sm sm:text-base max-w-xl mx-auto">
        Please select how you would like to proceed today at the AIIMS Central OPD Kiosk.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Option 1: Consultation & Symptoms */}
        <button
          onClick={() => onSelectAction('consultation')}
          className="group bg-stone-50 hover:bg-emerald-50/70 border-2 border-stone-200 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all shadow-sm hover:shadow-xl cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:scale-110 transition-transform shadow-xs">
              <Stethoscope className="w-7 h-7 text-emerald-700" />
            </div>
            <h3 className="font-black text-stone-900 text-lg mb-2">Consult a Doctor / Report Symptoms</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Use Swasthya Vaani voice intake, check vitals, and get assigned to an OPD cabin queue.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-700">
            <span>Start Voice Intake</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* Option 2: View Past Reports */}
        <button
          onClick={() => onSelectAction('reports')}
          className="group bg-stone-50 hover:bg-blue-50/70 border-2 border-stone-200 hover:border-blue-500 rounded-2xl p-6 text-left transition-all shadow-sm hover:shadow-xl cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5 group-hover:scale-110 transition-transform shadow-xs">
              <ClipboardList className="w-7 h-7 text-blue-700" />
            </div>
            <h3 className="font-black text-stone-900 text-lg mb-2">View My Reports & Health Locker</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Access past consultation summaries, lab test results, and prescriptions from ABHA.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-700">
            <span>Open Health Locker</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>
    </div>
  );
};
