export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'kn' | 'gu' | 'ml' | 'pa';

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechCode: string; // For SpeechRecognition & SpeechSynthesis
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', speechCode: 'en-IN', region: 'All India' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', speechCode: 'hi-IN', region: 'North / Central' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', speechCode: 'mr-IN', region: 'Maharashtra' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', speechCode: 'ta-IN', region: 'Tamil Nadu' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', speechCode: 'te-IN', region: 'Andhra / Telangana' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', speechCode: 'bn-IN', region: 'West Bengal' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', speechCode: 'kn-IN', region: 'Karnataka' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', speechCode: 'gu-IN', region: 'Gujarat' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', speechCode: 'ml-IN', region: 'Kerala' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', region: 'Punjab' },
];

export interface TranslationSchema {
  // Navigation & Header
  appTitle: string;
  appSubtitle: string;
  systemsOnline: string;
  stationName: string;
  changeLanguage: string;
  selectLanguage: string;
  audioPromptBtn: string;
  failsafeHint: string;
  stepCheckIn: string;
  stepVoice: string;
  stepRecords: string;
  stepProcessing: string;
  stepDoctorView: string;

  // Screen 1: Welcome
  welcomeBadge: string;
  welcomeHeading: string;
  welcomeSubheading: string;
  abhaInputLabel: string;
  abhaPlaceholder: string;
  quickFill: string;
  startIntakeBtn: string;
  trustAbdm: string;
  trustVoice: string;
  trustTriage: string;

  // Screen 2: Voice
  voiceStepBadge: string;
  voiceHeading: string;
  voiceSubheading: string;
  tapToSpeak: string;
  listening: string;
  activeMicNotice: string;
  tapToStop: string;
  transcriptLabel: string;
  transcriptPlaceholder: string;
  clearTranscript: string;
  sampleSymptomHeader: string;
  sampleSymptoms: Array<{ title: string; text: string }>;
  backBtn: string;
  nextStepBtn: string;

  // Screen 3: Upload
  uploadStepBadge: string;
  uploadHeading: string;
  uploadSubheading: string;
  dropzonePrompt: string;
  dropzoneSubtext: string;
  changeFile: string;
  readyForOcr: string;
  noDocNotice: string;
  noDocSubtext: string;
  useSampleReportBtn: string;
  analyzeWithAiBtn: string;

  // Screen 4: Processing
  processingHeading: string;
  processingSubheading: string;
  processingStep1: string;
  processingStep2: string;
  processingStep3: string;

  // Screen 5: Dashboard
  doctorViewTitle: string;
  doctorName: string;
  priorityHigh: string;
  statusCheckedIn: string;
  card1Title: string;
  card1Badge: string;
  patientAudioTranscript: string;
  langVerified: string;
  extractedClinicalSchema: string;
  confidenceHigh: string;
  card2Title: string;
  card2Badge: string;
  viewDocument: string;
  labValuesExtracted: string;
  recordSource: string;
  sessionTimer: string;
  rejectRecord: string;
  completeConsultation: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  en: {
    appTitle: 'SwasthyaSetuDesk',
    appSubtitle: 'Self-Service Healthcare Station',
    systemsOnline: 'Systems Online',
    stationName: 'Station #04 • OPD Triage',
    changeLanguage: 'Language',
    selectLanguage: 'Choose your preferred language',
    audioPromptBtn: 'Listen in English',
    failsafeHint: 'Double-click SwasthyaSetuDesk logo anytime to bypass demo',
    stepCheckIn: 'Check-In',
    stepVoice: 'Voice Symptoms',
    stepRecords: 'Records OCR',
    stepProcessing: 'AI Structuring',
    stepDoctorView: 'Doctor HIS',

    welcomeBadge: 'AI-Powered Clinical Intake',
    welcomeHeading: 'SwasthyaSetuDesk Self-Check-In',
    welcomeSubheading: 'Quick clinical registration and symptom assessment before seeing your doctor.',
    abhaInputLabel: 'Enter ABHA ID or Mobile Number',
    abhaPlaceholder: 'e.g., 91-XXXX-XXXX or ABHA-8829-1022-3110',
    quickFill: 'Quick Fill for Testing:',
    startIntakeBtn: 'Start Clinical Intake',
    trustAbdm: 'ABDM Compliant',
    trustVoice: '10+ Indian Languages',
    trustTriage: 'Priority Triage',

    voiceStepBadge: 'Step 1 of 2 • Voice Symptom Capture',
    voiceHeading: 'Describe your symptoms',
    voiceSubheading: 'Tap the microphone and explain how you are feeling in your own words.',
    tapToSpeak: 'Tap to Speak',
    listening: 'Listening...',
    activeMicNotice: 'Microphone active • Speak clearly in your language',
    tapToStop: 'Tap again to stop recording',
    transcriptLabel: 'Live Transcript',
    transcriptPlaceholder: 'Your words will appear here as you speak, or you can type directly...',
    clearTranscript: 'Clear',
    sampleSymptomHeader: 'Or select typical symptom for demonstration:',
    sampleSymptoms: [
      {
        title: 'Chest Pain (Acute)',
        text: 'I have been feeling a sharp pain in my chest since yesterday morning. It gets worse when I take deep breaths. No fever, but I feel very dizzy today.',
      },
      {
        title: 'Fever & Cough',
        text: 'High grade fever for 3 days with dry cough and mild breathlessness when climbing stairs.',
      },
      {
        title: 'Diabetic Numbness',
        text: 'Experiencing tingling sensation and loss of feeling in both feet over the last 2 weeks.',
      },
    ],
    backBtn: 'Back',
    nextStepBtn: 'Next Step',

    uploadStepBadge: 'Step 2 of 2 • Medical Records OCR',
    uploadHeading: 'Upload Prior Records',
    uploadSubheading: 'Upload past prescriptions, lab tests (HbA1c, Lipid panel), or discharge summaries for Gemini AI digitization.',
    dropzonePrompt: 'Tap or drag & drop medical document image here',
    dropzoneSubtext: 'Supports JPEG, PNG, scanned prescriptions, or lab reports',
    changeFile: 'Change File',
    readyForOcr: 'Ready for Clinical OCR',
    noDocNotice: "Don't have a document handy?",
    noDocSubtext: 'Use pre-configured sample Comprehensive Metabolic Panel (HbA1c)',
    useSampleReportBtn: 'Use Sample Lab Report',
    analyzeWithAiBtn: 'Analyze with AI',

    processingHeading: 'Structuring Clinical Data... Calling Gemini AI...',
    processingSubheading: 'Synthesizing vocal intake & document telemetry for Doctor Triage...',
    processingStep1: 'Extracting Chief Complaint & Timing...',
    processingStep2: 'OCR digitizing metabolic lab panel...',
    processingStep3: 'Generating structured Hospital Information System summary...',

    doctorViewTitle: 'Hospital Information System - Doctor View',
    doctorName: 'Dr. Ananya Sharma',
    priorityHigh: 'Priority: HIGH',
    statusCheckedIn: 'Status: Checked-In',
    card1Title: 'Structured AI History',
    card1Badge: 'AI Processed',
    patientAudioTranscript: 'Patient Audio Transcript',
    langVerified: 'Verified Voice Intake',
    extractedClinicalSchema: 'Extracted Clinical Schema',
    confidenceHigh: 'High Confidence (99.4%)',
    card2Title: 'Digitized Records',
    card2Badge: 'OCR Validated',
    viewDocument: 'View Document',
    labValuesExtracted: 'Lab Values Extracted',
    recordSource: 'Records uploaded from City General Diagnostics. Scanned on 2023-11-20.',
    sessionTimer: 'Session Timer',
    rejectRecord: 'Reject Record',
    completeConsultation: 'Complete Consultation',
  },

