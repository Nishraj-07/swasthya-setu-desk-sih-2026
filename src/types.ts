/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type KioskStep =
  | 'welcome'
  | 'identify'
  | 'voice'
  | 'converse'
  | 'upload'
  | 'scan'
  | 'processing'
  | 'summarize'
  | 'dashboard'
  | 'consult';

export type UserRole = 'user' | 'doctor' | 'his';

export type ClinicalTrack = 'allopathic' | 'ayush';

export type AuthMode = 'abha' | 'aadhaar' | 'register';

export type RedFlagSeverity = 'CRITICAL' | 'URGENT' | 'STANDARD';

export interface BhashiniLanguage {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  script: string;
  region: string;
  isOfficial22: boolean;
}

export interface PatientProfile {
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  aadhaarLast4?: string;
  address?: string;
  bloodGroup?: string;
  consentAudioGranted: boolean;
  dpdpConsentTimestamp: string;
  uploadedDocuments?: Array<DigitizedDocument | { fileName?: string; extractedMedication?: string; extractedMedications?: string[]; medications?: ExtractedMedication[] }>;
  ocrDocuments?: Array<DigitizedDocument | any>;
}

export interface SocratesHistory {
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associatedSymptoms: string[];
  timeCourse: string;
  exacerbatingFactors: string;
  severity: number; // 1-10
}

export interface AyushPariksha {
  prakriti: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridosha';
  vikriti: string;
  sara: 'Pravara (Superior)' | 'Madhyama (Medium)' | 'Avara (Inferior)';
  samhanana: 'Compact/Firm' | 'Moderate' | 'Loose';
  pramana: 'Proportionate' | 'Disproportionate';
  satmya: 'Eka-Rasa' | 'Sarva-Rasa (Adaptable)';
  sattva: 'Pravara (High Mental Strength)' | 'Madhyama' | 'Avara (Anxious/Weak)';
  aharaShakti: 'Abhyavaharana & Jarana (High)' | 'Moderate' | 'Mandagni (Low)';
  vyayamaShakti: 'High Endurance' | 'Moderate' | 'Low Endurance';
  vaya: 'Bala (Child)' | 'Madhyama (Adult)' | 'Vriddha (Elderly)';
  aharaVihara: {
    dietaryPattern: string;
    sleepPattern: string;
    bowelHabits: string;
    waterIntake: string;
  };
}

export interface RedFlagAlert {
  isTriggered: boolean;
  category: 'CARDIAC' | 'STROKE_FAST' | 'RESPIRATORY' | 'ANAPHYLAXIS' | 'SEPSIS_TRAUMA' | 'NONE';
  title: string;
  description: string;
  severity: RedFlagSeverity;
  triageAction: string;
  detectedKeywords: string[];
}

export interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  route?: string;
  prescribedDate?: string;
  status: 'active' | 'completed' | 'discontinued';
}

export interface ExtractedLabResult {
  parameter: string;
  value: string;
  numericValue?: number;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  date: string;
}

export interface DigitizedDocument {
  id: string;
  fileName: string;
  docType: 'PRESCRIPTION' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY' | 'IMAGING';
  documentDate: string;
  facilityName: string;
  previewUrl?: string;
  rawOcrText: string;
  diagnoses: string[];
  medications: ExtractedMedication[];
  labResults: ExtractedLabResult[];
  surgeriesAndProcedures: string[];
  abnormalFlags: string[];
  drugInteractions?: string[];
  extractedMedication?: string;
  extractedMedications?: string[];
  extractedData?: { abnormalLabs?: ExtractedLabResult[]; medications?: ExtractedMedication[] };
}

export interface BhashiniAsrResponse {
  success: boolean;
  nativeLanguage: string;
  nativeTranscript: string;
  englishTranslation: string;
  socrates?: Partial<SocratesHistory>;
  ayush?: Partial<AyushPariksha>;
  redFlag?: RedFlagAlert;
  confidenceScore?: number;
  engineUsed: string;
}

export interface StructuredClinicalSummary {
  patientId: string;
  abhaId: string;
  chiefComplaint: string;
  clinicalTrack: ClinicalTrack;
  hpi: string;
  socrates: SocratesHistory;
  ayushPariksha?: AyushPariksha;
  pastMedicalSurgical: string[];
  drugAndAllergy: {
    activeMedications: ExtractedMedication[];
    allergies: string[];
  };
  familyHistory: string;
  personalSocialHistory: string;
  reviewOfSystems: string[];
  priorInvestigations: ExtractedLabResult[];
  redFlagAlert?: RedFlagAlert;
  doctorNotes: string;
  bilingualPatientTranscript: string;
  generatedAt: string;
  fhirBundleJson: string;
}

export interface PatientQueueItem {
  id: string;
  tokenNumber: string;
  patientName: string;
  abhaId: string;
  age: number;
  gender: string;
  department: string;
  roomNumber: string;
  assignedDoctor: string;
  doctorId?: string;
  assignedCabin?: string;
  chiefComplaint: string;
  registeredAt: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'EMERGENCY_TRIAGE' | 'COMPLETED';
  redFlagSeverity: RedFlagSeverity;
  spokenLanguage: string;
  clinicalTrack: ClinicalTrack;
  socrates: SocratesHistory;
  documentsCount: number;
  fhirReady: boolean;
}

export interface HospitalDepartment {
  id: string;
  name: string;
  code: string;
  currentDoctor: string;
  roomNumber: string;
  activeQueueCount: number;
  emergencyCount: number;
  averageWaitMins: number;
  status: 'ACTIVE' | 'BUSY' | 'ON_CALL';
}

export type SyncStateStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR' | 'OFFLINE';

export interface SyncRecordMetadata {
  synced?: boolean;
  syncStatus?: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  lastSyncedAt?: string;
  syncError?: string;
  abdmTxnId?: string;
  fhirResourceId?: string;
  retryCount?: number;
}

export interface AbdmSyncPayload {
  kioskId: string;
  facilityId: string;
  hipId: string;
  syncedAt: string;
  records: {
    patients: Array<PatientProfile & SyncRecordMetadata>;
    clinicalSummaries: Array<StructuredClinicalSummary & SyncRecordMetadata>;
    queue: Array<PatientQueueItem & SyncRecordMetadata>;
    documents: Array<DigitizedDocument & SyncRecordMetadata>;
  };
}

export interface AbdmSyncResponse {
  success: boolean;
  transactionId: string;
  hipAcknowledgement: string;
  ndhmGatewayTimestamp: string;
  stats: {
    patientsProcessed: number;
    summariesPushed: number;
    queueUpdated: number;
    documentsLinked: number;
  };
  fhirBundleUris: Array<{
    abhaId: string;
    bundleId: string;
    resourceUri: string;
  }>;
  abdmSandboxStatus: {
    m1M2M3Certified: boolean;
    hipRegistryStatus: 'ACTIVE' | 'REGISTERED';
    gatewayEndpoint: string;
  };
  message: string;
}

export interface SyncStatusState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  lastError: string | null;
  lastTxnId: string | null;
  activeGateway: string;
}

export interface DoctorNotification {
  id: string;
  patientId: string;
  patientName: string;
  tokenNumber: string;
  department: string;
  roomNumber: string;
  chiefComplaint: string;
  timestamp: string;
  read: boolean;
}

