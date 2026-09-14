/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DigitizedDocument,
  RedFlagAlert,
  SocratesHistory,
  AyushPariksha,
  StructuredClinicalSummary,
  PatientProfile,
} from '../types';

export const EXTRACTOR_SYSTEM_PROMPT = `
You are a strict clinical data extractor. Analyze the patient transcript and extract SOCRATES parameters.

CRITICAL INSTRUCTIONS (STRICT NEGATIVE ENFORCEMENT):
- ONLY extract information directly stated by the patient.
- NEVER assume or extrapolate clinical details (such as pain radiation, location, or severity) based on classic medical presentations.
- If the patient mentions chest pain but does not explicitly state that it travels or radiates to another body part (e.g., left arm, jaw, back), you MUST set radiation strictly to "None reported" or "Unspecified". Do not hallucinate textbook symptoms.
- If the patient does not state an attribute (e.g., exact position, duration in days/hours, radiation), set that field strictly to "None reported" or "Unspecified".

Output JSON format:
{
  "socrates": {
    "site": string | "Unspecified",
    "onset": string | "Unspecified",
    "character": string | "Unspecified",
    "radiation": string | "None reported" | "Unspecified",
    "associations": string | "Unspecified",
    "timing_duration": string | "Unspecified",
    "exacerbating_relieving": string | "Unspecified",
    "severity": string | "Unspecified"
  },
  "clarification_needed": string[] // list of unmentioned parameters to ask next
}
`;

// Sample Medical Lab Report SVG Data URI for instant high-fidelity OCR preview
export const SAMPLE_NABL_LAB_REPORT_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="340" height="460" viewBox="0 0 340 460" fill="%23ffffff"><rect width="340" height="460" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2" rx="10"/><rect x="18" y="18" width="304" height="48" rx="6" fill="%230f172a"/><text x="32" y="44" font-family="sans-serif" font-size="13" font-weight="bold" fill="%2338bdf8">APOLLO DIAGNOSTICS &amp; NABL LABS</text><text x="32" y="58" font-family="sans-serif" font-size="9" fill="%2394a3b8">NABL Accredited • ISO 15189 • Reg: #APL-BLR-9920</text><text x="20" y="86" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="%231e293b">COMPREHENSIVE METABOLIC &amp; CARDIAC PANEL</text><text x="20" y="99" font-family="sans-serif" font-size="9" fill="%2364748b">Sample Collected: 2026-08-25 | Fasting Blood (Serum)</text><rect x="18" y="112" width="304" height="22" fill="%23f1f5f9"/><text x="24" y="127" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23475569">TEST NAME</text><text x="165" y="127" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23475569">VALUE</text><text x="245" y="127" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23475569">REFERENCE</text><text x="24" y="152" font-family="sans-serif" font-size="9" fill="%231e293b">Glycated Hb (HbA1c)</text><text x="165" y="152" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23dc2626">8.6 % (HIGH)</text><text x="245" y="152" font-family="sans-serif" font-size="8.5" fill="%2364748b">4.0 - 5.6 %</text><line x1="18" y1="162" x2="322" y2="162" stroke="%23f1f5f9"/><text x="24" y="180" font-family="sans-serif" font-size="9" fill="%231e293b">Fasting Blood Sugar</text><text x="165" y="180" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23dc2626">174 mg/dL</text><text x="245" y="180" font-family="sans-serif" font-size="8.5" fill="%2364748b">70 - 100 mg/dL</text><line x1="18" y1="190" x2="322" y2="190" stroke="%23f1f5f9"/><text x="24" y="208" font-family="sans-serif" font-size="9" fill="%231e293b">High-Sens Troponin I</text><text x="165" y="208" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23dc2626">0.052 ng/mL (ELEVATED)</text><text x="245" y="208" font-family="sans-serif" font-size="8.5" fill="%2364748b">&lt; 0.014 ng/mL</text><line x1="18" y1="218" x2="322" y2="218" stroke="%23f1f5f9"/><text x="24" y="236" font-family="sans-serif" font-size="9" fill="%231e293b">Serum Creatinine</text><text x="165" y="236" font-family="sans-serif" font-size="9" font-weight="bold" fill="%2316a34a">1.02 mg/dL</text><text x="245" y="236" font-family="sans-serif" font-size="8.5" fill="%2364748b">0.7 - 1.3 mg/dL</text><line x1="18" y1="246" x2="322" y2="246" stroke="%23f1f5f9"/><text x="24" y="264" font-family="sans-serif" font-size="9" fill="%231e293b">LDL Cholesterol</text><text x="165" y="264" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23dc2626">158 mg/dL</text><text x="245" y="264" font-family="sans-serif" font-size="8.5" fill="%2364748b">&lt; 100 mg/dL</text><rect x="18" y="285" width="304" height="60" rx="6" fill="%23fef2f2" stroke="%23fecaca"/><text x="26" y="303" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23991b1b">PATHOLOGY CRITICAL ALERT:</text><text x="26" y="318" font-family="sans-serif" font-size="8.5" fill="%237f1d1d">• Uncontrolled Type-2 Diabetes with elevated Troponin I.</text><text x="26" y="331" font-family="sans-serif" font-size="8.5" fill="%237f1d1d">• Urgent Cardiology &amp; Diabetology evaluation advised.</text><text x="20" y="445" font-family="sans-serif" font-size="8" fill="%2394a3b8">Authorized Signatory: Dr. R. Iyer, MD (Pathology) • ABDM Health Facility ID: IN-KA-HOSP-0021</text></svg>`;

