/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  PatientProfile,
  StructuredClinicalSummary,
  PatientQueueItem,
  DigitizedDocument,
  SyncRecordMetadata,
} from '../types';

export const DB_NAME = 'AyurSetu_HealthKiosk_DB';
export const DB_VERSION = 1;

/**
 * Storage Typed Schema Definition for IndexedDB
 */
export interface HealthKioskDBSchema extends DBSchema {
  patients: {
    key: string; // abhaId
    value: PatientProfile;
    indexes: {
      'by-phone': string;
      'by-name': string;
      'by-aadhaar': string;
    };
  };
  clinicalSummaries: {
    key: string; // generated ID (e.g., abhaId or summary UUID)
    value: StructuredClinicalSummary & { id?: string };
    indexes: {
      'by-abha': string;
      'by-generated-at': string;
      'by-track': string;
    };
  };
  queue: {
    key: string; // queue item id / token ID
    value: PatientQueueItem;
    indexes: {
      'by-status': string;
      'by-abha': string;
      'by-department': string;
      'by-registered-at': string;
      'by-token': string;
    };
  };
  documents: {
    key: string; // document id
    value: DigitizedDocument & { abhaId?: string; uploadedAt?: string };
    indexes: {
      'by-abha': string;
      'by-type': string;
      'by-date': string;
    };
  };
  appState: {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<HealthKioskDBSchema>> | null = null;

/**
 * Initialize / Upgrade IndexedDB instance
 */
export async function getDB(): Promise<IDBPDatabase<HealthKioskDBSchema>> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB is not supported in this runtime environment.');
  }

  if (!dbPromise) {
    dbPromise = openDB<HealthKioskDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // 1. Patients Object Store
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', {
            keyPath: 'abhaId',
          });
          patientStore.createIndex('by-phone', 'phone', { unique: false });
          patientStore.createIndex('by-name', 'name', { unique: false });
          patientStore.createIndex('by-aadhaar', 'aadhaarLast4', { unique: false });
        }

        // 2. Clinical Summaries Object Store
        if (!db.objectStoreNames.contains('clinicalSummaries')) {
          const summaryStore = db.createObjectStore('clinicalSummaries', {
            keyPath: 'abhaId',
          });
          summaryStore.createIndex('by-abha', 'abhaId', { unique: false });
          summaryStore.createIndex('by-generated-at', 'generatedAt', { unique: false });
          summaryStore.createIndex('by-track', 'clinicalTrack', { unique: false });
        }

        // 3. OPD Patient Queue Object Store
        if (!db.objectStoreNames.contains('queue')) {
          const queueStore = db.createObjectStore('queue', {
            keyPath: 'id',
          });
          queueStore.createIndex('by-status', 'status', { unique: false });
          queueStore.createIndex('by-abha', 'abhaId', { unique: false });
          queueStore.createIndex('by-department', 'department', { unique: false });
          queueStore.createIndex('by-registered-at', 'registeredAt', { unique: false });
          queueStore.createIndex('by-token', 'tokenNumber', { unique: false });
        }

        // 4. Digitized OCR Medical Documents
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', {
            keyPath: 'id',
          });
          docStore.createIndex('by-abha', 'abhaId', { unique: false });
          docStore.createIndex('by-type', 'docType', { unique: false });
          docStore.createIndex('by-date', 'documentDate', { unique: false });
        }

        // 5. Session / Kiosk Global App State
        if (!db.objectStoreNames.contains('appState')) {
          db.createObjectStore('appState', {
            keyPath: 'key',
          });
        }
      },
    });
  }

  return dbPromise;
}

// ============================================================================
// 1. PATIENT RECORDS CRUD OPERATIONS
// ============================================================================

/**
 * Save or insert a new Patient Profile
 */
export async function savePatient(patient: PatientProfile): Promise<PatientProfile> {
  if (!patient.abhaId) {
    throw new Error('Patient ABHA ID is required for persistence.');
  }
  const db = await getDB();
  await db.put('patients', patient);
  return patient;
}

/**
 * Get Patient by ABHA ID
 */
export async function getPatient(abhaId: string): Promise<PatientProfile | undefined> {
  if (!abhaId) return undefined;
  const db = await getDB();
  return db.get('patients', abhaId);
}

