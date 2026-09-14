/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Globe2,
  Stethoscope,
  RefreshCw,
  Search,
  Filter,
  FileCode,
  Radio,
  ExternalLink,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import {
  PatientProfile,
  StructuredClinicalSummary,
  DigitizedDocument,
  RedFlagAlert,
  BhashiniLanguage,
  PatientQueueItem,
  HospitalDepartment,
} from '../types';
import { getLocalizedStrings } from '../locales';
import { adminRegisterStaff } from '../services/authRegistryService';
import { DepartmentCard } from './DepartmentCard';
import { PatientHistoryView } from './PatientHistoryView';

interface HisDashboardProps {
  currentPatient: PatientProfile;
  currentSummary: StructuredClinicalSummary;
  queue: PatientQueueItem[];
  departments: HospitalDepartment[];
  language?: BhashiniLanguage;
  currentDoctor?: { id: string; name: string; department: string; regNumber: string; assignedCabin?: string } | null;
  currentHospitalAdmin?: { id: string; name: string; branch: string; role: string } | null;
  onSelectPatient: (patientId: string) => void;
  onUpdateQueueItemStatus: (id: string, status: PatientQueueItem['status']) => void;
  onRerouteDepartment: (id: string, newDept: string, newRoom: string) => void;
  onSwitchToDoctor: (patientId?: string) => void;
  onSwitchToUser: () => void;
  onPushConsultationNotification?: (item: PatientQueueItem) => void;
}