  hi: {
    appTitle: 'मेडीकियोस्क',
    appSubtitle: 'स्वयं-सेवा स्वास्थ्य जांच केंद्र',
    systemsOnline: 'सिस्टम ऑनलाइन',
    stationName: 'स्टेशन #04 • ओपीडी ट्राइएज',
    changeLanguage: 'भाषा बदलें',
    selectLanguage: 'अपनी पसंदीदा भाषा चुनें',
    audioPromptBtn: 'हिन्दी में सुनें',
    failsafeHint: 'डेमो बायपास करने के लिए कभी भी मेडीकियोस्क लोगो पर डबल-क्लिक करें',
    stepCheckIn: 'चेक-इन',
    stepVoice: 'आवाज से लक्षण',
    stepRecords: 'दस्तावेज ओसीआर',
    stepProcessing: 'एआई विश्लेषण',
    stepDoctorView: 'डॉक्टर दृश्य',

    welcomeBadge: 'एआई-संचालित क्लीनिकल इनटेक',
    welcomeHeading: 'मेडीकियोस्क स्वयं-चेक-इन',
    welcomeSubheading: 'डॉक्टर से मिलने से पहले त्वरित क्लीनिकल पंजीकरण और लक्षणों का आकलन।',
    abhaInputLabel: 'आभा (ABHA) आईडी या मोबाइल नंबर दर्ज करें',
    abhaPlaceholder: 'उदा. 91-XXXX-XXXX या ABHA-8829-1022-3110',
    quickFill: 'त्वरित परीक्षण के लिए भरें:',
    startIntakeBtn: 'क्लीनिकल इनटेक शुरू करें',
    trustAbdm: 'एबीडीएम (ABDM) अनुपालित',
    trustVoice: '10+ भारतीय भाषाएं',
    trustTriage: 'प्राथमिकता ट्राइएज',

    voiceStepBadge: 'चरण 1 / 2 • आवाज से लक्षण दर्ज करें',
    voiceHeading: 'अपने लक्षणों का वर्णन करें',
    voiceSubheading: 'माइक्रोफ़ोन पर टैप करें और अपनी भाषा में बताएं कि आप कैसा महसूस कर रहे हैं।',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening: 'सुन रहे हैं...',
    activeMicNotice: 'माइक सक्रिय है • कृपया स्पष्ट बोलें',
    tapToStop: 'रोकने के लिए दोबारा टैप करें',
    transcriptLabel: 'सजीव प्रतिलेख (Transcript)',
    transcriptPlaceholder: 'जैसे ही आप बोलेंगे, आपके शब्द यहाँ दिखाई देंगे या आप सीधे टाइप भी कर सकते हैं...',
    clearTranscript: 'साफ़ करें',
    sampleSymptomHeader: 'या डेमो के लिए लक्षण चुनें:',
    sampleSymptoms: [
      {
        title: 'सीने में दर्द (तीव्र)',
        text: 'कल सुबह से मेरे सीने में तेज दर्द हो रहा है। गहरी सांस लेने पर यह और बढ़ जाता है। बुखार नहीं है, लेकिन बहुत चक्कर आ रहे हैं।',
      },
      {
        title: 'बुखार और खांसी',
        text: '3 दिनों से तेज बुखार है, साथ में सूखी खांसी और सीढ़ियां चढ़ते समय हल्की सांस फूलती है।',
      },
      {
        title: 'पैरों में सुन्नपन',
        text: 'पिछले 2 हफ्तों से दोनों पैरों में झनझनाहट और सुन्नपन महसूस हो रहा है।',
      },
    ],
    backBtn: 'पीछे जाएं',
    nextStepBtn: 'अगला चरण',

    uploadStepBadge: 'चरण 2 / 2 • मेडिकल रिकॉर्ड ओसीआर',
    uploadHeading: 'पुराने मेडिकल रिकॉर्ड अपलोड करें',
    uploadSubheading: 'जेमिनी एआई द्वारा डिजिटलीकरण के लिए पुराने पर्चे, लैब टेस्ट (HbA1c आदि) अपलोड करें।',
    dropzonePrompt: 'दस्तावेज़ की तस्वीर यहाँ टैप करें या खींचें',
    dropzoneSubtext: 'JPEG, PNG या स्कैन की गई लैब रिपोर्ट समर्थित हैं',
    changeFile: 'फ़ाइल बदलें',
    readyForOcr: 'क्लीनिकल ओसीआर के लिए तैयार',
    noDocNotice: 'क्या आपके पास दस्तावेज़ नहीं है?',
    noDocSubtext: 'पहले से तैयार नमूना मेटाबोलिक पैनल (HbA1c) का उपयोग करें',
    useSampleReportBtn: 'नमूना लैब रिपोर्ट चुनें',
    analyzeWithAiBtn: 'एआई से विश्लेषण करें',

    processingHeading: 'क्लीनिकल डेटा तैयार हो रहा है... जेमिनी एआई सक्रिय...',
    processingSubheading: 'डॉक्टर ट्राइएज के लिए आवाज और रिपोर्ट का समन्वय किया जा रहा है...',
    processingStep1: 'मुख्य समस्या और समय का विश्लेषण...',
    processingStep2: 'मेटाबोलिक लैब पैनल का ओसीआर डिजिटलीकरण...',
    processingStep3: 'हॉस्पिटल इंफॉर्मेशन सिस्टम (HIS) सारांश तैयार किया जा रहा है...',

    doctorViewTitle: 'अस्पताल सूचना प्रणाली - डॉक्टर दृश्य',
    doctorName: 'डॉ. अनन्या शर्मा',
    priorityHigh: 'प्राथमिकता: उच्च (HIGH)',
    statusCheckedIn: 'स्थिति: चेक-इन पूर्ण',
    card1Title: 'संरचित एआई इतिहास (Structured AI History)',
    card1Badge: 'एआई संसाधित',
    patientAudioTranscript: 'मरीज का ऑडियो प्रतिलेख',
    langVerified: 'सत्यापित आवाज इनटेक',
    extractedClinicalSchema: 'निकाला गया क्लीनिकल स्कीमा',
    confidenceHigh: 'उच्च सटीकता (99.4%)',
    card2Title: 'डिजिटाइज्ड रिकॉर्ड्स (Digitized Records)',
    card2Badge: 'ओसीआर सत्यापित',
    viewDocument: 'दस्तावेज़ देखें',
    labValuesExtracted: 'निकाले गए लैब मान (Lab Values)',
    recordSource: 'सिटी जनरल डायग्नोस्टिक्स से प्राप्त रिपोर्ट। स्कैन तिथि: 2023-11-20.',
    sessionTimer: 'सत्र टाइमर',
    rejectRecord: 'अस्वीकार करें',
    completeConsultation: 'परामर्श पूरा करें',
  },

  mr: {
    appTitle: 'मेडीकियोस्क',
    appSubtitle: 'स्वयं-सेवा आरोग्य तपासणी केंद्र',
    systemsOnline: 'सिस्टीम कार्यरत',
    stationName: 'स्टेशन #04 • ओपीडी ट्रायज',
    changeLanguage: 'भाषा बदला',
    selectLanguage: 'तुमची पसंतीची भाषा निवडा',
    audioPromptBtn: 'मराठीत ऐका',
    failsafeHint: 'डेमो बायपास करण्यासाठी मेडीकियोस्क लोगोवर डबल-क्लिक करा',
    stepCheckIn: 'चेक-इन',
    stepVoice: 'आवाजाद्वारे लक्षणे',
    stepRecords: 'कागदपत्रे ओसीआर',
    stepProcessing: 'एआय प्रक्रिया',
    stepDoctorView: 'डॉक्टर व्ह्यू',

    welcomeBadge: 'एआय-सक्षम क्लिनिकल इनटेक',
    welcomeHeading: 'मेडीकियोस्क सेल्फ चेक-इन',
    welcomeSubheading: 'डॉक्टरांना भेटण्यापूर्वी जलद नोंदणी आणि लक्षणांचे अचूक मूल्यांकन.',
    abhaInputLabel: 'आभा (ABHA) आयडी किंवा मोबाईल नंबर टाका',
    abhaPlaceholder: 'उदा. 91-XXXX-XXXX किंवा ABHA-8829-1022-3110',
    quickFill: 'चाचणीसाठी त्वरित भरा:',
    startIntakeBtn: 'क्लिनिकल तपासणी सुरू करा',
    trustAbdm: 'ABDM प्रमाणित',
    trustVoice: '१०+ भारतीय भाषा',
    trustTriage: 'प्राधान्य ट्रायज',

    voiceStepBadge: 'टप्पा १ / २ • आवाजाद्वारे लक्षणे नोंदवा',
    voiceHeading: 'तुमची लक्षणे सांगा',
    voiceSubheading: 'मायक्रोफोनवर टॅप करा आणि तुम्हाला काय त्रास होत आहे ते स्वतःच्या भाषेत सांगा.',
    tapToSpeak: 'बोलण्यासाठी टॅप करा',
    listening: 'ऐकत आहे...',
    activeMicNotice: 'माईक चालू आहे • कृपया स्पष्ट बोला',
    tapToStop: 'थांबवण्यासाठी पुन्हा टॅप करा',
    transcriptLabel: 'थेट मजकूर (Transcript)',
    transcriptPlaceholder: 'तुम्ही बोलताच शब्द येथे दिसतील किंवा थेट टाइप करा...',
    clearTranscript: 'हटवा',
    sampleSymptomHeader: 'किंवा डेमोसाठी नमुना लक्षण निवडा:',
    sampleSymptoms: [
      {
        title: 'छातीत दुखणे (तीव्र)',
        text: 'काल सकाळपासून माझ्या छातीत तीव्र दुखत आहे. दीर्घ श्वास घेतल्यावर जास्त त्रास होतो आणि खूप चक्कर येत आहे.',
      },
      {
        title: 'ताप आणि खोकला',
        text: '३ दिवसांपासून तीव्र ताप आणि कोरडा खोकला आहे, जिने चढताना धाप लागते.',
      },
      {
        title: 'पायात मुंग्या येणे',
        text: 'गेल्या २ आठवड्यांपासून दोन्ही पायांत मुंग्या येत असून बधीरपणा जाणवत आहे.',
      },
    ],
    backBtn: 'मागे जा',
    nextStepBtn: 'पुढील टप्पा',

    uploadStepBadge: 'टप्पा २ / २ • वैद्यकीय नोंदी डिजिटायझेशन',
    uploadHeading: 'जुने वैद्यकीय अहवाल अपलोड करा',
    uploadSubheading: 'जेमिनी एआय विश्लेषणासाठी जुने प्रिस्क्रिप्शन किंवा लॅब टेस्टचे फोटो अपलोड करा.',
    dropzonePrompt: 'कागदपत्रांचा फोटो येथे टाका किंवा टॅप करा',
    dropzoneSubtext: 'JPEG, PNG किंवा स्कॅन केलेले अहवाल समर्थित आहेत',
    changeFile: 'फाइल बदला',
    readyForOcr: 'ओसीआर साठी तयार',
    noDocNotice: 'सध्या कागदपत्र उपलब्ध नाही का?',
    noDocSubtext: 'तयार नमुना लॅब अहवाल वापरा (HbA1c)',
    useSampleReportBtn: 'नमुना अहवाल निवडा',
    analyzeWithAiBtn: 'एआय द्वारे विश्लेषण करा',

    processingHeading: 'माहितीचे संकलन सुरू आहे... जेमिनी एआय कार्यरत...',
    processingSubheading: 'डॉक्टरांच्या तपासणीसाठी ऑडिओ आणि अहवालांचे एकत्रीकरण होत आहे...',
    processingStep1: 'मुख्य लक्षण आणि वेळेचे वर्गीकरण...',
    processingStep2: 'मेटाबॉलिक लॅब अहवालाचे ओसीआर रूपांतर...',
    processingStep3: 'हॉस्पिटल इन्फॉर्मेशन सिस्टीम अहवाल तयार होत आहे...',

    doctorViewTitle: 'हॉस्पिटल इन्फॉर्मेशन सिस्टीम - डॉक्टर व्ह्यू',
    doctorName: 'डॉ. अनन्या शर्मा',
    priorityHigh: 'प्राधान्य: उच्च (HIGH)',
    statusCheckedIn: 'स्थिती: चेक-इन पूर्ण',
    card1Title: 'स्ट्रक्चर्ड एआय हिस्ट्री (Structured AI History)',
    card1Badge: 'एआय विश्लेषित',
    patientAudioTranscript: 'रुग्णाचा ऑडिओ मजकूर',
    langVerified: 'सत्यापित व्हॉइस इनटेक',
    extractedClinicalSchema: 'निष्कर्ष काढलेला क्लिनिकल डेटा',
    confidenceHigh: 'उच्च अचूकता (९९.४%)',
    card2Title: 'डिजिटाइज्ड रेकॉर्ड्स (Digitized Records)',
    card2Badge: 'ओसीआर प्रमाणित',
    viewDocument: 'कागदपत्र पहा',
    labValuesExtracted: 'लॅब चाचणी मूल्ये',
    recordSource: 'सिटी जनरल डायग्नोस्टिक अहवाल. स्कॅन दिनांक: 2023-11-20.',
    sessionTimer: 'सत्र वेळ',
    rejectRecord: 'नाकारा',
    completeConsultation: 'सल्लामसलत पूर्ण करा',
  },