/**
 * Get all stored Patient Profiles
 */
export async function getAllPatients(): Promise<PatientProfile[]> {
  const db = await getDB();
  return db.getAll('patients');
}

/**
 * Update existing Patient Profile
 */
export async function updatePatient(
  abhaId: string,
  updates: Partial<PatientProfile>
): Promise<PatientProfile> {
  const db = await getDB();
  const tx = db.transaction('patients', 'readwrite');
  const store = tx.objectStore('patients');
  const existing = await store.get(abhaId);

  if (!existing) {
    throw new Error(`Patient with ABHA ID "${abhaId}" not found.`);
  }

  const updated: PatientProfile = {
    ...existing,
    ...updates,
    abhaId, // preserve key
  };

  await store.put(updated);
  await tx.done;
  return updated;
}

/**
 * Delete a Patient Record
 */
export async function deletePatient(abhaId: string): Promise<void> {
  if (!abhaId) return;
  const db = await getDB();
  await db.delete('patients', abhaId);
}

/**
 * Search patients by Name, Phone, or ABHA ID
 */
export async function searchPatients(query: string): Promise<PatientProfile[]> {
  if (!query || !query.trim()) return getAllPatients();
  const q = query.trim().toLowerCase();
  const all = await getAllPatients();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.abhaId.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.aadhaarLast4 && p.aadhaarLast4.includes(q))
  );
}

// ============================================================================
// 2. CLINICAL SUMMARIES CRUD OPERATIONS
// ============================================================================

/**
 * Save or Update a Structured Clinical Summary
 */
export async function saveClinicalSummary(
  summary: StructuredClinicalSummary
): Promise<StructuredClinicalSummary> {
  if (!summary.abhaId) {
    throw new Error('Summary must have an associated abhaId.');
  }
  const db = await getDB();
  await db.put('clinicalSummaries', summary);
  return summary;
}

/**
 * Retrieve Clinical Summary by ABHA ID
 */
export async function getClinicalSummary(
  abhaId: string
): Promise<StructuredClinicalSummary | undefined> {
  if (!abhaId) return undefined;
  const db = await getDB();
  return db.get('clinicalSummaries', abhaId);
}

/**
 * Retrieve all Clinical Summaries
 */
export async function getAllClinicalSummaries(): Promise<StructuredClinicalSummary[]> {
  const db = await getDB();
  return db.getAll('clinicalSummaries');
}

/**
 * Update an existing Clinical Summary
 */
export async function updateClinicalSummary(
  abhaId: string,
  updates: Partial<StructuredClinicalSummary>
): Promise<StructuredClinicalSummary> {
  const db = await getDB();
  const tx = db.transaction('clinicalSummaries', 'readwrite');
  const store = tx.objectStore('clinicalSummaries');
  const existing = await store.get(abhaId);

  const updated: StructuredClinicalSummary = {
    ...(existing || {
      patientId: abhaId,
      abhaId,
      chiefComplaint: '',
      clinicalTrack: 'allopathic',
      hpi: '',
      socrates: {
        site: '',
        onset: '',
        character: '',
        radiation: '',
        associatedSymptoms: [],
        timeCourse: '',
        exacerbatingFactors: '',
        severity: 5,
      },
      pastMedicalSurgical: [],
      drugAndAllergy: { activeMedications: [], allergies: [] },
      familyHistory: '',
      personalSocialHistory: '',
      reviewOfSystems: [],
      priorInvestigations: [],
      doctorNotes: '',
      bilingualPatientTranscript: '',
      generatedAt: new Date().toISOString(),
      fhirBundleJson: '',
    }),
    ...updates,
    abhaId, // preserve key
  };

  await store.put(updated);
  await tx.done;
  return updated;
}

/**
 * Delete Clinical Summary
 */
export async function deleteClinicalSummary(abhaId: string): Promise<void> {
  if (!abhaId) return;
  const db = await getDB();
  await db.delete('clinicalSummaries', abhaId);
}

// ============================================================================
// 3. OPD PATIENT QUEUE CRUD OPERATIONS
// ============================================================================

/**
 * Add or Update a patient in the OPD Queue
 */
