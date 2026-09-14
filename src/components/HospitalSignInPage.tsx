/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Languages,
  KeyRound,
  Lock,
  Hospital,
  AlertCircle,
  Sparkles,
  Server,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Wand2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BhashiniLanguage } from '../types';
import { getLocalizedStrings, BHASHINI_22_LANGUAGES } from '../bhashiniLanguages';
import { AudioGuidanceButton } from './AudioGuidanceButton';
import { authenticateOrRegisterUser } from '../services/authRegistryService';
import { validatePasswordPolicy, DEMO_CREDENTIALS, PASSWORD_ERROR_GUIDANCE } from '../utils/passwordPolicy';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface HospitalSignInPageProps {
  language: BhashiniLanguage;
  onBack: () => void;
  onOpenLanguageModal: () => void;
  onHospitalSignIn: (hospitalData: { id: string; name: string; branch: string; role: string }) => void;
  onLanguageChange?: (lang: BhashiniLanguage) => void;
}

export const HospitalSignInPage: React.FC<HospitalSignInPageProps> = ({
  language,
  onBack,
  onOpenLanguageModal,
  onHospitalSignIn,
  onLanguageChange,
}) => {
  const [hospitalAdminId, setHospitalAdminId] = useState('');
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [hospitalRole, setHospitalRole] = useState('Chief Triage Officer');
  const [hospitalFacility, setHospitalFacility] = useState('AIIMS Central OPD Station');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatusText, setLoadingStatusText] = useState('Verifying Facility Admin Token...');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const loc = getLocalizedStrings(language.code);

  // Real-time password validation
  const passwordValidation = useMemo(
    () => validatePasswordPolicy(hospitalPassword),
    [hospitalPassword]
  );

  // Admin ID format helper
  const getAdminIdValidationError = (val: string): string | null => {
    if (!val.trim()) return null;
    const cleaned = val.trim();
    if (cleaned.length < 4) {
      return 'Enter at least 4 characters for Facility Admin ID or email.';
    }
    return null;
  };

  const liveValidationError = getAdminIdValidationError(hospitalAdminId);

  // Quick Demo Fill Handler
  const handleQuickDemoFill = () => {
    setHospitalAdminId(DEMO_CREDENTIALS.hospitalAdmin.id);
    setHospitalFacility(DEMO_CREDENTIALS.hospitalAdmin.facilityName);
    setHospitalRole(DEMO_CREDENTIALS.hospitalAdmin.role);
    setHospitalPassword(DEMO_CREDENTIALS.hospitalAdmin.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = hospitalAdminId.trim();
    if (!hospitalFacility.trim()) {
      setErrorMessage('Please enter the Hospital / Facility Name.');
      return;
    }
    if (!cleanId) {
      setErrorMessage('Please enter your Facility Admin ID or Work Email.');
      return;
    }
    const validationErr = getAdminIdValidationError(cleanId);
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }
    if (!hospitalPassword.trim()) {
      setErrorMessage('Please enter your Facility Security Password.');
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMessage(PASSWORD_ERROR_GUIDANCE);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setLoadingStatusText('Verifying Facility Admin Token & HFR Directory...');

    // Simulate smooth verification delay
    await new Promise((r) => setTimeout(r, 600));

    try {
      const authResult = await authenticateOrRegisterUser(cleanId, 'his', hospitalPassword);
      if (!authResult.success || !authResult.user) {
        setErrorMessage(authResult.error || 'Credentials not found in active registry. Please contact Hospital Administration.');
        setIsLoading(false);
        return;
      }

      onHospitalSignIn({
        id: authResult.user.id || cleanId,
        name: hospitalFacility.trim() || authResult.user.facilityName || 'AIIMS Central OPD Station',
        branch: authResult.user.branch || 'Main Hospital Building - Block A',
        role: hospitalRole,
      });
    } catch (err) {
      setErrorMessage('Credentials not found in active registry. Please contact Hospital Administration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 bg-[#F8F5F2] overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-full border border-stone-200 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 relative">
            {/* Bhashini Language Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 text-stone-900 rounded-full border border-stone-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Languages className="w-4 h-4 text-purple-600" />
                <span>{language.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <AnimatePresence>
                {showLangDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 max-h-64 overflow-y-auto"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Select Language / भाषा चुनें
                    </div>
                    {BHASHINI_22_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          if (onLanguageChange) onLanguageChange(lang);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between hover:bg-purple-50 transition-colors ${
                          language.code === lang.code ? 'text-purple-600 bg-purple-50/50' : 'text-stone-700'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-stone-400 font-normal">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AudioGuidanceButton
              contextType="his_signin"
              language={language}
              buttonLabel={loc.audioGuideLabel}
            />
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-[0_12px_40px_rgb(0,0,0,0.04)] space-y-7 relative overflow-hidden"
        >
          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3 text-center p-6"
              >
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-stone-900">{loadingStatusText}</p>
                  <p className="text-xs text-stone-500">Connecting to Health Facility Registry (HFR) Gateway...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Title & Quick Demo Fill */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-stone-100 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Admin &amp; Command</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
                HIS Command Center Sign-In
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Hospital Command Desk, OPD Queue Balancing &amp; Real-time Bed Analytics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full border border-purple-200 transition-colors cursor-pointer"
                title="Autofill Verified Demo Admin"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Quick Demo Fill</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Admin Staff ID / Official Work Email
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
                  className={`w-full pl-4 pr-12 py-3.5 bg-stone-50 border rounded-2xl text-sm font-bold text-stone-900 focus:bg-white outline-none transition-all ${
                    liveValidationError
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20'
                  }`}
                />
                <Building2 className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              {/* Real-time Validation Feedback */}
              {liveValidationError && hospitalAdminId.length > 0 && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{liveValidationError}</span>
                </p>
              )}
              {!liveValidationError && hospitalAdminId.length > 0 && (
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Valid Admin ID format. Ready for gateway validation.</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Hospital / Health Facility Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={hospitalFacility}
                  onChange={(e) => setHospitalFacility(e.target.value)}
                  placeholder="e.g. AIIMS Central OPD Station"
                  className="w-full pl-4 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold text-stone-900 focus:bg-white focus:border-purple-600 outline-none"
                />
                <Hospital className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Administrative Role / Designation
              </label>
              <div className="relative">
                <select
                  value={hospitalRole}
                  onChange={(e) => setHospitalRole(e.target.value)}
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold text-stone-900 focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
                >
                  <option value="Chief Triage Officer">Chief Triage &amp; Nursing Supervisor</option>
                  <option value="OPD Operations Manager">OPD Operations Manager</option>
                  <option value="ABDM Gateway Administrator">ABDM Gateway Administrator</option>
                  <option value="Hospital Medical Superintendent">Hospital Medical Superintendent</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Facility Security Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide Password' : 'Show Password'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={hospitalPassword}
                  onChange={(e) => {
                    setHospitalPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter password (e.g. Admin@2026#)"
                  className="w-full pl-4 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold text-stone-900 focus:bg-white focus:border-purple-600 outline-none"
                />
                <Lock className="w-5 h-5 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              {/* Dynamic Password Strength Indicator with Checklist Badges */}
              <PasswordStrengthIndicator validation={passwordValidation} />
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-base flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer transform hover:scale-[1.01] disabled:opacity-50"
            >
              <span>Sign In to Hospital HIS Command</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>

        {/* Security Footer */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Health Facility Registry (HFR) Level 3 Security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Server className="w-4 h-4 text-stone-400" />
            <span>Real-time OPD Queue Load Balancing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
