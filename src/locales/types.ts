/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LocalizedUIStrings {
  // Navigation & General
  appTitle: string;
  appSubtitle: string;
  kioskTag: string;
  stepIdentify: string;
  stepConverse: string;
  stepScan: string;
  stepSummarize: string;
  stepConsult: string;
  bhashiniBanner: string;
  languageSelectBtn: string;
  doctorWorkspaceBtn: string;
  exitDoctorBtn: string;
  backBtn: string;
  nextBtn: string;
  proceedBtn: string;
  saveBtn: string;
  cancelBtn: string;
  closeBtn: string;
  loadingText: string;
  audioGuideLabel: string;
  stopAudioLabel: string;

  // Header & Navigation Links
  howItWorks: string;
  ayushMode: string;
  abdmSupport: string;
  splitView: string;
  exitSplit: string;
  vaniyantraCall: string;
  helpDesk: string;
  fullWindow: string;
  windowPatientKiosk: string;
  windowDoctorEmr: string;
  windowHisCommand: string;
  step1Nav: string;
  step2Nav: string;
  step3Nav: string;
  step4Nav: string;
  step5Nav: string;

  // Audio Guidance Prompts
  audioPromptIdentify: string;
  audioPromptConverse: string;
  audioPromptScan: string;
  audioPromptConsent: string;
  audioPromptSummary: string;

  // Step 1: Identify & Consent
  nhmBadge: string;
  heroTitle: string;
  heroSub: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;
  patientIdentTitle: string;
  abdmMilestoneBadge: string;
  tabAbha: string;
  tabAadhaar: string;
  tabInstant: string;
  abhaAddressLabel: string;
  quickDemoProfiles: string;
  profile1Label: string;
  profile2Label: string;
  aadhaar12DigitLabel: string;
  uidaiOtpNotice: string;
  dpdpConsentCheckboxText: string;
  beginIntakeBtn: string;

  abhaLoginTitle: string;
  abhaPlaceholder: string;
  orAadhaar: string;
  orRegister: string;
  aadhaarKycTitle: string;
  aadhaarPlaceholder: string;
  walkinTitle: string;
  fullNameLabel: string;
  ageLabel: string;
  genderLabel: string;
  maleLabel: string;
  femaleLabel: string;
  otherLabel: string;
  phoneLabel: string;
  btnStartVoiceTouch: string;
  consentTitle: string;
  consentBody: string;
  otpLabel: string;
  verifyOtpBtn: string;
  otpVerifiedSuccess: string;
  sendOtpBtn: string;
  nhaCertifiedBadge: string;
  dpdpPrivacyNotice: string;

  // Step 2: Clinical Converse
  converseStepBadge: string;
  converseHeroTitle: string;
  converseHeroSub: string;
  liveTranscriptLabel: string;
  aiEntityExtractedBadge: string;
  transcriptHelpPlaceholder: string;
  socratesCharacterLabel: string;
  painScoreLabel: string;
  vaniyantraCallBannerTitle: string;
  vaniyantraCallBannerSub: string;
  startVoiceConsultBtn: string;
  regionalSamplesTitle: string;
  resetRecordingBtn: string;
  nextUploadBtn: string;
  languageLabel: string;
  tapMicToSpeak: string;
  listeningTapPause: string;

  allopathicTrack: string;
  ayushTrack: string;
  allopathicDesc: string;
  ayushDesc: string;
  voiceInputTitle: string;
  voiceMicStart: string;
  voiceMicStop: string;
  voiceListening: string;
  voicePromptPlaceholder: string;
  socratesTitle: string;
  socratesSubtitle: string;
  socratesSite: string;
  socratesOnset: string;
  socratesCharacter: string;
  socratesRadiation: string;
  socratesSeverity: string;
  socratesTiming: string;
  socratesFactors: string;
  socratesAssociated: string;
  quickSymptomChipsTitle: string;
  redFlagWarning: string;
  redFlagImmediateAction: string;
  clearTranscriptBtn: string;

  // AYUSH Pariksha
  prakritiLabel: string;
  vikritiLabel: string;
  agniLabel: string;
  saraLabel: string;
  satmyaLabel: string;
  aharaViharaTitle: string;
  dietPatternLabel: string;
  sleepPatternLabel: string;
  bowelHabitLabel: string;
  waterIntakeLabel: string;

  // Step 3: Scan Documents
  scanStepBadge: string;
  scanHeroTitle: string;
  scanHeroSub: string;
  useCameraBtn: string;
  uploadFileBtn: string;
  stopCameraBtn: string;
  switchCameraBtn: string;
  capturePhotoBtn: string;
  dropzoneSub: string;
  useSampleLabBtn: string;
  useSamplePrescriptionBtn: string;
  analyzeWithAiBtn: string;
  deleteDoc: string;
  previewDoc: string;

  scanTitle: string;
  scanSub: string;
  scannerHardwareTitle: string;
  scannerReadyBadge: string;
  holdDocText: string;
  alignDocSub: string;
  captureRecordBtn: string;
  dropzoneText: string;
  digitizedFilesHeader: string;
  tabTimeline: string;
  tabOcrEntities: string;
  labReportTitle: string;
  prescriptionTitle: string;
  dischargeSummaryTitle: string;
  testNameCol: string;
  valueCol: string;
  refRangeCol: string;
  statusCol: string;
  highBadge: string;
  criticalBadge: string;
  normalBadge: string;
  activeMedsTitle: string;
  abnormalFlagsTitle: string;

  // Step 4: Processing
  autoClinicalSynthesis: string;
  synthesizingTitle: string;
  synthesizingSub: string;
  microstep1Title: string;
  microstep1Detail: string;
  microstep2Title: string;
  microstep2Detail: string;
  microstep3Title: string;
  microstep3Detail: string;

  // Step 5: Summary & Route
  summaryBadge: string;
  summaryHeroTitle: string;
  summaryHeroSub: string;
  tabSummary: string;
  tabFhir: string;
  copyFhirBtn: string;
  copiedBadge: string;

  summaryTitle: string;
  summarySub: string;
  abdmDpdpValidatedBadge: string;
  zeroRetentionTitle: string;
  zeroRetentionNotice: string;
  tabClinicalDraft: string;
  tabFhirJson: string;
  chiefComplaintLabel: string;
  hpiLabel: string;
  pastMedicalLabel: string;
  drugAndAllergyLabel: string;
  familyHistoryLabel: string;
  socialHistoryLabel: string;
  reviewOfSystemsLabel: string;
  priorInvestigationsLabel: string;
  purgeDataBtn: string;
  proceedToDoctorBtn: string;
  pushToHisBtn: string;
  hisSyncSuccess: string;

  // Step 6: Doctor Workspace
  doctorDashboardTitle: string;
  doctorSub: string;
  cabinNumber: string;
  exportFhirBtn: string;
  fhirCopiedText: string;
  approveSaveHisBtn: string;
  editDraftBtn: string;
  doneEditingBtn: string;
  priorityTriageAlert: string;
  queueBypassActive: string;
  patientDemographicsTitle: string;
  doctorNotesLabel: string;
  doctorNotesPlaceholder: string;
  allergyCriticalAlert: string;
  savedSuccessMsg: string;
  resetKioskBtn: string;

  // Language Modal
  langModalTitle: string;
  langModalSubtitle: string;
  searchLangPlaceholder: string;
  allRegionsTab: string;
  northRegionTab: string;
  southRegionTab: string;
  eastRegionTab: string;
  westRegionTab: string;

  // Additional Comprehensive UI Keys
  chiefComplaintSocrates: string;
  cancelEditBtn: string;
  editEmrEntryBtn: string;
  hpiNarrativeLabel: string;
  saveClinicalChangesBtn: string;
  associatedSymptomsLabel: string;
  fullHpiLabel: string;
  recordsOcrTimeline: string;
  labInvestigationsHeader: string;
  activeMedReconciliation: string;
  doctorImpressionOrders: string;
  statDiagnosticOrders: string;
  resetNextPatientBtn: string;
  amendAddNotesBtn: string;
  pushedToEmrNotice: string;
  acceptPushEmrBtn: string;
  fhirBundleTab: string;
  copiedNotice: string;
  copyJsonBtn: string;
  hisClinicalSummaryTitle: string;
  patientKioskView: string;
  hisDashboardView: string;
  priorityHighAlert: string;

  microStep1Title: string;
  microStep1Detail: string;
  microStep2Title: string;
  microStep2Detail: string;
  microStep3Title: string;
  microStep3Detail: string;
  automatedClinicalSynthesis: string;
  generatingIntakePackage: string;
  viewDoctorDashboardNow: string;

  scanEyebrow: string;
  liveCameraScanner: string;
  switchCamera: string;
  alignFrameNotice: string;
  captureExtractBtn: string;
  extractingOcrText: string;
  uploadPrompt: string;
  uploadSupportSub: string;
  useDeviceCamera: string;
  orDropFiles: string;
  digitizedRecordsTitle: string;
  nablStandardBadge: string;
  extractedBadge: string;
  backToVoiceBtn: string;
  analyzeGenerateSummaryBtn: string;

  abdmEncryptedEyebrow: string;
  emergencyAlertTitle: string;
  actionRequired: string;
  statHighPriority: string;
  structuredSummaryTab: string;
  locationRadiation: string;
  onsetSeverity: string;
  dpdpTitle: string;
  dpdpSub: string;
  purgeMemoryBtn: string;
  proceedDoctorConsultBtn: string;

  totalLiveQueue: string;
  redFlagsEmergencies: string;
  avgTriageTime: string;
  abdmFhirSync: string;
  liveTriageQueueTab: string;
  opdDepartmentsTab: string;
  abdmGatewayTab: string;
  bhashiniAnalyticsTab: string;
  searchQueuePlaceholder: string;
  allDepartments: string;
  allStatuses: string;
  priorityEmergency: string;
  statusWaiting: string;
  statusInConsultation: string;
  statusCompleted: string;
  tokenCol: string;
  patientProfileCol: string;
  languageCol: string;
  chiefComplaintCol: string;
  assignedCabinCol: string;
  actionsCol: string;
  doctorWorkstationTab: string;

  // Converse Step Extended
  voiceEyebrow: string;
  voiceHeroTitle: string;
  voiceHeroSub: string;
  voiceTapToSpeak: string;
  voiceLanguageLabel: string;
  aiEntityExtracted: string;
  transcriptPlaceholder: string;
  preferVoiceCall: string;
  voiceCallHelper: string;
  quickVoiceSamples: string;
  nextUploadRecordsBtn: string;

  // Portal selector & footer keys
  selectPortal: string;
  portalSub: string;
  patientBadge: string;
  patientTitle: string;
  patientDesc: string;
  patientBtn: string;
  doctorBadge: string;
  doctorTitle: string;
  doctorDesc: string;
  doctorBtn: string;
  hisBadge: string;
  hisTitle: string;
  hisDesc: string;
  hisBtn: string;
  footer1: string;
  footer2: string;
  footer3: string;
}
