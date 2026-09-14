/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LocalizedUIStrings } from './types';
import { enLocale } from './en';
import { hiLocale } from './hi';
import { mrLocale } from './mr';
import { taLocale } from './ta';
import { teLocale } from './te';
import { bnLocale } from './bn';
import { guLocale } from './gu';
import { knLocale } from './kn';
import { mlLocale } from './ml';
import { paLocale } from './pa';
import { orLocale } from './or';
import { urLocale } from './ur';
import { asLocale } from './as';
import { saLocale } from './sa';
import { neLocale } from './ne';
import { maLocale } from './ma';
import { ksLocale } from './ks';
import { kokLocale } from './kok';
import { mniLocale } from './mni';
import { brxLocale } from './brx';
import { doiLocale } from './doi';
import { satLocale } from './sat';
import { sdLocale } from './sd';

export * from './types';
export { enLocale } from './en';
export { hiLocale } from './hi';

const ALL_LOCALES: Record<string, Partial<LocalizedUIStrings>> = {
  en: enLocale,
  hi: hiLocale,
  mr: mrLocale,
  ta: taLocale,
  te: teLocale,
  bn: bnLocale,
  gu: guLocale,
  kn: knLocale,
  ml: mlLocale,
  pa: paLocale,
  or: orLocale,
  ur: urLocale,
  as: asLocale,
  sa: saLocale,
  ne: neLocale,
  ma: maLocale,
  ks: ksLocale,
  kok: kokLocale,
  mni: mniLocale,
  brx: brxLocale,
  doi: doiLocale,
  sat: satLocale,
  sd: sdLocale,
};

export function getLocalizedUI(langCode: string): LocalizedUIStrings {
  const custom = ALL_LOCALES[langCode];
  if (!custom) {
    return enLocale;
  }
  // Merge with fallback enLocale so every key is strictly guaranteed non-empty string
  return {
    ...enLocale,
    ...custom,
  };
}

export const getLocalizedStrings = getLocalizedUI;
