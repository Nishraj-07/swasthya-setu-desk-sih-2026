/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { PasswordValidationResult } from '../utils/passwordPolicy';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
  showChecklist?: boolean;
  compact?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  validation,
  showChecklist = true,
  compact = false,
}) => {
  if (validation.strength === 'empty') {
    return null;
  }

  const { score, strength, requirements, isValid } = validation;

  const strengthColors = {
    weak: {
      bar: 'bg-red-500',
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Weak Password',
    },
    moderate: {
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Moderate Strength',
    },
    strong: {
      bar: 'bg-emerald-600',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Strong Security (Clinical Grade)',
    },
  }[strength];

  return (
    <div className="space-y-2 mt-2 pt-1">
      {/* Visual Strength Progress Bar & Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => {
            const isFilled = step <= score;
            return (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  isFilled ? strengthColors.bar : 'bg-stone-200'
                }`}
              />
            );
          })}
        </div>

        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${strengthColors.bg} ${strengthColors.text} ${strengthColors.border}`}
        >
          {isValid ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          <span>{strengthColors.label}</span>
        </span>
      </div>

      {/* Checklist Requirement Badges */}
      {showChecklist && (
        <div className="pt-1">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Security Requirements ({score}/5 met):</span>
            {isValid && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> All criteria satisfied
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {requirements.map((req) => {
              return (
                <div
                  key={req.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    req.met
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                      : 'bg-stone-100/90 text-stone-500 border border-stone-200'
                  }`}
                >
                  {req.met ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-stone-400 shrink-0" />
                  )}
                  <span>{compact ? req.shortLabel : req.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Security Guidance if requirements unmet */}
      {!isValid && (
        <p className="text-[11px] text-stone-500 leading-tight pt-0.5">
          <span className="font-semibold text-stone-700">Required: </span>
          Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character (@$!%*?&#).
        </p>
      )}
    </div>
  );
};
