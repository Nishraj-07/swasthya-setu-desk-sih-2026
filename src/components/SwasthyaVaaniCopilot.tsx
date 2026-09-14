/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Phone, PhoneOff, Mic, Activity, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { BhashiniLanguage, ClinicalTrack } from '../types';

interface ClinicalReport {
  differentials: { condition: string; probability: number; rationale: string }[];
  redFlags: string[];
  icd10Codes: { code: string; description: string }[];
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

interface SwasthyaVaaniCopilotProps {
  language?: BhashiniLanguage;
  clinicalTrack?: ClinicalTrack;
  onClose?: () => void;
}

export const SwasthyaVaaniCopilot: React.FC<SwasthyaVaaniCopilotProps> = ({
  language,
  clinicalTrack,
  onClose,
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState<{ sender: string; text: string }[]>([]);
  const [report, setReport] = useState<ClinicalReport | null>(null);

  const startConsultation = () => {
    setIsCallActive(true);
    setTranscript([
      { sender: 'Swasthya Vaani AI', text: 'Namaste. I am Dr. Swasthya Vaani. Please describe your primary symptoms and how long you have been experiencing them.' }
    ]);
  };

  const simulatePatientResponse = (input: string) => {
    const updated = [...transcript, { sender: 'Patient', text: input }];
    setTranscript(updated);

    // Simulate AI clinical reasoning output after intake
    setTimeout(() => {
      setTranscript([
        ...updated,
        { sender: 'Swasthya Vaani AI', text: 'Thank you. I have analyzed your symptoms and reviewed your uploaded lab report. Generating the clinical handover for the doctor...' }
      ]);
      
      setReport({
        differentials: [
          { condition: 'Acute Coronary Syndrome / Unstable Angina', probability: 78, rationale: 'Retrosternal chest discomfort with radiation to left arm and diaphoresis.' },
          { condition: 'Gastroesophageal Reflux Disease (GERD)', probability: 15, rationale: 'Epigastric burning exacerbated post-meals.' },
          { condition: 'Musculoskeletal Chest Wall Pain', probability: 7, rationale: 'Localized tenderness without autonomic symptoms.' }
        ],
        redFlags: ['STAT ECG Required within 10 minutes', 'Monitor continuous SpO2 and Blood Pressure'],
        icd10Codes: [
          { code: 'I20.9', description: 'Angina pectoris, unspecified' },
          { code: 'R07.9', description: 'Chest pain, unspecified' }
        ],
        soap: {
          subjective: '45-year-old patient presents with acute onset retrosternal chest tightness radiating to the left arm, lasting 45 minutes.',
          objective: 'Vitals logged via kiosk: BP 142/90 mmHg, HR 102 bpm, SpO2 96% on room air. Lab OCR shows mild dyslipidemia.',
          assessment: 'High probability of cardiac etiology. Rule out acute coronary syndrome immediately.',
          plan: '1. Immediate 12-lead ECG. 2. Troponin-I STAT assay. 3. Sublingual nitroglycerin per protocol if BP permits. 4. Urgent physician evaluation in Cabin 01.'
        }
      });
      setIsCallActive(false);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 sm:p-8 max-w-4xl mx-auto my-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-200 pb-5 mb-6 gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AIIMS Clinical Intelligence Copilot</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">Swasthya Vaani & Report Generator</h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Real-time voice intake in {language ? language.nativeName : 'Hindi/English'}, lab OCR analysis, and doctor-ready clinical synthesis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isCallActive && !report && (
            <button 
              onClick={startConsultation}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2.5 cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
              Start Swasthya Vaani Call
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 font-bold px-3 py-1.5 rounded-lg text-sm bg-stone-100"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {isCallActive && (
        <div className="bg-stone-950 text-white rounded-2xl p-6 mb-6 shadow-2xl relative z-10 border border-stone-800">
          <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
            <span className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
              <span className="animate-ping w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Live Voice Consultation Active (Bhashini 22-Lang Audio Engine)
            </span>
            <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded-full border border-emerald-800 font-mono">SOCRATES Engine Running</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-5 p-3 bg-stone-900/50 rounded-xl border border-stone-800">
            {transcript.map((t, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl text-sm ${t.sender.includes('AI') ? 'bg-stone-800 text-emerald-300 border border-emerald-900/50' : 'bg-emerald-900/40 text-stone-100 ml-8 border border-emerald-700/30'}`}>
                <strong className="block text-xs uppercase tracking-wider text-stone-400 mb-1">{t.sender}</strong>
                {t.text}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => simulatePatientResponse("I have severe pressure-like chest pain radiating to my left arm since 30 minutes ago, rated 8 out of 10.")}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Simulate Patient Voice Input: Chest Pain (8/10)</span>
            </button>
            <button 
              onClick={() => setIsCallActive(false)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-5 rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-6 bg-stone-50 border border-stone-200 rounded-2xl p-6 relative z-10">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-stone-900">Doctor Handover Report & Clinical Decision Support</h3>
              <p className="text-xs text-stone-500">Synthesized via AIIMS Autonomous Clinical Protocol</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Validated by Swasthya Vaani AI
            </span>
          </div>

          {/* Red Flags */}
          {report.redFlags.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-800 shadow-xs">
              <h4 className="font-black text-xs uppercase tracking-wider flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>STAT Red Flag Alerts</span>
              </h4>
              <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                {report.redFlags.map((flag, i) => <li key={i} className="font-semibold">{flag}</li>)}
              </ul>
            </div>
          )}

          {/* Differentials */}
          <div>
            <h4 className="font-bold text-stone-700 mb-3 text-xs uppercase tracking-wider">Probability-Ranked Differential Diagnoses</h4>
            <div className="space-y-2.5">
              {report.differentials.map((diff, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-stone-200 flex justify-between items-center text-sm shadow-xs">
                  <div>
                    <span className="font-bold text-stone-900">{diff.condition}</span>
                    <p className="text-xs text-stone-500 mt-0.5">{diff.rationale}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black shrink-0 ${diff.probability > 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {diff.probability}% Prob.
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ICD-10 & SOAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
              <h4 className="font-bold text-stone-700 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>ICD-10 Coded Output</span>
              </h4>
              <div className="space-y-2">
                {report.icd10Codes.map((c, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-emerald-800 font-bold">{c.code}</span>
                    <span className="text-stone-700 ml-2">{c.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
              <h4 className="font-bold text-stone-700 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>ABDM HL7 FHIR SOAP Summary</span>
              </h4>
              <div className="space-y-2 text-xs text-stone-700">
                <p><strong>S:</strong> {report.soap.subjective}</p>
                <p><strong>O:</strong> {report.soap.objective}</p>
                <p><strong>A:</strong> {report.soap.assessment}</p>
                <p><strong>P:</strong> {report.soap.plan}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
