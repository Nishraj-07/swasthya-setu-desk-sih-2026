/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, Printer, ShieldCheck, Calendar, Clock, Stethoscope, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface ConsultationReportProps {
  patientName: string;
  abhaNumber: string;
  age: number;
  gender: string;
  department: string;
  attendingDoctor: string;
  cabin: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  icd10Code: string;
  prescriptions: { name: string; dosage: string; frequency: string; duration: string }[];
  lifestyleAdvice: string[];
  followUpDate: string;
  onClose?: () => void;
}

export const PatientPostConsultationReport: React.FC<{ reportData: ConsultationReportProps }> = ({ reportData }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-6 sm:p-8 max-w-3xl mx-auto my-6 print:shadow-none print:border-none print:p-0 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 print:hidden"></div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-5 mb-6 gap-4 relative z-10">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Ayushman Bharat Digital Mission (ABDM)
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">Digital Health Consultation Summary</h2>
          <p className="text-xs sm:text-sm text-stone-500">SwasthyaSetuDesk • AIIMS Central OPD Facility</p>
        </div>
        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Record
          </span>
          <span className="text-xs text-stone-400 font-mono">{reportData.date}</span>
        </div>
      </div>

      {/* Patient & Encounter Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-xl mb-6 border border-stone-200 text-xs sm:text-sm relative z-10">
        <div>
          <span className="block text-[11px] text-stone-400 uppercase font-bold tracking-wider">Patient Name</span>
          <strong className="text-stone-900 font-bold">{reportData.patientName}</strong>
        </div>
        <div>
          <span className="block text-[11px] text-stone-400 uppercase font-bold tracking-wider">ABHA ID</span>
          <strong className="text-stone-900 font-mono text-xs">{reportData.abhaNumber}</strong>
        </div>
        <div>
          <span className="block text-[11px] text-stone-400 uppercase font-bold tracking-wider">Attending Doctor</span>
          <strong className="text-stone-900 font-bold">{reportData.attendingDoctor}</strong>
        </div>
        <div>
          <span className="block text-[11px] text-stone-400 uppercase font-bold tracking-wider">OPD Cabin</span>
          <strong className="text-emerald-700 font-bold">{reportData.cabin}</strong>
        </div>
      </div>

      {/* Clinical Findings & Diagnosis */}
      <div className="space-y-6 mb-6 relative z-10">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-black text-stone-700 mb-2 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <span>Recorded Symptoms & Swasthya Vaani Intake</span>
          </h3>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-stone-700 space-y-1 bg-stone-50/50 p-3.5 rounded-xl border border-stone-200">
            {reportData.symptoms.map((sym, idx) => (
              <li key={idx} className="font-medium">{sym}</li>
            ))}
          </ul>
        </div>

        <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200">
          <h3 className="text-xs uppercase tracking-wider font-black text-emerald-900 mb-1">Finalized Diagnosis</h3>
          <p className="text-base font-bold text-stone-900">{reportData.diagnosis}</p>
          <span className="inline-block mt-2 bg-emerald-200/60 text-emerald-900 text-xs px-2.5 py-1 rounded font-mono font-bold border border-emerald-300">
            ICD-10 Code: {reportData.icd10Code}
          </span>
        </div>

        {/* Prescribed Medications */}
        <div>
          <h3 className="text-xs uppercase tracking-wider font-black text-stone-700 mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Prescribed Treatment Plan</span>
          </h3>
          <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-100 text-stone-700 text-[11px] uppercase tracking-wider font-black">
                <tr>
                  <th className="p-3">Medicine Name</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white">
                {reportData.prescriptions.map((med, idx) => (
                  <tr key={idx} className="text-stone-800">
                    <td className="p-3 font-bold">{med.name}</td>
                    <td className="p-3">{med.dosage}</td>
                    <td className="p-3 font-medium text-emerald-800">{med.frequency}</td>
                    <td className="p-3">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lifestyle & Follow-up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h3 className="text-xs uppercase tracking-wider font-black text-stone-700 mb-2">Dietary & Lifestyle Advice</h3>
            <ul className="list-disc pl-5 text-xs text-stone-700 space-y-1.5">
              {reportData.lifestyleAdvice.map((advice, idx) => (
                <li key={idx} className="font-medium">{advice}</li>
              ))}
            </ul>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h3 className="text-xs uppercase tracking-wider font-black text-stone-700 mb-2">Follow-up Schedule</h3>
            <p className="text-sm font-bold text-stone-900">{reportData.followUpDate}</p>
            <p className="text-xs text-stone-500 mt-2">Please bring this summary card during your next OPD visit or report to the ER immediately if red flag symptoms recur.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 print:hidden relative z-10">
        <button
          onClick={handlePrint}
          className="bg-stone-800 hover:bg-stone-900 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report</span>
        </button>
        <button
          onClick={() => alert('Consultation record securely pushed to your ABHA Health Locker!')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sync to ABHA Locker</span>
        </button>
      </div>
    </div>
  );
};
