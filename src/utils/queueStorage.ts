/**
 * Unified Patient Queue Storage & Cross-Tab Real-time Event Bus
 * Uses localStorage, window CustomEvents, and BroadcastChannel for zero-latency cross-tab sync.
 */

export interface PatientRecord {
  id: string;
  token: string;
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  track?: 'ALLOPATHIC' | 'AYUSH';
  department?: string;
  cabin?: string;
  roomNumber?: string;
  isEmergency: boolean;
  chiefComplaint: string;
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
  triageTimestamp: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'EMERGENCY';
  hpi?: string;
  doctorNotes?: string;
  clinicalImpression?: string;
  attendingDoctor?: string;
  completedAt?: string;
  orderedDiagnostics?: any[];
  prescriptions?: any[];
  labInvestigations?: any[];
  medications?: any[];
  rawDocuments?: any[];
  fhirBundleJson?: string;
}

const STORAGE_KEY = 'medikiosk_shared_patient_queue';
const QUEUE_EVENT = 'medikiosk_queue_updated';
const BROADCAST_CHANNEL_NAME = 'medikiosk_queue_channel';

// Fallback seed queue if storage is totally empty - initialized as COMPLETED
const SEED_QUEUE: PatientRecord[] = [
  {
    id: 'p-106',
    token: 'OPD-106',
    abhaId: '91-9666-6893-8761',
    name: 'Asha Sharma',
    age: 34,
    gender: 'Female',
    phone: '+91 98123 45678',
    track: 'ALLOPATHIC',
    department: 'General Medicine & Triage',
    cabin: 'Cabin #104',
    roomNumber: 'Cabin #104',
    isEmergency: false,
    chiefComplaint: 'Normal follow-up evaluation',
    socrates: {
      site: 'General',
      onset: '1 week ago',
      character: 'Mild fatigue',
      radiation: 'None',
      associations: 'None',
      timing: 'Intermittent',
      exacerbating: 'None',
      severity: '2 / 10',
      associatedSymptoms: [],
    },
    triageTimestamp: '09:25 AM',
    status: 'COMPLETED',
  },
  {
    id: 'p-101',
    token: 'OPD-101',
    abhaId: '91-4829-1092-3841',
    name: 'Ramesh K. Verma',
    age: 48,
    gender: 'Male',
    phone: '+91 98765 43210',
    track: 'ALLOPATHIC',
    department: 'Cardiology OPD',
    cabin: 'Cabin #104',
    roomNumber: 'Cabin #104',
    isEmergency: true,
    chiefComplaint: 'Acute retrosternal chest pain radiating to left arm & jaw',
    socrates: {
      site: 'Retrosternal (Substernal central chest)',
      onset: 'Sudden onset ~45 minutes ago while climbing stairs',
      character: 'Severe crushing pressure and tightness',
      radiation: 'Radiating to left shoulder, medial arm & mandible',
      associations: 'Profuse cold diaphoresis, dyspnea, nausea',
      timing: 'Constant, non-fluctuating (>45 mins)',
      exacerbating: 'Worsened by minimal exertion, unimproved by rest',
      severity: '8 / 10',
      associatedSymptoms: ['Cold Diaphoresis', 'Exertional Dyspnea', 'Palpitations', 'Nausea'],
    },
    triageTimestamp: '10:14 AM',
    status: 'COMPLETED',
    hpi: 'A 48-year-old male with history of CAD presents with sudden-onset retrosternal crushing pain lasting 45 minutes, associated with cold sweats and dyspnea.',
    doctorNotes: 'Impression: Acute Coronary Syndrome. Urgent ECG and Troponin I indicated. Completed.',
  },
  {
    id: 'p-102',
    token: 'OPD-102',
    abhaId: '91-8829-4410-9921',
    name: 'Sunita Sharma',
    age: 52,
    gender: 'Female',
    phone: '+91 94123 56789',
    track: 'ALLOPATHIC',
    department: 'General Medicine & Triage',
    cabin: 'Cabin #108',
    roomNumber: 'Cabin #108',
    isEmergency: false,
    chiefComplaint: 'Atypical epigastric burning and post-prandial palpitation',
    socrates: {
      site: 'Epigastric & lower retrosternal',
      onset: 'Gradual onset over past 3 weeks',
      character: 'Burning discomfort and fullness',
      radiation: 'Occasional radiation to back',
      associations: 'Fatigue, mild shortness of breath on brisk walk',
      timing: 'Intermittent, worse after meals',
      exacerbating: 'Heavy meals, fast walking',
      severity: '5 / 10',
      associatedSymptoms: ['Post-prandial Fullness', 'Fatigue', 'Palpitation'],
    },
    triageTimestamp: '10:28 AM',
    status: 'COMPLETED',
    hpi: 'A 52-year-old female presents with 3-week history of epigastric burning and palpitations.',
  },
  {
    id: 'p-103',
    token: 'OPD-103',
    abhaId: '91-3310-7721-5504',
    name: 'Vikram Malhotra',
    age: 64,
    gender: 'Male',
    phone: '+91 97112 33445',
    track: 'ALLOPATHIC',
    department: 'Cardiology OPD',
    cabin: 'Cabin #104',
    roomNumber: 'Cabin #104',
    isEmergency: false,
    chiefComplaint: 'Routine cardiac follow-up post PTCA Stent & bilateral ankle swelling',
    socrates: {
      site: 'Bilateral lower extremities (Pre-tibial)',
      onset: 'Insidious onset over last 2 months',
      character: 'Pitting edema with dependent swelling',
      radiation: 'None',
      associations: 'Orthopnea (2 pillows), mild nocturia',
      timing: 'Progressive, more prominent in evening',
      exacerbating: 'Prolonged standing',
      severity: '4 / 10',
      associatedSymptoms: ['Pitting Pedal Edema', 'Mild Orthopnea'],
    },
    triageTimestamp: '10:45 AM',
    status: 'COMPLETED',
  },
  {
    id: 'p-104',
    token: 'OPD-104',
    abhaId: '91-7712-4439-0129',
    name: 'Meenakshi Iyer',
    age: 39,
    gender: 'Female',
    phone: '+91 98201 11223',
    track: 'AYUSH',
    department: 'AYUSH & Integrative Medicine',
    cabin: 'Cabin #202',
    roomNumber: 'Cabin #202',
    isEmergency: false,
    chiefComplaint: 'Chronic migraine with Vata-Pitta Prakriti imbalance & sleep disturbance',
    socrates: {
      site: 'Right temporal and frontal hemicranial',
      onset: 'Recurrent episodes for 1 year',
      character: 'Pulsating, throbbing vascular pain',
      radiation: 'Radiating to nape of neck',
      associations: 'Photophobia, nausea, visual aura',
      timing: 'Bi-weekly episodes lasting 6-8 hours',
      exacerbating: 'Stress, missed meals, direct sunlight',
      severity: '7 / 10',
      associatedSymptoms: ['Photophobia', 'Nausea', 'Aura'],
    },
    triageTimestamp: '11:02 AM',
    status: 'COMPLETED',
  },
];

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel initialization fallback:', e);
  }
}