export const SAMPLE_PRESCRIPTION_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="340" height="460" viewBox="0 0 340 460" fill="%23ffffff"><rect width="340" height="460" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2" rx="10"/><rect x="18" y="18" width="304" height="48" rx="6" fill="%230284c7"/><text x="32" y="42" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23ffffff">MAX HEALTHCARE CLINICAL OPD</text><text x="32" y="56" font-family="sans-serif" font-size="8.5" fill="%23e0f2fe">Dr. S. Kulkarni, MD, DM (Cardiology) • Reg: KMC/44910</text><line x1="18" y1="80" x2="322" y2="80" stroke="%23e2e8f0" stroke-width="1.5"/><text x="20" y="98" font-family="serif" font-size="18" font-weight="bold" fill="%230284c7">℞ (Rx)</text><text x="20" y="124" font-family="sans-serif" font-size="10" font-weight="bold" fill="%231e293b">1. Tab. Ecosprin 75 mg (Aspirin)</text><text x="36" y="139" font-family="sans-serif" font-size="9" fill="%2364748b">1 tablet once daily after lunch (Post Prandial) • 30 days</text><text x="20" y="165" font-family="sans-serif" font-size="10" font-weight="bold" fill="%231e293b">2. Tab. Atorvastatin 20 mg</text><text x="36" y="180" font-family="sans-serif" font-size="9" fill="%2364748b">1 tablet at bedtime (Nocte) • 30 days</text><text x="20" y="206" font-family="sans-serif" font-size="10" font-weight="bold" fill="%231e293b">3. Tab. Metformin 500 mg SR</text><text x="36" y="221" font-family="sans-serif" font-size="9" fill="%2364748b">1 tablet twice daily with meals • 30 days</text><text x="20" y="247" font-family="sans-serif" font-size="10" font-weight="bold" fill="%231e293b">4. Tab. Clopidogrel 75 mg</text><text x="36" y="262" font-family="sans-serif" font-size="9" fill="%2364748b">1 tablet once daily morning • 30 days</text><rect x="18" y="290" width="304" height="48" rx="6" fill="%23fffbeb" stroke="%23fde68a"/><text x="26" y="308" font-family="sans-serif" font-size="9" font-weight="bold" fill="%2392400e">CLINICAL DIRECTIVE &amp; ADVICE:</text><text x="26" y="322" font-family="sans-serif" font-size="8.5" fill="%23b45309">Repeat lipid profile and ECG if chest discomfort recurs.</text><text x="20" y="445" font-family="sans-serif" font-size="8" fill="%2394a3b8">Digitally generated Prescription • ABDM Compliant E-Prescription</text></svg>`;

export const SAMPLE_DISCHARGE_SUMMARY_DATA_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="340" height="460" viewBox="0 0 340 460" fill="%23ffffff"><rect width="340" height="460" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2" rx="10"/><rect x="18" y="18" width="304" height="44" rx="6" fill="%231e293b"/><text x="30" y="42" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23f8fafc">AIIMS IPD DISCHARGE SUMMARY</text><text x="20" y="80" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%23334155">ADMISSION: 2024-03-10 | DISCHARGE: 2024-03-14</text><text x="20" y="96" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%230f766e">PROCEDURE: Percutaneous Coronary Angioplasty (PTCA)</text><text x="20" y="112" font-family="sans-serif" font-size="9" fill="%23475569">Drug-Eluting Stent (DES) placed in Left Anterior Descending (LAD) artery.</text><text x="20" y="138" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%231e293b">DISCHARGE DIAGNOSIS:</text><text x="20" y="154" font-family="sans-serif" font-size="9" fill="%23334155">Coronary Artery Disease (CAD - Single Vessel Disease), T2DM, HTN.</text><text x="20" y="180" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="%231e293b">ALLERGY RECORD:</text><text x="20" y="196" font-family="sans-serif" font-size="9" font-weight="bold" fill="%23b91c1c">Penicillin Allergy (Urticaria &amp; Bronchospasm)</text><text x="20" y="445" font-family="sans-serif" font-size="8" fill="%2394a3b8">Govt of India ABDM Health Records Provider • AIIMS</text></svg>`;