  ta: {
    appTitle: 'மெடிகியோஸ்க்',
    appSubtitle: 'சுய சேவை சுகாதார மையம்',
    systemsOnline: 'அமைப்புகள் தயார்',
    stationName: 'நிலையம் #04 • ஒபிடி தரம் பிரிப்பு',
    changeLanguage: 'மொழியை மாற்றவும்',
    selectLanguage: 'உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
    audioPromptBtn: 'தமிழில் கேட்கவும்',
    failsafeHint: 'டெமோவைத் தவிர்க்க மெடிகியோஸ்க் லோகோவை இருமுறை தட்டவும்',
    stepCheckIn: 'செக்-இன்',
    stepVoice: 'குரல் அறிகுறிகள்',
    stepRecords: 'ஆவணங்கள் ஓசிஆர்',
    stepProcessing: 'ஏஐ பகுப்பாய்வு',
    stepDoctorView: 'மருத்துவர் பார்வை',

    welcomeBadge: 'AI இயங்கும் மருத்துவப் பதிவு',
    welcomeHeading: 'மெடிகியோஸ்க் சுய செக்-இன்',
    welcomeSubheading: 'மருத்துவரைச் சந்திக்கும் முன் விரைவான பதிவு மற்றும் அறிகுறிகள் மதிப்பீடு.',
    abhaInputLabel: 'ஆபா (ABHA) எண் அல்லது மொபைல் எண் உள்ளிடவும்',
    abhaPlaceholder: 'எ.கா., 91-XXXX-XXXX அல்லது ABHA-8829-1022-3110',
    quickFill: 'விரைவு சோதனைக்கு:',
    startIntakeBtn: 'மருத்துவப் பதிவைத் தொடங்குங்கள்',
    trustAbdm: 'ABDM இணக்கமானது',
    trustVoice: '10+ இந்திய மொழிகள்',
    trustTriage: 'முன்னுரிமை தரம்',

    voiceStepBadge: 'படி 1 / 2 • குரல் மூலம் அறிகுறிகளைப் பதிவுசெய்க',
    voiceHeading: 'உங்கள் உடல்நிலை அறிகுறிகளைக் கூறவும்',
    voiceSubheading: 'மைக்ரோஃபோனைத் தட்டி உங்கள் மொழியில் நீங்கள் எப்படி உணர்கிறீர்கள் என்பதை விவரிக்கவும்.',
    tapToSpeak: 'பேச தட்டவும்',
    listening: 'கேட்கிறது...',
    activeMicNotice: 'மைக் ஆன் செய்யப்பட்டுள்ளது • தெளிவாகப் பேசவும்',
    tapToStop: 'நிறுத்த மீண்டும் தட்டவும்',
    transcriptLabel: 'நேரடி உரை (Transcript)',
    transcriptPlaceholder: 'நீங்கள் பேசும்போது வார்த்தைகள் இங்கு தோன்றும்...',
    clearTranscript: 'அழி',
    sampleSymptomHeader: 'அல்லது மாதிரி அறிகுறிகளைத் தேர்ந்தெடுக்கவும்:',
    sampleSymptoms: [
      {
        title: 'நெஞ்சு வலி (கடுமையானது)',
        text: 'நேற்று காலை முதல் நெஞ்சில் கடுமையான வலி உள்ளது. ஆழமாக மூச்சு விடும்போது வலி அதிகமாகிறது மற்றும் தலைசுற்றல் உள்ளது.',
      },
      {
        title: 'காய்ச்சல் மற்றும் இருமல்',
        text: '3 நாட்களாகக் கடுமையான காய்ச்சல் மற்றும் வறட்டு இருமல், மூச்சுத் திணறல் உள்ளது.',
      },
      {
        title: 'கால்களில் மரத்துப்போதல்',
        text: 'கடந்த 2 வாரங்களாக இரண்டு கால்களிலும் ஊசி குத்துவது போன்ற உணர்வும் மரத்துப்போதலும் உள்ளது.',
      },
    ],
    backBtn: 'பின்செல்',
    nextStepBtn: 'அடுத்த படி',

    uploadStepBadge: 'படி 2 / 2 • மருத்துவ ஆவணங்கள் ஸ்கேன்',
    uploadHeading: 'பழைய மருத்துவ ஆவணங்களைப் பதிவேற்றவும்',
    uploadSubheading: 'மருத்துவர் சீட்டுகள், இரத்தப் பரிசோதனை (HbA1c) அறிக்கைகளை ஏஐ பகுப்பாய்விற்குப் பதிவேற்றவும்.',
    dropzonePrompt: 'ஆவணப் படத்தை இங்கே தட்டவும் அல்லது இழுத்துப் போடவும்',
    dropzoneSubtext: 'JPEG, PNG அல்லது ஸ்கேன் செய்யப்பட்ட அறிக்கைகள்',
    changeFile: 'கோப்பை மாற்று',
    readyForOcr: 'OCRக்கு தயார்',
    noDocNotice: 'ஆவணம் கையில் இல்லையா?',
    noDocSubtext: 'மாதிரி இரத்தப் பரிசோதனை அறிக்கையைப் பயன்படுத்தவும் (HbA1c)',
    useSampleReportBtn: 'மாதிரி அறிக்கையைத் தேர்ந்தெடுக்கவும்',
    analyzeWithAiBtn: 'AI மூலம் பகுப்பாய்வு செய்க',

    processingHeading: 'மருத்துவத் தரவு உருவாக்கப்படுகிறது... ஜெமினி AI இயங்குகிறது...',
    processingSubheading: 'மருத்துவர் பார்வைக்காகக் குரல் மற்றும் அறிக்கைகள் ஒருங்கிணைக்கப்படுகின்றன...',
    processingStep1: 'முக்கிய அறிகுறி மற்றும் நேரத்தை வகைப்படுத்துதல்...',
    processingStep2: 'ஆய்வக அறிக்கையின் OCR டிஜிட்டல் மாற்றம்...',
    processingStep3: 'மருத்துவமனை தகவல் அமைப்பு (HIS) அறிக்கை தயாரித்தல்...',

    doctorViewTitle: 'மருத்துவமனை தகவல் அமைப்பு - மருத்துவர் பார்வை',
    doctorName: 'டாக்டர் அனன்யா சர்மா',
    priorityHigh: 'முன்னுரிமை: உயர்வானது (HIGH)',
    statusCheckedIn: 'நிலை: செக்-இன் முடிந்தது',
    card1Title: 'கட்டமைக்கப்பட்ட AI வரலாறு (Structured AI History)',
    card1Badge: 'AI செயல்படுத்தப்பட்டது',
    patientAudioTranscript: 'நோயாளி குரல் பதிவு உரை',
    langVerified: 'சரிபார்க்கப்பட்ட குரல் பதிவு',
    extractedClinicalSchema: 'பிரித்தெடுக்கப்பட்ட மருத்துவத் திட்டம்',
    confidenceHigh: 'உயர் துல்லியம் (99.4%)',
    card2Title: 'டிஜிட்டல் மயமாக்கப்பட்ட ஆவணங்கள்',
    card2Badge: 'OCR சரிபார்க்கப்பட்டது',
    viewDocument: 'ஆவணத்தைப் பார்',
    labValuesExtracted: 'ஆய்வக முடிவுகள் (Lab Values)',
    recordSource: 'சிட்டி ஜெனரல் நோயறிதல் அறிக்கை. ஸ்கேன் நாள்: 2023-11-20.',
    sessionTimer: 'அமர்வு நேரம்',
    rejectRecord: 'நிராகரி',
    completeConsultation: 'ஆலோசனையை முடிக்கவும்',
  },