export const HisDashboard: React.FC<HisDashboardProps> = ({
  currentPatient,
  currentSummary,
  queue,
  departments,
  language,
  currentDoctor,
  currentHospitalAdmin,
  onSelectPatient,
  onUpdateQueueItemStatus,
  onRerouteDepartment,
  onSwitchToDoctor,
  onSwitchToUser,
  onPushConsultationNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'queue' | 'departments' | 'abdm_gateway' | 'bhashini_analytics' | 'staff_management' | 'patient_history'>('queue');
  const [selectedFhirBundle, setSelectedFhirBundle] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sandbox Server Sync Status State
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  const handleTriggerSync = () => {
    setSyncState('syncing');
    setTimeout(() => {
      const success = Math.random() > 0.12;
      setSyncState(success ? 'synced' : 'error');
      setLastSyncTime(new Date().toLocaleTimeString());
      setToastMessage(success ? 'Sandbox server synchronization complete (Patient queue pushed successfully).' : 'Sandbox server synchronization failed (Retrying in background).');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  // Staff Management Form State
  const [staffName, setStaffName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffDept, setStaffDept] = useState('Cardiology OPD');
  const [staffCabin, setStaffCabin] = useState('Cabin #204');
  const [staffPin, setStaffPin] = useState('');
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Real-time validation for HPR ID / NMC Number
  const getStaffIdValidationError = (val: string): string | null => {
    if (!val.trim()) return null;
    const cleaned = val.trim();
    if (!cleaned.startsWith('HPR-') && cleaned.length < 5) {
      return 'Official HPR ID should start with "HPR-" (e.g., HPR-DL-9942) or be a valid NMC registration ID.';
    }
    return null;
  };
  const staffIdValidationError = getStaffIdValidationError(staffId);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      setStaffError('Please enter doctor full name.');
      return;
    }
    if (!staffId.trim()) {
      setStaffError('Please enter Official HPR ID / NMC Number.');
      return;
    }
    if (staffIdValidationError) {
      setStaffError(staffIdValidationError);
      return;
    }
    if (!staffPin || staffPin.length < 4 || staffPin.length > 6) {
      setStaffError('Security PIN must be 4 to 6 digits.');
      return;
    }

    setStaffError(null);
    setIsStaffLoading(true);

    try {
      const result = await adminRegisterStaff({
        id: staffId.trim(),
        role: 'doctor',
        name: staffName.trim(),
        department: staffDept,
        assignedCabin: staffCabin,
        pin: staffPin.trim(),
      });

      if (!result.success) {
        setStaffError(result.error || 'Failed to register doctor.');
        setIsStaffLoading(false);
        return;
      }

      const docName = result.user?.name || staffName.trim();
      setToastMessage(`Success: Dr. ${docName} has been registered and provisioned for ${staffCabin}.`);
      setStaffName('');
      setStaffId('');
      setStaffPin('');
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setStaffError('An unexpected error occurred during staff registration.');
    } finally {
      setIsStaffLoading(false);
    }
  };

  const loc = getLocalizedStrings(language?.code || 'en');

  const handleStatusChangeWithToast = (item: PatientQueueItem, newStatus: PatientQueueItem['status']) => {
    onUpdateQueueItemStatus(item.id, newStatus);
    setToastMessage(`ABDM M1/M2/M3 state updated successfully for ${item.patientName} (Token: #${item.tokenNumber})`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const isDoctorRole = Boolean(currentDoctor && !currentHospitalAdmin);

  // Filtered Queue (strictly filtered by doctor ID / assigned cabin if logged in as a doctor)
  const filteredQueue = queue.filter((item) => {
    if (isDoctorRole && currentDoctor) {
      const matchesDoc =
        item.doctorId === currentDoctor.id ||
        item.assignedDoctor?.toLowerCase().includes(currentDoctor.name.toLowerCase().replace('dr.', '').trim()) ||
        item.roomNumber?.toLowerCase().includes((currentDoctor.assignedCabin || '').toLowerCase()) ||
        item.assignedCabin === currentDoctor.assignedCabin ||
        item.department?.toLowerCase().includes(currentDoctor.department.split('-')[0].trim().toLowerCase());
      if (!matchesDoc) return false;
    }

    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.abhaId.includes(searchQuery) ||
      item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDeptFilter === 'ALL' || item.department === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || item.status === selectedStatusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const queueSourceForStats = isDoctorRole ? filteredQueue : queue;
  const criticalCount = queueSourceForStats.filter((q) => q.redFlagSeverity === 'CRITICAL').length;
  const inConsultCount = queueSourceForStats.filter((q) => q.status === 'IN_CONSULTATION').length;
  const waitingCount = queueSourceForStats.filter((q) => q.status === 'WAITING' || q.status === 'EMERGENCY_TRIAGE').length;
  const completedCount = queueSourceForStats.filter((q) => q.status === 'COMPLETED').length;

  return (
    <div id="his-dashboard-view" className="flex-1 flex flex-col bg-slate-900 text-slate-100 min-h-screen overflow-y-auto">
      {/* Top HIS Command Center Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {isDoctorRole ? `Doctor Workstation Queue • ${currentDoctor?.name} (${currentDoctor?.assignedCabin || currentDoctor?.department})` : 'Hospital Information System (HIS / HMIS)'}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isDoctorRole ? 'Secure EMR Session' : 'ABDM Gateway M1/M2/M3 Online'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isDoctorRole ? `Assigned Cabin: ${currentDoctor?.assignedCabin || 'OPD'} • Clinical ID: ${currentDoctor?.id}` : 'AIIMS Central OPD & Emergency Command Center • Facility ID: IN-DL-AIIMS-001'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation to Doctor / User */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Sandbox Server Sync Status Indicator */}
            <button
              type="button"
              onClick={handleTriggerSync}
              className="bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-2 hover:border-slate-600 transition-all cursor-pointer group"
              title="Click to manually push queue to sandbox server"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                syncState === 'synced' ? 'bg-emerald-500 shadow-emerald-500/50 shadow-sm animate-pulse' :
                syncState === 'syncing' ? 'bg-amber-400 animate-ping' :
                'bg-red-500 animate-bounce'
              }`}></span>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <span>Sync Status:</span>
                  <span className={
                    syncState === 'synced' ? 'text-emerald-400' :
                    syncState === 'syncing' ? 'text-amber-400' : 'text-red-400'
                  }>
                    {syncState === 'synced' ? 'Synced' : syncState === 'syncing' ? 'Syncing...' : 'Failed'}
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Last push: {lastSyncTime}</div>
              </div>
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-transform ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="his-to-user-btn"
              type="button"
              onClick={onSwitchToUser}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{loc.patientKioskView}</span>
            </button>
            <button
              id="his-to-doctor-btn"
              type="button"
              onClick={() => onSwitchToDoctor()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{loc.doctorWorkstationTab}</span>
            </button>
          </div>
        </div>
      </div>

      {isDoctorRole && (
        <div className="bg-blue-950/90 border-b border-blue-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Secure Doctor View: Showing assigned patients only for <strong className="text-white">{currentDoctor?.name}</strong> at <strong className="text-white">{currentDoctor?.assignedCabin || currentDoctor?.department}</strong>. Hospital-wide analytics and unassigned records are restricted.</span>
          </div>
          <span className="font-mono text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-cyan-300 shrink-0">ABDM M1/M2/M3 Secure</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* Top Key Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">{loc.totalLiveQueue}</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{queue.length}</span>
              <span className="text-xs text-slate-400">patients today</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{completedCount} Consulted</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{waitingCount} Waiting</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-red-500/30 p-4 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-red-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">{loc.redFlagsEmergencies}</span>
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-red-400">{criticalCount}</span>
              <span className="text-xs text-red-300/80">stat triage priority</span>
            </div>
            <div className="mt-2 text-[11px] text-red-300 font-medium">
              Immediate ECG / ACS Protocol Active
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">{loc.avgTriageTime}</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400">1.8</span>
              <span className="text-xs text-slate-400">minutes / patient</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Voice ASR & OCR Fast-Track Active
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">{loc.abdmFhirSync}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">100%</span>
              <span className="text-xs text-emerald-300/80">M1/M2/M3</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              DPDP Act Zero Retention Compliant
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              id="his-tab-queue"
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{loc.liveTriageQueueTab} ({filteredQueue.length})</span>
            </button>
            <button
              id="his-tab-departments"
              type="button"
              onClick={() => setActiveTab('departments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{loc.opdDepartmentsTab} ({departments.length})</span>
            </button>
            <button
              id="his-tab-abdm"
              type="button"
              onClick={() => setActiveTab('abdm_gateway')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'abdm_gateway'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loc.abdmGatewayTab}</span>
            </button>
            <button
              id="his-tab-bhashini"
              type="button"
              onClick={() => setActiveTab('bhashini_analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'bhashini_analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>{loc.bhashiniAnalyticsTab}</span>
            </button>
            <button
              id="his-tab-staff"
              type="button"
              onClick={() => setActiveTab('staff_management')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'staff_management'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>Staff Management</span>
            </button>
            <button
              id="his-tab-patient-history"
              type="button"
              onClick={() => setActiveTab('patient_history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'patient_history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <FileCode className="w-4 h-4 text-cyan-300" />
              <span>Patient History</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE PATIENT QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={loc.searchQueuePlaceholder}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 w-full focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Department Filter */}
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">{loc.allDepartments}</option>
                  <option value="Cardiology OPD">Cardiology OPD</option>
                  <option value="General Medicine OPD">General Medicine</option>
                  <option value="AYUSH Triage">AYUSH Triage</option>
                  <option value="Emergency Resuscitation">Emergency Bay</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">{loc.allStatuses}</option>
                  <option value="EMERGENCY_TRIAGE">🚨 {loc.priorityEmergency}</option>
                  <option value="WAITING">⏳ {loc.statusWaiting}</option>
                  <option value="IN_CONSULTATION">🩺 {loc.statusInConsultation}</option>
                  <option value="COMPLETED">✅ {loc.statusCompleted}</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">{loc.tokenCol}</th>
                      <th className="px-4 py-3">{loc.patientProfileCol}</th>
                      <th className="px-4 py-3">{loc.languageCol}</th>
                      <th className="px-4 py-3">{loc.chiefComplaintCol}</th>
                      <th className="px-4 py-3">{loc.assignedCabinCol}</th>
                      <th className="px-4 py-3">{loc.statusCol}</th>
                      <th className="px-4 py-3 text-right">{loc.actionsCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {filteredQueue.map((item) => {
                      const isCurrent = item.abhaId === currentPatient.abhaId;
                      const isCritical = item.redFlagSeverity === 'CRITICAL';
                      const isEmergency = item.status === 'EMERGENCY_TRIAGE' || isCritical;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-700/40 transition-colors ${
                            isEmergency
                              ? 'bg-red-950/30 border-y border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                              : isCurrent
                              ? 'bg-blue-950/30'
                              : ''
                          }`}
                        >
                          {/* Token & Registered Time */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-lg font-mono font-black text-sm ${
                                  isCritical
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : isCurrent
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-900 text-cyan-400 border border-slate-700'
                                }`}
                              >
                                #{item.tokenNumber}
                              </span>
                              <div className="text-[11px] text-slate-400">
                                <div>{item.registeredAt}</div>
                                {isCurrent && (
                                  <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded">
                                    CURRENT USER
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Patient Profile */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white text-sm">{item.patientName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ABHA: {item.abhaId}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.age} yrs • {item.gender}
                            </div>
                          </td>

                          {/* Language & Track */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="bg-slate-900 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {item.spokenLanguage}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  item.clinicalTrack === 'ayush'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                                }`}
                              >
                                {item.clinicalTrack}
                              </span>
                            </div>
                          </td>

                          {/* Chief Complaint & Triage */}
                          <td className="px-4 py-3.5 max-w-[280px]">
                            <div className="text-slate-200 font-medium line-clamp-2">
                              {item.chiefComplaint}
                            </div>
                            {item.redFlagSeverity === 'CRITICAL' && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-400">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                <span>CRITICAL ACS / STROKE TRIAGE</span>
                              </div>
                            )}
                            <div className="mt-1 text-[10px] text-slate-400">
                              SOCRATES: Severity {item.socrates.severity}/10 • {item.documentsCount} OCR Doc(s)
                            </div>
                          </td>

                          {/* Assigned Cabin */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white">{item.department}</div>
                            <div className="text-[11px] text-cyan-300">{item.roomNumber}</div>
                            <div className="text-[10px] text-slate-400">{item.assignedDoctor}</div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                item.status === 'EMERGENCY_TRIAGE'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                                  : item.status === 'IN_CONSULTATION'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                  : item.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open in Doctor EMR Workstation */}
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateQueueItemStatus(item.id, 'IN_CONSULTATION');
                                  if (onPushConsultationNotification) {
                                    onPushConsultationNotification(item);
                                  }
                                  onSelectPatient(item.id);
                                  onSwitchToDoctor(item.id);
                                }}
                                title="Transfer patient & open in Doctor EMR Workstation"
                                className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Open in EMR</span>
                              </button>

                              {/* Push Alert to Doctor Inbox */}
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateQueueItemStatus(item.id, 'IN_CONSULTATION');
                                  if (onPushConsultationNotification) {
                                    onPushConsultationNotification(item);
                                  }
                                  const docName = item.assignedDoctor || currentDoctor?.name || 'Dr. A. Verma';
                                  setToastMessage(`Consultation alert successfully pushed to ${docName}'s live EMR inbox.`);
                                  setTimeout(() => setToastMessage(null), 4500);
                                }}
                                title="Push consultation alert to Doctor EMR Inbox"
                                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>Notify</span>
                              </button>

                              {/* Status Toggle Dropdown */}
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleStatusChangeWithToast(item, e.target.value as PatientQueueItem['status'])
                                }
                                className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                              >
                                <option value="WAITING">Waiting</option>
                                <option value="EMERGENCY_TRIAGE">Emergency</option>
                                <option value="IN_CONSULTATION">In Consult</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OPD DEPARTMENTS & CABINS */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                queue={queue}
                onSelectDepartment={(deptName) => {
                  setSelectedDeptFilter(deptName);
                  setActiveTab('queue');
                }}
              />
            ))}
          </div>
        )}

        {/* TAB 3: ABDM GATEWAY & FHIR R4 LOGS */}
        {activeTab === 'abdm_gateway' && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Ayushman Bharat Digital Mission (ABDM) Gateway Live Bridge
                  </h3>
                  <p className="text-xs text-slate-400">
                    National Health Authority (NHA) & Digital Personal Data Protection (DPDP) Act v2.0 Compliance Bridge
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-lg font-mono">
                    BRIDGE ID: ABDM-AIIMS-GW-994
                  </span>
                </div>
              </div>

              {/* Milestone Verification Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between text-emerald-400 text-xs font-bold mb-1">
                    <span>Milestone 1 (M1)</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-black text-white">ABHA Verification & Linking</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Aadhaar OTP, Demo Auth, & QR Code scanning for digital identity capture.
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between text-emerald-400 text-xs font-bold mb-1">
                    <span>Milestone 2 (M2)</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-black text-white">Health Document Generation</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    FHIR R4 Diagnostic Report, Prescription, and OPD Discharge Summary creation.
                  </p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80">
                  <div className="flex items-center justify-between text-emerald-400 text-xs font-bold mb-1">
                    <span>Milestone 3 (M3)</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-black text-white">HIP / HIU Data Exchange</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Encrypted ECDH-256 data exchange across consent manager gateways.
                  </p>
                </div>
              </div>

              {/* Current Active Patient FHIR Bundle Preview */}
              <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 mb-3">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <FileCode className="w-4 h-4" />
                    Current Patient ABDM FHIR Bundle (HL7 FHIR Release 4): {currentPatient.name} ({currentPatient.abhaId})
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-Generated by SwasthyaSetuDesk AI</span>
                </div>
                <pre className="text-slate-300 max-h-72 overflow-y-auto scrollbar-none text-[11px] leading-relaxed">
                  {currentSummary.fhirBundleJson}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 22 BHASHINI ANALYTICS */}
        {activeTab === 'bhashini_analytics' && (
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-md space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-cyan-400" />
                Digital India Bhashini Multimodal Speech-to-Text & Clinical NMT Matrix
              </h3>
              <p className="text-xs text-slate-400">
                National Language Translation Mission (NLTM) distribution across 22 Scheduled Indian Languages
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {[
                { lang: 'Hindi (हिन्दी)', count: 42, percentage: '38%', active: true },
                { lang: 'Bengali (বাংলা)', count: 18, percentage: '16%', active: true },
                { lang: 'Tamil (தமிழ்)', count: 14, percentage: '12%', active: true },
                { lang: 'Telugu (తెలుగు)', count: 11, percentage: '10%', active: true },
                { lang: 'Marathi (मराठी)', count: 9, percentage: '8%', active: true },
                { lang: 'Gujarati (ગુજરાતી)', count: 7, percentage: '6%', active: true },
                { lang: 'Kannada (ಕನ್ನಡ)', count: 5, percentage: '4%', active: true },
                { lang: 'Malayalam (മലയാളം)', count: 4, percentage: '3%', active: true },
                { lang: 'Punjabi (ਪੰਜਾਬੀ)', count: 3, percentage: '2%', active: true },
                { lang: 'Odia (ଓଡ଼ିଆ)', count: 2, percentage: '1%', active: true },
                { lang: 'Assamese (অসমীয়া)', count: 1, percentage: '1%', active: true },
                { lang: 'English (Indian)', count: 6, percentage: '5%', active: true },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{item.lang}</span>
                    <span className="text-cyan-400 font-bold">{item.percentage}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                      style={{ width: item.percentage }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
                    <span>{item.count} voice intakes</span>
                    <span className="text-emerald-400">98.4% Acc</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STAFF MANAGEMENT */}
        {activeTab === 'staff_management' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-700 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>NMC &amp; National Health Authority (NHA) Staff Onboarding</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Authorized Doctor Registration &amp; EMR Provisioning</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Register authorized medical practitioners, assign OPD departments, cabins, and generate secure cryptographic SHA-256 credentials.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SHA-256 Vault Sync</span>
                </div>
              </div>

              <form onSubmit={handleStaffSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Dr. Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Dr. Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Dr. Ananya Mukherjee"
                      className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  {/* Official HPR ID / NMC Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Official HPR ID / NMC Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. HPR-DL-9942 or NMC-629104"
                      className={`w-full px-4 py-3.5 bg-slate-900 border rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none font-bold ${
                        staffIdValidationError ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                    {staffIdValidationError && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{staffIdValidationError}</span>
                      </p>
                    )}
                  </div>

                  {/* Department Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Department <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={staffDept}
                      onChange={(e) => setStaffDept(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
                    >
                      <option value="Cardiology OPD">Cardiology OPD</option>
                      <option value="General Medicine OPD">General Medicine OPD</option>
                      <option value="Neurology OPD">Neurology OPD</option>
                      <option value="Orthopedics OPD">Orthopedics OPD</option>
                      <option value="AYUSH Integrative Clinic">AYUSH Integrative Clinic</option>
                      <option value="Emergency & Triage">Emergency &amp; Triage</option>
                    </select>
                  </div>

                  {/* Assigned Cabin Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Assigned Cabin <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={staffCabin}
                      onChange={(e) => setStaffCabin(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
                    >
                      <option value="Cabin #101">Cabin #101 (Room 101)</option>
                      <option value="Cabin #102">Cabin #102 (Room 102)</option>
                      <option value="Cabin #104">Cabin #104 (Room 104)</option>
                      <option value="Cabin #115">Cabin #115 (Room 115)</option>
                      <option value="Cabin #204">Cabin #204 (Room 204)</option>
                      <option value="Cabin #308">Cabin #308 (Room 308)</option>
                      <option value="Cabin #001">Cabin #001 (Emergency Triage)</option>
                    </select>
                  </div>
                </div>

                {/* Security PIN */}
                <div className="max-w-md">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Security Passcode / PIN (4-6 Digits) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
                  />
                  <p className="text-xs text-slate-400 mt-1">Used by the clinician for secure cryptographic login to their EMR workstation.</p>
                </div>

                {staffError && (
                  <div className="p-4 bg-red-950/60 border border-red-500/50 text-red-300 text-xs rounded-2xl flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{staffError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isStaffLoading}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-base flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer disabled:opacity-50 transform hover:scale-[1.01]"
                  >
                    {isStaffLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Provisioning EMR Access...</span>
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-5 h-5" />
                        <span>Register &amp; Provision Staff</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: PATIENT HISTORY VIEW */}
        {activeTab === 'patient_history' && (
          <PatientHistoryView queue={queue} currentSummary={currentSummary} />
        )}
      </div>

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 border border-emerald-500/80 text-emerald-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold text-white">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
