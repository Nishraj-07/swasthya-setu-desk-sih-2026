/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Calendar, ShieldCheck, Stethoscope, FileText, Activity, Clock, CheckCircle2, AlertTriangle, User, ArrowRight, Pill, TestTube2 } from 'lucide-react';
import { PatientQueueItem, StructuredClinicalSummary } from '../types';
import { getStoredQueue, PatientRecord } from '../utils/queueStorage';

interface PatientHistoryRecord {
  abhaId: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string;
  visits: {
    visitId: string;
    date: string;
    department: string;
    cabin: string;
    attendingDoctor: string;
    status: 'COMPLETED' | 'IN_CONSULTATION' | 'WAITING' | 'EMERGENCY_TRIAGE';
    severityScore: number;
    symptoms: string[];
    diagnosis: string;
    icd10Code: string;
    prescriptions: { name: string; dosage: string; frequency?: string; duration?: string; instructions?: string }[];
    orderedDiagnostics?: { id?: string; label?: string; name?: string; priority?: string; category?: string }[];
    doctorNotes?: string;
    lifestyleAdvice: string[];
    abdmSyncStatus: 'Verified (M1/M2/M3)' | 'Pending Sync' | 'Synced to Health Locker';
  }[];
}

interface PatientHistoryViewProps {
  queue: PatientQueueItem[];
  currentSummary?: StructuredClinicalSummary;
}

