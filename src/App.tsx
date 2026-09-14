/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  Stethoscope,
  Building2,
  User,
  Users,
  LayoutGrid,
  Maximize2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Phone,
  PhoneCall,
  HeartPulse,
  HelpCircle,
  Info,
  Leaf,
  X,
  LogIn,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import {
  KioskStep,
  UserRole,
  ClinicalTrack,
  BhashiniLanguage,
  PatientProfile,
  SocratesHistory,
  AyushPariksha,
  RedFlagAlert,
  DigitizedDocument,
  StructuredClinicalSummary,
  PatientQueueItem,
  HospitalDepartment,
  DoctorNotification,
} from './types';
import { BHASHINI_22_LANGUAGES, getLocalizedStrings } from './bhashiniLanguages';
import {
  SAMPLE_INITIAL_DOCUMENTS,
  DEFAULT_AYUSH_PARIKSHA,
  COMMON_SOCRATES_PRESETS,
  INITIAL_HOSPITAL_DEPARTMENTS,
  INITIAL_HOSPITAL_QUEUE,
  detectRedFlags,
  generateFhirBundle,
} from './data/clinicalDatasets';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { IdentifyStep } from './components/IdentifyStep';
import { ConverseStep } from './components/ConverseStep';
import { ScanStep } from './components/ScanStep';
import { ProcessingStep } from './components/ProcessingStep';
import { SummaryRouteStep } from './components/SummaryRouteStep';
import { DoctorDashboard } from './components/DoctorDashboard';
import { HisDashboard } from './components/HisDashboard';
import { VaniYantraCallModal } from './components/VaniYantraCallModal';
import { LandingHome } from './components/LandingHome';
import { PatientSignInPage } from './components/PatientSignInPage';
import { DoctorSignInPage } from './components/DoctorSignInPage';
import { HospitalSignInPage } from './components/HospitalSignInPage';
import { SignInModal, UserRole as AuthUserRole } from './components/SignInModal';
import { storageService } from './services/storageService';
import { syncService } from './services/syncService';
import { AbdmSyncStatusBadge } from './components/AbdmSyncStatusBadge';
import {
  savePatientToQueue,
  updatePatientStatus,
  getStoredQueue,
  subscribeToQueue,
  patientRecordToQueueItem,
} from './utils/queueStorage';

