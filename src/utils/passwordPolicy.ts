/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PasswordRequirement {
  id: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
  label: string;
  shortLabel: string;
  met: boolean;
}

export type PasswordStrengthLevel = 'empty' | 'weak' | 'moderate' | 'strong';

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 5
  strength: PasswordStrengthLevel;
  requirements: PasswordRequirement[];
  errorMessage: string | null;
}

export const PASSWORD_ERROR_GUIDANCE =
  'Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.';

/**
 * Validates a password against clinical EMR and HIS administrative security standards:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special symbol (@$!%*?&#)
 */
export function validatePasswordPolicy(password: string): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      strength: 'empty',
      requirements: [
        { id: 'length', label: 'At least 8 characters', shortLabel: '8+ Chars', met: false },
        { id: 'uppercase', label: '1 uppercase letter (A-Z)', shortLabel: 'Uppercase (A-Z)', met: false },
        { id: 'lowercase', label: '1 lowercase letter (a-z)', shortLabel: 'Lowercase (a-z)', met: false },
        { id: 'number', label: '1 number (0-9)', shortLabel: 'Number (0-9)', met: false },
        { id: 'special', label: '1 special character (@$!%*?&#)', shortLabel: 'Special (@$!%*?&#)', met: false },
      ],
      errorMessage: null,
    };
  }

  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  // Special characters: @ $ ! % * ? & # (also allow other standard symbols)
  const hasSpecial = /[@$!%*?&#]/.test(password);

  const requirements: PasswordRequirement[] = [
    { id: 'length', label: 'At least 8 characters', shortLabel: '8+ Chars', met: hasLength },
    { id: 'uppercase', label: '1 uppercase letter (A-Z)', shortLabel: 'Uppercase (A-Z)', met: hasUppercase },
    { id: 'lowercase', label: '1 lowercase letter (a-z)', shortLabel: 'Lowercase (a-z)', met: hasLowercase },
    { id: 'number', label: '1 number (0-9)', shortLabel: 'Number (0-9)', met: hasNumber },
    { id: 'special', label: '1 special character (@$!%*?&#)', shortLabel: 'Special (@$!%*?&#)', met: hasSpecial },
  ];

  const score = requirements.filter((r) => r.met).length;
  const isValid = score === 5;

  let strength: PasswordStrengthLevel = 'weak';
  if (score === 5) {
    strength = 'strong';
  } else if (score >= 3 && hasLength) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }

  return {
    isValid,
    score,
    strength,
    requirements,
    errorMessage: isValid ? null : PASSWORD_ERROR_GUIDANCE,
  };
}

/**
 * Verified demo credentials for Hackathon rapid testing
 * (All strictly satisfy the password policy: 8+ chars, uppercase, lowercase, number, special char)
 */
export const DEMO_CREDENTIALS = {
  doctor: {
    id: 'HPR-DL-9941',
    name: 'Dr. Rajesh Sharma',
    department: 'Cardiology OPD - Room 204',
    regNumber: 'NMC-488102',
    assignedCabin: 'Cabin #204',
    password: 'DocPass@2026#',
  },
  doctorAyush: {
    id: 'HPR-MH-1029',
    name: 'Dr. Priya Nair',
    department: 'AYUSH Integrative Clinic - Room 005',
    regNumber: 'NMC-519204',
    assignedCabin: 'Cabin #005',
    password: 'AyushDoc@2026#',
  },
  hospitalAdmin: {
    id: 'HIS-ADMIN-01',
    email: 'admin@aiims.abdm.gov.in',
    name: 'AIIMS Central OPD Command Station',
    facilityName: 'AIIMS Central OPD Station',
    branch: 'Main Hospital Building - Block A',
    role: 'Chief Triage Officer',
    password: 'Admin@2026#',
  },
  patient: {
    abhaId: '91-8829-4410-9921',
    mobile: '9876543210',
    name: 'Suresh Sharma',
    age: 52,
    gender: 'Male' as const,
    phone: '+91 98765 43210',
  },
};
