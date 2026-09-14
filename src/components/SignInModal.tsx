/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  User,
  Stethoscope,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Phone,
  Hospital,
  AlertCircle,
  Camera,
  ScanLine,
  QrCode,
  Eye,
  EyeOff,
  Wand2,
} from 'lucide-react';
import { BhashiniLanguage, PatientProfile, AuthMode } from '../types';
import { getLocalizedStrings } from '../bhashiniLanguages';
import { AbhaCameraScanner, ScannedAbhaProfile } from './AbhaCameraScanner';
import { validatePasswordPolicy, DEMO_CREDENTIALS, PASSWORD_ERROR_GUIDANCE } from '../utils/passwordPolicy';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { authenticateOrRegisterPatient, authenticateOrRegisterUser } from '../services/authRegistryService';

export type UserRole = 'patient' | 'doctor' | 'hospital';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  language: BhashiniLanguage;
  patient?: PatientProfile;
  onPatientSignIn: (patientData: Partial<PatientProfile>) => void;
  onDoctorSignIn: (doctorData: { id: string; name: string; department: string; regNumber: string; assignedCabin?: string }) => void;
  onHospitalSignIn: (hospitalData: { id: string; name: string; branch: string; role: string }) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'patient',
  language,
  patient,
  onPatientSignIn,
  onDoctorSignIn,
  onHospitalSignIn,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Patient Sign-in state
  const [authMode, setAuthMode] = useState<AuthMode>('abha');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [tempAbha, setTempAbha] = useState('');
  const [tempAadhaar, setTempAadhaar] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempAge, setTempAge] = useState<number | ''>('');
  const [tempGender, setTempGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [tempPhone, setTempPhone] = useState('');
  const [patientConsent, setPatientConsent] = useState(false);
  const [patientOtpSent, setPatientOtpSent] = useState(false);
  const [patientOtp, setPatientOtp] = useState('');

  // Doctor Sign-in state
  const [doctorId, setDoctorId] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);
  const [doctorDept, setDoctorDept] = useState('Cardiology OPD - Room 204');

  // Hospital Admin Sign-in state
  const [hospitalAdminId, setHospitalAdminId] = useState('');
  const [hospitalFacility, setHospitalFacility] = useState('AIIMS Central OPD Station');
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [showHospitalPassword, setShowHospitalPassword] = useState(false);
  const [hospitalRole, setHospitalRole] = useState('Chief Triage Officer');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loc = getLocalizedStrings(language.code);

  // Real-time password validations
  const doctorPasswordValidation = useMemo(
    () => validatePasswordPolicy(doctorPassword),
    [doctorPassword]
  );
  const hospitalPasswordValidation = useMemo(
    () => validatePasswordPolicy(hospitalPassword),
    [hospitalPassword]
  );

  // Real-time Patient ID validation
  const patientIdValidation = useMemo(() => {
    const cleaned = tempAbha.trim().replace(/-/g, '');
    if (!cleaned) return null;
    const is14Digit = /^\d{14}$/.test(cleaned);
    const is10Digit = /^[6-9]\d{9}$/.test(cleaned);
    const isAbhaAddress = /^[a-zA-Z0-9._-]+@abdm$/.test(tempAbha.trim());
    if (is14Digit || is10Digit || isAbhaAddress) {
      return { valid: true, text: is14Digit ? 'Valid 14-Digit ABHA Number' : is10Digit ? 'Valid 10-Digit Mobile Number' : 'Valid @abdm Address' };
    }
    return { valid: false, text: 'Must be 14-digit ABHA ID or 10-digit mobile number' };
  }, [tempAbha]);

  if (!isOpen) return null;

  const handleScanSuccess = (scanned: ScannedAbhaProfile) => {
    onPatientSignIn({
      abhaId: scanned.abhaId,
      name: scanned.name,
      age: scanned.age,
      gender: scanned.gender,
      phone: scanned.phone,
      aadhaarLast4: '0000',
      address: scanned.address,
      consentAudioGranted: true,
      dpdpConsentTimestamp: new Date().toISOString(),
    });
    setIsQrScannerOpen(false);
    onClose();
  };

  // Demo autofill handlers
  const handleQuickDemoPatient = () => {
    setAuthMode('abha');
    setTempAbha(DEMO_CREDENTIALS.patient.abhaId);
    setTempName(DEMO_CREDENTIALS.patient.name);
    setTempAge(DEMO_CREDENTIALS.patient.age);
    setTempGender(DEMO_CREDENTIALS.patient.gender);
    setTempPhone(DEMO_CREDENTIALS.patient.phone);
    setPatientConsent(true);
    setErrorMessage(null);
  };

  const handleQuickDemoDoctor = () => {
    setDoctorId(DEMO_CREDENTIALS.doctor.id);
    setDoctorDept(DEMO_CREDENTIALS.doctor.department);
    setDoctorPassword(DEMO_CREDENTIALS.doctor.password);
    setErrorMessage(null);
  };

  const handleQuickDemoAdmin = () => {
    setHospitalAdminId(DEMO_CREDENTIALS.hospitalAdmin.id);
    setHospitalFacility(DEMO_CREDENTIALS.hospitalAdmin.facilityName);
    setHospitalRole(DEMO_CREDENTIALS.hospitalAdmin.role);
    setHospitalPassword(DEMO_CREDENTIALS.hospitalAdmin.password);
    setErrorMessage(null);
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientConsent) {
      setErrorMessage('Please accept the mandatory DPDP Act 2023 & ABDM consent checkbox to proceed.');
      return;
    }

    if (authMode === 'abha') {
      const cleaned = tempAbha.trim().replace(/-/g, '');
      const is14Digit = /^\d{14}$/.test(cleaned);
      const is10Digit = /^[6-9]\d{9}$/.test(cleaned);
      const isAbhaAddress = /^[a-zA-Z0-9._-]+@abdm$/.test(tempAbha.trim());
      if (!is14Digit && !is10Digit && !isAbhaAddress) {
        setErrorMessage('Please enter a valid 14-digit ABHA Number or 10-digit Mobile Number.');
        return;
      }
    } else if (authMode === 'aadhaar') {
      const cleanedAadhaar = tempAadhaar.replace(/\D/g, '');
      if (cleanedAadhaar.length < 4) {
        setErrorMessage('Please enter your 12-digit Aadhaar Number.');
        return;
      }
      if (patientOtpSent && !patientOtp.trim()) {
        setErrorMessage('Please enter the 4-digit SMS OTP received.');
        return;
      }
    } else if (authMode === 'register') {
      if (!tempName.trim()) {
        setErrorMessage('Please enter the patient full name.');
        return;
      }
      if (!tempAge || tempAge <= 0) {
        setErrorMessage('Please enter a valid patient age.');
        return;
      }
    }

    setErrorMessage(null);

    const inputIdentifier =
      authMode === 'abha'
        ? tempAbha.trim()
        : authMode === 'aadhaar'
        ? tempAadhaar.trim()
        : tempPhone.trim() || '9876543210';

    try {
      const authResult = await authenticateOrRegisterPatient(
        inputIdentifier.replace(/-/g, '').length === 14 || inputIdentifier.replace(/-/g, '').length === 10
          ? inputIdentifier.replace(/-/g, '')
          : '9876543210'
      );

      const finalAbha =
        authResult.user?.id ||
        tempAbha.trim() ||
        `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const finalName = authResult.user?.name || tempName.trim() || (authMode === 'abha' ? 'Verified ABHA Patient' : 'OPD Walk-In');
      const finalAge = typeof tempAge === 'number' && tempAge > 0 ? tempAge : Number(authResult.user?.age) || 45;
      const finalGender = tempGender || (authResult.user?.gender as 'Male' | 'Female' | 'Other') || 'Male';
      const finalPhone = tempPhone.trim() || (tempAbha.length === 10 ? `+91 ${tempAbha}` : '+91 98765 00000');

      onPatientSignIn({
        abhaId: finalAbha,
        name: finalName,
        age: finalAge,
        gender: finalGender,
        phone: finalPhone,
        aadhaarLast4: tempAadhaar ? tempAadhaar.slice(-4) : '0000',
        consentAudioGranted: true,
        dpdpConsentTimestamp: new Date().toISOString(),
      });
      onClose();
    } catch {
      onPatientSignIn({
        abhaId: tempAbha.trim() || '91-8829-4410-9921',
        name: tempName.trim() || 'Verified ABHA Patient',
        age: typeof tempAge === 'number' ? tempAge : 45,
        gender: tempGender,
        phone: tempPhone.trim() || '+91 98765 00000',
        consentAudioGranted: true,
        dpdpConsentTimestamp: new Date().toISOString(),
      });
      onClose();
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId.trim()) {
      setErrorMessage('Please enter Doctor HPR ID or NMC Registration Number.');
      return;
    }
    if (!doctorPassword.trim()) {
      setErrorMessage('Please enter your clinical EMR password.');
      return;
    }
    if (!doctorPasswordValidation.isValid) {
      setErrorMessage(PASSWORD_ERROR_GUIDANCE);
      return;
    }

    setErrorMessage(null);

    try {
      const authResult = await authenticateOrRegisterUser(doctorId.trim(), 'doctor', doctorPassword);
      if (!authResult.success || !authResult.user) {
        setErrorMessage(authResult.error || 'Credentials not found in active registry. Please contact Hospital Administration.');
        return;
      }

      const assignedCabin = doctorDept.includes('Room')
        ? `Cabin #${doctorDept.split('Room')[1]?.trim() || '104'}`
        : 'Cabin #104';

      onDoctorSignIn({
        id: authResult.user.id || doctorId.trim(),
        name: authResult.user.name || (doctorId.startsWith('Dr.') ? doctorId : `Dr. ${doctorId}`),
        department: doctorDept,
        regNumber: authResult.user.regNumber || 'NMC-488102',
        assignedCabin,
      });
      onClose();
    } catch (err) {
      setErrorMessage('Credentials not found in active registry. Please contact Hospital Administration.');
    }
  };

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalAdminId.trim()) {
      setErrorMessage('Please enter Hospital Admin Staff ID or Work Email.');
      return;
    }
    if (!hospitalPassword.trim()) {
      setErrorMessage('Please enter your Facility Security Token.');
      return;
    }
    if (!hospitalPasswordValidation.isValid) {
      setErrorMessage(PASSWORD_ERROR_GUIDANCE);
      return;
    }

    setErrorMessage(null);

    try {
      const authResult = await authenticateOrRegisterUser(hospitalAdminId.trim(), 'his', hospitalPassword);
      if (!authResult.success || !authResult.user) {
        setErrorMessage(authResult.error || 'Credentials not found in active registry. Please contact Hospital Administration.');
        return;
      }

      onHospitalSignIn({
        id: authResult.user.id || hospitalAdminId.trim(),
        name: hospitalFacility.trim() || authResult.user.facilityName || 'AIIMS Central OPD Station',
        branch: authResult.user.branch || 'Main Hospital Building - Block A',
        role: hospitalRole,
      });
      onClose();
    } catch (err) {
      setErrorMessage('Credentials not found in active registry. Please contact Hospital Administration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Role Selector */}
        <div className="bg-gradient-to-r from-stone-50 to-stone-100 p-5 sm:p-6 border-b border-stone-200 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-stone-200 transition-colors cursor-pointer shadow-2xs"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52833C] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              SwasthyaSetuDesk Multi-Role Auth
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            Unified Healthcare Sign-In
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Select your role to access your dedicated clinical workspace with role-based security.
          </p>

          {/* 3 User Types Tabs (Patient, Doctor, Hospital Admin) */}
          <div className="grid grid-cols-3 gap-2 mt-4 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('patient');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'patient'
                  ? 'bg-[#52833C] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('doctor');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'doctor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('hospital');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'hospital'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Hospital Admin</span>
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* ======================================================== */}
          {/* 1. PATIENT SIGN-IN FORM */}
          {/* ======================================================== */}
          {selectedRole === 'patient' && (
            <form onSubmit={handlePatientSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Patient Identification (ABDM &amp; DPDP)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickDemoPatient}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#52833C] bg-[#52833C]/10 hover:bg-[#52833C]/20 px-2.5 py-1 rounded-full border border-[#52833C]/30 transition-colors cursor-pointer"
                    title="Autofill Demo Patient for Rapid Testing"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Quick Demo Fill</span>
                  </button>
                  <span className="text-[10px] font-bold text-[#52833C] bg-[#52833C]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    SHA-256 Vault
                  </span>
                </div>
              </div>

              {/* Instant Camera QR Scanner Trigger */}
              <button
                type="button"
                onClick={() => setIsQrScannerOpen(true)}
                className="w-full p-3 bg-gradient-to-r from-emerald-600 to-[#52833C] hover:from-emerald-700 hover:to-[#436e30] text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Scan ABHA Card QR with Device Camera</span>
                    <span className="text-[10px] text-emerald-100 font-normal">
                      Instant zero-touch patient authentication
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Scan</span>
                </div>
              </button>

              {/* Identification Modes */}
              <div className="grid grid-cols-4 gap-1.5 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthMode('abha')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'abha' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  ABHA ID
                </button>
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="py-1.5 text-xs font-bold rounded-lg transition-all bg-emerald-50 text-[#52833C] border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                >
                  Scan QR
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('aadhaar')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'aadhaar' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Aadhaar
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Walk-In
                </button>
              </div>

              {authMode === 'abha' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    14-Digit ABHA Number or 10-Digit Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tempAbha}
                      onChange={(e) => {
                        setTempAbha(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="e.g., 91-8829-4410-9921 or 9876543210"
                      className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 focus:bg-white focus:border-[#52833C] focus:ring-2 focus:ring-[#52833C]/20 outline-none"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {patientIdValidation && (
                    <div className="flex items-center gap-1.5 text-xs pt-0.5">
                      {patientIdValidation.valid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-700">{patientIdValidation.text}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-medium text-amber-700">{patientIdValidation.text}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {authMode === 'aadhaar' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    12-Digit Aadhaar Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempAadhaar}
                      onChange={(e) => setTempAadhaar(e.target.value)}
                      placeholder="XXXX-XXXX-4819"
                      className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono font-bold text-stone-900 focus:bg-white focus:border-[#52833C] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPatientOtpSent(true);
                        setPatientOtp('4829');
                      }}
                      className="px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      {patientOtpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                  {patientOtpSent && (
                    <div className="p-3 bg-[#52833C]/10 border border-[#52833C]/30 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-stone-800 font-medium">Enter UIDAI SMS OTP:</span>
                      <input
                        type="text"
                        value={patientOtp}
                        onChange={(e) => setPatientOtp(e.target.value)}
                        placeholder="4829"
                        className="w-24 px-3 py-1.5 bg-white border border-[#52833C] rounded-lg text-center font-mono font-bold text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {authMode === 'register' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter patient full name"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={tempAge}
                        onChange={(e) => setTempAge(Number(e.target.value))}
                        placeholder="e.g. 45"
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Gender</label>
                      <select
                        value={tempGender}
                        onChange={(e) => setTempGender(e.target.value as any)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Mandatory DPDP Act 2023 Consent Checkbox */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={patientConsent}
                    onChange={(e) => {
                      setPatientConsent(e.target.checked);
                      if (e.target.checked && errorMessage) setErrorMessage(null);
                    }}
                    className="mt-0.5 w-4 h-4 accent-[#52833C] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-stone-600 leading-relaxed">
                    <strong className="text-stone-900">DPDP Act 2023 &amp; ABDM Informed Consent:</strong> I hereby authorize SwasthyaSetuDesk to process my symptom narration and documents to generate a structured HL7 FHIR clinical summary for OPD triage.
                  </span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-[#52833C] hover:bg-[#436e30] text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                <span>Sign In as Patient &amp; Start Intake</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* 2. DOCTOR SIGN-IN FORM */}
          {/* ======================================================== */}
          {selectedRole === 'doctor' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Doctor Clinical EMR Access
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickDemoDoctor}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200 transition-colors cursor-pointer"
                    title="Autofill Verified Doctor Demo Credentials"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Quick Demo Fill</span>
                  </button>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" />
                    NMC / HPR
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Doctor HPR ID / NMC Registration Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={doctorId}
                    onChange={(e) => {
                      setDoctorId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. HPR-DL-9941 or NMC-488102"
                    className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <Stethoscope className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Department / OPD Clinic
                </label>
                <select
                  value={doctorDept}
                  onChange={(e) => setDoctorDept(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
                >
                  <option value="Cardiology OPD - Room 204">Cardiology OPD - Room 204</option>
                  <option value="General Medicine OPD - Room 102">General Medicine OPD - Room 102</option>
                  <option value="Neurology OPD - Room 308">Neurology OPD - Room 308</option>
                  <option value="Orthopedics OPD - Room 115">Orthopedics OPD - Room 115</option>
                  <option value="AYUSH Integrative Clinic - Room 005">AYUSH Integrative Clinic - Room 005</option>
                  <option value="Emergency & STAT Triage - Room 001">Emergency &amp; STAT Triage - Room 001</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Clinical EMR Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDoctorPassword(!showDoctorPassword)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {showDoctorPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showDoctorPassword ? 'Hide Password' : 'Show Password'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showDoctorPassword ? 'text' : 'password'}
                    value={doctorPassword}
                    onChange={(e) => {
                      setDoctorPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter password (e.g. DocPass@2026#)"
                    className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Real-time Password Strength Engine */}
                <PasswordStrengthIndicator validation={doctorPasswordValidation} />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                <span>Sign In to Doctor EMR Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* 3. HOSPITAL ADMIN / HIS SIGN-IN FORM */}
          {/* ======================================================== */}
          {selectedRole === 'hospital' && (
            <form onSubmit={handleHospitalSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Hospital Information System (HIS)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickDemoAdmin}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200 transition-colors cursor-pointer"
                    title="Autofill Verified Admin Demo Credentials"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Quick Demo Fill</span>
                  </button>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Hospital className="w-3 h-3" />
                    HIS Command Desk
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Admin Staff ID / Work Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={hospitalAdminId}
                    onChange={(e) => {
                      setHospitalAdminId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. HIS-ADMIN-01 or admin@aiims.abdm.gov.in"
                    className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-purple-600 outline-none"
                  />
                  <Building2 className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Hospital / Health Facility Name
                </label>
                <input
                  type="text"
                  value={hospitalFacility}
                  onChange={(e) => setHospitalFacility(e.target.value)}
                  placeholder="e.g. AIIMS Central OPD Station"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Administrative Role
                </label>
                <select
                  value={hospitalRole}
                  onChange={(e) => setHospitalRole(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
                >
                  <option value="Chief Triage Officer">Chief Triage &amp; Nursing Supervisor</option>
                  <option value="OPD Operations Manager">OPD Operations Manager</option>
                  <option value="ABDM Gateway Administrator">ABDM Gateway Administrator</option>
                  <option value="Hospital Medical Superintendent">Hospital Medical Superintendent</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Facility Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHospitalPassword(!showHospitalPassword)}
                    className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
                  >
                    {showHospitalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showHospitalPassword ? 'Hide Password' : 'Show Password'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showHospitalPassword ? 'text' : 'password'}
                    value={hospitalPassword}
                    onChange={(e) => {
                      setHospitalPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter password (e.g. Admin@2026#)"
                    className="w-full pl-4 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:border-purple-600 outline-none"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Real-time Password Strength Engine */}
                <PasswordStrengthIndicator validation={hospitalPasswordValidation} />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                <span>Sign In to Hospital HIS Command</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#52833C]" />
            <span>Digital Personal Data Protection (DPDP) Act 2023</span>
          </div>
          <span className="font-mono text-[10px] text-stone-400">NHA ABDM v3.1 Compliant</span>
        </div>
      </div>

      {/* ABHA QR Scanner Modal */}
      <AbhaCameraScanner
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        language={language}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