  te: {
    appTitle: 'మెడికియోస్క్',
    appSubtitle: 'స్వయం-సేవ ఆరోగ్య తనిఖీ కేంద్రం',
    systemsOnline: 'సిస్టమ్స్ ఆన్‌లైన్',
    stationName: 'స్టేషన్ #04 • ఓపీడీ ట్రయాజ్',
    changeLanguage: 'భాషను మార్చండి',
    selectLanguage: 'మీ ప్రాధాన్య భాషను ఎంచుకోండి',
    audioPromptBtn: 'తెలుగులో వినండి',
    failsafeHint: 'డెమోను దాటవేయడానికి ఎప్పుడైనా మెడికియోస్క్ లోగోపై డబుల్ క్లిక్ చేయండి',
    stepCheckIn: 'చెక్-ఇన్',
    stepVoice: 'వాయిస్ లక్షణాలు',
    stepRecords: 'రికార్డుల ఓసీఆర్',
    stepProcessing: 'ఏఐ ప్రాసెసింగ్',
    stepDoctorView: 'డాక్టర్ వీక్షణ',

    welcomeBadge: 'AI-ఆధారిత క్లినికల్ ఇన్‌టేక్',
    welcomeHeading: 'మెడికియోస్క్ సెల్ఫ్ చెక్-ఇన్',
    welcomeSubheading: 'వైద్యుడిని కలిసే ముందు త్వరిత క్లినికల్ నమోదు మరియు లక్షణాల అంచనా.',
    abhaInputLabel: 'ఆభా (ABHA) ఐడీ లేదా మొబైల్ నంబర్ నమోదు చేయండి',
    abhaPlaceholder: 'ఉదా., 91-XXXX-XXXX లేదా ABHA-8829-1022-3110',
    quickFill: 'టెస్టింగ్ కొరకు వేగంగా నింపండి:',
    startIntakeBtn: 'క్లినికల్ ఇన్‌టేక్ ప్రారంభించండి',
    trustAbdm: 'ABDM ఆమోదిత',
    trustVoice: '10+ భారతీయ భాషలు',
    trustTriage: 'ప్రాధాన్యతా ట్రయాజ్',

    voiceStepBadge: 'దశ 1 / 2 • వాయిస్ ద్వారా లక్షణాలు',
    voiceHeading: 'మీ ఆరోగ్య సమస్యలను వివరించండి',
    voiceSubheading: 'మైక్రోఫోన్‌ను నొక్కండి మరియు మీ స్వంత భాషలో మీకు ఎలా అనిపిస్తుందో చెప్పండి.',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    listening: 'వింటున్నది...',
    activeMicNotice: 'మైక్ ఆన్‌లో ఉంది • దయచేసి స్పష్టంగా మాట్లాడండి',
    tapToStop: 'ఆపడానికి మళ్లీ నొక్కండి',
    transcriptLabel: 'ప్రత్యక్ష వచనం (Transcript)',
    transcriptPlaceholder: 'మీరు మాట్లాడేటప్పుడు పదాలు ఇక్కడ కనిపిస్తాయి...',
    clearTranscript: 'తుడిచివేయి',
    sampleSymptomHeader: 'లేదా డెమో కొరకు లక్షణాన్ని ఎంచుకోండి:',
    sampleSymptoms: [
      {
        title: 'ఛాతీ నొప్పి (తీవ్రమైన)',
        text: 'నిన్న ఉదయం నుండి నా ఛాతీలో తీవ్రమైన నొప్పిగా ఉంది. లోతుగా శ్వాస తీసుకున్నప్పుడు నొప్పి ఎక్కువవుతోంది మరియు చాలా తలతిరుగుతోంది.',
      },
      {
        title: 'జ్వరం మరియు దగ్గు',
        text: '3 రోజులుగా తీవ్ర జ్వరం, పొడి దగ్గు మరియు మెట్లు ఎక్కేటప్పుడు ఆయాసంగా ఉంది.',
      },
      {
        title: 'పాదాలలో తిమ్మిరి',
        text: 'గత 2 వారాలుగా రెండు పాదాలలో తిమ్మిరి మరియు స్పర్శ కోల్పోయినట్లు అనిపిస్తోంది.',
      },
    ],
    backBtn: 'వెనుకకు',
    nextStepBtn: 'తదుపరి దశ',

    uploadStepBadge: 'దశ 2 / 2 • మెడికల్ రికార్డ్స్ ఓసీఆర్',
    uploadHeading: 'పాత వైద్య రికార్డులను అప్‌లోడ్ చేయండి',
    uploadSubheading: 'జెమిని AI డిజిటలైజేషన్ కొరకు పాత ప్రిస్క్రిప్షన్లు లేదా ల్యాబ్ నివేదికలను (HbA1c) అప్‌లోడ్ చేయండి.',
    dropzonePrompt: 'పత్రం చిత్రాన్ని ఇక్కడ నొక్కండి లేదా లాగండి',
    dropzoneSubtext: 'JPEG, PNG లేదా స్కాన్ చేసిన ల్యాబ్ నివేదికలు',
    changeFile: 'ఫైల్ మార్చండి',
    readyForOcr: 'OCR కొరకు సిద్ధం',
    noDocNotice: 'పత్రం అందుబాటులో లేదా?',
    noDocSubtext: 'నమూనా ల్యాబ్ నివేదికను ఉపయోగించండి (HbA1c)',
    useSampleReportBtn: 'నమూనా నివేదికను ఎంచుకోండి',
    analyzeWithAiBtn: 'AI తో విశ్లేషించండి',

    processingHeading: 'క్లినికల్ సమాచారం సిద్ధమవుతోంది... జెమిని AI పని చేస్తోంది...',
    processingSubheading: 'డాక్టర్ పరిశీలన కోసం వాయిస్ మరియు నివేదికలను సమన్వయం చేస్తోంది...',
    processingStep1: 'ప్రధాన సమస్య మరియు సమయ విశ్లేషణ...',
    processingStep2: 'ల్యాబ్ నివేదిక యొక్క OCR డిజిటలైజేషన్...',
    processingStep3: 'హాస్పిటల్ ఇన్ఫర్మేషన్ సిస్టమ్ నివేదిక తయారీ...',

    doctorViewTitle: 'హాస్పిటల్ ఇన్ఫర్మేషన్ సిస్టమ్ - డాక్టర్ వీక్షణ',
    doctorName: 'డా. అనన్య శర్మ',
    priorityHigh: 'ప్రాధాన్యత: అత్యధికం (HIGH)',
    statusCheckedIn: 'స్థితి: చెక్-ఇన్ పూర్తయింది',
    card1Title: 'నిర్మాణాత్మక AI చరిత్ర (Structured AI History)',
    card1Badge: 'AI ప్రాసెస్ చేయబడింది',
    patientAudioTranscript: 'రోగి ఆడియో రాతపూర్వక రూపం',
    langVerified: 'ధృవీకరించబడిన వాయిస్ ఇన్‌టేక్',
    extractedClinicalSchema: 'సంగ్రహించిన క్లినికల్ స్కీమా',
    confidenceHigh: 'అత్యధిక ఖచ్చితత్వం (99.4%)',
    card2Title: 'డిజిటలైజ్ చేయబడిన రికార్డులు',
    card2Badge: 'OCR ధృవీకరించబడింది',
    viewDocument: 'పత్రాన్ని వీక్షించండి',
    labValuesExtracted: 'ల్యాబ్ పరీక్ష ఫలితాలు (Lab Values)',
    recordSource: 'సిటీ జనరల్ డయాగ్నోస్టిక్స్ రిపోర్ట్. స్కాన్ తేదీ: 2023-11-20.',
    sessionTimer: 'సెషన్ సమయం',
    rejectRecord: 'తిరస్కరించండి',
    completeConsultation: 'సంప్రదింపును పూర్తి చేయండి',
  },

  bn: {
    appTitle: 'মেডিকিয়স্ক',
    appSubtitle: 'স্বয়ংক্রিয় স্বাস্থ্য পরিষেবা কেন্দ্র',
    systemsOnline: 'সিস্টেম অনলাইন',
    stationName: 'স্টেশন #০৪ • ওপিডি ট্রায়াজ',
    changeLanguage: 'ভাষা পরিবর্তন করুন',
    selectLanguage: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
    audioPromptBtn: 'বাংলায় শুনুন',
    failsafeHint: 'ডেমো বাইপাস করতে মেডিকিয়স্ক লোগোতে ডাবল ক্লিক করুন',
    stepCheckIn: 'চেক-ইন',
    stepVoice: 'ভয়েস লক্ষণ',
    stepRecords: 'নথি ওসিআর',
    stepProcessing: 'এআই বিশ্লেষণ',
    stepDoctorView: 'ডাক্তার ভিউ',

    welcomeBadge: 'এআই-চালিত ক্লিনিক্যাল ইনটেক',
    welcomeHeading: 'মেডিকিয়স্ক স্ব-চেক-ইন',
    welcomeSubheading: 'ডাক্তারের কাছে যাওয়ার আগে দ্রুত ক্লিনিক্যাল নিবন্ধন ও লক্ষণ মূল্যায়ন।',
    abhaInputLabel: 'আভা (ABHA) আইডি বা মোবাইল নম্বর লিখুন',
    abhaPlaceholder: 'যেমন: 91-XXXX-XXXX বা ABHA-8829-1022-3110',
    quickFill: 'পরীক্ষার জন্য পূরণ করুন:',
    startIntakeBtn: 'ক্লিনিক্যাল ইনটেক শুরু করুন',
    trustAbdm: 'ABDM অনুমোদিত',
    trustVoice: '১০+ ভারতীয় ভাষা',
    trustTriage: 'অগ্রাধিকার ট্রায়াজ',

    voiceStepBadge: 'ধাপ ১ / ২ • ভয়েস লক্ষণ রেকর্ড',
    voiceHeading: 'আপনার উপসর্গের বর্ণনা দিন',
    voiceSubheading: 'মাইক্রোফোনে ট্যাপ করুন এবং নিজের ভাষায় আপনার সমস্যা জানান।',
    tapToSpeak: 'কথা বলতে ট্যাপ করুন',
    listening: 'শুনছি...',
    activeMicNotice: 'মাইক চালু আছে • পরিষ্কারভাবে কথা বলুন',
    tapToStop: 'থামাতে আবার ট্যাপ করুন',
    transcriptLabel: 'সরাসরি প্রতিলিপি (Transcript)',
    transcriptPlaceholder: 'আপনি কথা বলার সাথে সাথে এখানে শব্দ দেখা যাবে...',
    clearTranscript: 'মুছে ফেলুন',
    sampleSymptomHeader: 'অথবা ডেমোর জন্য লক্ষণ নির্বাচন করুন:',
    sampleSymptoms: [
      {
        title: 'বুকে ব্যথা (তীব্র)',
        text: 'গতকাল সকাল থেকে আমার বুকে তীব্র ব্যথা হচ্ছে। গভীর শ্বাস নিলে ব্যথা বাড়ে এবং মাথা ঘোরে।',
      },
      {
        title: 'জ্বর এবং কাশি',
        text: '৩ দিন ধরে তীব্র জ্বর, শুকনো কাশি ও সিঁড়ি ওঠার সময় শ্বাসকষ্ট হচ্ছে।',
      },
      {
        title: 'পায়ে অসাড়তা',
        text: 'গত ২ সপ্তাহ ধরে দুই পায়ে ঝিঁঝিঁ ধরা এবং অসাড় ভাব অনুভব করছি।',
      },
    ],
    backBtn: 'পিছনে',
    nextStepBtn: 'পরবর্তী ধাপ',

    uploadStepBadge: 'ধাপ ২ / ২ • মেডিকেল রিপোর্ট ওসিআর',
    uploadHeading: 'পুরানো মেডিকেল রিপোর্ট আপলোড করুন',
    uploadSubheading: 'জেমিনি এআই বিশ্লেষণের জন্য প্রেসক্রিপশন বা ল্যাব রিপোর্ট (HbA1c) আপলোড করুন।',
    dropzonePrompt: 'নথির ছবি এখানে ট্যাপ করুন বা টেনে আনুন',
    dropzoneSubtext: 'JPEG, PNG বা স্ক্যান করা রিপোর্ট সমর্থিত',
    changeFile: 'ফাইল পরিবর্তন করুন',
    readyForOcr: 'OCR এর জন্য প্রস্তুত',
    noDocNotice: 'কাছে নথি নেই?',
    noDocSubtext: 'নমুনা ল্যাব রিপোর্ট ব্যবহার করুন (HbA1c)',
    useSampleReportBtn: 'নমুনা রিপোর্ট বেছে নিন',
    analyzeWithAiBtn: 'AI দিয়ে বিশ্লেষণ করুন',

    processingHeading: 'ক্লিনিক্যাল ডেটা তৈরি হচ্ছে... জেমিনি এআই সক্রিয়...',
    processingSubheading: 'ডাক্তারের দেখার জন্য অডিও ও রিপোর্টের সমন্বয় করা হচ্ছে...',
    processingStep1: 'প্রধান সমস্যা এবং সময়ের শ্রেণিবিন্যাস...',
    processingStep2: 'মেটাবলিক ল্যাব প্যানেলের ওসিআর রূপান্তর...',
    processingStep3: 'হাসপাতাল তথ্য ব্যবস্থা (HIS) রিপোর্ট প্রস্তুত করা হচ্ছে...',

    doctorViewTitle: 'হাসপাতাল তথ্য ব্যবস্থা - ডাক্তার ভিউ',
    doctorName: 'ডাঃ অনন্যা শর্মা',
    priorityHigh: 'অগ্রাধিকার: উচ্চ (HIGH)',
    statusCheckedIn: 'স্থিতি: চেক-ইন সম্পন্ন',
    card1Title: 'কাঠামোগত এআই ইতিহাস (Structured AI History)',
    card1Badge: 'এআই প্রক্রিয়াকৃত',
    patientAudioTranscript: 'রোগীর অডিও প্রতিলিপি',
    langVerified: 'যাচাইকৃত ভয়েস ইনটেক',
    extractedClinicalSchema: 'নিষ্কাশিত ক্লিনিক্যাল স্কিমা',
    confidenceHigh: 'উচ্চ নির্ভুলতা (৯৯.৪%)',
    card2Title: 'ডিজিটাইজড রেকর্ড (Digitized Records)',
    card2Badge: 'ওসিআর যাচাইকৃত',
    viewDocument: 'নথি দেখুন',
    labValuesExtracted: 'ল্যাব পরীক্ষার মান (Lab Values)',
    recordSource: 'সিটি জেনারেল ডায়াগনস্টিক রিপোর্ট। স্ক্যানের তারিখ: 2023-11-20.',
    sessionTimer: 'সেশন সময়',
    rejectRecord: 'প্রত্যাখ্যান করুন',
    completeConsultation: 'পরামর্শ সম্পন্ন করুন',
  },

