/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  FileCheck2,
  Edit3,
  Save,
  CheckCircle2,
  Pill,
  Activity,
  RotateCcw,
  Copy,
  Check,
  User,
  Users,
  Building2,
  Search,
  UserCheck,
  ShieldCheck,
  FileText,
  Clock,
  ChevronRight,
  X,
  ArrowLeft,
  Filter,
  FileCode,
  Bell,
  Sparkles,
  LogOut,
  Layers,
  Thermometer,
  HeartPulse,
  Eye,
  CheckCircle,
  Calendar,
  Phone,
  RefreshCw,
  Printer,
  Download,
  Plus,
  Trash2,
  Edit2,
  ArrowDownToLine,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PatientProfile,
  StructuredClinicalSummary,
  DigitizedDocument,
  RedFlagAlert,
  BhashiniLanguage,
  PatientQueueItem,
  ExtractedMedication,
  DoctorNotification,
  ExtractedLabResult,
} from '../types';
import { getLocalizedStrings } from '../bhashiniLanguages';
import { syncService } from '../services/syncService';
import { searchPatients, getAllQueueItems, getClinicalSummary } from '../services/storageService';
import {
  PatientRecord,
  getStoredQueue,
  updatePatientStatus,
  updatePatientRecord,
  subscribeToQueue,
} from '../utils/queueStorage';