export async function addToQueue(item: PatientQueueItem): Promise<PatientQueueItem> {
  const db = await getDB();
  await db.put('queue', item);
  return item;
}

/**
 * Get a specific Queue Item by ID
 */
export async function getQueueItem(id: string): Promise<PatientQueueItem | undefined> {
  if (!id) return undefined;
  const db = await getDB();
  return db.get('queue', id);
}

/**
 * Get all active and historic Queue Items
 */
export async function getAllQueueItems(): Promise<PatientQueueItem[]> {
  const db = await getDB();
  return db.getAll('queue');
}

/**
 * Get Queue Items by Status ('WAITING' | 'IN_CONSULTATION' | 'EMERGENCY_TRIAGE' | 'COMPLETED')
 */
export async function getQueueByStatus(
  status: PatientQueueItem['status']
): Promise<PatientQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('queue', 'by-status', status);
}

/**
 * Get Queue Items by Hospital Department
 */
export async function getQueueByDepartment(
  department: string
): Promise<PatientQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('queue', 'by-department', department);
}

/**
 * Update Queue Status (e.g., transition from WAITING to IN_CONSULTATION or COMPLETED)
 */
export async function updateQueueStatus(
  id: string,
  status: PatientQueueItem['status']
): Promise<PatientQueueItem> {
  const db = await getDB();
  const tx = db.transaction('queue', 'readwrite');
  const store = tx.objectStore('queue');
  const existing = await store.get(id);

  if (!existing) {
    throw new Error(`Queue Item with ID "${id}" not found.`);
  }

  const updated: PatientQueueItem = {
    ...existing,
    status,
  };

  await store.put(updated);
  await tx.done;
  return updated;
}

/**
 * Update full fields of a Queue Item
 */
export async function updateQueueItem(
  id: string,
  updates: Partial<PatientQueueItem>
): Promise<PatientQueueItem> {
  const db = await getDB();
  const tx = db.transaction('queue', 'readwrite');
  const store = tx.objectStore('queue');
  const existing = await store.get(id);

  if (!existing) {
    throw new Error(`Queue item with ID "${id}" not found.`);
  }

  const updated: PatientQueueItem = {
    ...existing,
    ...updates,
    id, // preserve key
  };

  await store.put(updated);
  await tx.done;
  return updated;
}

/**
 * Remove patient from OPD Queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  if (!id) return;
  const db = await getDB();
  await db.delete('queue', id);
}

/**
 * Clear Entire Queue (End of Day / Fresh Demo Reset)
 */
export async function clearQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('queue');
}

// ============================================================================
// 4. DIGITIZED DOCUMENTS CRUD OPERATIONS
// ============================================================================

/**
 * Save Digitized Document
 */
export async function saveDocument(
  doc: DigitizedDocument & { abhaId?: string; uploadedAt?: string }
): Promise<DigitizedDocument> {
  const db = await getDB();
  await db.put('documents', {
    ...doc,
    uploadedAt: doc.uploadedAt || new Date().toISOString(),
  });
  return doc;
}

/**
 * Retrieve all Digitized Documents
 */
export async function getAllDocuments(): Promise<DigitizedDocument[]> {
  const db = await getDB();
  return db.getAll('documents');
}

/**
 * Retrieve Documents by Patient ABHA ID
 */
export async function getDocumentsByAbha(abhaId: string): Promise<DigitizedDocument[]> {
  if (!abhaId) return [];
  const db = await getDB();
  return db.getAllFromIndex('documents', 'by-abha', abhaId);
}

/**
 * Delete a Document
 */
export async function deleteDocument(id: string): Promise<void> {
  if (!id) return;
  const db = await getDB();
  await db.delete('documents', id);
}

// ============================================================================
// 5. SESSION & APP STATE PERSISTENCE
// ============================================================================

/**
 * Persist app state for cross-reload session restoration
 */
export async function saveAppState<T = any>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await db.put('appState', {
      key,
      value,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(`Failed to persist app state for "${key}":`, err);
  }
}

/**
 * Retrieve persisted app state
 */
export async function getAppState<T = any>(key: string): Promise<T | undefined> {
  try {
    const db = await getDB();
    const entry = await db.get('appState', key);
    return entry ? (entry.value as T) : undefined;
  } catch (err) {
    console.warn(`Failed to retrieve app state for "${key}":`, err);
    return undefined;
  }
}