  kn: {
    appTitle: 'ಮೆಡಿಕಿಯೋಸ್ಕ್',
    appSubtitle: 'ಸ್ವಯಂ ಸೇವಾ ಆರೋಗ್ಯ ತಪಾಸಣಾ ಕೇಂದ್ರ',
    systemsOnline: 'ವ್ಯವಸ್ಥೆ ಸಕ್ರಿಯವಾಗಿದೆ',
    stationName: 'ನಿಲ್ದಾಣ #04 • ಒಪಿಡಿ ಟ್ರಯೇಜ್',
    changeLanguage: 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
    selectLanguage: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    audioPromptBtn: 'ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ',
    failsafeHint: 'ಡೆಮೊ ಬೈಪಾಸ್ ಮಾಡಲು ಮೆಡಿಕಿಯೋಸ್ಕ್ ಲೋಗೋ ಮೇಲೆ ಡಬಲ್-ಕ್ಲಿಕ್ ಮಾಡಿ',
    stepCheckIn: 'ಚೆಕ್-ಇನ್',
    stepVoice: 'ಧ್ವನಿ ಲಕ್ಷಣಗಳು',
    stepRecords: 'ದಾಖಲೆಗಳ ಓಸಿಆರ್',
    stepProcessing: 'ಎಐ ಪ್ರಕ್ರಿಯೆ',
    stepDoctorView: 'ವೈದ್ಯರ ವೀಕ್ಷಣೆ',

    welcomeBadge: 'ಎಐ-ಚಾಲಿತ ಕ್ಲಿನಿಕಲ್ ಇಂಟೇಕ್',
    welcomeHeading: 'ಮೆಡಿಕಿಯೋಸ್ಕ್ ಸೆಲ್ಫ್ ಚೆಕ್-ಇನ್',
    welcomeSubheading: 'ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗುವ ಮುನ್ನ ತ್ವರಿತ ಕ್ಲಿನಿಕಲ್ ನೋಂದಣಿ ಮತ್ತು ಲಕ್ಷಣಗಳ ಮೌಲ್ಯಮಾಪನ.',
    abhaInputLabel: 'ಆಭಾ (ABHA) ಐಡಿ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    abhaPlaceholder: 'ಉದಾ: 91-XXXX-XXXX ಅಥವಾ ABHA-8829-1022-3110',
    quickFill: 'ಪರೀಕ್ಷೆಗಾಗಿ ಭರ್ತಿ ಮಾಡಿ:',
    startIntakeBtn: 'ಕ್ಲಿನಿಕಲ್ ತಪಾಸಣೆ ಪ್ರಾರಂಭಿಸಿ',
    trustAbdm: 'ABDM ಅನುಮೋದಿತ',
    trustVoice: '10+ ಭಾರತೀಯ ಭಾಷೆಗಳು',
    trustTriage: 'ಆದ್ಯತಾ ಟ್ರಯೇಜ್',

    voiceStepBadge: 'ಹಂತ 1 / 2 • ಧ್ವನಿ ಮೂಲಕ ಲಕ್ಷಣಗಳ ದಾಖಲಾತಿ',
    voiceHeading: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ವಿವರಿಸಿ',
    voiceSubheading: 'ಮೈಕ್ರೊಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿ.',
    tapToSpeak: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...',
    activeMicNotice: 'ಮೈಕ್ ಚಾಲನೆಯಲ್ಲಿದೆ • ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ',
    tapToStop: 'ನಿಲ್ಲಿಸಲು ಮತ್ತೆ ಟ್ಯಾಪ್ ಮಾಡಿ',
    transcriptLabel: 'ನೇರ ಪಠ್ಯ (Transcript)',
    transcriptPlaceholder: 'ನೀವು ಮಾತನಾಡಿದಂತೆ ಪದಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ...',
    clearTranscript: 'ಅಳಿಸಿ',
    sampleSymptomHeader: 'ಅಥವಾ ಡೆಮೊಗಾಗಿ ಲಕ್ಷಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
    sampleSymptoms: [
      {
        title: 'ಎದೆ ನೋವು (ತೀವ್ರ)',
        text: 'ನಿನ್ನೆ ಮುಂಜಾನೆಯಿಂದ ಎದೆಯಲ್ಲಿ ತೀವ್ರ ನೋವು ಕಾಣಿಸಿಕೊಂಡಿದೆ. ದೀರ್ಘ ಉಸಿರಾಡಿದಾಗ ನೋವು ಹೆಚ್ಚಾಗುತ್ತದೆ ಮತ್ತು ತಲೆಸುತ್ತು ಬರುತ್ತಿದೆ.',
      },
      {
        title: 'ಜ್ವರ ಮತ್ತು ಕೆಮ್ಮು',
        text: '3 ದಿನಗಳಿಂದ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ಒಣ ಕೆಮ್ಮು, ಮೆಟ್ಟಿಲು ಹತ್ತುವಾಗ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ.',
      },
      {
        title: 'ಪಾದಗಳಲ್ಲಿ ಮರಗಟ್ಟುವಿಕೆ',
        text: 'ಕಳೆದ 2 ವಾರಗಳಿಂದ ಎರಡೂ ಪಾದಗಳಲ್ಲಿ ಮರಗಟ್ಟುವಿಕೆ ಮತ್ತು ಜುಮ್ಮೆನಿಸುವಿಕೆ ಇದೆ.',
      },
    ],
    backBtn: 'ಹಿಂದೆ',
    nextStepBtn: 'ಮುಂದಿನ ಹಂತ',

    uploadStepBadge: 'ಹಂತ 2 / 2 • ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳ ಓಸಿಆರ್',
    uploadHeading: 'ಹಳೆಯ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    uploadSubheading: 'ಜೆಮಿನಿ ಎಐ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಅಥವಾ ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    dropzonePrompt: 'ದಾಖಲೆಯ ಫೋಟೋವನ್ನು ಇಲ್ಲಿ ಟ್ಯಾಪ್ ಮಾಡಿ ಅಥವಾ ಡ್ರ್ಯಾಗ್ ಮಾಡಿ',
    dropzoneSubtext: 'JPEG, PNG ಅಥವಾ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ವರದಿಗಳು',
    changeFile: 'ಫೈಲ್ ಬದಲಾಯಿಸಿ',
    readyForOcr: 'OCR ಗೆ ಸಿದ್ಧವಾಗಿದೆ',
    noDocNotice: 'ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲವೇ?',
    noDocSubtext: 'ಮಾದರಿ ಲ್ಯಾಬ್ ವರದಿಯನ್ನು ಬಳಸಿ (HbA1c)',
    useSampleReportBtn: 'ಮಾದರಿ ವರದಿ ಆಯ್ಕೆಮಾಡಿ',
    analyzeWithAiBtn: 'AI ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಿ',

    processingHeading: 'ಕ್ಲಿನಿಕಲ್ ಡೇಟಾ ತಯಾರಾಗುತ್ತಿದೆ... ಜೆಮಿನಿ ಎಐ ಸಕ್ರಿಯವಾಗಿದೆ...',
    processingSubheading: 'ವೈದ್ಯರ ವೀಕ್ಷಣೆಗಾಗಿ ಧ್ವನಿ ಮತ್ತು ವರದಿಗಳ ಸಂಯೋಜನೆ ನಡೆಯುತ್ತಿದೆ...',
    processingStep1: 'ಮುಖ್ಯ ಸಮಸ್ಯೆ ಮತ್ತು ಸಮಯದ ವಿಶ್ಲೇಷಣೆ...',
    processingStep2: 'ಮೆಟಾಬಾಲಿಕ್ ಲ್ಯಾಬ್ ವರದಿಯ ಓಸಿಆರ್ ಡಿಜಿಟಲೀಕರಣ...',
    processingStep3: 'ಆಸ್ಪತ್ರೆ ಮಾಹಿತಿ ವ್ಯವಸ್ಥೆ (HIS) ವರದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',

    doctorViewTitle: 'ಆಸ್ಪತ್ರೆ ಮಾಹಿತಿ ವ್ಯವಸ್ಥೆ - ವೈದ್ಯರ ವೀಕ್ಷಣೆ',
    doctorName: 'ಡಾ. ಅನನ್ಯಾ ಶರ್ಮಾ',
    priorityHigh: 'ಆದ್ಯತೆ: ಅತ್ಯುನ್ನತ (HIGH)',
    statusCheckedIn: 'ಸ್ಥಿತಿ: ಚೆಕ್-ಇನ್ ಪೂರ್ಣಗೊಂಡಿದೆ',
    card1Title: 'ರಚನಾತ್ಮಕ ಎಐ ಇತಿಹಾಸ (Structured AI History)',
    card1Badge: 'ಎಐ ಸಂಸ್ಕರಿಸಲಾಗಿದೆ',
    patientAudioTranscript: 'ರೋಗಿಯ ಧ್ವನಿ ಪಠ್ಯ',
    langVerified: 'ದೃಢೀಕರಿಸಿದ ಧ್ವನಿ ಇಂಟೇಕ್',
    extractedClinicalSchema: 'ಹೊರತೆಗೆಯಲಾದ ಕ್ಲಿನಿಕಲ್ ಸ್ಕೀಮಾ',
    confidenceHigh: 'ಉನ್ನತ ನಿಖರತೆ (99.4%)',
    card2Title: 'ಡಿಜಿಟಲೀಕೃತ ದಾಖಲೆಗಳು',
    card2Badge: 'ಓಸಿಆರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    viewDocument: 'ದಾಖಲೆ ವೀಕ್ಷಿಸಿ',
    labValuesExtracted: 'ಲ್ಯಾಬ್ ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳು (Lab Values)',
    recordSource: 'ಸಿಟಿ ಜನರಲ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್ ವರದಿ. ಸ್ಕ್ಯಾನ್ ದಿನಾಂಕ: 2023-11-20.',
    sessionTimer: 'ಅಧಿವೇಶನದ ಸಮಯ',
    rejectRecord: 'ತಿರಸ್ಕರಿಸಿ',
    completeConsultation: 'ಸಮಾಲೋಚನೆ ಪೂರ್ಣಗೊಳಿಸಿ',
  },

