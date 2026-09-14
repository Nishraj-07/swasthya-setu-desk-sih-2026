/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Users, Stethoscope, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WaitingPatient {
  id: string;
  name: string;
  abhaNumber: string;
  departmentNeeded: string;
  severityScore: number; // 1 to 10
  symptomsSummary: string;
}

interface AssignedPatient extends WaitingPatient {
  assignedCabin: string;
  assignedDoctor: string;
  triageCategory: 'STAT_EMERGENCY' | 'URGENT' | 'ROUTINE';
  timestamp: string;
}

export const AITriageEngine: React.FC = () => {
  const [isAiModeActive, setIsAiModeActive] = useState(false);
  const [waitingQueue, setWaitingQueue] = useState<WaitingPatient[]>([
    { id: 'P-001', name: 'Rahul Sharma', abhaNumber: '91-4521-8932-1102', departmentNeeded: 'Cardiology OPD', severityScore: 9, symptomsSummary: 'Acute retrosternal chest pain radiating to left arm' },
    { id: 'P-002', name: 'Priya Verma', abhaNumber: '91-8832-1204-5561', departmentNeeded: 'Orthopedics & Trauma', severityScore: 4, symptomsSummary: 'Right wrist sprain following fall' },
    { id: 'P-003', name: 'Amit Patel', abhaNumber: '91-6672-3390-8812', departmentNeeded: 'General Medicine OPD', severityScore: 6, symptomsSummary: 'Persistent high fever (103°F) for 4 days with chills' }
  ]);
  
  const [dispatchedList, setDispatchedList] = useState<AssignedPatient[]>([]);

  const runAutonomousTriage = () => {
    setIsAiModeActive(true);

    setTimeout(() => {
      // Sort by severity descending and assign cabins
      const sorted = [...waitingQueue].sort((a, b) => b.severityScore - a.severityScore);
      
      const newlyDispatched: AssignedPatient[] = sorted.map(patient => {
        let cabin = 'Cabin 108 (General Medicine)';
        let doctor = 'Dr. Rajesh Mehra';
        let category: 'STAT_EMERGENCY' | 'URGENT' | 'ROUTINE' = 'ROUTINE';

        if (patient.severityScore >= 8 || patient.departmentNeeded.includes('Cardiology')) {
          cabin = 'Cabin 104 (Cardiology OPD - Emergency Resuscitation)';
          doctor = 'Dr. Ananya Sen';
          category = 'STAT_EMERGENCY';
        } else if (patient.severityScore >= 6) {
          cabin = 'Cabin 106 (Urgent Care & Acute Medicine)';
          doctor = 'Dr. Vikramaditya Roy';
          category = 'URGENT';
        } else if (patient.departmentNeeded.includes('Orthopedics')) {
          cabin = 'Cabin 112 (Ortho & Trauma)';
          doctor = 'Dr. Preeti Deshmukh';
          category = 'ROUTINE';
        }

        return {
          ...patient,
          assignedCabin: cabin,
          assignedDoctor: doctor,
          triageCategory: category,
          timestamp: new Date().toLocaleTimeString()
        };
      });

      setDispatchedList(newlyDispatched);
      setWaitingQueue([]);
      setIsAiModeActive(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 sm:p-8 max-w-5xl mx-auto my-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-5 mb-6 gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Triage & Dispatcher</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">SwasthyaSetuDesk Smart Queue Dispatcher</h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Automatically analyzes severity scores, symptoms, and clinical tracks to route patients to appropriate OPD cabins.
          </p>
        </div>
        
        <button
          onClick={runAutonomousTriage}
          disabled={isAiModeActive || waitingQueue.length === 0}
          className={`px-6 py-3 rounded-full font-bold text-stone-950 shadow-lg transition-all flex items-center gap-2.5 cursor-pointer transform hover:scale-105 active:scale-95 shrink-0 ${
            isAiModeActive ? 'bg-amber-400 cursor-wait' : waitingQueue.length === 0 ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30'
          }`}
        >
          {isAiModeActive ? (
            <>
              <span className="w-3 h-3 rounded-full bg-stone-950 animate-ping"></span>
              <span>Running Triage Dispatch...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Enable Autonomous Triage Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Waiting Queue */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-500" />
              <span>Waiting Queue ({waitingQueue.length} Patients)</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 bg-stone-200 text-stone-700 rounded-full font-mono">Pending Triage</span>
          </div>

          {waitingQueue.length === 0 ? (
            <p className="text-sm text-stone-400 italic py-12 text-center">All waiting patients have been dispatched successfully.</p>
          ) : (
            <div className="space-y-3">
              {waitingQueue.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{p.name}</span>
                      <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono">{p.abhaNumber}</span>
                    </div>
                    <p className="text-xs text-stone-600">{p.symptomsSummary}</p>
                    <span className="inline-block bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded">{p.departmentNeeded}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${p.severityScore >= 8 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    Sev: {p.severityScore}/10
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Successfully Dispatched / Assigned */}
        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>AI-Assigned Active Consultations ({dispatchedList.length})</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-full font-mono">Dispatched</span>
          </div>

          {dispatchedList.length === 0 ? (
            <p className="text-sm text-stone-400 italic py-12 text-center">Click "Enable Autonomous Triage Mode" to process queue.</p>
          ) : (
            <div className="space-y-3">
              {dispatchedList.map(d => (
                <div key={d.id} className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-stone-900 text-sm">{d.name}</span>
                      <span className="text-xs text-stone-500 block font-mono">ABHA: {d.abhaNumber}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      d.triageCategory === 'STAT_EMERGENCY' ? 'bg-red-100 text-red-700 animate-pulse' : 
                      d.triageCategory === 'URGENT' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {d.triageCategory}
                    </span>
                  </div>
                  
                  <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100 text-xs text-stone-700 space-y-1">
                    <p><strong>Cabin:</strong> <span className="text-emerald-900 font-bold">{d.assignedCabin}</span></p>
                    <p><strong>Doctor:</strong> <span className="text-stone-900 font-semibold">{d.assignedDoctor}</span></p>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1">
                    <span>Severity: <strong>{d.severityScore}/10</strong></span>
                    <span>Dispatched at {d.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