export const SAMPLE_INITIAL_DOCUMENTS: DigitizedDocument[] = [
  {
    id: 'doc-001',
    fileName: 'Apollo_NABL_Lab_Panel_2026.png',
    docType: 'LAB_REPORT',
    documentDate: '2026-08-25',
    facilityName: 'Apollo Diagnostics & NABL Labs',
    previewUrl: SAMPLE_NABL_LAB_REPORT_DATA_URL,
    rawOcrText:
      'APOLLO DIAGNOSTICS & NABL LABS. Fasting Blood Sugar: 174 mg/dL (HIGH). Glycated Hb (HbA1c): 8.6 % (HIGH). High-Sens Troponin I: 0.052 ng/mL (ELEVATED). Serum Creatinine: 1.02 mg/dL. LDL Cholesterol: 158 mg/dL (HIGH).',
    diagnoses: ['Uncontrolled Type-2 Diabetes Mellitus', 'Suspected Acute Coronary Event', 'Hyperlipidemia'],
    medications: [],
    labResults: [
      {
        parameter: 'HbA1c (Glycated Hemoglobin)',
        value: '8.6 %',
        numericValue: 8.6,
        unit: '%',
        referenceRange: '4.0 - 5.6 %',
        status: 'HIGH',
        date: '2026-08-25',
      },
      {
        parameter: 'Fasting Blood Sugar',
        value: '174 mg/dL',
        numericValue: 174,
        unit: 'mg/dL',
        referenceRange: '70 - 100 mg/dL',
        status: 'HIGH',
        date: '2026-08-25',
      },
      {
        parameter: 'High-Sens Troponin I',
        value: '0.052 ng/mL',
        numericValue: 0.052,
        unit: 'ng/mL',
        referenceRange: '< 0.014 ng/mL',
        status: 'CRITICAL',
        date: '2026-08-25',
      },
      {
        parameter: 'LDL Cholesterol',
        value: '158 mg/dL',
        numericValue: 158,
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        status: 'HIGH',
        date: '2026-08-25',
      },
      {
        parameter: 'Serum Creatinine',
        value: '1.02 mg/dL',
        numericValue: 1.02,
        unit: 'mg/dL',
        referenceRange: '0.7 - 1.3 mg/dL',
        status: 'NORMAL',
        date: '2026-08-25',
      },
    ],
    surgeriesAndProcedures: [],
    abnormalFlags: ['Elevated Cardiac Troponin I (0.052 ng/mL)', 'HbA1c > 8.5% (Poor Glycemic Regulation)', 'LDL > 150 mg/dL'],
    drugInteractions: [],
  },
  {
    id: 'doc-002',
    fileName: 'Max_Cardio_Prescription_2026.png',
    docType: 'PRESCRIPTION',
    documentDate: '2026-08-15',
    facilityName: 'Max Healthcare Clinical OPD',
    previewUrl: SAMPLE_PRESCRIPTION_DATA_URL,
    rawOcrText:
      'MAX HEALTHCARE. Rx: 1. Tab. Ecosprin 75mg OD Post Prandial. 2. Tab. Atorvastatin 20mg Nocte. 3. Tab. Metformin 500mg SR BD. 4. Tab. Clopidogrel 75mg OD morning.',
    diagnoses: ['Ischemic Heart Disease (IHD)', 'Dyslipidemia'],
    medications: [
      { name: 'Ecosprin (Aspirin)', dosage: '75 mg', frequency: 'Once daily (Post-lunch)', status: 'active', route: 'Oral' },
      { name: 'Atorvastatin', dosage: '20 mg', frequency: 'Once daily (Night)', status: 'active', route: 'Oral' },
      { name: 'Metformin SR', dosage: '500 mg', frequency: 'Twice daily with food', status: 'active', route: 'Oral' },
      { name: 'Clopidogrel', dosage: '75 mg', frequency: 'Once daily morning', status: 'active', route: 'Oral' },
    ],
    labResults: [],
    surgeriesAndProcedures: [],
    abnormalFlags: ['Dual Antiplatelet Therapy (DAPT) active: High bleed precaution'],
    drugInteractions: ['Dual Antiplatelet (Aspirin + Clopidogrel) requires gastroprotection if dyspepsia presents'],
  },
  {
    id: 'doc-003',
    fileName: 'AIIMS_Discharge_Summary_2024.png',
    docType: 'DISCHARGE_SUMMARY',
    documentDate: '2024-03-14',
    facilityName: 'AIIMS New Delhi',
    previewUrl: SAMPLE_DISCHARGE_SUMMARY_DATA_URL,
    rawOcrText:
      'AIIMS DISCHARGE SUMMARY. Admission: 2024-03-10 to 2024-03-14. Procedure: PTCA with DES to LAD. Allergy: Penicillin (Severe Urticaria & Bronchospasm). Diagnosis: CAD (Single Vessel Disease).',
    diagnoses: ['Coronary Artery Disease (CAD - SVD)', 'Hypertension'],
    medications: [],
    labResults: [],
    surgeriesAndProcedures: ['Percutaneous Transluminal Coronary Angioplasty (PTCA with Drug Eluting Stent to LAD) - 2024'],
    abnormalFlags: ['CRITICAL ALLERGY: Penicillin group antibiotics contraindicated'],
    drugInteractions: [],
  },
];