export const getStoredQueue = (): PatientRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default queue if not present
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_QUEUE));
      return SEED_QUEUE;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_QUEUE;
  } catch (err) {
    console.error('Failed to read patient queue from storage:', err);
    return SEED_QUEUE;
  }
};

export const savePatientToQueue = (
  patient: Omit<PatientRecord, 'id' | 'token' | 'triageTimestamp' | 'status'> &
    Partial<Pick<PatientRecord, 'id' | 'token' | 'triageTimestamp' | 'status'>>
): PatientRecord => {
  const currentQueue = getStoredQueue();

  // If patient already exists with same abhaId, update or prepend
  const existingIdx = currentQueue.findIndex((p) => p.abhaId && p.abhaId === patient.abhaId);

  const nextTokenNum = 100 + currentQueue.length + 1;
  const token = patient.token || `OPD-${nextTokenNum}`;
  const triageTimestamp =
    patient.triageTimestamp ||
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const status = patient.status || (patient.isEmergency ? 'EMERGENCY' : 'WAITING');
  const id = patient.id || `p-${Date.now()}`;

  const newRecord: PatientRecord = {
    ...patient,
    id,
    token,
    triageTimestamp,
    status,
  };

  let updatedQueue: PatientRecord[];
  if (existingIdx >= 0) {
    updatedQueue = [...currentQueue];
    updatedQueue[existingIdx] = { ...updatedQueue[existingIdx], ...newRecord };
  } else {
    updatedQueue = [newRecord, ...currentQueue];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
  } catch (err) {
    console.error('Failed to save patient queue to localStorage:', err);
  }

  // Dispatch local CustomEvent
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(QUEUE_EVENT, { detail: updatedQueue }));
  }

  // Dispatch BroadcastChannel event across open tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'QUEUE_UPDATED', queue: updatedQueue });
    } catch (e) {
      console.warn('BroadcastChannel postMessage note:', e);
    }
  }

  return newRecord;
};

export const updatePatientStatus = (idOrAbhaId: string, status: PatientRecord['status']) => {
  const currentQueue = getStoredQueue();
  const updated = currentQueue.map((p) =>
    p.id === idOrAbhaId || p.abhaId === idOrAbhaId || p.token === idOrAbhaId
      ? { ...p, status }
      : p
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update patient status in localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(QUEUE_EVENT, { detail: updated }));
  }

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'QUEUE_UPDATED', queue: updated });
    } catch (e) {
      console.warn('BroadcastChannel postMessage note:', e);
    }
  }
};