  gu: {
    appTitle: 'મેડીકિયોસ્ક',
    appSubtitle: 'સ્વયં-સેવા આરોગ્ય તપાસ કેન્દ્ર',
    systemsOnline: 'સિસ્ટમ્સ ઓનલાઇન',
    stationName: 'સ્ટેશન #04 • ઓપીડી ટ્રાયેજ',
    changeLanguage: 'ભાષા બદલો',
    selectLanguage: 'તમારી પસંદગીની ભાષા પસંદ કરો',
    audioPromptBtn: 'ગુજરાતીમાં સાંભળો',
    failsafeHint: 'ડેમો બાયપાસ કરવા માટે ગમે ત્યારે મેડીકિયોસ્ક લોગો પર ડબલ-ક્લિક કરો',
    stepCheckIn: 'ચેક-ઇન',
    stepVoice: 'અવાજથી લક્ષણો',
    stepRecords: 'દસ્તાવેજો ઓસીઆર',
    stepProcessing: 'એઆઈ પ્રક્રિયા',
    stepDoctorView: 'ડોક્ટર વ્યુ',

    welcomeBadge: 'AI-સંચાલિત ક્લિનિકલ ઇન્ટેક',
    welcomeHeading: 'મેડીકિયોસ્ક સેલ્ફ ચેક-ઇન',
    welcomeSubheading: 'ડોક્ટરને મળતા પહેલા ઝડપી ક્લિનિકલ નોંધણી અને લક્ષણોનું મૂલ્યાંકન.',
    abhaInputLabel: 'આભા (ABHA) આઈડી અથવા મોબાઈલ નંબર દાખલ કરો',
    abhaPlaceholder: 'દા.ત., 91-XXXX-XXXX અથવા ABHA-8829-1022-3110',
    quickFill: 'ટેસ્ટિંગ માટે ઝડપથી ભરો:',
    startIntakeBtn: 'ક્લિનિકલ તપાસ શરૂ કરો',
    trustAbdm: 'ABDM સુસંગત',
    trustVoice: '10+ ભારતીય ભાષાઓ',
    trustTriage: 'પ્રાથમિકતા ટ્રાયેજ',

    voiceStepBadge: 'પગલું 1 / 2 • અવાજ દ્વારા લક્ષણો નોંધણી',
    voiceHeading: 'તમારા લક્ષણોનું વર્ણન કરો',
    voiceSubheading: 'માઇક્રોફોન પર ટેપ કરો અને તમારી પોતાની ભાષામાં જણાવો કે તમને શું તકલીફ છે.',
    tapToSpeak: 'બોલવા માટે ટેપ કરો',
    listening: 'સાંભળી રહ્યા છીએ...',
    activeMicNotice: 'માઇક ચાલુ છે • સ્પષ્ટ બોલો',
    tapToStop: 'રોકવા માટે ફરી ટેપ કરો',
    transcriptLabel: 'લાઇવ લખાણ (Transcript)',
    transcriptPlaceholder: 'તમે બોલશો તેમ શબ્દો અહીં દેખાશે...',
    clearTranscript: 'સાફ કરો',
    sampleSymptomHeader: 'અથવા ડેમો માટે લક્ષણ પસંદ કરો:',
    sampleSymptoms: [
      {
        title: 'છાતીમાં દુખાવો (તીવ્ર)',
        text: 'ગઈકાલ સવારથી મારી છાતીમાં તીવ્ર દુખાવો થઈ રહ્યો છે. ઊંડો શ્વાસ લેવાથી વધે છે અને ખૂબ ચક્કર આવે છે.',
      },
      {
        title: 'તાવ અને ઉધરસ',
        text: '3 દિવસથી સખત તાવ, સૂકી ઉધરસ અને સીડી ચડતી વખતે શ્વાસ ચડે છે.',
      },
      {
        title: 'પગમાં ખાલી ચડવી',
        text: 'છેલ્લા 2 અઠવાડિયાથી બંને પગમાં ઝણઝણાટી અને ખાલી ચડવાની સમસ્યા છે.',
      },
    ],
    backBtn: 'પાછા જાઓ',
    nextStepBtn: 'આગળનું પગલું',

    uploadStepBadge: 'પગલું 2 / 2 • મેડિકલ રેકોર્ડ્સ ઓસીઆર',
    uploadHeading: 'જૂના મેડિકલ રેકોર્ડ્સ અપલોડ કરો',
    uploadSubheading: 'જેમિની એઆઈ વિશ્લેષણ માટે જૂના પ્રિસ્ક્રિપ્શન અથવા લેબ રિપોર્ટ (HbA1c) અપલોડ કરો.',
    dropzonePrompt: 'દસ્તાવેજનો ફોટો અહીં ટેપ કરો અથવા ખેંચો',
    dropzoneSubtext: 'JPEG, PNG અથવા સ્કેન કરેલા રિપોર્ટ',
    changeFile: 'ફાઇલ બદલો',
    readyForOcr: 'OCR માટે તૈયાર',
    noDocNotice: 'દસ્તાવેજ ઉપલબ્ધ નથી?',
    noDocSubtext: 'નમૂના લેબ રિપોર્ટનો ઉપયોગ કરો (HbA1c)',
    useSampleReportBtn: 'નમૂના રિપોર્ટ પસંદ કરો',
    analyzeWithAiBtn: 'AI સાથે વિશ્લેષણ કરો',

    processingHeading: 'ક્લિનિકલ ડેટા તૈયાર થઈ રહ્યો છે... જેમિની એઆઈ સક્રિય...',
    processingSubheading: 'ડોક્ટર તપાસ માટે ઓડિયો અને રિપોર્ટ્સનું સંકલન થઈ રહ્યું છે...',
    processingStep1: 'મુખ્ય સમસ્યા અને સમયનું વિશ્લેષણ...',
    processingStep2: 'લેબ રિપોર્ટનું ઓસીઆર ડિજિટાઇઝેશન...',
    processingStep3: 'હોસ્પિટલ ઇન્ફોર્મેશન સિસ્ટમ (HIS) રિપોર્ટ તૈયાર થઈ રહ્યો છે...',

    doctorViewTitle: 'હોસ્પિટલ ઇન્ફોર્મેશન સિસ્ટમ - ડોક્ટર વ્યુ',
    doctorName: 'ડો. અનન્યા શર્મા',
    priorityHigh: 'પ્રાથમિકતા: ઉચ્ચ (HIGH)',
    statusCheckedIn: 'સ્થિતિ: ચેક-ઇન પૂર્ણ',
    card1Title: 'સ્ટ્રક્ચર્ડ એઆઈ હિસ્ટ્રી (Structured AI History)',
    card1Badge: 'એઆઈ પ્રોસેસ્ડ',
    patientAudioTranscript: 'દર્દીનો ઓડિયો લખાણ',
    langVerified: 'ચકાસાયેલ વોઇસ ઇન્ટેક',
    extractedClinicalSchema: 'તારવેલી ક્લિનિકલ સ્કીમા',
    confidenceHigh: 'ઉચ્ચ ચોકસાઈ (99.4%)',
    card2Title: 'ડિજિટાઇઝ્ડ રેકોર્ડ્સ',
    card2Badge: 'ઓસીઆર ચકાસાયેલ',
    viewDocument: 'દસ્તાવેજ જુઓ',
    labValuesExtracted: 'લેબ ટેસ્ટ પરિણામો (Lab Values)',
    recordSource: 'સિટી જનરલ ડાયગ્નોસ્ટિક્સ રિપોર્ટ. સ્કેન તારીખ: 2023-11-20.',
    sessionTimer: 'સત્ર સમય',
    rejectRecord: 'અસ્વીકાર કરો',
    completeConsultation: 'પરામર્શ પૂર્ણ કરો',
  },