// NLP Red-Flag Emergency Detection Engine
export function detectRedFlags(transcript: string, touchComplaints: string[] = []): RedFlagAlert {
  const text = (transcript + ' ' + touchComplaints.join(' ')).toLowerCase();

  // 1. CARDIAC ACUTE CORONARY RED FLAGS
  const cardiacKeywords = ['chest pain', 'chhati me dard', 'seene me dard', 'dharakan', 'sweating', 'left arm', 'jaw pain', 'tightness', 'radiation to shoulder', 'heavy weight on chest', 'ghabrahat', 'dizziness'];
  const hasCardiac = cardiacKeywords.filter((k) => text.includes(k));
  if (hasCardiac.length >= 2 || text.includes('chest pain') || text.includes('seene me dard') || text.includes('left arm')) {
    return {
      isTriggered: true,
      category: 'CARDIAC',
      title: 'ACUTE CORONARY SYNDROME / CHEST PAIN RED FLAG',
      description: 'Patient reported retrosternal/chest pain with potential radiation, autonomic symptoms or dizziness. High risk for acute myocardial ischemia.',
      severity: 'CRITICAL',
      triageAction: 'IMMEDIATE TRIAGE BYPASS: Rush to Bed 1 for Stat 12-Lead ECG & IV Access',
      detectedKeywords: hasCardiac.length ? hasCardiac : ['Chest Pain'],
    };
  }

  // 2. STROKE (FAST) SIGNS
  const strokeKeywords = ['face drooping', 'facial weakness', 'slurred speech', 'arm weakness', 'sudden numbness', 'loss of vision', 'paralysis', 'ek taraf kamzori', 'bolne me dikkat'];
  const hasStroke = strokeKeywords.filter((k) => text.includes(k));
  if (hasStroke.length >= 1) {
    return {
      isTriggered: true,
      category: 'STROKE_FAST',
      title: 'ACUTE STROKE (FAST) PROTOCOL ALERT',
      description: 'Sudden neurological deficit, facial asymmetry, or acute speech disturbance detected.',
      severity: 'CRITICAL',
      triageAction: 'IMMEDIATE STROKE CODE: Activate CT Brain Protocol & Neuro-Triage',
      detectedKeywords: hasStroke,
    };
  }

  // 3. SEVERE RESPIRATORY DISTRESS
  const respKeywords = ['saans lene me takleef', 'cannot breathe', 'gasping', 'cyanosis', 'blue lips', 'stridor', 'severe wheeze', 'oxygen falling', 'suffocation'];
  const hasResp = respKeywords.filter((k) => text.includes(k));
  if (hasResp.length >= 1) {
    return {
      isTriggered: true,
      category: 'RESPIRATORY',
      title: 'ACUTE RESPIRATORY COMPROMISE',
      description: 'Severe dyspnea, air hunger, or stridor reported.',
      severity: 'CRITICAL',
      triageAction: 'EMERGENCY OXYGEN & STAT SPO2 EVALUATION',
      detectedKeywords: hasResp,
    };
  }

  // 4. ANAPHYLAXIS
  const allergyKeywords = ['swollen throat', 'tongue swelling', 'rash after injection', 'anaphylaxis', 'gale me sujan', 'allergy'];
  const hasAllergy = allergyKeywords.filter((k) => text.includes(k));
  if (hasAllergy.length >= 1 && (text.includes('swelling') || text.includes('breathing') || text.includes('sujan'))) {
    return {
      isTriggered: true,
      category: 'ANAPHYLAXIS',
      title: 'SEVERE ALLERGIC REACTION / ANAPHYLAXIS',
      description: 'Acute airway swelling or widespread hives with respiratory distress.',
      severity: 'CRITICAL',
      triageAction: 'IMMEDIATE IM EPINEPHRINE & AIRWAY PROTECTION',
      detectedKeywords: hasAllergy,
    };
  }

  return {
    isTriggered: false,
    category: 'NONE',
    title: 'Standard OPD Triage',
    description: 'No immediate red-flag physiological emergencies identified. Routine OPD queue assigned.',
    severity: 'STANDARD',
    triageAction: 'Standard Consultation Queue (Doctor Cabin 4)',
    detectedKeywords: [],
  };
}