export interface DiagnosticItem {
  id: string;
  label: string;
  category: string;
  checked: boolean;
  priority?: 'CRITICAL' | 'HIGH' | 'STANDARD' | string;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface ActiveConsultationPatient {
  id: string;
  token: string;
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  isEmergency: boolean;
  chiefComplaint: string;
  department?: string;
  roomNumber?: string;
  triageTimestamp: string;
  socrates: {
    site: string;
    onset: string;
    character: string;
    radiation: string;
    associations: string;
    timing: string;
    exacerbating: string;
    severity: string;
    associatedSymptoms?: string[];
  };
  hpi?: string;
  doctorNotes?: string;
  orderedDiagnostics?: DiagnosticItem[];
  prescriptions?: PrescriptionItem[];
  labInvestigations?: ExtractedLabResult[];
  medications?: ExtractedMedication[];
  scannedPrescriptions?: ExtractedMedication[];
  rawDocuments?: DigitizedDocument[];
  fhirBundleJson?: string;
}

interface DoctorDashboardProps {
  doctorName?: string;
  hprId?: string;
  doctorRole?: string;
  doctorCabin?: string;
  patient?: PatientProfile;
  summary?: StructuredClinicalSummary;
  documents?: DigitizedDocument[];
  redFlagAlert?: RedFlagAlert;
  language: BhashiniLanguage;
  queue?: PatientQueueItem[];
  notifications?: DoctorNotification[];
  onDismissNotification?: (id: string) => void;
  onCompleteConsultation?: (abhaId: string) => void;
  onSelectQueuePatient?: (id: string) => void;
  onUpdateSummary?: (updated: Partial<StructuredClinicalSummary>) => void;
  onResetKiosk?: () => void;
  onSwitchToHis?: () => void;
  onSwitchToUser?: () => void;
  onLogout?: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  doctorName = 'Dr. Ananya Sen',
  hprId = 'HPR-DL-9941',
  doctorRole = 'MD, DM (Cardiology)',
  doctorCabin = 'OPD Cabin #104 • Cardiology',
  patient,
  summary,
  documents = [],
  redFlagAlert,
  language,
  queue = [],
  notifications = [],
  onDismissNotification,
  onCompleteConsultation,
  onSelectQueuePatient,
  onUpdateSummary,
  onResetKiosk,
  onSwitchToHis,
  onSwitchToUser,
  onLogout,
}) => {
  // Clean Desk State: activePatient is null by default
  const [activePatient, setActivePatient] = useState<ActiveConsultationPatient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WAITING' | 'STAT' | 'COMPLETED'>('ALL');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ActiveConsultationPatient[]>([]);

  // Clinical Editing State inside active consultation
  const [isEditing, setIsEditing] = useState(false);
  const [editedChiefComplaint, setEditedChiefComplaint] = useState('');
  const [editedHpi, setEditedHpi] = useState('');
  const [editedDoctorNotes, setEditedDoctorNotes] = useState('');

  // Modals & UI States
  const [showFhirModal, setShowFhirModal] = useState(false);
  const [copiedFhir, setCopiedFhir] = useState(false);
  const [showInboxDropdown, setShowInboxDropdown] = useState(false);
  const [completeToast, setCompleteToast] = useState<string | null>(null);
  const [consentVerifiedNotice, setConsentVerifiedNotice] = useState<string | null>(null);

  const loc = getLocalizedStrings(language.code);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dynamic Suggested Clinical Diagnostics generator based on Chief Complaint
  const generateSuggestedDiagnostics = (complaint: string = '') => {
    const text = complaint.toLowerCase();
    if (text.includes('chest') || text.includes('heart') || text.includes('cardiac') || text.includes('pain') || text.includes('angina')) {
      return [
        { id: 'card-1', label: 'Stat 12-Lead Electrocardiogram (ECG)', category: 'Cardiac', checked: false, priority: 'CRITICAL' },
        { id: 'card-2', label: 'Point-of-Care Cardiac Troponin I Re-assay', category: 'Cardiac', checked: false, priority: 'CRITICAL' },
        { id: 'card-3', label: 'Bedside 2D-Echocardiography (TTE)', category: 'Cardiac', checked: false, priority: 'HIGH' },
        { id: 'card-4', label: 'Serum Creatinine & Arterial Blood Gas (ABG)', category: 'Cardiac', checked: false, priority: 'STANDARD' },
        { id: 'card-5', label: 'Cardiology Interventional Refer (Cath Lab Prep)', category: 'Cardiac', checked: false, priority: 'HIGH' },
      ];
    } else if (text.includes('head') || text.includes('neuro') || text.includes('migraine') || text.includes('dizz') || text.includes('stroke') || text.includes('weak')) {
      return [
        { id: 'neuro-1', label: 'Non-Contrast Head CT Scan (NCCT)', category: 'Neurological', checked: false, priority: 'CRITICAL' },
        { id: 'neuro-2', label: 'Fundoscopy & Visual Field Assessment', category: 'Neurological', checked: false, priority: 'HIGH' },
        { id: 'neuro-3', label: 'Neurological Reflex & Cranial Nerve Exam', category: 'Neurological', checked: false, priority: 'HIGH' },
        { id: 'neuro-4', label: 'Serum Electrolytes & Comprehensive Metabolic Panel', category: 'Neurological', checked: false, priority: 'STANDARD' },
      ];
    } else if (text.includes('abdo') || text.includes('stomach') || text.includes('epigastric') || text.includes('gastric') || text.includes('nausea') || text.includes('vomit') || text.includes('belly')) {
      return [
        { id: 'gi-1', label: 'Abdominal Ultrasound (Whole Abdomen USG)', category: 'Gastrointestinal', checked: false, priority: 'HIGH' },
        { id: 'gi-2', label: 'Serum Amylase & Lipase Assay', category: 'Gastrointestinal', checked: false, priority: 'HIGH' },
        { id: 'gi-3', label: 'Liver Function Tests (LFT) & Lipid Panel', category: 'Gastrointestinal', checked: false, priority: 'STANDARD' },
        { id: 'gi-4', label: 'Stool Routine & Occult Blood Test', category: 'Gastrointestinal', checked: false, priority: 'STANDARD' },
      ];
    } else if (text.includes('breath') || text.includes('cough') || text.includes('dyspnea') || text.includes('lung') || text.includes('wheez') || text.includes('respiratory') || text.includes('cold')) {
      return [
        { id: 'resp-1', label: 'Digital Chest X-Ray (PA View)', category: 'Respiratory', checked: false, priority: 'HIGH' },
        { id: 'resp-2', label: 'Arterial Blood Gas (ABG) Analysis', category: 'Respiratory', checked: false, priority: 'CRITICAL' },
        { id: 'resp-3', label: 'Peak Flow Rate / Bedside Spirometry', category: 'Respiratory', checked: false, priority: 'STANDARD' },
        { id: 'resp-4', label: 'Quantitative D-Dimer Test', category: 'Respiratory', checked: false, priority: 'HIGH' },
      ];
    } else {
      return [
        { id: 'gen-1', label: 'Routine Complete Blood Count (CBC) & ESR', category: 'General', checked: false, priority: 'STANDARD' },
        { id: 'gen-2', label: 'Fasting Blood Sugar (FBS) & HbA1c', category: 'General', checked: false, priority: 'STANDARD' },
        { id: 'gen-3', label: 'Complete Routine & Microscopic Urinalysis', category: 'General', checked: false, priority: 'STANDARD' },
        { id: 'gen-4', label: 'Resting Blood Pressure & Vitals Re-evaluation', category: 'General', checked: false, priority: 'STANDARD' },
      ];
    }
  };

  // Dynamic Suggested Clinical Prescriptions generator based on Chief Complaint
  const generateSuggestedPrescriptions = (complaint: string = ''): PrescriptionItem[] => {
    const text = complaint.toLowerCase();
    if (text.includes('chest') || text.includes('heart') || text.includes('cardiac') || text.includes('pain') || text.includes('angina')) {
      return [
        { id: 'rx-1', name: 'Tab Aspirin 150mg', dosage: '1-0-0 (Morning)', duration: '30 Days', instructions: 'Post-prandial (After Food)' },
        { id: 'rx-2', name: 'Tab Atorvastatin 40mg', dosage: '0-0-1 (Night)', duration: '30 Days', instructions: 'At bedtime with water' },
        { id: 'rx-3', name: 'Tab Clopidogrel 75mg', dosage: '1-0-0 (Morning)', duration: '30 Days', instructions: 'After breakfast' },
        { id: 'rx-4', name: 'Tab Sorbitrate 5mg', dosage: 'SOS (Sublingual)', duration: 'As needed', instructions: 'Place under tongue on acute chest pain' },
      ];
    } else if (text.includes('head') || text.includes('neuro') || text.includes('migraine') || text.includes('dizz') || text.includes('stroke') || text.includes('weak')) {
      return [
        { id: 'rx-1', name: 'Tab Paracetamol 650mg', dosage: '1-0-1 (BD)', duration: '5 Days', instructions: 'After food' },
        { id: 'rx-2', name: 'Tab Pantoprazole 40mg', dosage: '1-0-0 (OD)', duration: '7 Days', instructions: '30 mins before breakfast' },
        { id: 'rx-3', name: 'Tab Naproxen 250mg', dosage: '1-0-1 (BD)', duration: '3 Days', instructions: 'Take with full glass of water' },
      ];
    } else if (text.includes('abdo') || text.includes('stomach') || text.includes('epigastric') || text.includes('gastric') || text.includes('nausea') || text.includes('vomit') || text.includes('belly')) {
      return [
        { id: 'rx-1', name: 'Tab Pantoprazole 40mg', dosage: '1-0-0 (OD)', duration: '14 Days', instructions: 'Empty stomach (Morning)' },
        { id: 'rx-2', name: 'Tab Drotaverine 40mg', dosage: '1-0-1 (BD)', duration: '3 Days', instructions: 'After meals for spasm relief' },
        { id: 'rx-3', name: 'Syrup Sucralfate 10ml', dosage: '1-1-1 (TDS)', duration: '7 Days', instructions: '1 hour before meals' },
      ];
    } else if (text.includes('breath') || text.includes('cough') || text.includes('dyspnea') || text.includes('lung') || text.includes('wheez') || text.includes('respiratory') || text.includes('cold')) {
      return [
        { id: 'rx-1', name: 'Inhaler Budecort 200mcg', dosage: '2 Puffs BD', duration: '14 Days', instructions: 'Rinse mouth with water after inhalation' },
        { id: 'rx-2', name: 'Tab Montelukast + Levocetirizine', dosage: '0-0-1 (Night)', duration: '10 Days', instructions: 'At bedtime' },
        { id: 'rx-3', name: 'Syrup Dextromethorphan 10ml', dosage: '1-0-1 (BD)', duration: '5 Days', instructions: 'After meals' },
      ];
    } else {
      return [
        { id: 'rx-1', name: 'Tab Paracetamol 650mg', dosage: '1-0-1 (BD)', duration: '5 Days', instructions: 'After meals' },
        { id: 'rx-2', name: 'Tab Pantoprazole 40mg', dosage: '1-0-0 (OD)', duration: '7 Days', instructions: 'Before breakfast' },
        { id: 'rx-3', name: 'Tab B-Complex & Zinc', dosage: '0-1-0 (OD)', duration: '15 Days', instructions: 'Post-lunch' },
      ];
    }
  };

  // Suggested Clinical Diagnostics Checklist (Unchecked by default)
  const [statOrders, setStatOrders] = useState([
    { id: '1', label: 'Stat 12-Lead Electrocardiogram (ECG)', category: 'Cardiac', checked: false, priority: 'CRITICAL' },
    { id: '2', label: 'Point-of-Care Cardiac Troponin I re-assay', category: 'Cardiac', checked: false, priority: 'CRITICAL' },
    { id: '3', label: 'Bedside 2D-Echocardiography (TTE)', category: 'Cardiac', checked: false, priority: 'HIGH' },
    { id: '4', label: 'Serum Creatinine & Arterial Blood Gas (ABG)', category: 'General', checked: false, priority: 'STANDARD' },
    { id: '5', label: 'Cardiology Interventional Refer (Cath Lab Prep)', category: 'Cardiac', checked: false, priority: 'HIGH' },
  ]);

  // Clinical Rx / Prescriptions State
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { id: 'rx-1', name: 'Tab Aspirin 150mg', dosage: '1-0-0', duration: '30 Days', instructions: 'Post-prandial' },
    { id: 'rx-2', name: 'Tab Atorvastatin 40mg', dosage: '0-0-1', duration: '30 Days', instructions: 'At bedtime' },
    { id: 'rx-3', name: 'Tab Pantoprazole 40mg', dosage: '1-0-0', duration: '7 Days', instructions: 'Before breakfast' },
  ]);
  const [editingRxId, setEditingRxId] = useState<string | null>(null);
  const [showAddDrugForm, setShowAddDrugForm] = useState(false);
  const [newDrug, setNewDrug] = useState<Omit<PrescriptionItem, 'id'>>({
    name: '',
    dosage: '1-0-1',
    duration: '5 Days',
    instructions: 'After meals',
  });

  // Past Medication / Scanned Records Manual Entry State
  const [showAddPastMedForm, setShowAddPastMedForm] = useState(false);
  const [newPastMed, setNewPastMed] = useState({
    name: '',
    dosage: '1-0-1',
    duration: 'Ongoing',
    instructions: 'Oral',
  });

  // Live Stored Queue State from unified queue storage (shared across tabs & Kiosk/HIS/EMR)
  const [liveQueue, setLiveQueue] = useState<PatientRecord[]>(() => getStoredQueue());

  useEffect(() => {
    setLiveQueue(getStoredQueue());
    const unsubscribe = subscribeToQueue((updatedQueue) => {
      setLiveQueue(updatedQueue);
    });
    return () => unsubscribe();
  }, []);

  // Map queue from live stored queue or props
  const allQueuePatients: ActiveConsultationPatient[] = useMemo(() => {
    if (liveQueue && liveQueue.length > 0) {
      return liveQueue.map((q) => ({
        id: q.id,
        token: q.token || 'T-001',
        abhaId: q.abhaId,
        name: q.name,
        age: q.age || 45,
        gender: q.gender || 'Male',
        phone: q.phone,
        isEmergency: q.isEmergency || q.status === 'EMERGENCY',
        department: q.department || 'Cardiology OPD',
        roomNumber: q.cabin || q.roomNumber || doctorCabin,
        chiefComplaint: q.chiefComplaint || 'General Assessment',
        socrates: {
          site: q.socrates?.site || 'General',
          onset: q.socrates?.onset || 'Recent',
          character: q.socrates?.character || q.chiefComplaint || 'Pain/Discomfort',
          radiation: q.socrates?.radiation || 'None',
          associations: q.socrates?.associations || q.socrates?.associatedSymptoms?.join(', ') || 'None',
          timing: q.socrates?.timing || 'Continuous',
          exacerbating: q.socrates?.exacerbating || 'Exertion',
          severity: q.socrates?.severity || '5 / 10',
          associatedSymptoms: q.socrates?.associatedSymptoms || [],
        },
        hpi: q.hpi || `Patient registered at ${q.triageTimestamp || 'OPD'}. Chief complaint: ${q.chiefComplaint}`,
        doctorNotes: q.doctorNotes || '',
        triageTimestamp: q.triageTimestamp || 'Just Now',
        labInvestigations: q.labInvestigations || [],
        medications: q.medications || [],
        rawDocuments: q.rawDocuments || [],
        fhirBundleJson: q.fhirBundleJson,
        prescriptions: q.prescriptions,
        orderedDiagnostics: q.orderedDiagnostics,
      }));
    }
    return [];
  }, [liveQueue, doctorCabin]);

  // If a live patient is passed through kiosk session, include in queue lookup
  const combinedQueue = useMemo(() => {
    if (patient && patient.abhaId && patient.name) {
      const liveItem: ActiveConsultationPatient = {
        id: 'p-kiosk-live',
        token: 'T-LIVE',
        abhaId: patient.abhaId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        isEmergency: Boolean(redFlagAlert?.isTriggered),
        department: 'Cardiology',
        roomNumber: doctorCabin,
        chiefComplaint: summary?.chiefComplaint || 'Active Voice Kiosk Intake',
        socrates: {
          site: summary?.socrates?.site || 'Retrosternal',
          onset: summary?.socrates?.onset || 'Acute',
          character: summary?.socrates?.character || 'Pressure',
          radiation: summary?.socrates?.radiation || 'Left Arm',
          associations: summary?.socrates?.associatedSymptoms?.join(', ') || 'Diaphoresis',
          timing: summary?.socrates?.timeCourse || 'Continuous',
          exacerbating: summary?.socrates?.exacerbatingFactors || 'Exertion',
          severity: `${summary?.socrates?.severity || 7} / 10`,
          associatedSymptoms: summary?.socrates?.associatedSymptoms || [],
        },
        hpi: summary?.hpi || 'Live triage intake session from kiosk.',
        doctorNotes: summary?.doctorNotes || 'Impression: Clinical evaluation in progress.',
        labInvestigations: summary?.priorInvestigations || [],
        medications: summary?.drugAndAllergy?.activeMedications || [],
        rawDocuments: documents,
        fhirBundleJson: summary?.fhirBundleJson,
        triageTimestamp: 'Live Session',
      };

      const exists = allQueuePatients.some((p) => p.abhaId === patient.abhaId);
      return exists ? allQueuePatients : [liveItem, ...allQueuePatients];
    }
    return allQueuePatients;
  }, [patient, redFlagAlert, summary, documents, doctorCabin, allQueuePatients]);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return combinedQueue.filter((p) => {
      const matchingStored = liveQueue.find((lq) => lq.id === p.id || lq.abhaId === p.abhaId);
      const isCompleted = matchingStored ? matchingStored.status === 'COMPLETED' : false;

      if (activeFilter === 'STAT') return p.isEmergency && !isCompleted;
      if (activeFilter === 'WAITING') return !isCompleted;
      if (activeFilter === 'COMPLETED') return isCompleted;
      return true;
    });
  }, [combinedQueue, activeFilter, liveQueue]);

  // Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim().toLowerCase().replace(/[-\s]/g, '');
    if (!cleanQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Search in combined memory queue
    const matchedInQueue = combinedQueue.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const abhaMatch = p.abhaId.replace(/[-\s]/g, '').toLowerCase().includes(cleanQuery);
      const tokenMatch = p.token.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const phoneMatch = p.phone ? p.phone.replace(/[-\s]/g, '').includes(cleanQuery) : false;
      return nameMatch || abhaMatch || tokenMatch || phoneMatch;
    });

    // Also search in IndexedDB for historical records
    try {
      const idbResults = await searchPatients(searchQuery.trim());
      const additionalPatients: ActiveConsultationPatient[] = [];

      for (const idbP of idbResults) {
        if (!matchedInQueue.some((m) => m.abhaId === idbP.abhaId)) {
          const histSummary = await getClinicalSummary(idbP.abhaId);
          additionalPatients.push({
            id: `idb-${idbP.abhaId}`,
            token: 'HIST-REC',
            abhaId: idbP.abhaId,
            name: idbP.name,
            age: idbP.age,
            gender: idbP.gender,
            phone: idbP.phone,
            isEmergency: false,
            chiefComplaint: histSummary?.chiefComplaint || 'Historical EMR Record',
            socrates: {
              site: histSummary?.socrates?.site || 'Documented History',
              onset: histSummary?.socrates?.onset || 'Prior Visit',
              character: histSummary?.socrates?.character || 'Resolved/Managed',
              radiation: histSummary?.socrates?.radiation || 'None',
              associations: histSummary?.socrates?.associatedSymptoms?.join(', ') || 'None',
              timing: histSummary?.socrates?.timeCourse || 'Historic',
              exacerbating: histSummary?.socrates?.exacerbatingFactors || 'None',
              severity: `${histSummary?.socrates?.severity || 3} / 10`,
              associatedSymptoms: histSummary?.socrates?.associatedSymptoms || [],
            },
            hpi: histSummary?.hpi || 'Stored historical medical encounter.',
            doctorNotes: histSummary?.doctorNotes || '',
            labInvestigations: histSummary?.priorInvestigations || [],
            medications: histSummary?.drugAndAllergy?.activeMedications || [],
            triageTimestamp: 'Archived Encounter',
          });
        }
      }

      setSearchResults([...matchedInQueue, ...additionalPatients]);
    } catch (err) {
      setSearchResults(matchedInQueue);
    }
  };

  // Accept Next Patient from Queue
  const handleAcceptNext = () => {
    const nextPatient = filteredQueue.find((p) => {
      const stored = liveQueue.find((lq) => lq.id === p.id || lq.abhaId === p.abhaId);
      return stored ? stored.status !== 'COMPLETED' : true;
    }) || filteredQueue[0] || combinedQueue[0];

    if (nextPatient) {
      handleOpenPatientConsultation(nextPatient);
    }
  };

  // Open / Accept Consultation for a specific patient
  const handleOpenPatientConsultation = (selected: ActiveConsultationPatient) => {
    setActivePatient(selected);
    updatePatientStatus(selected.id, 'IN_CONSULTATION');
    setEditedChiefComplaint(selected.chiefComplaint);
    setEditedHpi(selected.hpi || '');
    setEditedDoctorNotes(
      selected.doctorNotes ||
        'Clinical Impression: Acute Coronary Syndrome (High-Risk NSTEMI/Angina). Stat 12-lead ECG and Troponin I ordered. Plan: Dual Antiplatelet Therapy (DAPT), high-dose statin, cardiac telemetry monitoring, urgent transfer to Cath Lab.'
    );
    
    // Restore existing ordered diagnostics or generate default suggestions
    if (selected.orderedDiagnostics && selected.orderedDiagnostics.length > 0) {
      setStatOrders(selected.orderedDiagnostics);
    } else {
      setStatOrders(generateSuggestedDiagnostics(selected.chiefComplaint));
    }

    // Restore existing prescriptions or generate suggestions
    if (selected.prescriptions && selected.prescriptions.length > 0) {
      setPrescriptions(selected.prescriptions);
    } else {
      setPrescriptions(generateSuggestedPrescriptions(selected.chiefComplaint));
    }

    setShowAddDrugForm(false);
    setEditingRxId(null);
    setShowAddPastMedForm(false);
    setIsEditing(false);
    setIsSearching(false);
    setSearchQuery('');

    // Trigger ABDM on-demand consent verification badge
    setConsentVerifiedNotice(`ABDM On-Demand Consent Verified: Encrypted health records retrieved for ABHA ID ${selected.abhaId}`);
    setTimeout(() => setConsentVerifiedNotice(null), 4500);

    if (onSelectQueuePatient) {
      onSelectQueuePatient(selected.id);
    }
  };

  // Auto-load patient into consultation view when transferred via props from HIS or Kiosk
  useEffect(() => {
    if (patient && patient.abhaId && patient.name) {
      const match = combinedQueue.find((p) => p.abhaId === patient.abhaId || p.id === patient.abhaId) || {
        id: 'p-kiosk-live',
        token: 'OPD-ACTIVE',
        abhaId: patient.abhaId,
        name: patient.name,
        age: patient.age || 40,
        gender: patient.gender || 'Male',
        phone: patient.phone,
        isEmergency: Boolean(redFlagAlert?.isTriggered),
        department: 'Cardiology OPD',
        roomNumber: doctorCabin,
        chiefComplaint: summary?.chiefComplaint || 'General OPD Evaluation',
        socrates: {
          site: summary?.socrates?.site || 'General',
          onset: summary?.socrates?.onset || 'Recent',
          character: summary?.socrates?.character || 'Consultation',
          radiation: summary?.socrates?.radiation || 'None',
          associations: summary?.socrates?.associatedSymptoms?.join(', ') || 'None',
          timing: summary?.socrates?.timeCourse || 'Continuous',
          exacerbating: summary?.socrates?.exacerbatingFactors || 'Exertion',
          severity: `${summary?.socrates?.severity || 5} / 10`,
          associatedSymptoms: summary?.socrates?.associatedSymptoms || [],
        },
        hpi: summary?.hpi || 'Live clinical intake from smart triage workstation.',
        doctorNotes: summary?.doctorNotes || '',
        labInvestigations: summary?.priorInvestigations || [],
        medications: summary?.drugAndAllergy?.activeMedications || [],
        rawDocuments: documents,
        fhirBundleJson: summary?.fhirBundleJson,
        triageTimestamp: 'Live Session',
      };
      handleOpenPatientConsultation(match);
    }
  }, [patient?.abhaId, patient?.name]);

  // Reconciled scanned medications list
  const scannedPrescriptionsList = useMemo(() => {
    if (!activePatient) return [];
    const list: ExtractedMedication[] = [];
    if (activePatient.scannedPrescriptions && activePatient.scannedPrescriptions.length > 0) {
      list.push(...activePatient.scannedPrescriptions);
    }
    if (activePatient.medications && activePatient.medications.length > 0) {
      activePatient.medications.forEach((m) => {
        if (!list.some((existing) => existing.name.toLowerCase() === m.name.toLowerCase())) {
          list.push(m);
        }
      });
    }
    if (activePatient.rawDocuments && activePatient.rawDocuments.length > 0) {
      activePatient.rawDocuments.forEach((doc) => {
        if (doc.medications && doc.medications.length > 0) {
          doc.medications.forEach((m) => {
            if (!list.some((existing) => existing.name.toLowerCase() === m.name.toLowerCase())) {
              list.push(m);
            }
          });
        }
      });
    }
    return list;
  }, [activePatient]);

  // Import single drug from OCR / scanned records into doctor's active Rx table
  const handleImportToRx = (med: ExtractedMedication) => {
    const newRx: PrescriptionItem = {
      id: `rx-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: med.name,
      dosage: [med.dosage, med.frequency].filter(Boolean).join(' • ') || '1-0-1 (BD)',
      duration: med.duration || '5 Days',
      instructions: med.instructions || 'After meals',
    };
    setPrescriptions((prev) => [...prev, newRx]);
    setCompleteToast(`Imported ${med.name} into Rx Table`);
    setTimeout(() => setCompleteToast(null), 3000);
  };

  // Import all scanned medications into doctor's active Rx table
  const handleImportAllToRx = () => {
    if (scannedPrescriptionsList.length === 0) return;
    const newItems: PrescriptionItem[] = scannedPrescriptionsList.map((med, idx) => ({
      id: `rx-imp-all-${Date.now()}-${idx}`,
      name: med.name,
      dosage: [med.dosage, med.frequency].filter(Boolean).join(' • ') || '1-0-1 (BD)',
      duration: med.duration || '5 Days',
      instructions: med.instructions || 'After meals',
    }));
    setPrescriptions((prev) => [...prev, ...newItems]);
    setCompleteToast(`Imported ${newItems.length} medications to Rx Table`);
    setTimeout(() => setCompleteToast(null), 3000);
  };

  // Add custom drug to Rx table
  const handleAddCustomDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrug.name.trim()) return;
    const item: PrescriptionItem = {
      id: `rx-cust-${Date.now()}`,
      name: newDrug.name.trim(),
      dosage: newDrug.dosage.trim() || '1-0-1',
      duration: newDrug.duration.trim() || '5 Days',
      instructions: newDrug.instructions.trim() || 'After meals',
    };
    setPrescriptions((prev) => [...prev, item]);
    setNewDrug({ name: '', dosage: '1-0-1', duration: '5 Days', instructions: 'After meals' });
    setShowAddDrugForm(false);
    setCompleteToast(`Added ${item.name} to Prescriptions`);
    setTimeout(() => setCompleteToast(null), 3000);
  };

  // Delete drug from Rx table
  const handleDeleteRx = (id: string) => {
    setPrescriptions((prev) => prev.filter((item) => item.id !== id));
  };

  // Update inline Rx field
  const handleUpdateRxField = (id: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Add past medication to patient record
  const handleAddPastMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPastMed.name.trim() || !activePatient) return;
    const addedMed: ExtractedMedication = {
      name: newPastMed.name.trim(),
      dosage: newPastMed.dosage.trim() || '1-0-1',
      frequency: 'Oral',
      duration: newPastMed.duration.trim() || 'Ongoing',
      instructions: newPastMed.instructions.trim() || 'Oral',
      status: 'active',
    };
    setActivePatient((prev) =>
      prev
        ? {
            ...prev,
            medications: [...(prev.medications || []), addedMed],
          }
        : null
    );
    setNewPastMed({ name: '', dosage: '1-0-1', duration: 'Ongoing', instructions: 'Oral' });
    setShowAddPastMedForm(false);
    setCompleteToast(`Added past medication ${addedMed.name}`);
    setTimeout(() => setCompleteToast(null), 3000);
  };

  // Save changes to active consultation
  const handleSaveDraft = () => {
    if (!activePatient) return;
    setActivePatient((prev) =>
      prev
        ? {
            ...prev,
            chiefComplaint: editedChiefComplaint,
            hpi: editedHpi,
            doctorNotes: editedDoctorNotes,
          }
        : null
    );

    updatePatientRecord(activePatient.id, {
      chiefComplaint: editedChiefComplaint,
      hpi: editedHpi,
      doctorNotes: editedDoctorNotes,
      clinicalImpression: editedDoctorNotes,
      attendingDoctor: `${doctorName} (${doctorRole})`,
      prescriptions: prescriptions,
      orderedDiagnostics: statOrders,
    });

    if (onUpdateSummary) {
      onUpdateSummary({
        chiefComplaint: editedChiefComplaint,
        hpi: editedHpi,
        doctorNotes: editedDoctorNotes,
      });
    }

    setIsEditing(false);
    syncService.triggerDebouncedSync(300);
    setCompleteToast('Consultation draft updated & synced with ABDM gateway.');
    setTimeout(() => setCompleteToast(null), 3000);
  };

  // End Consultation and Return to Clean Desk
  const handleEndConsultation = () => {
    if (activePatient) {
      const completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatePatientRecord(activePatient.id, {
        status: 'COMPLETED',
        completedAt,
        chiefComplaint: editedChiefComplaint,
        hpi: editedHpi,
        doctorNotes: editedDoctorNotes,
        clinicalImpression: editedDoctorNotes,
        attendingDoctor: `${doctorName} (${doctorRole})`,
        prescriptions: prescriptions,
        orderedDiagnostics: statOrders,
      });
      updatePatientStatus(activePatient.id, 'COMPLETED');
      if (onCompleteConsultation) {
        onCompleteConsultation(activePatient.abhaId);
      }
    }
    setActivePatient(null);
    setIsEditing(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setCompleteToast('Consultation ended. Record updated to COMPLETED in unified live queue.');
    setTimeout(() => setCompleteToast(null), 4000);
  };

  const handleCopyFhir = () => {
    const jsonStr = activePatient?.fhirBundleJson || summary?.fhirBundleJson || JSON.stringify(activePatient, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  const toggleStatOrder = (id: string) => {
    setStatOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, checked: !o.checked } : o))
    );
  };

  const waitingCount = liveQueue.filter((p) => p.status === 'WAITING' || p.status === 'EMERGENCY').length;
  const completedCount = liveQueue.filter((p) => p.status === 'COMPLETED').length;
  const statAlertsCount = liveQueue.filter((p) => p.isEmergency && p.status !== 'COMPLETED').length;

  return (
    <div
      id="doctor-dashboard-view"
      className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#F8F5F2] overflow-y-auto min-h-screen"
    >
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-24">
        {/* Top Bar Header */}
        <header className="print:hidden bg-[#0C0A09] text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#52833C] text-white flex items-center justify-center shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  EMR Clinical Workstation
                </h1>
                <span className="bg-[#52833C]/20 text-[#52833C] border border-[#52833C]/40 text-xs font-bold px-3 py-0.5 rounded-full font-mono">
                  {doctorCabin}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  ABDM Live M2/M3
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {doctorName} ({doctorRole}) • AIIMS New Delhi • ABDM HPR:{' '}
                <span className="font-mono text-emerald-400 font-bold">{hprId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Notification Bell Inbox */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowInboxDropdown(!showInboxDropdown)}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer"
                title="Incoming Patient Consultation Alerts"
              >
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showInboxDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl z-50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <span className="text-xs font-extrabold text-white">Live Consultation Inbox</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                        {unreadCount} New
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-stone-400 text-center py-6">No incoming consultation alerts from HIS.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              const found = combinedQueue.find((p) => p.id === notif.patientId);
                              if (found) {
                                handleOpenPatientConsultation(found);
                              }
                              if (onDismissNotification) {
                                onDismissNotification(notif.id);
                              }
                              setShowInboxDropdown(false);
                            }}
                            className="p-3 bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 rounded-xl cursor-pointer transition-all space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{notif.patientName}</span>
                              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded">
                                {notif.tokenNumber}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-300 line-clamp-1">{notif.chiefComplaint}</p>
                            <div className="flex items-center justify-between text-[10px] text-stone-400">
                              <span>{notif.department} ({notif.roomNumber})</span>
                              <span>{notif.timestamp}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {onSwitchToUser && (
              <button
                type="button"
                onClick={onSwitchToUser}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>{loc.patientKioskView}</span>
              </button>
            )}

            {onSwitchToHis && (
              <button
                type="button"
                onClick={onSwitchToHis}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>{loc.hisDashboardView}</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 bg-stone-800 hover:bg-red-950/80 hover:text-red-300 text-stone-200 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-stone-700"
                title="Sign Out from EMR Workstation"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Consent Verification Alert Banner */}
        <AnimatePresence>
          {consentVerifiedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="print:hidden p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{consentVerifiedNotice}</span>
              </div>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold uppercase">
                DPDP 2023 Compliant
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* VIEWPORT MODE 1: CLEAN DESK & ON-DEMAND PATIENT LOOKUP VIEW              */}
        {/* ========================================================================= */}
        {!activePatient ? (
          <div className="space-y-6 print:hidden">
            {/* Top Stat Queue Banner & Patient Search Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Card 1: Live OPD Queue & Accept Next CTA */}
              <div className="lg:col-span-1 bg-gradient-to-br from-[#0C0A09] via-stone-900 to-stone-950 text-white rounded-3xl p-6 border border-stone-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#52833C] uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4" />
                      Live OPD Queue Status
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                      Real-time Sync
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-black text-white">{waitingCount}</div>
                    <div className="text-xs text-stone-400 font-medium">Patients Waiting</div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-800/80 text-red-400 rounded-full text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{statAlertsCount} STAT / Emergency</span>
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleAcceptNext}
                    disabled={combinedQueue.length === 0}
                    className="w-full py-3.5 px-5 bg-[#52833C] hover:bg-[#436e30] text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#52833C]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Accept Next Patient in Queue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card 2: Patient Lookup & History Search Bar */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-[#52833C]" />
                      Patient Record Lookup &amp; On-Demand Fetch
                    </label>
                    <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      DPDP 2023 Consent Guarded
                    </span>
                  </div>

                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by 14-digit ABHA ID, 10-digit Mobile, Token (e.g. T-042), or Name..."
                      className="w-full pl-11 pr-28 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:border-[#52833C] focus:ring-2 focus:ring-[#52833C]/20 outline-none transition-all"
                    />
                    <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#52833C] hover:bg-[#436e30] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
                      Filter:
                    </span>
                    {(['ALL', 'WAITING', 'STAT', 'COMPLETED'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setActiveFilter(filter);
                          setIsSearching(false);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          activeFilter === filter && !isSearching
                            ? 'bg-[#52833C] text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {filter === 'ALL' && `All (${liveQueue.length})`}
                        {filter === 'WAITING' && `Waiting (${waitingCount})`}
                        {filter === 'STAT' && `STAT Alerts (${statAlertsCount})`}
                        {filter === 'COMPLETED' && `Completed (${completedCount})`}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-stone-500 font-medium">
                    ABHA Records decrypted on-demand upon consultation start.
                  </span>
                </div>
              </div>
            </div>

            {/* Results or Clean Desk Protocol Active View */}
            {isSearching ? (
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span>Search Results</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold">
                      {searchResults.length} {searchResults.length === 1 ? 'Record' : 'Records'}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearching(false);
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search</span>
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 space-y-2">
                    <p className="text-sm font-semibold">No matching patient records found for "{searchQuery}".</p>
                    <p className="text-xs text-stone-400">
                      Try searching with 14-digit ABHA ID, 10-digit mobile number, or patient name.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleOpenPatientConsultation(p)}
                        className="p-4 bg-stone-50 hover:bg-[#52833C]/5 border border-stone-200 hover:border-[#52833C]/40 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-stone-200 group-hover:bg-[#52833C] group-hover:text-white text-stone-800 flex items-center justify-center font-black text-xs transition-colors">
                            {p.token}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-900">{p.name}</span>
                              {p.isEmergency && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                                  STAT Alert
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500">
                              ABHA: <span className="font-mono text-stone-700">{p.abhaId}</span> • {p.gender}, {p.age}y
                            </p>
                            <p className="text-xs text-stone-600 line-clamp-1">{p.chiefComplaint}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 bg-[#52833C] text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 shadow-xs"
                        >
                          <span>Open</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* CLEAN DESK PROTOCOL ACTIVE BANNER & QUEUE PREVIEW */
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-10 sm:p-14 border border-stone-200/80 shadow-xs text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-[#52833C]/10 text-[#52833C] flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-lg mx-auto">
                    <h3 className="text-lg sm:text-xl font-black text-stone-900">
                      Clean Desk Protocol Active
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                      No active consultation. Accept the next patient from queue or search by ABHA ID / Mobile Number to view clinical history.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAcceptNext}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#52833C] hover:bg-[#436e30] text-white text-xs font-bold rounded-full shadow-md transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Start Next Consultation ({filteredQueue[0]?.name || 'Next Patient'})</span>
                    </button>
                  </div>
                </div>

                {/* Queue Cards Grid */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#52833C]" />
                      <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                        OPD Queue Waiting for Consultation ({filteredQueue.length})
                      </h3>
                    </div>
                    <span className="text-xs text-stone-400">Click any patient to initiate on-demand consult</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredQueue.map((qPatient) => (
                      <div
                        key={qPatient.id}
                        onClick={() => handleOpenPatientConsultation(qPatient)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                          qPatient.isEmergency
                            ? 'bg-red-50/40 border-red-200 hover:border-red-400 hover:shadow-md'
                            : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-[#52833C]/50 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black font-mono px-2.5 py-1 bg-stone-900 text-white rounded-lg">
                              {qPatient.token}
                            </span>
                            {qPatient.isEmergency ? (
                              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                                STAT Emergency
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                                Routine OPD
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-extrabold text-sm text-stone-900 group-hover:text-[#52833C] transition-colors">
                              {qPatient.name}
                            </h4>
                            <p className="text-xs text-stone-500 font-mono">
                              ABHA: {qPatient.abhaId}
                            </p>
                            <p className="text-xs text-stone-600 mt-0.5">
                              {qPatient.gender}, {qPatient.age} yrs • Triaged {qPatient.triageTimestamp}
                            </p>
                          </div>

                          <div className="p-2.5 bg-white/80 rounded-xl border border-stone-200/80 text-xs text-stone-800 font-medium line-clamp-2">
                            {qPatient.chiefComplaint}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                          <span className="text-stone-500 text-[11px]">Severity: {qPatient.socrates.severity}</span>
                          <span className="text-[#52833C] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Open EMR</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEWPORT MODE 2: ACTIVE CONSULTATION & FULL CLINICAL TRIAGE DASHBOARD     */
          /* ========================================================================= */
          <div className="space-y-6 animate-fadeIn">
            {/* Consultation Top Action Bar / Header Container */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white print:hidden">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleEndConsultation}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all cursor-pointer"
                  title="Return to clean desk"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-600 text-white font-mono">
                      {activePatient.token}
                    </span>
                    <h2 className="text-xl font-bold text-white">{activePatient.name}</h2>
                    <span className="text-xs text-slate-400">
                      {activePatient.gender}, {activePatient.age} yrs • ABHA: <strong className="text-white font-mono">{activePatient.abhaId}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Triaged at {activePatient.triageTimestamp}</span>
                    <span>•</span>
                    <span>Phone: {activePatient.phone || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: FHIR, Export to PDF & Complete */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFhirModal(true)}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>{loc.fhirBundleTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-600 shadow-sm cursor-pointer"
                  title="Print or Export Clinical Summary PDF"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Export to PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleEndConsultation}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete &amp; End Consultation</span>
                </button>
              </div>
            </div>

            {/* Chief Complaint & STAT Banner if critical */}
            {activePatient.isEmergency && (
              <div className="print:hidden bg-red-50 border border-red-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    STAT Clinical Alert Triggered
                  </h4>
                  <p className="text-sm font-semibold text-red-900 mt-0.5">{activePatient.chiefComplaint}</p>
                </div>
              </div>
            )}

            {/* Two-Column Modular Clinical Data Grid */}
            <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Card: 8-Dimension SOCRATES Breakdown */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h2 className="text-base font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#52833C]" />
                    <span>{loc.chiefComplaintSocrates}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs font-bold text-[#52833C] hover:text-[#436e30] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? loc.cancelEditBtn : loc.editEmrEntryBtn}</span>
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">{loc.chiefComplaintLabel}</label>
                      <input
                        type="text"
                        value={editedChiefComplaint}
                        onChange={(e) => setEditedChiefComplaint(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-[#52833C] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">{loc.hpiNarrativeLabel}</label>
                      <textarea
                        rows={4}
                        value={editedHpi}
                        onChange={(e) => setEditedHpi(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-normal focus:bg-white focus:border-[#52833C] outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-5 py-2.5 bg-[#52833C] text-white rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{loc.saveClinicalChangesBtn}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#F8F5F2] rounded-2xl border border-stone-200">
                      <p className="text-xs font-bold text-stone-500 uppercase">{loc.chiefComplaintLabel}</p>
                      <p className="text-base font-bold text-stone-900 mt-0.5">{activePatient.chiefComplaint}</p>
                    </div>

                    {/* SOCRATES 8-Dimension Structured Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Site (Location)</span>
                        <span className="font-bold text-stone-900">{activePatient.socrates.site || 'Retrosternal'}</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Onset</span>
                        <span className="font-bold text-stone-900">{activePatient.socrates.onset || 'Acute'}</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Character</span>
                        <span className="font-bold text-stone-900">{activePatient.socrates.character || 'Pressure'}</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Radiation</span>
                        <span className="font-bold text-stone-900">{activePatient.socrates.radiation || 'Left Shoulder & Arm'}</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Associations</span>
                        <span className="font-bold text-stone-900">{activePatient.socrates.associations || 'Diaphoresis'}</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Time Course</span>
                        <span className="font-bold text-stone-900">{activePatient.socrates.timing || 'Constant'}</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Exacerbating</span>
                        <span className="font-bold text-stone-900">{activePatient.socrates.exacerbating || 'Exertion'}</span>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                        <span className="font-bold text-stone-500 uppercase block text-[10px]">Severity</span>
                        <span className="font-black text-red-700">{activePatient.socrates.severity || '8 / 10'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                      <p className="text-[10px] font-bold text-stone-500 uppercase">{loc.fullHpiLabel}</p>
                      <p className="text-xs text-stone-700 leading-relaxed">{activePatient.hpi || activePatient.chiefComplaint}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Card: Digitized Records, Abnormal Labs & Medications */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <h2 className="text-base font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-stone-100">
                  <FileCheck2 className="w-4 h-4 text-[#52833C]" />
                  <span>{loc.recordsOcrTimeline}</span>
                </h2>

                {/* Extracted Abnormal Lab Values */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {loc.labInvestigationsHeader}
                  </p>
                  {activePatient.labInvestigations && activePatient.labInvestigations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activePatient.labInvestigations.map((inv, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border ${
                            inv.status === 'CRITICAL'
                              ? 'bg-red-50/80 border-red-200'
                              : inv.status === 'HIGH'
                              ? 'bg-amber-50/80 border-amber-200'
                              : 'bg-stone-50 border-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800">{inv.parameter}</span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                inv.status === 'CRITICAL'
                                  ? 'bg-red-600 text-white'
                                  : inv.status === 'HIGH'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-lg font-black text-stone-900 mt-1">{inv.value}</p>
                          <p className="text-[10px] text-stone-500 mt-0.5">Ref: {inv.referenceRange}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-stone-50 border border-dashed border-stone-300 rounded-2xl text-center text-stone-500 text-xs">
                      No abnormal lab investigations flagged.
                    </div>
                  )}
                </div>

                {/* Active Medication Reconciliation */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      {loc.activeMedReconciliation}
                    </p>
                    {scannedPrescriptionsList.length > 0 && (
                      <button
                        type="button"
                        onClick={handleImportAllToRx}
                        className="text-[11px] font-bold text-[#52833C] hover:text-[#436e30] flex items-center gap-1 cursor-pointer bg-[#52833C]/10 px-2.5 py-1 rounded-full transition-all hover:bg-[#52833C]/20"
                      >
                        <ArrowDownToLine className="w-3 h-3" />
                        <span>Import All to Rx</span>
                      </button>
                    )}
                  </div>

                  {scannedPrescriptionsList.length > 0 ? (
                    <div className="space-y-2">
                      {scannedPrescriptionsList.map((med, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#F8F5F2] rounded-2xl border border-stone-200 flex items-center justify-between gap-3 hover:border-stone-300 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#52833C]/10 text-[#52833C] flex items-center justify-center shrink-0">
                              <Pill className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">{med.name}</p>
                              <p className="text-[11px] text-stone-500 truncate">
                                {[med.dosage, med.frequency, med.duration].filter(Boolean).join(' • ') || 'Prescribed'}
                                {med.instructions ? ` (${med.instructions})` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                            <button
                              type="button"
                              onClick={() => handleImportToRx(med)}
                              className="text-[10px] font-bold text-[#52833C] hover:text-[#436e30] border border-[#52833C]/30 hover:border-[#52833C] bg-white px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="Import this medication into the active Rx Prescription table"
                            >
                              <ArrowDownToLine className="w-3 h-3" />
                              <span>Import to Rx</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 border border-dashed border-stone-300 rounded-2xl text-center space-y-2">
                      <p className="text-stone-500 text-xs">No active prescriptions detected from scanned documents.</p>
                      <button
                        type="button"
                        onClick={() => setShowAddPastMedForm(!showAddPastMedForm)}
                        className="text-xs font-bold text-[#52833C] hover:text-[#436e30] inline-flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Past Med</span>
                      </button>
                    </div>
                  )}

                  {/* Inline Add Past Med Form */}
                  {showAddPastMedForm && (
                    <form onSubmit={handleAddPastMed} className="p-4 bg-stone-100 rounded-2xl border border-stone-300 space-y-3 animate-fadeIn">
                      <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Record Historical Past Medication</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newPastMed.name}
                          onChange={(e) => setNewPastMed((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Drug Name & Strength (e.g. Tab Metformin 500mg)"
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-[#52833C]"
                          required
                        />
                        <input
                          type="text"
                          value={newPastMed.dosage}
                          onChange={(e) => setNewPastMed((p) => ({ ...p, dosage: e.target.value }))}
                          placeholder="Dosage / Frequency (e.g. 1-0-1)"
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-[#52833C]"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddPastMedForm(false)}
                          className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#52833C] hover:bg-[#436e30] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                        >
                          Save to Records
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Clinical Notes & Stat Orders Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clinician Notes Editor */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#52833C]" />
                    <span>{loc.doctorImpressionOrders}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="text-xs font-bold text-[#52833C] hover:text-[#436e30] flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editedDoctorNotes}
                  onChange={(e) => setEditedDoctorNotes(e.target.value)}
                  placeholder="Enter clinical impression, Rx medications, and disposal orders..."
                  className="w-full p-4 bg-[#F8F5F2] border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 focus:bg-white focus:border-[#52833C] outline-none leading-relaxed"
                />
              </div>

              {/* Suggested Clinical Diagnostics Checklist */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#52833C]" />
                    <span>Suggested Clinical Diagnostics</span>
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    {statOrders.filter(o => o.checked).length} selected of {statOrders.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {statOrders.map((order: any) => (
                    <label
                      key={order.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        order.checked ? 'bg-[#52833C]/5 border-[#52833C]/40' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={order.checked}
                          onChange={() => toggleStatOrder(order.id)}
                          className="w-4 h-4 accent-[#52833C] rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-stone-900">{order.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {order.category && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {order.category}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            order.priority === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {order.priority}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Dedicated Suggested Clinical Rx / Prescription Section directly below Diagnostics */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#52833C]/10 text-[#52833C] flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider">
                        Suggested Clinical Rx / Prescription
                      </h3>
                      <span className="bg-[#52833C]/10 text-[#52833C] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {prescriptions.length} Active Items
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Doctor-customizable prescription table synchronized with A4 clinical print slip &amp; ABDM gateway.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDrugForm(!showAddDrugForm)}
                    className="bg-[#52833C] hover:bg-[#436e30] text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-[#52833C]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Drug</span>
                  </button>
                </div>
              </div>

              {/* Add Drug Form (Inline / Modal toggle) */}
              {showAddDrugForm && (
                <form
                  onSubmit={handleAddCustomDrug}
                  className="p-5 bg-[#F8F5F2] border border-[#52833C]/30 rounded-2xl space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5 text-[#52833C]" />
                      <span>Add New Medication to Prescription</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddDrugForm(false)}
                      className="text-stone-500 hover:text-stone-900 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Drug Name &amp; Strength *</label>
                      <input
                        type="text"
                        value={newDrug.name}
                        onChange={(e) => setNewDrug((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Tab Aspirin 150mg"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-[#52833C]"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Dosage / Frequency *</label>
                      <input
                        type="text"
                        value={newDrug.dosage}
                        onChange={(e) => setNewDrug((p) => ({ ...p, dosage: e.target.value }))}
                        placeholder="e.g. 1-0-1 (BD) or OD"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-[#52833C]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Duration *</label>
                      <input
                        type="text"
                        value={newDrug.duration}
                        onChange={(e) => setNewDrug((p) => ({ ...p, duration: e.target.value }))}
                        placeholder="e.g. 5 Days, 1 Month"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-[#52833C]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Special Instructions</label>
                      <input
                        type="text"
                        value={newDrug.instructions}
                        onChange={(e) => setNewDrug((p) => ({ ...p, instructions: e.target.value }))}
                        placeholder="e.g. After meals, Before breakfast"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 outline-none focus:border-[#52833C]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setShowAddDrugForm(false)}
                      className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#52833C] hover:bg-[#436e30] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      Add to Prescription
                    </button>
                  </div>
                </form>
              )}

              {/* Interactive Prescription Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-[11px] font-black text-stone-500 uppercase tracking-wider bg-stone-50/80">
                      <th className="p-3.5 pl-4 rounded-l-2xl">Drug Name &amp; Strength</th>
                      <th className="p-3.5">Dosage / Frequency</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Special Instructions</th>
                      <th className="p-3.5 pr-4 text-right rounded-r-2xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs font-medium text-stone-800">
                    {prescriptions.map((rx) => {
                      const isEditingThis = editingRxId === rx.id;
                      return (
                        <tr
                          key={rx.id}
                          className={`hover:bg-stone-50/60 transition-colors ${
                            isEditingThis ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-4">
                            {isEditingThis ? (
                              <input
                                type="text"
                                value={rx.name}
                                onChange={(e) => handleUpdateRxField(rx.id, 'name', e.target.value)}
                                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 outline-none focus:border-[#52833C]"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#52833C]" />
                                <span className="font-bold text-stone-900">{rx.name}</span>
                              </div>
                            )}
                          </td>

                          <td className="p-3.5">
                            {isEditingThis ? (
                              <input
                                type="text"
                                value={rx.dosage}
                                onChange={(e) => handleUpdateRxField(rx.id, 'dosage', e.target.value)}
                                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 outline-none focus:border-[#52833C]"
                              />
                            ) : (
                              <span className="font-semibold px-2.5 py-1 bg-stone-100 rounded-lg text-stone-800 font-mono text-[11px]">
                                {rx.dosage}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            {isEditingThis ? (
                              <input
                                type="text"
                                value={rx.duration}
                                onChange={(e) => handleUpdateRxField(rx.id, 'duration', e.target.value)}
                                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 outline-none focus:border-[#52833C]"
                              />
                            ) : (
                              <span className="text-stone-700 font-medium">{rx.duration}</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            {isEditingThis ? (
                              <input
                                type="text"
                                value={rx.instructions}
                                onChange={(e) => handleUpdateRxField(rx.id, 'instructions', e.target.value)}
                                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 outline-none focus:border-[#52833C]"
                              />
                            ) : (
                              <span className="text-stone-600 italic">{rx.instructions || '—'}</span>
                            )}
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditingThis ? (
                                <button
                                  type="button"
                                  onClick={() => setEditingRxId(null)}
                                  className="p-1.5 bg-[#52833C] hover:bg-[#436e30] text-white rounded-lg cursor-pointer transition-all shadow-xs"
                                  title="Done Editing"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setEditingRxId(rx.id)}
                                  className="p-1.5 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-lg cursor-pointer transition-all"
                                  title="Edit Medication"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteRx(rx.id)}
                                className="p-1.5 hover:bg-red-100 text-stone-400 hover:text-red-700 rounded-lg cursor-pointer transition-all"
                                title="Delete Medication"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {prescriptions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-stone-500 space-y-2">
                          <p className="text-sm">No clinical medications prescribed yet.</p>
                          <button
                            type="button"
                            onClick={() => setShowAddDrugForm(true)}
                            className="text-xs font-bold text-[#52833C] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Click here to add the first prescription</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Floating Action Bar for Consultation */}
            <div className="print:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200/80 p-4 z-30 shadow-2xl">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEndConsultation}
                    className="rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs px-5 py-3 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return to Clean Desk</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-full border border-slate-400 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Slip (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="rounded-full border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-xs px-6 py-3 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Consultation Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEndConsultation}
                    className="rounded-full bg-[#52833C] hover:bg-[#436e30] text-white font-bold text-sm px-8 py-3.5 flex items-center gap-2 shadow-lg shadow-[#52833C]/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete &amp; Push to ABDM</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ================= PRINT / PDF EXPORT TEMPLATE ================= */}
            <div className="hidden print:block text-black bg-white p-8 space-y-5">
              {/* Hospital Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    National Health Mission • ABDM Smart OPD Clinical Slip
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Ministry of Health and Family Welfare • Ayushman Bharat Digital Mission
                  </p>
                </div>
                <div className="text-right text-xs text-slate-700">
                  <p className="font-bold text-slate-900">{doctorName}</p>
                  <p className="font-mono text-slate-600">HPR ID: {hprId}</p>
                  <p className="text-slate-500 mt-0.5">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Token Number</span>
                  <span className="font-black text-sm text-slate-900">{activePatient.token}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Patient Name</span>
                  <span className="font-bold text-sm text-slate-900">{activePatient.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Age / Gender</span>
                  <span className="font-bold text-slate-900">{activePatient.age} Yrs / {activePatient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">14-Digit ABHA ID</span>
                  <span className="font-mono font-bold text-slate-900">{activePatient.abhaId}</span>
                </div>
              </div>

              {/* STAT Alert Box (if applicable) */}
              {activePatient.isEmergency && (
                <div className="border-2 border-red-600 bg-red-50 rounded-xl p-3 text-xs">
                  <div className="font-black text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                    <span>⚠ STAT EMERGENCY CLINICAL ALERT</span>
                  </div>
                  <p className="text-red-900 font-bold mt-0.5">{activePatient.chiefComplaint}</p>
                </div>
              )}

              {/* Chief Complaint */}
              {!activePatient.isEmergency && (
                <div className="border border-slate-300 rounded-xl p-3 text-xs">
                  <span className="font-bold text-slate-700 block uppercase text-[10px]">Chief Complaint / Intake Reason:</span>
                  <p className="text-slate-900 font-medium mt-0.5">{activePatient.chiefComplaint}</p>
                </div>
              )}

              {/* SOCRATES Summary Table (2-Column Key-Value Grid) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  SOCRATES Clinical Symptom Assessment (8 Dimensions)
                </h4>
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Site (Location)</td>
                      <td className="p-2 text-slate-900 font-medium">{activePatient.socrates.site || 'Unspecified'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Onset (Timing)</td>
                      <td className="p-2 text-slate-900 font-medium">{activePatient.socrates.onset || 'Unspecified'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Character (Nature)</td>
                      <td className="p-2 text-slate-900 font-medium">{activePatient.socrates.character || 'Unspecified'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Radiation</td>
                      <td className="p-2 text-slate-900 font-medium">{activePatient.socrates.radiation || 'None'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Associations (Concomitant Symptoms)</td>
                      <td className="p-2 text-slate-900 font-medium">{activePatient.socrates.associations || 'None'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Time Course / Periodicity</td>
                      <td className="p-2 text-slate-900 font-medium">{activePatient.socrates.timing || 'Continuous'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Exacerbating &amp; Relieving Factors</td>
                      <td className="p-2 text-slate-900 font-medium">{activePatient.socrates.exacerbating || 'None'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="w-1/3 bg-slate-50 p-2 font-bold text-slate-700 uppercase border-r border-slate-300">Severity (Scale 1-10)</td>
                      <td className="p-2 text-slate-900 font-bold text-red-700">{activePatient.socrates.severity || 'Unspecified'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clinical Rx & Prescriptions (Print Slip Table) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  Clinical Rx &amp; Prescriptions ({prescriptions.length} Prescribed Medications)
                </h4>
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="p-2 text-left border-r border-slate-300 w-1/3">Drug Name &amp; Strength</th>
                      <th className="p-2 text-left border-r border-slate-300 w-1/4">Dosage / Frequency</th>
                      <th className="p-2 text-left border-r border-slate-300 w-1/6">Duration</th>
                      <th className="p-2 text-left">Special Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{rx.name}</td>
                        <td className="p-2 font-mono text-slate-800 border-r border-slate-300">{rx.dosage}</td>
                        <td className="p-2 text-slate-800 border-r border-slate-300">{rx.duration}</td>
                        <td className="p-2 text-slate-700 italic">{rx.instructions || '—'}</td>
                      </tr>
                    ))}
                    {prescriptions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-500 italic">No prescription medications ordered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Diagnostic Orders (Print Slip) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  Stat Diagnostic Investigations &amp; Orders
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {statOrders.map((order, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border flex items-center justify-between ${
                        order.checked ? 'border-slate-800 bg-slate-50 font-bold' : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px]">{order.checked ? '☑' : '☐'}</span>
                        <span>{order.label}</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono">{order.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Clinical Notes & Rx */}
              <div className="border border-slate-300 rounded-xl p-3 text-xs space-y-2">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Doctor Clinical Impression &amp; Disposal Plan:</span>
                <p className="text-slate-800 font-normal leading-relaxed italic">
                  {editedDoctorNotes || activePatient.doctorNotes || 'Consultation completed. Standard follow-up and monitoring prescribed.'}
                </p>
              </div>

              {/* Doctor Sign-Off & Prescription Area */}
              <div className="pt-4 border-t border-dashed border-slate-400 flex justify-between items-end text-xs">
                <div className="text-[10px] text-slate-500 max-w-sm">
                  Confidential ABDM Health Record • Generated for active clinical consultation under DPDP Act 2023 • Ephemeral local session.
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-slate-800 mb-1"></div>
                  <span className="font-semibold text-slate-700 block text-xs">Doctor Signature &amp; Stamp</span>
                  <span className="text-[10px] text-slate-500">{doctorName} ({hprId})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {completeToast && (
        <div className="print:hidden fixed bottom-20 right-6 z-50 bg-stone-950 border border-emerald-500 text-emerald-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold text-white">{completeToast}</span>
        </div>
      )}

      {/* FHIR Bundle JSON Viewer Modal */}
      {showFhirModal && (
        <div className="print:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#52833C]" />
                <h3 className="font-extrabold text-stone-900">{loc.fhirBundleTab}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyFhir}
                  className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-xs font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedFhir ? <Check className="w-3.5 h-3.5 text-[#52833C]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFhir ? loc.copiedNotice : loc.copyJsonBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFhirModal(false)}
                  className="p-1 text-stone-500 hover:text-stone-900 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-y-auto p-4 bg-stone-900 text-emerald-400 rounded-2xl text-xs font-mono mt-4 select-all">
              {activePatient?.fhirBundleJson || summary?.fhirBundleJson || JSON.stringify(activePatient, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