  ml: {
    appTitle: 'മെഡികിയോസ്ക്',
    appSubtitle: 'സ്വയം സേവന ആരോഗ്യ കേന്ദ്രം',
    systemsOnline: 'സിസ്റ്റം സജീവം',
    stationName: 'സ്റ്റേഷൻ #04 • ഒപിഡി ട്രയേജ്',
    changeLanguage: 'ഭാഷ മാറ്റുക',
    selectLanguage: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    audioPromptBtn: 'മലയാളത്തിൽ കേൾക്കുക',
    failsafeHint: 'ഡെമോ ഒഴിവാക്കാൻ മെഡികിയോസ്ക് ലോഗോയിൽ രണ്ടുതവണ ടാപ്പ് ചെയ്യുക',
    stepCheckIn: 'ചെക്ക്-ഇൻ',
    stepVoice: 'ശബ്ദ ലക്ഷണങ്ങൾ',
    stepRecords: 'രേഖകൾ ഒസിആർ',
    stepProcessing: 'എഐ പ്രക്രിയ',
    stepDoctorView: 'ഡോക്ടർ കാഴ്ച്ച',

    welcomeBadge: 'AI-പവർഡ് ക്ലിനിക്കൽ ഇൻടേക്ക്',
    welcomeHeading: 'മെഡികിയോസ്ക് സെൽഫ് ചെക്ക്-ഇൻ',
    welcomeSubheading: 'ഡോക്ടറെ കാണുന്നതിന് മുമ്പുള്ള വേഗത്തിലുള്ള ക്ലിനിക്കൽ രജിസ്ട്രേഷനും ലക്ഷണ വിലയിരുത്തലും.',
    abhaInputLabel: 'ആഭ (ABHA) ഐഡിയോ മൊബൈൽ നമ്പറോ നൽകുക',
    abhaPlaceholder: 'ഉദാ: 91-XXXX-XXXX അല്ലെങ്കിൽ ABHA-8829-1022-3110',
    quickFill: 'പരിശോധനയ്ക്കായി പൂരിപ്പിക്കുക:',
    startIntakeBtn: 'ക്ലിനിക്കൽ ഇൻടേക്ക് ആരംഭിക്കുക',
    trustAbdm: 'ABDM അംഗീകൃത',
    trustVoice: '10+ ഇന്ത്യൻ ഭാഷകൾ',
    trustTriage: 'മുൻഗണനാ ട്രയേജ്',

    voiceStepBadge: 'ഘട്ടം 1 / 2 • ശബ്ദത്തിലൂടെ ലക്ഷണങ്ങൾ രേഖപ്പെടുത്തുക',
    voiceHeading: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിവരിക്കുക',
    voiceSubheading: 'മൈക്രോഫോണിൽ ടാപ്പ് ചെയ്ത് നിങ്ങളുടെ സ്വന്തം ഭാഷയിൽ അനുഭവപ്പെടുന്ന അസ്വസ്ഥതകൾ പറയുക.',
    tapToSpeak: 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക',
    listening: 'കേൾക്കുന്നു...',
    activeMicNotice: 'മൈക്ക് ഓണാണ് • ദയവായി വ്യക്തമായി സംസാരിക്കുക',
    tapToStop: 'നിർത്താൻ വീണ്ടും ടാപ്പ് ചെയ്യുക',
    transcriptLabel: 'തത്സമയ വാചകം (Transcript)',
    transcriptPlaceholder: 'നിങ്ങൾ സംസാരിക്കുമ്പോൾ വാക്കുകൾ ഇവിടെ ദൃശ്യമാകും...',
    clearTranscript: 'മായ്ക്കുക',
    sampleSymptomHeader: 'അല്ലെങ്കിൽ മാതൃകാ ലക്ഷണം തിരഞ്ഞെടുക്കുക:',
    sampleSymptoms: [
      {
        title: 'നെഞ്ചുവേദന (തീവ്രമായ)',
        text: 'ഇന്നലെ രാവിലെ മുതൽ നെഞ്ചിൽ കഠിനമായ വേദനയുണ്ട്. ദീർഘമായി ശ്വാസമെടുക്കുമ്പോൾ വേദന കൂടുന്നു, കടുത്ത തലകറക്കവുമുണ്ട്.',
      },
      {
        title: 'പനിയും ചുമയും',
        text: '3 ദിവസമായി കടുത്ത പനിയും വരണ്ട ചുമയും, പടികൾ കയറുമ്പോൾ ശ്വാസതടസ്സവും ഉണ്ട്.',
      },
      {
        title: 'കാലുകളിൽ തരിപ്പ്',
        text: 'കഴിഞ്ഞ 2 ആഴ്ചയായി രണ്ട് കാലുകളിലും തരിപ്പും മരവിപ്പും അനുഭവപ്പെടുന്നു.',
      },
    ],
    backBtn: 'പിന്നോട്ട്',
    nextStepBtn: 'അടുത്ത ഘട്ടം',

    uploadStepBadge: 'ഘട്ടം 2 / 2 • മെഡിക്കൽ രേഖകൾ ഒസിആർ',
    uploadHeading: 'പഴയ മെഡിക്കൽ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക',
    uploadSubheading: 'ജെമിനി എഐ വിശകലനത്തിനായി കുറിപ്പടികളോ ലാബ് റിപ്പോർട്ടുകളോ (HbA1c) അപ്‌ലോഡ് ചെയ്യുക.',
    dropzonePrompt: 'രേഖകളുടെ ഫോട്ടോ ഇവിടെ ടാപ്പ് ചെയ്യുകയോ വലിച്ചിടുകയോ ചെയ്യുക',
    dropzoneSubtext: 'JPEG, PNG അല്ലെങ്കിൽ സ്കാൻ ചെയ്ത ലാബ് റിപ്പോർട്ടുകൾ',
    changeFile: 'ഫയൽ മാറ്റുക',
    readyForOcr: 'OCR ന് തയ്യാറാണ്',
    noDocNotice: 'രേഖകൾ ലഭ്യമല്ലേ?',
    noDocSubtext: 'മാതൃകാ ലാബ് റിപ്പോർട്ട് ഉപയോഗിക്കുക (HbA1c)',
    useSampleReportBtn: 'മാതൃകാ റിപ്പോർട്ട് തിരഞ്ഞെടുക്കുക',
    analyzeWithAiBtn: 'AI ഉപയോഗിച്ച് വിശകലനം ചെയ്യുക',

    processingHeading: 'ക്ലിനിക്കൽ ഡാറ്റ തയ്യാറാക്കുന്നു... ജെമിനി എഐ പ്രവർത്തിക്കുന്നു...',
    processingSubheading: 'ഡോക്ടർക്കായി വോയ്‌സും റിപ്പോർട്ടുകളും സമന്വയിപ്പിക്കുന്നു...',
    processingStep1: 'പ്രധാന രോഗലക്ഷണവും സമയവും വേർതിരിക്കുന്നു...',
    processingStep2: 'ലാബ് റിപ്പോർട്ടിന്റെ ഒസിആർ ഡിജിറ്റൈസേഷൻ...',
    processingStep3: 'ഹോസ്പിറ്റൽ ഇൻഫർമേഷൻ സിസ്റ്റം (HIS) റിപ്പോർട്ട് തയ്യാറാക്കുന്നു...',

    doctorViewTitle: 'ഹോസ്പിറ്റൽ ഇൻഫർമേഷൻ സിസ്റ്റം - ഡോക്ടർ കാഴ്ച്ച',
    doctorName: 'ഡോ. അനന്യ ശർമ്മ',
    priorityHigh: 'മുൻഗണന: ഉയർന്നത് (HIGH)',
    statusCheckedIn: 'നില: ചെക്ക്-ഇൻ പൂർത്തിയായി',
    card1Title: 'ഘടനാപരമായ എഐ ചരിത്രം (Structured AI History)',
    card1Badge: 'എഐ പ്രോസസ്സ് ചെയ്തു',
    patientAudioTranscript: 'രോഗിയുടെ ഓഡിയോ ലിഖിതരൂപം',
    langVerified: 'സ്ഥിരീകരിച്ച വോയ്സ് ഇൻടേക്ക്',
    extractedClinicalSchema: 'വേർതിരിച്ചെടുത്ത ക്ലിനിക്കൽ വിവരങ്ങൾ',
    confidenceHigh: 'ഉയർന്ന കൃത്യത (99.4%)',
    card2Title: 'ഡിജിറ്റൈസ് ചെയ്ത രേഖകൾ',
    card2Badge: 'ഒസിആർ സാധൂകരിച്ചു',
    viewDocument: 'രേഖ കാണുക',
    labValuesExtracted: 'ലാബ് പരിശോധനാ ഫലങ്ങൾ (Lab Values)',
    recordSource: 'സിറ്റി ജനറൽ ഡയഗ്നോസ്റ്റിക്സ് റിപ്പോർട്ട്. സ്കാൻ ചെയ്ത തീയതി: 2023-11-20.',
    sessionTimer: 'സെഷൻ സമയം',
    rejectRecord: 'നിരസിക്കുക',
    completeConsultation: 'കൺസൾട്ടേഷൻ പൂർത്തിയാക്കുക',
  },