// SOCRATES Adaptive Inquiry Branches
export interface SocratesPreset {
  id: string;
  label: string;
  hindiLabel: string;
  socrates: SocratesHistory;
  sampleVoicePrompt: string;
}

export const COMMON_SOCRATES_PRESETS: SocratesPreset[] = [
  {
    id: 'chest-pain-socrates',
    label: 'Chest Pain & Breathlessness',
    hindiLabel: 'सीने में दर्द व सांस फूलना',
    sampleVoicePrompt: 'I have sharp retrosternal chest pain that started yesterday morning. It radiates down my left shoulder and arm. Deep breathing makes it worse and I feel dizzy.',
    socrates: {
      site: 'Retrosternal / Left Precordial',
      onset: 'Sudden onset 24 hours ago (yesterday morning)',
      character: 'Sharp squeezing pressure with heavy feeling',
      radiation: 'Radiates to left shoulder, inner arm, and lower jaw',
      associatedSymptoms: ['Mild dyspnea on exertion', 'Dizziness', 'Cold diaphoresis'],
      timeCourse: 'Intermittent episodes lasting 15-20 minutes',
      exacerbatingFactors: 'Worsens with deep inspiration and climbing stairs; relieved slightly by rest',
      severity: 8,
    },
  },
  {
    id: 'abdomen-pain-socrates',
    label: 'Severe Epigastric / Abdominal Pain',
    hindiLabel: 'पेट में तेज दर्द व जलन',
    sampleVoicePrompt: 'I have severe burning pain in the upper abdomen for 3 days, especially after spicy food. Feeling nauseous with vomiting.',
    socrates: {
      site: 'Epigastric & Right Upper Quadrant',
      onset: 'Gradual onset 3 days ago',
      character: 'Severe burning and gnawing ache',
      radiation: 'Radiates through to the mid-back',
      associatedSymptoms: ['Post-prandial nausea', 'Acid reflux / water brash', 'Loss of appetite'],
      timeCourse: 'Constant burning sensation with post-meal peaks',
      exacerbatingFactors: 'Worsens with spicy foods, fasting, and NSAID intake',
      severity: 6,
    },
  },
  {
    id: 'cough-fever-socrates',
    label: 'Persistent Productive Cough & High Fever',
    hindiLabel: 'लगातार खांसी व तेज बुखार',
    sampleVoicePrompt: 'I have high fever with chills for 5 days and continuous productive cough with yellowish phlegm. Feeling very weak.',
    socrates: {
      site: 'Diffuse Bilateral Thoracic / Chest',
      onset: 'Subacute onset 5 days ago',
      character: 'Deep hacking cough with chest soreness',
      radiation: 'Non-radiating',
      associatedSymptoms: ['High grade fever (102°F) with chills', 'Purulent sputum', 'Generalized myalgia'],
      timeCourse: 'Continuous fever with nocturnal coughing spasms',
      exacerbatingFactors: 'Cold air and supine position; hot fluids give slight relief',
      severity: 7,
    },
  },
  {
    id: 'headache-neuro-socrates',
    label: 'Unilateral Throbbing Headache with Photophobia',
    hindiLabel: 'आधे सिर में तेज दर्द व उल्टी जैसा लगना',
    sampleVoicePrompt: 'Severe pulsating headache on the right side of my head since this morning, with sensitivity to bright lights and nausea.',
    socrates: {
      site: 'Right Hemicranial / Temporal-orbital',
      onset: 'Acute onset 6 hours ago',
      character: 'Throbbing, pulsating vascular headache',
      radiation: 'Radiates to retro-orbital region and nape of neck',
      associatedSymptoms: ['Photophobia', 'Phonophobia', 'Severe nausea', 'Visual aura (flashing zig-zags)'],
      timeCourse: 'Peak intensity reached within 2 hours',
      exacerbatingFactors: 'Bright sunlight, loud noises, and head movements; dark quiet room relieves',
      severity: 8,
    },
  },
];