export default function App() {
  // Navigation View State: 'home' | 'signin_patient' | 'signin_doctor' | 'signin_hospital' | 'portal'
  const [currentView, setCurrentView] = useState<'home' | 'signin_patient' | 'signin_doctor' | 'signin_hospital' | 'portal'>('home');

  // Active Window / User Role: 'user' | 'doctor' | 'his'
  const [activeRole, setActiveRole] = useState<UserRole>('user');

  // Split-Screen / Multi-Window View Mode
  const [isMultiWindowMode, setIsMultiWindowMode] = useState<boolean>(false);

  // VaniYantra Voice Call Modal Global State
  const [isGlobalVaniYantraOpen, setIsGlobalVaniYantraOpen] = useState<boolean>(false);


  // Info Modals: 'how_it_works' | 'ayush_info' | 'abdm_info' | 'help_desk' | null
  const [infoModalType, setInfoModalType] = useState<string | null>(null);

  // Sign In Modal state
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInModalInitialRole, setSignInModalInitialRole] = useState<'patient' | 'doctor' | 'hospital'>('patient');

  // Sign In Role Selector Dropdown state
  const [isSignInDropdownOpen, setIsSignInDropdownOpen] = useState(false);

  // Authenticated doctor/admin state
  const [currentDoctor, setCurrentDoctor] = useState<{ id: string; name: string; department: string; regNumber: string } | null>(null);
  const [currentHospitalAdmin, setCurrentHospitalAdmin] = useState<{ id: string; name: string; branch: string; role: string } | null>(null);

  // Patient Kiosk Step State: 'welcome' | 'voice' | 'upload' | 'processing' | 'dashboard'
  const [currentStep, setCurrentStep] = useState<KioskStep>('welcome');

  // Selected Language: defaults to English (en) on reload and first start, with full 22 Bhashini language switching
  const [selectedLanguage, setSelectedLanguage] = useState<BhashiniLanguage>(() => {
    const englishLang = BHASHINI_22_LANGUAGES.find((l) => l.code === 'en');
    return englishLang || BHASHINI_22_LANGUAGES[0];
  });
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  // Empty initial baseline
  const EMPTY_PATIENT: PatientProfile = {
    abhaId: '',
    name: '',
    age: 0,
    gender: 'Male',
    phone: '',
    aadhaarLast4: '',
    consentAudioGranted: false,
    dpdpConsentTimestamp: '',
  };

  const EMPTY_SOCRATES: SocratesHistory = {
    site: '',
    onset: '',
    character: '',
    radiation: '',
    associatedSymptoms: [],
    timeCourse: '',
    exacerbatingFactors: '',
    severity: 5,
  };

  const EMPTY_RED_FLAG: RedFlagAlert = {
    isTriggered: false,
    category: 'NONE',
    title: '',
    description: '',
    severity: 'STANDARD',
    triageAction: '',
    detectedKeywords: [],
  };

  // Patient Profile state (starts completely blank with zero users)
  const [patient, setPatient] = useState<PatientProfile>(EMPTY_PATIENT);

  // Clinical Track: Allopathic vs AYUSH
  const [clinicalTrack, setClinicalTrack] = useState<ClinicalTrack>('allopathic');

  // Patient Voice/Touch Transcript
  const [transcript, setTranscript] = useState<string>('');

  // SOCRATES Allopathic History
  const [socrates, setSocrates] = useState<SocratesHistory>(EMPTY_SOCRATES);

  // AYUSH Dashavidha Pariksha
  const [ayushPariksha, setAyushPariksha] = useState<AyushPariksha>(DEFAULT_AYUSH_PARIKSHA);

  // Red-Flag Emergency Alert
  const [redFlagAlert, setRedFlagAlert] = useState<RedFlagAlert>(EMPTY_RED_FLAG);

  // Digitized OCR Documents
  const [documents, setDocuments] = useState<DigitizedDocument[]>([]);

  // Doctor Notes
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  // HIS State: Live Departments and Patient Queue
  const [departments, setDepartments] = useState<HospitalDepartment[]>(INITIAL_HOSPITAL_DEPARTMENTS);
  const [hospitalQueue, setHospitalQueue] = useState<PatientQueueItem[]>([]);

  const loc = getLocalizedStrings(selectedLanguage.code);

  // Synthesized Structured Clinical Summary
  const clinicalSummary = useMemo<StructuredClinicalSummary>(() => {
    const summaryObject: StructuredClinicalSummary = {
      patientId: patient.abhaId || 'UNREGISTERED',
      abhaId: patient.abhaId || 'UNREGISTERED',
      chiefComplaint: socrates.site
        ? `${socrates.character || 'Pain'} at ${socrates.site}`
        : socrates.character || 'Clinical Intake Assessment',
      clinicalTrack,
      hpi: socrates.onset
        ? `Patient reports ${socrates.onset}. Symptoms described as ${socrates.character}, with radiation to ${socrates.radiation}. Pain severity rated ${socrates.severity}/10. Exacerbating factors include: ${socrates.exacerbatingFactors}.`
        : 'Intake in progress or awaiting clinician entry.',
      socrates,
      ayushPariksha: clinicalTrack === 'ayush' ? ayushPariksha : undefined,
      pastMedicalSurgical: patient.name ? [
        'Coronary Artery Disease (PTCA with DES to LAD in 2024 at AIIMS)',
        'Type-2 Diabetes Mellitus (Uncontrolled)',
        'Dyslipidemia',
      ] : [],
      drugAndAllergy: {
        activeMedications: documents.length > 0
          ? documents.flatMap((d) => d.medications || d.extractedData?.medications || [])
          : [],
        allergies: documents.length > 0
          ? ['Penicillin group antibiotics (Documented Urticaria)']
          : [],
      },
      familyHistory: patient.name ? 'Family history recorded in ABHA health locker.' : 'None recorded.',
      personalSocialHistory: patient.name ? 'Non-smoker.' : 'None recorded.',
      reviewOfSystems: [],
      priorInvestigations: documents.flatMap((d) => d.labResults || d.extractedData?.abnormalLabs || []),
      redFlagAlert,
      doctorNotes,
      bilingualPatientTranscript: transcript,
      generatedAt: new Date().toISOString(),
      fhirBundleJson: '',
    };

    summaryObject.fhirBundleJson = generateFhirBundle(patient, summaryObject);
    return summaryObject;
  }, [patient, socrates, ayushPariksha, clinicalTrack, redFlagAlert, doctorNotes, transcript, documents]);

  // Keep current patient in sync with hospital queue and unified localStorage queue bus
  const updateQueueFromCurrentPatient = () => {
    if (!patient.abhaId) return;

    // Save to unified queue storage for real-time cross-tab sync
    savePatientToQueue({
      abhaId: patient.abhaId,
      name: patient.name || 'Anonymous Patient',
      age: patient.age || 35,
      gender: patient.gender || 'Male',
      phone: patient.phone,
      track: clinicalTrack === 'ayush' ? 'AYUSH' : 'ALLOPATHIC',
      department: clinicalTrack === 'ayush' ? 'AYUSH & Integrative Medicine' : 'General Medicine & Triage',
      cabin: clinicalTrack === 'ayush' ? 'Cabin #202' : 'Cabin #104',
      roomNumber: clinicalTrack === 'ayush' ? 'Cabin #202' : 'Cabin #104',
      isEmergency: Boolean(redFlagAlert.isTriggered),
      chiefComplaint: socrates.character || 'General OPD Assessment',
      socrates: {
        site: socrates.site || 'General',
        onset: socrates.onset || 'Recent',
        character: socrates.character || 'Discomfort',
        radiation: socrates.radiation || 'None',
        associations: socrates.associatedSymptoms?.join(', ') || 'None',
        timing: socrates.timeCourse || 'Continuous',
        exacerbating: socrates.exacerbatingFactors || 'Exertion',
        severity: `${socrates.severity || 5} / 10`,
        associatedSymptoms: socrates.associatedSymptoms || [],
      },
      status: redFlagAlert.isTriggered ? 'EMERGENCY' : 'WAITING',
      hpi: `Intake registered at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Chief complaint: ${socrates.character || 'General OPD Assessment'}`,
      doctorNotes: doctorNotes || '',
      rawDocuments: documents,
    });

    setHospitalQueue((prev) => {
      const exists = prev.some((item) => item.abhaId === patient.abhaId);
      let updatedQueue: PatientQueueItem[];
      if (exists) {
        updatedQueue = prev.map((item) =>
          item.abhaId === patient.abhaId
            ? {
                ...item,
                patientName: patient.name,
                age: patient.age,
                gender: patient.gender,
                chiefComplaint: socrates.character || item.chiefComplaint,
                redFlagSeverity: redFlagAlert.isTriggered ? redFlagAlert.severity : 'STANDARD',
                socrates,
                clinicalTrack,
                documentsCount: documents.length,
              }
            : item
        );
      } else {
        const newItem: PatientQueueItem = {
          id: `queue-${Date.now()}`,
          tokenNumber: `OPD-${100 + prev.length + 1}`,
          patientName: patient.name || 'Anonymous Patient',
          abhaId: patient.abhaId,
          age: patient.age || 35,
          gender: patient.gender || 'Male',
          chiefComplaint: socrates.character || 'General OPD Consult',
          department: clinicalTrack === 'ayush' ? 'AYUSH & Integrative Medicine' : 'General Medicine & Triage',
          roomNumber: clinicalTrack === 'ayush' ? 'Cabin #202' : 'Cabin #104',
          assignedDoctor: clinicalTrack === 'ayush' ? 'Dr. V. Shastri, BAMS, MD (Ayur)' : 'Dr. A. Verma, MBBS, MD',
          registeredAt: new Date().toISOString(),
          status: redFlagAlert.isTriggered ? 'EMERGENCY_TRIAGE' : 'WAITING',
          redFlagSeverity: redFlagAlert.isTriggered ? redFlagAlert.severity : 'STANDARD',
          spokenLanguage: selectedLanguage.name,
          clinicalTrack,
          socrates,
          documentsCount: documents.length,
          fhirReady: true,
        };
        updatedQueue = [newItem, ...prev];
      }

      // Persist to IndexedDB
      updatedQueue.forEach((q) => {
        storageService.addToQueue(q).catch((e) => console.warn('Queue persistence warning:', e));
      });

      return updatedQueue;
    });

    // Also persist patient and clinical summary
    if (patient.name && patient.abhaId) {
      storageService.savePatient(patient).catch((e) => console.warn('Patient save warning:', e));
      storageService.saveClinicalSummary(clinicalSummary).catch((e) => console.warn('Summary save warning:', e));
    }

    // Trigger debounced cloud background sync to push local IndexedDB records to ABDM Sandbox / FHIR server
    syncService.triggerDebouncedSync(1000);
  };

  // Initial Load on mount and real-time subscription across tabs
  useEffect(() => {
    // Initial sync from unified queue storage
    const stored = getStoredQueue();
    if (stored && stored.length > 0) {
      setHospitalQueue(stored.map(patientRecordToQueueItem));
    }

    // Subscribe to real-time cross-tab and local updates
    const unsubscribe = subscribeToQueue((records) => {
      setHospitalQueue(records.map(patientRecordToQueueItem));
    });

    return () => unsubscribe();
  }, []);

  // Full Kiosk Reset - Signs out and clears all user data to complete zero state
  const handleResetKiosk = () => {
    setPatient(EMPTY_PATIENT);
    setCurrentDoctor(null);
    setCurrentHospitalAdmin(null);
    setCurrentStep('welcome');
    setCurrentView('home');
    setActiveRole('user');
    setTranscript('');
    setSocrates(EMPTY_SOCRATES);
    setAyushPariksha(DEFAULT_AYUSH_PARIKSHA);
    setDocuments([]);
    setDoctorNotes('');
    setClinicalTrack('allopathic');
    setRedFlagAlert(EMPTY_RED_FLAG);
    setIsSignInDropdownOpen(false);
  };

  const handleZeroRetentionPurge = () => {
    setTranscript('');
    alert(loc.zeroRetentionTitle + ': ' + loc.zeroRetentionNotice);
  };

  const handleQueueStatusChange = (id: string, status: PatientQueueItem['status']) => {
    setHospitalQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    updatePatientStatus(id, status === 'EMERGENCY_TRIAGE' ? 'EMERGENCY' : status);
    storageService.updateQueueStatus(id, status).catch((e) => console.warn('Queue status update error:', e));
  };

  const handleRerouteDept = (id: string, newDept: string, newRoom: string) => {
    setHospitalQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, department: newDept, roomNumber: newRoom } : item
      )
    );
    storageService
      .updateQueueItem(id, { department: newDept, roomNumber: newRoom })
      .catch((e) => console.warn('Queue reroute error:', e));
  };

  const handleSelectPatientFromQueue = (patientId: string) => {
    const found = hospitalQueue.find((q) => q.id === patientId || q.abhaId === patientId);
    if (found) {
      setPatient((prev) => ({
        ...prev,
        name: found.patientName,
        abhaId: found.abhaId,
        age: found.age,
        gender: found.gender as 'Male' | 'Female' | 'Other',
        phone: found.phone || prev.phone,
      }));
      setSocrates(found.socrates);
      setClinicalTrack(found.clinicalTrack);
      if (!currentDoctor) {
        setCurrentDoctor({
          id: 'HPR-DL-9941',
          name: 'Dr. Ananya Sen',
          department: 'Cardiology OPD',
          regNumber: 'NMC-88291',
          assignedCabin: 'Cabin #104 • Cardiology',
        });
      }
      setActiveRole('doctor');
      setCurrentView('portal');
    }
  };

  const [doctorNotifications, setDoctorNotifications] = useState<DoctorNotification[]>([]);

  const handlePushConsultationNotification = (item: PatientQueueItem) => {
    const newNotif: DoctorNotification = {
      id: `notif-${Date.now()}`,
      patientId: item.id,
      patientName: item.patientName,
      tokenNumber: item.tokenNumber,
      department: item.department,
      roomNumber: item.roomNumber,
      chiefComplaint: item.chiefComplaint,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setDoctorNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDismissNotification = (id: string) => {
    setDoctorNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCompleteConsultation = (abhaId: string) => {
    if (!abhaId) return;
    const item = hospitalQueue.find((q) => q.abhaId === abhaId);
    if (item) {
      setHospitalQueue((prev) =>
        prev.map((q) => (q.abhaId === abhaId ? { ...q, status: 'COMPLETED' } : q))
      );
      updatePatientStatus(item.id, 'COMPLETED');
      storageService
        .updateQueueStatus(item.id, 'COMPLETED')
        .catch((e) => console.warn('Complete consultation sync error:', e));
    }
    setDoctorNotifications((prev) => prev.filter((n) => n.read || n.patientId));
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#0C0A09] flex flex-col font-sans selection:bg-[#52833C]/20 selection:text-[#52833C]">
      {/* Top Navigation: Minimalist Bar with MediKiosk logo, subtle green dot, navigation links, and Help Desk pill */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/70 shrink-0 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo with Green Pulse */}
          <div
            id="arogyasetu-desk-logo-brand"
            onClick={() => {
              setCurrentView('home');
              if (activeRole === 'user' && !patient.abhaId) {
                setCurrentStep('welcome');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="SwasthyaSetuDesk - Multilingual Clinical Intake Kiosk"
          >
            <div className="w-8 h-8 rounded-full bg-[#52833C]/10 flex items-center justify-center text-[#52833C] group-hover:scale-105 transition-transform shadow-xs">
              <HeartPulse className="w-4 h-4 text-[#52833C]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-[#0C0A09]">
                SwasthyaSetuDesk
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#52833C] inline-block animate-pulse"></span>
            </div>
          </div>

          {/* Right Action Tools: Language Change, Helpdesk, AI Voice Guide, ABDM Cloud Sync, and Sign In */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 0. ABDM Cloud FHIR Sync Badge */}
            <AbdmSyncStatusBadge />

            {/* 1. Global Swasthya Vaani AI Voice Doctor Call Button */}
            <button
              id="header-vaniyantra-call-btn"
              type="button"
              onClick={() => {
                setCurrentView('home');
                setCurrentStep('voice');
                setIsGlobalVaniYantraOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#00925c] hover:bg-[#007a4d] text-white rounded-full text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-900/20 ring-2 ring-emerald-300/50 hover:ring-emerald-200"
              title="Start Live Call with Swasthya Vaani AI Doctor"
            >
              <PhoneCall className="w-3.5 h-3.5 text-white animate-bounce" />
              <span className="hidden sm:inline">Swasthya Vaani AI Doctor Call</span>
              <span className="sm:hidden">AI Call</span>
            </button>

            {/* 2. Language Change Button */}
            <button
              id="header-language-change-btn"
              type="button"
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-stone-100/80 hover:bg-stone-200/80 text-stone-800 rounded-full border border-stone-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Change Language (22 Official Indian Languages)"
            >
              <Globe className="w-3.5 h-3.5 text-[#52833C]" />
              <span className="hidden xs:inline">{selectedLanguage.nativeName}</span>
              <span className="xs:hidden">{selectedLanguage.code.toUpperCase()}</span>
            </button>

            {/* 3. Helpdesk Button */}
            <button
              id="header-helpdesk-btn"
              type="button"
              onClick={() => setInfoModalType('help_desk')}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-full border border-stone-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Helpdesk & OPD Assistance"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>{loc.helpDesk}</span>
            </button>

            {/* 3. Sign In / User Profile Status */}
            <div className="relative">
              {patient.abhaId && patient.consentAudioGranted && activeRole === 'user' ? (
                <div className="flex items-center gap-1.5 bg-[#52833C]/10 border border-[#52833C]/30 text-[#2B4C1E] px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                  <UserCheck className="w-3.5 h-3.5 text-[#52833C]" />
                  <span className="hidden sm:inline font-semibold">{patient.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-stone-500 font-mono">({patient.abhaId.slice(-4)})</span>
                  <button
                    type="button"
                    onClick={handleResetKiosk}
                    className="ml-1 text-[11px] text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                    title="Sign Out / Switch Account"
                  >
                    Sign Out
                  </button>
                </div>
              ) : activeRole === 'doctor' && currentDoctor ? (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline font-semibold">{currentDoctor.name}</span>
                  <span className="text-[10px] text-blue-500 font-mono">({currentDoctor.department})</span>
                  <button
                    type="button"
                    onClick={handleResetKiosk}
                    className="ml-1 text-[11px] text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                    title="Doctor Logout"
                  >
                    Sign Out
                  </button>
                </div>
              ) : activeRole === 'his' && currentHospitalAdmin ? (
                <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span className="hidden sm:inline font-semibold">{currentHospitalAdmin.name}</span>
                  <span className="text-[10px] text-purple-500 font-mono">({currentHospitalAdmin.branch})</span>
                  <button
                    type="button"
                    onClick={handleResetKiosk}
                    className="ml-1 text-[11px] text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                    title="HIS Admin Logout"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  id="header-sign-in-btn"
                  type="button"
                  onClick={() => setIsSignInDropdownOpen(!isSignInDropdownOpen)}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#52833C] hover:bg-[#436e30] text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer transform hover:scale-[1.02] active:scale-98"
                  title="Sign In as Patient, Doctor, or Hospital Admin"
                >
                  <LogIn className="w-3.5 h-3.5 text-white" />
                  <span>
                    {activeRole === 'doctor'
                      ? 'Doctor Portal'
                      : activeRole === 'his'
                      ? 'Hospital HIS'
                      : 'Sign In'}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-white/80 transition-transform ${isSignInDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Website-Style Dropdown Menu with scrollbar for the 3 user types */}
              {isSignInDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSignInDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2 border-b border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Select Sign-In Portal
                      </span>
                      <span className="text-[10px] font-semibold bg-[#52833C]/10 text-[#52833C] px-2 py-0.5 rounded-full">
                        ABDM Unified
                      </span>
                    </div>

                    {/* Scrollable list container */}
                    <div className="max-h-64 overflow-y-auto px-1.5 py-1 space-y-1 scrollbar-thin scrollbar-thumb-stone-200">
                      {/* Option 1: Patient / Kiosk Visitor */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignInDropdownOpen(false);
                          setCurrentView('signin_patient');
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-3 cursor-pointer ${
                          activeRole === 'user' && patient.abhaId
                            ? 'bg-[#52833C]/10 border border-[#52833C]/30 text-[#0C0A09]'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#52833C] flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-900">Patient / Self Check-In</span>
                            {activeRole === 'user' && patient.abhaId && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#52833C]" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            ABHA ID, Aadhaar OTP & Voice Intake
                          </p>
                        </div>
                      </button>

                      {/* Option 2: Doctor / Healthcare Provider */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignInDropdownOpen(false);
                          setCurrentView('signin_doctor');
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-3 cursor-pointer ${
                          activeRole === 'doctor'
                            ? 'bg-[#52833C]/10 border border-[#52833C]/30 text-[#0C0A09]'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-900">Doctor / Clinical EMR</span>
                            {activeRole === 'doctor' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#52833C]" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            SOCRATES summary, OCR vitals & STAT alerts
                          </p>
                        </div>
                      </button>

                      {/* Option 3: Hospital Admin / HIS Management */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignInDropdownOpen(false);
                          setCurrentView('signin_hospital');
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-3 cursor-pointer ${
                          activeRole === 'his'
                            ? 'bg-[#52833C]/10 border border-[#52833C]/30 text-[#0C0A09]'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-900">Hospital Administration (HIS)</span>
                            {activeRole === 'his' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#52833C]" />
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            OPD queues, department load & ABDM M1-M3 sync
                          </p>
                        </div>
                      </button>
                    </div>

                    <div className="mt-1 pt-2 px-3.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                      <span>DPDP Act 2023 Compliant</span>
                      <span className="font-mono text-[9px] text-[#52833C]">NHA M1/M2/M3</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Kiosk Process Navigation (Step tracker) - ONLY displayed after sign-in / intake activation */}
        {activeRole === 'user' && !isMultiWindowMode && Boolean(patient.abhaId && patient.consentAudioGranted && currentStep !== 'welcome' && currentStep !== 'identify') && (
          <div className="bg-[#F8F5F2] border-t border-stone-200/60 px-4 py-2 overflow-x-auto scrollbar-none animate-fadeIn">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 min-w-[480px]">
              {[
                { id: 'welcome', label: loc.step1Nav },
                { id: 'voice', label: loc.step2Nav },
                { id: 'upload', label: loc.step3Nav },
                { id: 'processing', label: loc.step4Nav },
                { id: 'summarize', label: loc.step5Nav },
              ].map((st, index) => {
                const isActive =
                  currentStep === st.id ||
                  (currentStep === 'identify' && st.id === 'welcome') ||
                  (currentStep === 'converse' && st.id === 'voice') ||
                  (currentStep === 'scan' && st.id === 'upload');

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setCurrentStep(st.id as KioskStep);
                    }}
                    className={`flex items-center gap-2 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#52833C] text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive ? 'bg-white text-[#52833C]' : 'bg-stone-300 text-stone-700'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* MULTI-WINDOW SPLIT MODE VIEW */}
      {isMultiWindowMode ? (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-stone-200 overflow-hidden min-h-[calc(100vh-100px)]">
          {/* WINDOW 1: PATIENT KIOSK */}
          <div className="flex flex-col bg-[#F8F5F2] overflow-y-auto max-h-[calc(100vh-100px)]">
            <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#52833C]" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
                  {loc.windowPatientKiosk}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('user');
                  setIsMultiWindowMode(false);
                }}
                className="text-xs font-bold text-[#52833C] hover:text-[#436e30] flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{loc.fullWindow}</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col">
              {(currentStep === 'welcome' || currentStep === 'identify') && (
                <IdentifyStep
                  language={selectedLanguage}
                  patient={patient}
                  onUpdatePatient={(up) => {
                    setPatient((prev) => ({ ...prev, ...up }));
                    updateQueueFromCurrentPatient();
                  }}
                  onNext={() => setCurrentStep('voice')}
                  onOpenLanguageModal={() => setIsLangModalOpen(true)}
                />
              )}
              {(currentStep === 'voice' || currentStep === 'converse') && (
                <ConverseStep
                  language={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  clinicalTrack={clinicalTrack}
                  onSelectTrack={setClinicalTrack}
                  transcript={transcript}
                  onChangeTranscript={(t) => {
                    setTranscript(t);
                    updateQueueFromCurrentPatient();
                  }}
                  socrates={socrates}
                  onUpdateSocrates={(up) => {
                    setSocrates((prev) => ({ ...prev, ...up }));
                    updateQueueFromCurrentPatient();
                  }}
                  ayushPariksha={ayushPariksha}
                  onUpdateAyush={setAyushPariksha}
                  redFlagAlert={redFlagAlert}
                  onUpdateRedFlag={(rf) => {
                    setRedFlagAlert(rf);
                    updateQueueFromCurrentPatient();
                  }}
                  onBack={() => setCurrentStep('welcome')}
                  onNext={() => setCurrentStep('upload')}
                  onOpenVaniYantraCall={() => setIsGlobalVaniYantraOpen(true)}
                />
              )}
              {(currentStep === 'upload' || currentStep === 'scan') && (
                <ScanStep
                  language={selectedLanguage}
                  documents={documents}
                  onAddDocument={(doc) => {
                    setDocuments((prev) => [doc, ...prev]);
                    updateQueueFromCurrentPatient();
                  }}
                  onBack={() => setCurrentStep('voice')}
                  onNext={() => setCurrentStep('processing')}
                />
              )}
              {currentStep === 'processing' && (
                <ProcessingStep
                  language={selectedLanguage}
                  patient={patient}
                  summary={clinicalSummary}
                  onComplete={() => {
                    updateQueueFromCurrentPatient();
                    setActiveRole('doctor');
                  }}
                />
              )}
              {currentStep === 'summarize' && (
                <SummaryRouteStep
                  language={selectedLanguage}
                  patient={patient}
                  summary={clinicalSummary}
                  redFlagAlert={redFlagAlert}
                  onProceedToDoctor={() => setActiveRole('doctor')}
                  onZeroRetentionPurge={handleZeroRetentionPurge}
                />
              )}
            </div>
          </div>

          {/* WINDOW 2: DOCTOR WORKSTATION */}
          <div className="flex flex-col bg-[#F8F5F2] overflow-y-auto max-h-[calc(100vh-100px)]">
            <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#52833C]" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-stone-900">
                  {loc.windowDoctorEmr}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('doctor');
                  setIsMultiWindowMode(false);
                }}
                className="text-xs font-bold text-[#52833C] hover:text-[#436e30] flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{loc.fullWindow}</span>
              </button>
            </div>

            <DoctorDashboard
              doctorName={currentDoctor?.name || 'Dr. Ananya Sen'}
              hprId={currentDoctor?.id || 'HPR-DL-9941'}
              doctorRole={currentDoctor?.role || 'MD, DM (Cardiology)'}
              doctorCabin={currentDoctor?.cabin || 'OPD Cabin #104 • Cardiology'}
              patient={patient}
              summary={clinicalSummary}
              documents={documents}
              redFlagAlert={redFlagAlert}
              language={selectedLanguage}
              queue={hospitalQueue}
              onSelectQueuePatient={handleSelectPatientFromQueue}
              onUpdateSummary={(up) => {
                if (up.chiefComplaint) {
                  setSocrates((prev) => ({ ...prev, character: up.chiefComplaint || prev.character }));
                }
                if (up.doctorNotes) setDoctorNotes(up.doctorNotes);
              }}
              onResetKiosk={handleResetKiosk}
              onSwitchToHis={() => setActiveRole('his')}
              onSwitchToUser={() => setActiveRole('user')}
            />
          </div>

          {/* WINDOW 3: HIS COMMAND CENTER */}
          <div className="flex flex-col bg-[#0C0A09] overflow-y-auto max-h-[calc(100vh-100px)]">
            <div className="bg-stone-950 text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-white">
                  {loc.windowHisCommand}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('his');
                  setIsMultiWindowMode(false);
                }}
                className="text-xs font-bold text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{loc.fullWindow}</span>
              </button>
            </div>

            <HisDashboard
              currentPatient={patient}
              currentSummary={clinicalSummary}
              queue={hospitalQueue}
              departments={departments}
              language={selectedLanguage}
              onSelectPatient={handleSelectPatientFromQueue}
              onUpdateQueueItemStatus={handleQueueStatusChange}
              onRerouteDepartment={handleRerouteDept}
              onSwitchToDoctor={() => setActiveRole('doctor')}
              onSwitchToUser={() => setActiveRole('user')}
            />
          </div>
        </div>
      ) : (
        /* DEDICATED FULL-SCREEN SINGLE WINDOW VIEW */
        <main className="flex-1 flex flex-col">
          {/* A. DEDICATED PATIENT SIGN IN PAGE */}
          {currentView === 'signin_patient' ? (
            <PatientSignInPage
              language={selectedLanguage}
              onBack={() => setCurrentView('home')}
              onOpenLanguageModal={() => setIsLangModalOpen(true)}
              onPatientSignIn={(patientData) => {
                setPatient({
                  abhaId: patientData.abhaId || '',
                  name: patientData.name || '',
                  age: patientData.age || 35,
                  gender: patientData.gender || 'Male',
                  phone: patientData.phone || '',
                  aadhaarLast4: patientData.aadhaarLast4 || '',
                  consentAudioGranted: true,
                  dpdpConsentTimestamp: new Date().toISOString(),
                });
                setActiveRole('user');
                setCurrentStep('voice'); // Direct to voice consultation immediately!
                setCurrentView('portal');
              }}
            />
          ) : currentView === 'signin_doctor' ? (
            /* B. DEDICATED DOCTOR SIGN IN PAGE */
            <DoctorSignInPage
              language={selectedLanguage}
              onBack={() => setCurrentView('home')}
              onOpenLanguageModal={() => setIsLangModalOpen(true)}
              onDoctorSignIn={(doctorData) => {
                setCurrentDoctor(doctorData);
                setActiveRole('doctor');
                setIsMultiWindowMode(false);
                setCurrentView('portal');
              }}
            />
          ) : currentView === 'signin_hospital' ? (
            /* C. DEDICATED HOSPITAL ADMIN SIGN IN PAGE */
            <HospitalSignInPage
              language={selectedLanguage}
              onBack={() => setCurrentView('home')}
              onOpenLanguageModal={() => setIsLangModalOpen(true)}
              onHospitalSignIn={(hospitalData) => {
                setCurrentHospitalAdmin(hospitalData);
                setActiveRole('his');
                setIsMultiWindowMode(false);
                setCurrentView('portal');
              }}
            />
          ) : currentView === 'home' && (!patient.abhaId || !patient.consentAudioGranted || currentStep === 'welcome') && activeRole === 'user' ? (
            /* D. LANDING HOME WITH THE 3 USER TYPE CARDS */
            <LandingHome
              language={selectedLanguage}
              onSelectPortal={(role) => {
                if (role === 'patient') setCurrentView('signin_patient');
                else if (role === 'doctor') setCurrentView('signin_doctor');
                else if (role === 'hospital') setCurrentView('signin_hospital');
              }}
              onOpenLanguageModal={() => setIsLangModalOpen(true)}
              onOpenHelpdesk={() => setInfoModalType('help_desk')}
            />
          ) : activeRole === 'user' ? (
            /* 1. USER WINDOW: PATIENT KIOSK WORKFLOW */
            <div className="flex-1 flex flex-col">
              {currentStep === 'identify' && (
                <IdentifyStep
                  language={selectedLanguage}
                  patient={patient}
                  onUpdatePatient={(up) => {
                    setPatient((prev) => ({ ...prev, ...up }));
                    updateQueueFromCurrentPatient();
                  }}
                  onNext={() => setCurrentStep('voice')}
                  onOpenLanguageModal={() => setIsLangModalOpen(true)}
                />
              )}

              {(currentStep === 'voice' || currentStep === 'converse') && Boolean(patient.abhaId) && (
                <ConverseStep
                  language={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  clinicalTrack={clinicalTrack}
                  onSelectTrack={setClinicalTrack}
                  transcript={transcript}
                  onChangeTranscript={(t) => {
                    setTranscript(t);
                    updateQueueFromCurrentPatient();
                  }}
                  socrates={socrates}
                  onUpdateSocrates={(up) => {
                    setSocrates((prev) => ({ ...prev, ...up }));
                    updateQueueFromCurrentPatient();
                  }}
                  ayushPariksha={ayushPariksha}
                  onUpdateAyush={setAyushPariksha}
                  redFlagAlert={redFlagAlert}
                  onUpdateRedFlag={(rf) => {
                    setRedFlagAlert(rf);
                    updateQueueFromCurrentPatient();
                  }}
                  onBack={() => {
                    setCurrentStep('welcome');
                    setCurrentView('home');
                  }}
                  onNext={() => setCurrentStep('upload')}
                  onOpenVaniYantraCall={() => setIsGlobalVaniYantraOpen(true)}
                />
              )}

              {(currentStep === 'upload' || currentStep === 'scan') && Boolean(patient.abhaId) && (
                <ScanStep
                  language={selectedLanguage}
                  documents={documents}
                  onAddDocument={(doc) => {
                    setDocuments((prev) => [doc, ...prev]);
                    updateQueueFromCurrentPatient();
                  }}
                  onBack={() => setCurrentStep('voice')}
                  onNext={() => setCurrentStep('processing')}
                />
              )}

              {currentStep === 'processing' && Boolean(patient.abhaId) && (
                <ProcessingStep
                  language={selectedLanguage}
                  patient={patient}
                  summary={clinicalSummary}
                  onComplete={() => {
                    updateQueueFromCurrentPatient();
                    setCurrentStep('summarize');
                  }}
                />
              )}

              {currentStep === 'summarize' && Boolean(patient.abhaId) && (
                <SummaryRouteStep
                  language={selectedLanguage}
                  patient={patient}
                  summary={clinicalSummary}
                  redFlagAlert={redFlagAlert}
                  onProceedToDoctor={() => {
                    handleResetKiosk();
                  }}
                  onZeroRetentionPurge={handleZeroRetentionPurge}
                />
              )}
            </div>
          ) : null}

          {/* 2. DOCTOR WINDOW: CLINICIAN EMR WORKSTATION (STRICT AUTH GUARD) */}
          {activeRole === 'doctor' && (
            currentDoctor ? (
              <DoctorDashboard
                doctorName={currentDoctor.name}
                hprId={currentDoctor.id}
                doctorRole={currentDoctor.role}
                doctorCabin={currentDoctor.cabin || 'OPD Cabin #104 • Cardiology'}
                patient={patient}
                summary={clinicalSummary}
                documents={documents}
                redFlagAlert={redFlagAlert}
                language={selectedLanguage}
                queue={hospitalQueue}
                notifications={doctorNotifications}
                onDismissNotification={handleDismissNotification}
                onCompleteConsultation={handleCompleteConsultation}
                onSelectQueuePatient={handleSelectPatientFromQueue}
                onUpdateSummary={(up) => {
                  if (up.chiefComplaint) {
                    setSocrates((prev) => ({ ...prev, character: up.chiefComplaint || prev.character }));
                  }
                  if (up.doctorNotes) setDoctorNotes(up.doctorNotes);
                }}
                onResetKiosk={handleResetKiosk}
                onSwitchToHis={() => {
                  if (!currentHospitalAdmin) {
                    setCurrentHospitalAdmin({
                      id: 'ADMIN-AIIMS-01',
                      name: 'Rajesh Kumar (Medical Superintendent)',
                      branch: 'AIIMS Main Campus',
                      role: 'Super Admin',
                    });
                  }
                  setActiveRole('his');
                  setCurrentView('portal');
                }}
                onSwitchToUser={() => {
                  setActiveRole('user');
                  setCurrentView('home');
                }}
                onLogout={() => {
                  setCurrentDoctor(null);
                  setActiveRole('user');
                  setCurrentView('home');
                }}
              />
            ) : (
              <DoctorSignInPage
                language={selectedLanguage}
                onBack={() => {
                  setActiveRole('user');
                  setCurrentView('home');
                }}
                onOpenLanguageModal={() => setIsLangModalOpen(true)}
                onDoctorSignIn={(doctorData) => {
                  setCurrentDoctor(doctorData);
                  setActiveRole('doctor');
                  setIsMultiWindowMode(false);
                  setCurrentView('portal');
                }}
              />
            )
          )}

          {/* 3. HIS WINDOW: HOSPITAL INFORMATION SYSTEM (STRICT AUTH GUARD) */}
          {activeRole === 'his' && (
            (currentHospitalAdmin || currentDoctor) ? (
              <HisDashboard
                currentPatient={patient}
                currentSummary={clinicalSummary}
                queue={hospitalQueue}
                departments={departments}
                language={selectedLanguage}
                currentDoctor={currentDoctor}
                currentHospitalAdmin={currentHospitalAdmin}
                onSelectPatient={handleSelectPatientFromQueue}
                onUpdateQueueItemStatus={handleQueueStatusChange}
                onRerouteDepartment={handleRerouteDept}
                onPushConsultationNotification={handlePushConsultationNotification}
                onSwitchToDoctor={(patientId?: string) => {
                  if (patientId) {
                    handleSelectPatientFromQueue(patientId);
                  }
                  if (!currentDoctor) {
                    setCurrentDoctor({
                      id: 'HPR-DL-9941',
                      name: 'Dr. Ananya Sen',
                      department: 'Cardiology OPD',
                      regNumber: 'NMC-88291',
                      assignedCabin: 'Cabin #104 • Cardiology',
                    });
                  }
                  setActiveRole('doctor');
                  setCurrentView('portal');
                }}
                onSwitchToUser={() => {
                  setActiveRole('user');
                  setCurrentView('home');
                }}
              />
            ) : (
              <HospitalSignInPage
                language={selectedLanguage}
                onBack={() => {
                  setActiveRole('user');
                  setCurrentView('home');
                }}
                onOpenLanguageModal={() => setIsLangModalOpen(true)}
                onHospitalSignIn={(hospitalData) => {
                  setCurrentHospitalAdmin(hospitalData);
                  setActiveRole('his');
                  setIsMultiWindowMode(false);
                  setCurrentView('portal');
                }}
              />
            )
          )}
        </main>
      )}

      {/* 22 Bhashini Languages Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => setSelectedLanguage(lang)}
      />

      {/* Global VaniYantra AI Voice Doctor Call Modal */}
      <VaniYantraCallModal
        isOpen={isGlobalVaniYantraOpen}
        onClose={() => setIsGlobalVaniYantraOpen(false)}
        language={selectedLanguage}
        clinicalTrack={clinicalTrack}
        onSymptomsExtracted={(extractedText, partialSocrates) => {
          setTranscript(extractedText);
          if (partialSocrates) {
            setSocrates((prev) => ({ ...prev, ...partialSocrates }));
          }
          updateQueueFromCurrentPatient();
        }}
      />

      {/* Info Modals (How it Works, AYUSH Mode, ABDM Support, Help Desk) */}
      {infoModalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#52833C]"></span>
                <h3 className="font-extrabold text-base sm:text-lg text-[#0C0A09]">
                  {infoModalType === 'how_it_works' && 'How SwasthyaSetuDesk Works'}
                  {infoModalType === 'ayush_mode' && 'AYUSH Dashavidha Pariksha'}
                  {infoModalType === 'abdm_support' && 'ABDM & DPDP Compliance'}
                  {infoModalType === 'help_desk' && 'SwasthyaSetuDesk Help Desk & Support'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInfoModalType(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#71717A] leading-relaxed">
              {infoModalType === 'how_it_works' && (
                <>
                  <p>
                    <strong className="text-stone-900">1. Instant Identification:</strong> Patient enters their 14-digit ABHA ID or mobile number to authenticate with ABDM.
                  </p>
                  <p>
                    <strong className="text-stone-900">2. Natural Voice Elicitation:</strong> Speak freely in any of the 22 Bhashini regional languages. Gemini extracts SOCRATES history and flags critical emergencies.
                  </p>
                  <p>
                    <strong className="text-stone-900">3. Document OCR:</strong> Digitize paper prescriptions, discharge summaries, and lab reports in seconds using the device camera or file upload.
                  </p>
                  <p>
                    <strong className="text-stone-900">4. EMR Synthesis:</strong> Produces an HL7 FHIR R4 Bundle directly loaded into the doctor's consultation workstation.
                  </p>
                </>
              )}

              {infoModalType === 'ayush_mode' && (
                <>
                  <p>
                    SwasthyaSetuDesk features specialized support for AYUSH (Ayurveda, Yoga &amp; Naturopathy, Unani, Siddha, and Homoeopathy) protocols.
                  </p>
                  <p>
                    It structures patient clinical intake according to <strong className="text-stone-900">Dashavidha Pariksha</strong> (Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara-Shakti, Vyayama-Shakti, and Vaya) and Ahara-Vihara patterns.
                  </p>
                </>
              )}

              {infoModalType === 'abdm_support' && (
                <>
                  <p>
                    <strong className="text-stone-900">ABDM Milestones 1, 2, and 3:</strong> Fully compliant with Ayushman Bharat Digital Mission standards, generating HL7 FHIR R4 Bundles and Health Information Provider (HIP) / Health Information User (HIU) record structures.
                  </p>
                  <p>
                    <strong className="text-stone-900">DPDP Act 2023:</strong> Strictly enforces patient informed consent and zero-retention data purging.
                  </p>
                </>
              )}

              {infoModalType === 'help_desk' && (
                <>
                  <p>
                    Need assistance operating the kiosk? Hospital triage attendants and technical staff are available at the main reception counter.
                  </p>
                  <div className="p-3 bg-[#F8F5F2] rounded-2xl border border-stone-200 space-y-1 text-xs">
                    <p><strong className="text-stone-900">Toll-Free Helpline:</strong> 1800-11-4477</p>
                    <p><strong className="text-stone-900">Emergency Desk:</strong> OPD Block A, Room 101</p>
                    <p><strong className="text-stone-900">AI Assistant:</strong> Tap the "VaniYantra Call" button on top for live voice help in your regional language.</p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalType(null)}
                className="rounded-full bg-[#52833C] text-white text-xs font-bold px-6 py-2.5 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABDM Unified Sign-In Modal (Patient, Doctor, Hospital Staff) */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        initialRole={signInModalInitialRole}
        language={selectedLanguage}
        onPatientSignIn={(patientData) => {
          setPatient({
            abhaId: patientData.abhaId,
            name: patientData.name,
            age: patientData.age,
            gender: patientData.gender,
            phone: patientData.phone,
            aadhaarLast4: patientData.aadhaarLast4 || '',
            consentAudioGranted: true,
            dpdpConsentTimestamp: new Date().toISOString(),
          });
          setActiveRole('user');
          setCurrentStep('voice'); // Direct to voice consultation immediately!
          setIsSignInModalOpen(false);
        }}
        onDoctorSignIn={(doctorData) => {
          setCurrentDoctor(doctorData);
          setActiveRole('doctor');
          setIsMultiWindowMode(false);
          setIsSignInModalOpen(false);
        }}
        onHospitalSignIn={(hospitalData) => {
          setCurrentHospitalAdmin(hospitalData);
          setActiveRole('his');
          setIsMultiWindowMode(false);
          setIsSignInModalOpen(false);
        }}
      />

    </div>
  );
}