/**
 * Delete persisted app state
 */
export async function removeAppState(key: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('appState', key);
  } catch (err) {}
}

// ============================================================================
// 6. DATABASE MAINTENANCE, BACKUP & EXPORT
// ============================================================================

/**
 * Completely clear all stores in IndexedDB (Database Reset)
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['patients', 'clinicalSummaries', 'queue', 'documents', 'appState'],
    'readwrite'
  );
  await Promise.all([
    tx.objectStore('patients').clear(),
    tx.objectStore('clinicalSummaries').clear(),
    tx.objectStore('queue').clear(),
    tx.objectStore('documents').clear(),
    tx.objectStore('appState').clear(),
  ]);
  await tx.done;
}

/**
 * Export full IndexedDB dataset as JSON string
 */
export async function exportDatabaseBackup(): Promise<string> {
  const db = await getDB();
  const [patients, clinicalSummaries, queue, documents] = await Promise.all([
    db.getAll('patients'),
    db.getAll('clinicalSummaries'),
    db.getAll('queue'),
    db.getAll('documents'),
  ]);

  const payload = {
    app: 'AyurSetu-AI-OPD-Kiosk',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    patients,
    clinicalSummaries,
    queue,
    documents,
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Import a JSON backup payload into IndexedDB
 */
export async function importDatabaseBackup(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    const db = await getDB();

    if (Array.isArray(parsed.patients)) {
      const tx = db.transaction('patients', 'readwrite');
      for (const p of parsed.patients) {
        await tx.objectStore('patients').put(p);
      }
      await tx.done;
    }

    if (Array.isArray(parsed.clinicalSummaries)) {
      const tx = db.transaction('clinicalSummaries', 'readwrite');
      for (const s of parsed.clinicalSummaries) {
        await tx.objectStore('clinicalSummaries').put(s);
      }
      await tx.done;
    }

    if (Array.isArray(parsed.queue)) {
      const tx = db.transaction('queue', 'readwrite');
      for (const q of parsed.queue) {
        await tx.objectStore('queue').put(q);
      }
      await tx.done;
    }

    if (Array.isArray(parsed.documents)) {
      const tx = db.transaction('documents', 'readwrite');
      for (const d of parsed.documents) {
        await tx.objectStore('documents').put(d);
      }
      await tx.done;
    }

    return true;
  } catch (e) {
    console.error('Failed to import database backup:', e);
    return false;
  }
}

// ============================================================================
// 7. BACKGROUND SYNC & ABDM FHIR CLOUD PERSISTENCE
// ============================================================================

/**
 * Get all un-synced or pending records across patients, clinical summaries, queue, and documents
 */
export async function getUnsyncedRecords() {
  const db = await getDB();
  const [patients, clinicalSummaries, queue, documents] = await Promise.all([
    db.getAll('patients'),
    db.getAll('clinicalSummaries'),
    db.getAll('queue'),
    db.getAll('documents'),
  ]);

  const unsyncedPatients = (patients as Array<PatientProfile & SyncRecordMetadata>).filter(
    (p) => !p.synced || p.syncStatus === 'PENDING' || p.syncStatus === 'FAILED'
  );

  const unsyncedSummaries = (clinicalSummaries as Array<StructuredClinicalSummary & SyncRecordMetadata>).filter(
    (s) => !s.synced || s.syncStatus === 'PENDING' || s.syncStatus === 'FAILED'
  );

  const unsyncedQueue = (queue as Array<PatientQueueItem & SyncRecordMetadata>).filter(
    (q) => !q.synced || q.syncStatus === 'PENDING' || q.syncStatus === 'FAILED'
  );

  const unsyncedDocuments = (documents as Array<DigitizedDocument & SyncRecordMetadata>).filter(
    (d) => !d.synced || d.syncStatus === 'PENDING' || d.syncStatus === 'FAILED'
  );

  const totalPending =
    unsyncedPatients.length +
    unsyncedSummaries.length +
    unsyncedQueue.length +
    unsyncedDocuments.length;

  return {
    patients: unsyncedPatients,
    clinicalSummaries: unsyncedSummaries,
    queue: unsyncedQueue,
    documents: unsyncedDocuments,
    totalPending,
  };
}

/**
 * Mark a batch of items as successfully synced to ABDM / Cloud FHIR server
 */
export async function markBatchAsSynced(result: {
  syncedAt: string;
  abdmTxnId: string;
  patientAbhas: string[];
  summaryAbhas: string[];
  queueIds: string[];
  documentIds: string[];
  fhirBundleUris?: Array<{ abhaId: string; bundleId: string; resourceUri: string }>;
}): Promise<void> {
  const db = await getDB();

  // 1. Mark Patients
  if (result.patientAbhas && result.patientAbhas.length > 0) {
    const tx = db.transaction('patients', 'readwrite');
    for (const abha of result.patientAbhas) {
      const patient = await tx.objectStore('patients').get(abha);
      if (patient) {
        (patient as any).synced = true;
        (patient as any).syncStatus = 'SYNCED';
        (patient as any).lastSyncedAt = result.syncedAt;
        (patient as any).abdmTxnId = result.abdmTxnId;
        await tx.objectStore('patients').put(patient);
      }
    }
    await tx.done;
  }

  // 2. Mark Clinical Summaries
  if (result.summaryAbhas && result.summaryAbhas.length > 0) {
    const tx = db.transaction('clinicalSummaries', 'readwrite');
    for (const abha of result.summaryAbhas) {
      const summary = await tx.objectStore('clinicalSummaries').get(abha);
      if (summary) {
        const uriObj = result.fhirBundleUris?.find((u) => u.abhaId === abha);
        (summary as any).synced = true;
        (summary as any).syncStatus = 'SYNCED';
        (summary as any).lastSyncedAt = result.syncedAt;
        (summary as any).abdmTxnId = result.abdmTxnId;
        if (uriObj) {
          (summary as any).fhirResourceId = uriObj.resourceUri;
        }
        await tx.objectStore('clinicalSummaries').put(summary);
      }
    }
    await tx.done;
  }

  // 3. Mark Queue Items
  if (result.queueIds && result.queueIds.length > 0) {
    const tx = db.transaction('queue', 'readwrite');
    for (const qId of result.queueIds) {
      const qItem = await tx.objectStore('queue').get(qId);
      if (qItem) {
        (qItem as any).synced = true;
        (qItem as any).syncStatus = 'SYNCED';
        (qItem as any).lastSyncedAt = result.syncedAt;
        (qItem as any).abdmTxnId = result.abdmTxnId;
        await tx.objectStore('queue').put(qItem);
      }
    }
    await tx.done;
  }

  // 4. Mark Documents
  if (result.documentIds && result.documentIds.length > 0) {
    const tx = db.transaction('documents', 'readwrite');
    for (const docId of result.documentIds) {
      const doc = await tx.objectStore('documents').get(docId);
      if (doc) {
        (doc as any).synced = true;
        (doc as any).syncStatus = 'SYNCED';
        (doc as any).lastSyncedAt = result.syncedAt;
        (doc as any).abdmTxnId = result.abdmTxnId;
        await tx.objectStore('documents').put(doc);
      }
    }
    await tx.done;
  }
}

/**
 * Unified storage service object for clean object-oriented access
 */
export const storageService = {
  getDB,
  // Patient CRUD
  savePatient,
  getPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  searchPatients,
  // Clinical Summary CRUD
  saveClinicalSummary,
  getClinicalSummary,
  getAllClinicalSummaries,
  updateClinicalSummary,
  deleteClinicalSummary,
  // Queue CRUD
  addToQueue,
  getQueueItem,
  getAllQueueItems,
  getQueueByStatus,
  getQueueByDepartment,
  updateQueueStatus,
  updateQueueItem,
  removeFromQueue,
  clearQueue,
  // Documents CRUD
  saveDocument,
  getAllDocuments,
  getDocumentsByAbha,
  deleteDocument,
  // Sync Operations
  getUnsyncedRecords,
  markBatchAsSynced,
  // App State & Maintenance
  saveAppState,
  getAppState,
  removeAppState,
  clearAllData,
  exportDatabaseBackup,
  importDatabaseBackup,
};

export default storageService;