// AYUSH Dashavidha Pariksha Default Clinical Models
export const DEFAULT_AYUSH_PARIKSHA: AyushPariksha = {
  prakriti: 'Vata-Pitta',
  vikriti: 'Pitta-Vata Prakopa (Elevated Agni with Vata Vyadhi in Hridaya sthana)',
  sara: 'Madhyama (Medium)',
  samhanana: 'Moderate',
  pramana: 'Proportionate',
  satmya: 'Sarva-Rasa (Adaptable)',
  sattva: 'Madhyama',
  aharaShakti: 'Mandagni (Low)',
  vyayamaShakti: 'Moderate',
  vaya: 'Madhyama (Adult)',
  aharaVihara: {
    dietaryPattern: 'Katu-Tikta (Pungent & Spicy) intake, irregular meal timings (Vishamashana)',
    sleepPattern: 'Anidra (Disturbed sleep, < 5.5 hours/night)',
    bowelHabits: 'Krura Koshta (Vata predominant dry bowels/constipation)',
    waterIntake: '1.5 Liters/day (Ushnodaka preferred)',
  },
};

// HL7 FHIR v4.0.1 Resource Bundle Synthesizer (complies with ABDM Health Data Exchange)
export function generateFhirBundle(
  patient: PatientProfile,
  summary: StructuredClinicalSummary
): string {
  const fhirObject = {
    resourceType: 'Bundle',
    id: `abdm-opd-bundle-${Date.now()}`,
    identifier: {
      system: 'https://ndhm.gov.in/fhir/bundles',
      value: `HIS-OPD-${patient.abhaId || 'ABHA-8829-1022-3110'}`,
    },
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: patient.abhaId || 'ABHA-8829-1022-3110',
          identifier: [
            {
              system: 'https://healthid.ndhm.gov.in',
              value: patient.abhaId || '91-8829-1022-3110',
            },
          ],
          name: [{ text: patient.name || 'Suresh Kumar Sharma' }],
          gender: patient.gender?.toLowerCase() || 'male',
          birthDate: '1974-06-15',
          telecom: [{ system: 'phone', value: patient.phone || '+91 98765 43210' }],
        },
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'chief-complaint-condition',
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional' }],
          },
          category: [
            {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }],
            },
          ],
          code: {
            text: summary.chiefComplaint || 'Chest Pain / Angina Pectoris',
          },
          subject: { reference: `Patient/${patient.abhaId || 'ABHA-8829-1022-3110'}` },
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'clinical-socrates-observation',
          status: 'final',
          code: { text: 'SOCRATES Adaptive Clinical History Intake' },
          valueString: `Site: ${summary.socrates.site}; Onset: ${summary.socrates.onset}; Character: ${summary.socrates.character}; Radiation: ${summary.socrates.radiation}; Severity: ${summary.socrates.severity}/10.`,
        },
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'ayush-dashavidha-observation',
          status: 'final',
          code: { text: 'AYUSH Dashavidha Pariksha & Ahara-Vihara' },
          valueString: summary.ayushPariksha
            ? `Prakriti: ${summary.ayushPariksha.prakriti}; Vikriti: ${summary.ayushPariksha.vikriti}; Agni: ${summary.ayushPariksha.aharaShakti}; Nidra: ${summary.ayushPariksha.aharaVihara.sleepPattern}`
            : 'Standard Allopathic track chosen.',
        },
      },
      ...summary.priorInvestigations.map((lab, index) => ({
        resource: {
          resourceType: 'Observation',
          id: `lab-result-${index + 1}`,
          status: 'final',
          category: [
            {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory' }],
            },
          ],
          code: { text: lab.parameter },
          valueQuantity: {
            value: lab.numericValue || parseFloat(lab.value) || 0,
            unit: lab.unit,
          },
          referenceRange: [{ text: lab.referenceRange }],
          interpretation: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: lab.status === 'CRITICAL' ? 'HH' : lab.status === 'HIGH' ? 'H' : 'N',
                },
              ],
            },
          ],
        },
      })),
      {
        resource: {
          resourceType: 'AllergyIntolerance',
          id: 'patient-allergy-01',
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }],
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }],
          },
          substance: { text: 'Penicillin' },
          criticality: 'high',
          reaction: [{ manifestation: [{ text: 'Urticaria & Bronchospasm' }] }],
        },
      },
    ],
  };

  return JSON.stringify(fhirObject, null, 2);
}