  pa: {
    appTitle: 'ਮੈਡੀਕਿਓਸਕ',
    appSubtitle: 'ਸਵੈ-ਸੇਵਾ ਸਿਹਤ ਜਾਂਚ ਕੇਂਦਰ',
    systemsOnline: 'ਸਿਸਟਮ ਔਨਲਾਈਨ',
    stationName: 'ਸਟੇਸ਼ਨ #04 • ਓਪੀਡੀ ਟ੍ਰਾਈਏਜ',
    changeLanguage: 'ਭਾਸ਼ਾ ਬਦਲੋ',
    selectLanguage: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ',
    audioPromptBtn: 'ਪੰਜਾਬੀ ਵਿੱਚ ਸੁਣੋ',
    failsafeHint: 'ਡੈਮੋ ਬਾਈਪਾਸ ਕਰਨ ਲਈ ਮੈਡੀਕਿਓਸਕ ਲੋਗੋ ਤੇ ਡਬਲ-ਕਲਿੱਕ ਕਰੋ',
    stepCheckIn: 'ਚੈੱਕ-ਇਨ',
    stepVoice: 'ਆਵਾਜ਼ ਰਾਹੀਂ ਲੱਛਣ',
    stepRecords: 'ਦਸਤਾਵੇਜ਼ ਓਸੀਆਰ',
    stepProcessing: 'ਏਆਈ ਪ੍ਰੋਸੈਸਿੰਗ',
    stepDoctorView: 'ਡਾਕਟਰ ਦ੍ਰਿਸ਼',

    welcomeBadge: 'ਏਆਈ-ਸੰਚਾਲਿਤ ਕਲੀਨਿਕਲ ਇਨਟੇਕ',
    welcomeHeading: 'ਮੈਡੀਕਿਓਸਕ ਸਵੈ-ਚੈੱਕ-ਇਨ',
    welcomeSubheading: 'ਡਾਕਟਰ ਨੂੰ ਮਿਲਣ ਤੋਂ ਪਹਿਲਾਂ ਤੇਜ਼ ਕਲੀਨਿਕਲ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਲੱਛਣਾਂ ਦਾ ਮੁਲਾਂਕਣ।',
    abhaInputLabel: 'ਆਭਾ (ABHA) ਆਈਡੀ ਜਾਂ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
    abhaPlaceholder: 'ਉਦਾਹਰਣ ਵਜੋਂ, 91-XXXX-XXXX ਜਾਂ ABHA-8829-1022-3110',
    quickFill: 'ਟੈਸਟਿੰਗ ਲਈ ਤੁਰੰਤ ਭਰੋ:',
    startIntakeBtn: 'ਕਲੀਨਿਕਲ ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ',
    trustAbdm: 'ABDM ਪ੍ਰਮਾਣਿਤ',
    trustVoice: '10+ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ',
    trustTriage: 'ਪ੍ਰਮੁੱਖਤਾ ਟ੍ਰਾਈਏਜ',

    voiceStepBadge: 'ਕਦਮ 1 / 2 • ਆਵਾਜ਼ ਰਾਹੀਂ ਲੱਛਣ ਦੱਸੋ',
    voiceHeading: 'ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ',
    voiceSubheading: 'ਮਾਈਕ੍ਰੋਫੋਨ ਤੇ ਟੈਪ ਕਰੋ ਅਤੇ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਦੱਸੋ ਕਿ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ।',
    tapToSpeak: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ',
    listening: 'ਸੁਣ ਰਿਹਾ ਹੈ...',
    activeMicNotice: 'ਮਾਈਕ ਚਾਲੂ ਹੈ • ਕਿਰਪਾ ਕਰਕੇ ਸਾਫ਼ ਬੋਲੋ',
    tapToStop: 'ਰੋਕਣ ਲਈ ਦੁਬਾਰਾ ਟੈਪ ਕਰੋ',
    transcriptLabel: 'ਲਾਈਵ ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ',
    transcriptPlaceholder: 'ਜਿਵੇਂ ਤੁਸੀਂ ਬੋਲੋਗੇ, ਸ਼ਬਦ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ...',
    clearTranscript: 'ਸਾਫ਼ ਕਰੋ',
    sampleSymptomHeader: 'ਜਾਂ ਡੈਮੋ ਲਈ ਲੱਛਣ ਚੁਣੋ:',
    sampleSymptoms: [
      {
        title: 'ਛਾਤੀ ਵਿੱਚ ਦਰਦ (ਤੀਬਰ)',
        text: 'ਕੱਲ੍ਹ ਸਵੇਰ ਤੋਂ ਮੇਰੀ ਛਾਤੀ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ ਹੋ ਰਿਹਾ ਹੈ। ਡੂੰਘਾ ਸਾਹ ਲੈਣ ਤੇ ਦਰਦ ਵਧਦਾ ਹੈ ਅਤੇ ਚੱਕਰ ਆ ਰਹੇ ਹਨ।',
      },
      {
        title: 'ਬੁਖਾਰ ਅਤੇ ਖੰਘ',
        text: '3 ਦਿਨਾਂ ਤੋਂ ਤੇਜ਼ ਬੁਖਾਰ ਅਤੇ ਸੁੱਕੀ ਖੰਘ ਹੈ, ਪੌੜੀਆਂ ਚੜ੍ਹਨ ਸਮੇਂ ਸਾਹ ਚੜ੍ਹਦਾ ਹੈ।',
      },
      {
        title: 'ਪੈਰਾਂ ਵਿੱਚ ਸੁੰਨਪਨ',
        text: 'ਪਿਛਲੇ 2 ਹਫ਼ਤਿਆਂ ਤੋਂ ਦੋਵੇਂ ਪੈਰਾਂ ਵਿੱਚ ਝਣਝਣਾਹਟ ਅਤੇ ਸੁੰਨਪਨ ਮਹਿਸੂਸ ਹੋ ਰਿਹਾ ਹੈ।',
      },
    ],
    backBtn: 'ਪਿੱਛੇ',
    nextStepBtn: 'ਅਗਲਾ ਕਦਮ',

    uploadStepBadge: 'ਕਦਮ 2 / 2 • ਮੈਡੀਕਲ ਰਿਕਾਰਡ ਓਸੀਆਰ',
    uploadHeading: 'ਪੁਰਾਣੇ ਮੈਡੀਕਲ ਰਿਕਾਰਡ ਅੱਪਲੋਡ ਕਰੋ',
    uploadSubheading: 'ਜੇਮਿਨੀ ਏਆਈ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਪਰਚੀਆਂ ਜਾਂ ਲੈਬ ਰਿਪੋਰਟਾਂ (HbA1c) ਅੱਪਲੋਡ ਕਰੋ।',
    dropzonePrompt: 'ਦਸਤਾਵੇਜ਼ ਦੀ ਫੋਟੋ ਇੱਥੇ ਟੈਪ ਕਰੋ ਜਾਂ ਖਿੱਚੋ',
    dropzoneSubtext: 'JPEG, PNG ਜਾਂ ਸਕੈਨ ਕੀਤੀਆਂ ਰਿਪੋਰਟਾਂ',
    changeFile: 'ਫਾਈਲ ਬਦਲੋ',
    readyForOcr: 'OCR ਲਈ ਤਿਆਰ',
    noDocNotice: 'ਦਸਤਾਵੇਜ਼ ਮੌਜੂਦ ਨਹੀਂ ਹੈ?',
    noDocSubtext: 'ਨਮੂਨਾ ਲੈਬ ਰਿਪੋਰਟ ਦੀ ਵਰਤੋਂ ਕਰੋ (HbA1c)',
    useSampleReportBtn: 'ਨਮੂਨਾ ਰਿਪੋਰਟ ਚੁਣੋ',
    analyzeWithAiBtn: 'AI ਨਾਲ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',

    processingHeading: 'ਕਲੀਨਿਕਲ ਡਾਟਾ ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ... ਜੇਮਿਨੀ ਏਆਈ ਸਰਗਰਮ...',
    processingSubheading: 'ਡਾਕਟਰ ਦੀ ਜਾਂਚ ਲਈ ਆਡੀਓ ਅਤੇ ਰਿਪੋਰਟਾਂ ਦਾ ਤਾਲਮੇਲ ਹੋ ਰਿਹਾ ਹੈ...',
    processingStep1: 'ਮੁੱਖ ਸਮੱਸਿਆ ਅਤੇ ਸਮੇਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ...',
    processingStep2: 'ਲੈਬ ਰਿਪੋਰਟ ਦਾ ਓਸੀਆਰ ਡਿਜੀਟਾਈਜ਼ੇਸ਼ਨ...',
    processingStep3: 'ਹਸਪਤਾਲ ਸੂਚਨਾ ਪ੍ਰਣਾਲੀ (HIS) ਰਿਪੋਰਟ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',

    doctorViewTitle: 'ਹਸਪਤਾਲ ਸੂਚਨਾ ਪ੍ਰਣਾਲੀ - ਡਾਕਟਰ ਦ੍ਰਿਸ਼',
    doctorName: 'ਡਾ. ਅਨੰਨਿਆ ਸ਼ਰਮਾ',
    priorityHigh: 'ਪ੍ਰਮੁੱਖਤਾ: ਉੱਚ (HIGH)',
    statusCheckedIn: 'ਸਥਿਤੀ: ਚੈੱਕ-ਇਨ ਪੂਰਾ',
    card1Title: 'ਸੰਰਚਨਾਤਮਕ ਏਆਈ ਇਤਿਹਾਸ (Structured AI History)',
    card1Badge: 'ਏਆਈ ਪ੍ਰੋਸੈਸਡ',
    patientAudioTranscript: 'ਮਰੀਜ਼ ਦੀ ਆਡੀਓ ਲਿਖਤ',
    langVerified: 'ਪ੍ਰਮਾਣਿਤ ਵੌਇਸ ਇਨਟੇਕ',
    extractedClinicalSchema: 'ਕੱਢਿਆ ਗਿਆ ਕਲੀਨਿਕਲ ਸਕੀਮਾ',
    confidenceHigh: 'ਉੱਚ ਸ਼ੁੱਧਤਾ (99.4%)',
    card2Title: 'ਡਿਜੀਟਾਈਜ਼ ਕੀਤੇ ਰਿਕਾਰਡ',
    card2Badge: 'ਓਸੀਆਰ ਪ੍ਰਮਾਣਿਤ',
    viewDocument: 'ਦਸਤਾਵੇਜ਼ ਦੇਖੋ',
    labValuesExtracted: 'ਲੈਬ ਟੈਸਟ ਨਤੀਜੇ (Lab Values)',
    recordSource: 'ਸਿਟੀ ਜਨਰਲ ਡਾਇਗਨੋਸਟਿਕਸ ਰਿਪੋਰਟ। ਸਕੈਨ ਮਿਤੀ: 2023-11-20.',
    sessionTimer: 'ਸੈਸ਼ਨ ਸਮਾਂ',
    rejectRecord: 'ਰੱਦ ਕਰੋ',
    completeConsultation: 'ਸਲਾਹ ਪੂਰੀ ਕਰੋ',
  },
};