export const updatePatientRecord = (idOrAbhaId: string, updates: Partial<PatientRecord>) => {
  const currentQueue = getStoredQueue();
  const updated = currentQueue.map((p) =>
    p.id === idOrAbhaId || p.abhaId === idOrAbhaId || p.token === idOrAbhaId
      ? { ...p, ...updates }
      : p
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update patient record in localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(QUEUE_EVENT, { detail: updated }));
  }

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'QUEUE_UPDATED', queue: updated });
    } catch (e) {
      console.warn('BroadcastChannel postMessage note:', e);
    }
  }
};

export const subscribeToQueue = (callback: (queue: PatientRecord[]) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const localHandler = () => {
    callback(getStoredQueue());
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || !e.key) {
      callback(getStoredQueue());
    }
  };

  const broadcastHandler = (e: MessageEvent) => {
    if (e.data && e.data.type === 'QUEUE_UPDATED') {
      callback(e.data.queue || getStoredQueue());
    }
  };

  window.addEventListener(QUEUE_EVENT, localHandler);
  window.addEventListener('storage', storageHandler);

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', broadcastHandler);
  }

  return () => {
    window.removeEventListener(QUEUE_EVENT, localHandler);
    window.removeEventListener('storage', storageHandler);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', broadcastHandler);
    }
  };
};

export const patientRecordToQueueItem = (rec: PatientRecord): import('../types').PatientQueueItem => {
  return {
    id: rec.id,
    tokenNumber: rec.token,
    patientName: rec.name,
    abhaId: rec.abhaId,
    age: rec.age,
    gender: rec.gender,
    department: rec.department || (rec.track === 'AYUSH' ? 'AYUSH & Integrative Medicine' : 'General Medicine & Triage'),
    roomNumber: rec.cabin || rec.roomNumber || (rec.track === 'AYUSH' ? 'Cabin #202' : 'Cabin #104'),
    assignedDoctor: rec.track === 'AYUSH' ? 'Dr. Vidyadhar Sharma (BAMS)' : 'Dr. Ananya Sen (MD, DM)',
    chiefComplaint: rec.chiefComplaint,
    registeredAt: rec.triageTimestamp,
    status: rec.status === 'EMERGENCY' ? 'EMERGENCY_TRIAGE' : rec.status,
    redFlagSeverity: rec.isEmergency ? 'CRITICAL' : 'STANDARD',
    spokenLanguage: 'Hindi / English',
    clinicalTrack: rec.track === 'AYUSH' ? 'ayush' : 'allopathic',
    socrates: {
      site: rec.socrates?.site || '',
      onset: rec.socrates?.onset || '',
      character: rec.socrates?.character || rec.chiefComplaint || '',
      radiation: rec.socrates?.radiation || '',
      associatedSymptoms: rec.socrates?.associatedSymptoms || [],
      timeCourse: rec.socrates?.timing || '',
      exacerbatingFactors: rec.socrates?.exacerbating || '',
      severity: parseInt(rec.socrates?.severity || '5', 10) || 5,
    },
    documentsCount: rec.rawDocuments?.length || 0,
    fhirReady: true,
  };
};

export const queueItemToPatientRecord = (item: import('../types').PatientQueueItem): PatientRecord => {
  return {
    id: item.id,
    token: item.tokenNumber,
    abhaId: item.abhaId,
    name: item.patientName,
    age: item.age,
    gender: item.gender,
    track: item.clinicalTrack === 'ayush' ? 'AYUSH' : 'ALLOPATHIC',
    department: item.department,
    cabin: item.roomNumber,
    roomNumber: item.roomNumber,
    isEmergency: item.status === 'EMERGENCY_TRIAGE' || item.redFlagSeverity === 'CRITICAL',
    chiefComplaint: item.chiefComplaint,
    socrates: {
      site: item.socrates?.site || 'General',
      onset: item.socrates?.onset || 'Recent',
      character: item.socrates?.character || item.chiefComplaint || 'Pain',
      radiation: item.socrates?.radiation || 'None',
      associations: item.socrates?.associatedSymptoms?.join(', ') || 'None',
      timing: item.socrates?.timeCourse || 'Continuous',
      exacerbating: item.socrates?.exacerbatingFactors || 'Exertion',
      severity: `${item.socrates?.severity || 5} / 10`,
      associatedSymptoms: item.socrates?.associatedSymptoms || [],
    },
    triageTimestamp: item.registeredAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: item.status === 'EMERGENCY_TRIAGE' ? 'EMERGENCY' : (item.status as any),
  };
};