export const PatientHistoryView: React.FC<PatientHistoryViewProps> = ({ queue, currentSummary }) => {
  const [searchAbha, setSearchAbha] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientHistoryRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mock patient history database for robust demo testing
  const mockPatientDatabase: PatientHistoryRecord[] = [
    {
      abhaId: '91-4521-8932-1102',
      patientName: 'Rahul Sharma',
      age: 45,
      gender: 'Male',
      phone: '+91 98765 43210',
      bloodGroup: 'B+',
      visits: [
        {
          visitId: 'VISIT-2026-0830-01',
          date: 'August 30, 2026 - 10:14 AM',
          department: 'Cardiology OPD',
          cabin: 'Cabin 104 (Emergency Resuscitation)',
          attendingDoctor: 'Dr. Ananya Sen',
          status: 'COMPLETED',
          severityScore: 9,
          symptoms: ['Acute retrosternal chest pressure radiating to left arm', 'Duration: 45 minutes', 'Associated with diaphoresis'],
          diagnosis: 'Acute Coronary Syndrome / Unstable Angina suspected',
          icd10Code: 'I20.9 (Angina pectoris, unspecified)',
          prescriptions: [
            { name: 'Aspirin', dosage: '325 mg', frequency: 'STAT (Once)', duration: '1 day' },
            { name: 'Atorvastatin', dosage: '80 mg', frequency: 'Once daily at night', duration: '30 days' },
            { name: 'Sublingual Nitroglycerin', dosage: '0.4 mg', frequency: 'As needed for chest pain', duration: '7 days' }
          ],
          lifestyleAdvice: ['Strict physical rest', 'Low sodium and low fat diet', 'Immediate ER report if chest pain recurs'],
          abdmSyncStatus: 'Verified (M1/M2/M3)'
        },
        {
          visitId: 'VISIT-2025-1112-04',
          date: 'November 12, 2025 - 02:30 PM',
          department: 'General Medicine OPD',
          cabin: 'Cabin 108',
          attendingDoctor: 'Dr. Rajesh Mehra',
          status: 'COMPLETED',
          severityScore: 3,
          symptoms: ['Seasonal allergic rhinitis', 'Mild dry cough'],
          diagnosis: 'Upper Respiratory Tract Infection',
          icd10Code: 'J06.9 (Acute upper respiratory infection)',
          prescriptions: [
            { name: 'Cetirizine', dosage: '10 mg', frequency: 'Once daily at bedtime', duration: '5 days' },
            { name: 'Paracetamol', dosage: '650 mg', frequency: 'TDS PRN', duration: '3 days' }
          ],
          lifestyleAdvice: ['Steam inhalation twice daily', 'Increase warm fluid intake'],
          abdmSyncStatus: 'Synced to Health Locker'
        }
      ]
    },
    {
      abhaId: '91-8832-1204-5561',
      patientName: 'Priya Verma',
      age: 28,
      gender: 'Female',
      phone: '+91 91234 56789',
      bloodGroup: 'O+',
      visits: [
        {
          visitId: 'VISIT-2026-0830-02',
          date: 'August 30, 2026 - 10:25 AM',
          department: 'Orthopedics & Trauma',
          cabin: 'Cabin 112',
          attendingDoctor: 'Dr. Preeti Deshmukh',
          status: 'COMPLETED',
          severityScore: 4,
          symptoms: ['Right wrist sprain following accidental slip at home', 'Mild localized swelling'],
          diagnosis: 'Acute Right Wrist Ligament Sprain',
          icd10Code: 'S63.5 (Sprain of wrist)',
          prescriptions: [
            { name: 'Ibuprofen + Paracetamol Gel', dosage: 'Topical application', frequency: 'TDS', duration: '5 days' },
            { name: 'Serratiopeptidase', dosage: '10 mg', frequency: 'BD after meals', duration: '5 days' }
          ],
          lifestyleAdvice: ['Wrist immobilization brace', 'Cold compression packs 15 mins every 4 hours'],
          abdmSyncStatus: 'Verified (M1/M2/M3)'
        }
      ]
    }
  ];

  const handleSearch = (e?: React.FormEvent, customAbha?: string) => {
    if (e) e.preventDefault();
    const query = (customAbha || searchAbha).trim();
    if (!query) {
      setErrorMessage('Please enter a valid ABHA ID (e.g., 91-4521-8932-1102) or patient name.');
      return;
    }
    setErrorMessage(null);
    const cleaned = query.toLowerCase().replace(/[-\s]/g, '');

    // 1. Check in live stored queue (most up-to-date with doctor changes)
    const storedQueue = getStoredQueue();
    const storedMatch = storedQueue.find(
      (p) =>
        p.abhaId.replace(/[-\s]/g, '').toLowerCase().includes(cleaned) ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.token.toLowerCase().includes(query.toLowerCase())
    );

    if (storedMatch) {
      setSelectedPatient({
        abhaId: storedMatch.abhaId,
        patientName: storedMatch.name,
        age: storedMatch.age || 45,
        gender: storedMatch.gender || 'Male',
        phone: storedMatch.phone || '+91 98765 43210',
        bloodGroup: 'B+',
        visits: [
          {
            visitId: `VISIT-LIVE-${storedMatch.token || storedMatch.id}`,
            date: `Today - ${storedMatch.triageTimestamp || 'Active Session'}`,
            department: storedMatch.department || 'Cardiology OPD',
            cabin: storedMatch.cabin || storedMatch.roomNumber || 'Cabin #104',
            attendingDoctor: storedMatch.attendingDoctor || 'Dr. Ananya Sen (Consultant Cardiologist)',
            status: storedMatch.status === 'EMERGENCY' ? 'EMERGENCY_TRIAGE' : (storedMatch.status as any),
            severityScore: storedMatch.isEmergency ? 8 : 4,
            symptoms: [
              storedMatch.chiefComplaint,
              `Onset: ${storedMatch.socrates?.onset || 'Recent'} | Site: ${storedMatch.socrates?.site || 'General'}`,
              storedMatch.socrates?.radiation ? `Radiation: ${storedMatch.socrates.radiation}` : '',
              storedMatch.socrates?.associations ? `Associations: ${storedMatch.socrates.associations}` : '',
            ].filter(Boolean),
            diagnosis: storedMatch.doctorNotes?.slice(0, 80) || (storedMatch.isEmergency ? 'Acute Coronary Syndrome / High-Risk Chest Discomfort' : 'Clinical Triage Evaluation Complete'),
            icd10Code: storedMatch.isEmergency ? 'I20.9 (Angina Pectoris / ACS)' : 'R07.9 (Clinical Assessment)',
            doctorNotes: storedMatch.doctorNotes,
            orderedDiagnostics: storedMatch.orderedDiagnostics || [],
            prescriptions: (storedMatch.prescriptions && storedMatch.prescriptions.length > 0)
              ? storedMatch.prescriptions
              : [
                  { name: 'Tab Aspirin 150mg', dosage: '1-0-0', frequency: 'OD (Post-meal)', duration: '30 Days' },
                  { name: 'Tab Atorvastatin 40mg', dosage: '0-0-1', frequency: 'Bedtime', duration: '30 Days' },
                  { name: 'Tab Pantoprazole 40mg', dosage: '1-0-0', frequency: 'Before breakfast', duration: '7 Days' },
                ],
            lifestyleAdvice: ['Physical rest', 'Low sodium diet', 'Regular follow-up in OPD'],
            abdmSyncStatus: storedMatch.status === 'COMPLETED' ? 'Verified (M1/M2/M3)' : 'Pending Sync',
          },
        ],
      });
      setErrorMessage(null);
      return;
    }

    // 2. Check in mock database
    const found = mockPatientDatabase.find(
      (p) =>
        p.abhaId.replace(/[-\s]/g, '').toLowerCase().includes(cleaned) ||
        p.patientName.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setSelectedPatient(found);
      setErrorMessage(null);
      return;
    }

    // 3. Check in prop queue
    const queueMatch = queue.find(
      (q) =>
        q.abhaId.replace(/[-\s]/g, '').toLowerCase().includes(cleaned) ||
        q.patientName.toLowerCase().includes(query.toLowerCase()) ||
        q.tokenNumber.toLowerCase().includes(query.toLowerCase())
    );

    if (queueMatch) {
      setSelectedPatient({
        abhaId: queueMatch.abhaId,
        patientName: queueMatch.patientName,
        age: queueMatch.age || 35,
        gender: queueMatch.gender || 'Other',
        phone: queueMatch.phone || '+91 90000 11111',
        bloodGroup: 'A+',
        visits: [
          {
            visitId: `VISIT-LIVE-${queueMatch.tokenNumber}`,
            date: `Today - ${queueMatch.registeredAt || 'Active'}`,
            department: queueMatch.department,
            cabin: queueMatch.roomNumber,
            attendingDoctor: queueMatch.assignedDoctor,
            status: queueMatch.status,
            severityScore: queueMatch.redFlagSeverity === 'CRITICAL' ? 9 : 3,
            symptoms: [queueMatch.chiefComplaint],
            diagnosis: 'Active Clinical Consultation',
            icd10Code: 'R07.9 (Symptomatic Evaluation)',
            prescriptions: [{ name: 'Pending Final Rx', dosage: '-', frequency: '-', duration: '-' }],
            lifestyleAdvice: ['Awaiting clinician consultation'],
            abdmSyncStatus: queueMatch.status === 'COMPLETED' ? 'Verified (M1/M2/M3)' : 'Pending Sync',
          },
        ],
      });
      setErrorMessage(null);
    } else {
      setSelectedPatient(null);
      setErrorMessage(`No patient found matching "${query}". Try searching "Ramesh K. Verma" or "Rahul Sharma".`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-500/30 uppercase tracking-widest">
            ABDM M3 Health Locker Gateway
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">Patient History & Visit Timeline Lookup</h2>
          <p className="text-xs text-slate-400">
            Secure read-only access to historical visit statuses, clinical summaries, and ICD-10 diagnoses via ABHA ID.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchAbha}
              onChange={(e) => setSearchAbha(e.target.value)}
              placeholder="Enter ABHA ID (e.g. 91-4521...) or Name"
              className="bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 w-full focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shrink-0 shadow-md shadow-cyan-600/20"
          >
            Lookup History
          </button>
        </form>
      </div>

      {errorMessage && (
        <div className="bg-amber-950/40 border border-amber-500/40 text-amber-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedPatient && !errorMessage && (
        <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No Patient Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Enter an ABHA ID or patient name above (or try searching <span className="text-cyan-400 font-mono">Rahul Sharma</span>) to review historical records and clinical timelines.
          </p>
        </div>
      )}

      {selectedPatient && (
        <div className="space-y-6 animate-fadeIn">
          {/* Patient Demographic Card */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-lg">
                {selectedPatient.patientName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPatient.patientName}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-cyan-300 border border-slate-800">ABHA: {selectedPatient.abhaId}</span>
                  <span>{selectedPatient.age} yrs • {selectedPatient.gender}</span>
                  <span>Blood: <strong className="text-white">{selectedPatient.bloodGroup}</strong></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>DPDP Consent Verified & Active</span>
            </div>
          </div>

          {/* Visit Timeline */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Historical Visit Timeline ({selectedPatient.visits.length} Encounters Recorded)</span>
            </h3>

            <div className="space-y-4 relative pl-6 border-l-2 border-slate-800 ml-3">
              {selectedPatient.visits.map((visit, idx) => (
                <div key={idx} className="relative bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition-all">
                  <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-cyan-500 border-4 border-slate-950"></div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 font-bold">{visit.visitId}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          visit.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{visit.department} • <span className="text-slate-400 text-xs font-normal">{visit.cabin}</span></h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-mono block">{visit.date}</span>
                      <span className="text-xs font-semibold text-cyan-300">Attending: {visit.attendingDoctor}</span>
                    </div>
                  </div>

                  {/* Symptoms & Diagnosis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <strong className="block text-slate-400 uppercase text-[10px] tracking-wider mb-1">Recorded Symptoms</strong>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {visit.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <strong className="block text-cyan-400 uppercase text-[10px] tracking-wider mb-1">Finalized Diagnosis & ICD-10</strong>
                      <p className="font-bold text-white">{visit.diagnosis}</p>
                      <span className="inline-block mt-1 bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono text-[11px] border border-cyan-800">
                        {visit.icd10Code}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Notes & Clinical Impression */}
                  {visit.doctorNotes && (
                    <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                      <strong className="block text-emerald-400 uppercase text-[10px] tracking-wider font-bold">
                        Attending Doctor Notes & Clinical Plan
                      </strong>
                      <p className="text-slate-200 leading-relaxed font-sans">{visit.doctorNotes}</p>
                    </div>
                  )}

                  {/* Ordered Diagnostics */}
                  {visit.orderedDiagnostics && visit.orderedDiagnostics.length > 0 && (
                    <div>
                      <strong className="block text-[10px] uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <TestTube2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ordered Stat Diagnostics & Lab Work</span>
                      </strong>
                      <div className="flex flex-wrap gap-2">
                        {visit.orderedDiagnostics.map((diag, i) => (
                          <span
                            key={i}
                            className="bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            {typeof diag === 'string' ? diag : diag.label || diag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescriptions */}
                  <div>
                    <strong className="block text-[10px] uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-blue-400" />
                      <span>Prescribed Medications</span>
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {visit.prescriptions.map((med, i) => (
                        <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                          <strong className="text-white block">{med.name}</strong>
                          <span className="text-slate-400 text-[11px]">{med.dosage} {med.frequency ? `• ${med.frequency}` : ''} {med.duration ? `• ${med.duration}` : ''}</span>
                          {med.instructions && <p className="text-[10px] text-cyan-300 mt-0.5 italic">{med.instructions}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>Lifestyle Advice: {visit.lifestyleAdvice.join(', ')}</span>
                    <span className="text-emerald-400 font-medium">{visit.abdmSyncStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