export const INITIAL_HOSPITAL_DEPARTMENTS: import('../types').HospitalDepartment[] = [
  {
    id: 'dept-1',
    name: 'Cardiology OPD',
    code: 'CARD-104',
    currentDoctor: 'Dr. Ananya Sen (MD, DM)',
    roomNumber: 'Cabin 104',
    activeQueueCount: 4,
    emergencyCount: 1,
    averageWaitMins: 12,
    status: 'ACTIVE',
  },
  {
    id: 'dept-2',
    name: 'General Medicine OPD',
    code: 'MED-108',
    currentDoctor: 'Dr. Rajesh Mehra (MD)',
    roomNumber: 'Cabin 108',
    activeQueueCount: 6,
    emergencyCount: 0,
    averageWaitMins: 8,
    status: 'ACTIVE',
  },
  {
    id: 'dept-3',
    name: 'AYUSH Triage',
    code: 'AYUSH-202',
    currentDoctor: 'Dr. Vidyadhar Sharma (BAMS, MD Ayu)',
    roomNumber: 'Cabin 202',
    activeQueueCount: 3,
    emergencyCount: 0,
    averageWaitMins: 5,
    status: 'ACTIVE',
  },
  {
    id: 'dept-4',
    name: 'Emergency Resuscitation',
    code: 'EMRG-BAY1',
    currentDoctor: 'Dr. Vikram Patel (EM Specialist)',
    roomNumber: 'Emergency Bay 1',
    activeQueueCount: 2,
    emergencyCount: 2,
    averageWaitMins: 0,
    status: 'BUSY',
  },
  {
    id: 'dept-5',
    name: 'Orthopedics & Trauma',
    code: 'ORTHO-112',
    currentDoctor: 'Dr. Preeti Deshmukh (MS Ortho)',
    roomNumber: 'Cabin 112',
    activeQueueCount: 5,
    emergencyCount: 0,
    averageWaitMins: 15,
    status: 'ACTIVE',
  },
  {
    id: 'dept-6',
    name: 'Pediatrics & Neonatal',
    code: 'PED-115',
    currentDoctor: 'Dr. Kavita Nair (MD Peds)',
    roomNumber: 'Cabin 115',
    activeQueueCount: 4,
    emergencyCount: 0,
    averageWaitMins: 10,
    status: 'ACTIVE',
  },
];

export const INITIAL_HOSPITAL_QUEUE: import('../types').PatientQueueItem[] = [];

