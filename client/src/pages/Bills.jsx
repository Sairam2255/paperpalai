import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  IndianRupee,
  Languages,
  Lightbulb,
  Loader2,
  MessageCircle,
  Save,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Upload,
  Waves,
  X,
  Zap,
} from "lucide-react";

import Layout from "../components/Layout";
import API from "../services/api";
import "./Bills.css";

const LANGUAGE_DATA = [
  { value: "English", native: "English", flag: "🇬🇧" },
  { value: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { value: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { value: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { value: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

const BILL_TYPES = [
  { value: "Electricity", icon: Zap },
  { value: "Mobile", icon: CreditCard },
  { value: "Internet", icon: Waves },
  { value: "Water", icon: Waves },
  { value: "Insurance", icon: ShieldCheck },
  { value: "Other", icon: FileText },
];

/* =========================================================
   OFFICIAL BILL PROVIDERS
========================================================= */

const OFFICIAL_BILL_PROVIDERS = [
  {
    name: "Jio",
    keywords: [
      "jio",
      "reliance jio",
      "jio true 5g",
      "reliance jio infocomm",
    ],
    url: "https://www.jio.com/selfcare/paybill/",
  },
  {
    name: "Airtel",
    keywords: [
      "airtel",
      "bharti airtel",
      "bharti airtel limited",
    ],
    url: "https://www.airtel.in/broadband-bill-pay",
  },
  {
    name: "Vi",
    keywords: [
      "vodafone idea",
      "vodafone idea limited",
      "vodafone",
      "idea cellular",
    ],
    url: "https://www.myvi.in/",
  },
  {
    name: "APEPDCL",
    keywords: [
      "apepdcl",
      "eastern power distribution",
      "andhra pradesh eastern power",
      "andhra pradesh eastern power distribution company",
    ],
    url: "https://www.apeasternpower.com/",
  },
  {
    name: "APSPDCL",
    keywords: [
      "apspdcl",
      "southern power distribution",
      "southern power distribution company of a.p.",
      "southern power distribution company of andhra pradesh",
    ],
    url: "https://www.apspdcl.in/",
  },
];

/* =========================================================
   PROVIDER DETECTION
========================================================= */

const detectBillProvider = (analysisText = "") => {
  const normalizedText = String(analysisText)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedText) {
    return null;
  }

  for (const provider of OFFICIAL_BILL_PROVIDERS) {
    for (const keyword of provider.keywords) {
      const normalizedKeyword = keyword
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      if (!normalizedKeyword) {
        continue;
      }

      const escapedKeyword = normalizedKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const pattern = new RegExp(
        `(^|[^a-z0-9])${escapedKeyword}([^a-z0-9]|$)`,
        "i"
      );

      if (pattern.test(normalizedText)) {
        return provider;
      }
    }
  }

  return null;
};

const COPY = {
  English: {
    badge: "BILL INTELLIGENCE",
    title: "Understand your bills better",
    subtitle:
      "Upload a bill or take a photo. PaperPal will explain the important details, charges, due dates, usage, alerts, and practical saving tips.",
    defaultLanguage: "Default language",
    defaultHint:
      "This language will be selected automatically the next time you open Bills.",
    chooseLanguage: "1. Choose your language",
    chooseLanguageHint:
      "Select the language in which PaperPal should explain your bill.",
    billType: "2. What type of bill is this?",
    billTypeHint:
      "This helps PaperPal focus on the right usage and charges.",
    addBill: "3. Add your bill",
    addBillHint:
      "Upload a document or take a fresh photo of your bill.",
    uploadBill: "Upload Bill",
    uploadHint: "PDF, JPG, JPEG or PNG",
    takePhoto: "Take Photo",
    cameraHint: "Open camera and capture your bill",
    analyze: "Analyze Bill",
    selectLanguage: "Select a language first",
    ready: "Ready for analysis",
    emptyKicker: "PAPERPAL BILL AI",
    emptyTitle: "Ready to understand your bill?",
    emptyText:
      "Choose your language, add your bill, and let PaperPal turn complicated details into a simple explanation.",
    analyzing: "Analyzing your bill...",
    analyzingText:
      "PaperPal is reading the bill, identifying charges, checking dates and usage, and preparing useful insights.",
    analyzingSteps: [
      "Extracting key information...",
      "Analyzing charges and details...",
      "Checking important alerts...",
      "Generating saving tips...",
    ],
    wait:
      "This may take a few seconds. Please don't close this page.",
    complete: "ANALYSIS COMPLETE",
    report: "Your Bill Intelligence",
    continueHint:
      "Ask follow-up questions or save this bill and chat for later.",
    continueChat: "Continue Chat",
    anotherPhoto: "Take Another Photo",
    saveAll: "Save Chat & Document",
    saved: "Saved",
    completeIntro: "Your bill has been analyzed.",
    completeIntroHint:
      "Continue the conversation or save the bill and chat for later.",
    understandCharges: "Understand charges",
    understandChargesHint: "See where your money is going.",
    dueDates: "Never miss due dates",
    dueDatesHint: "Find payment deadlines quickly.",
    savings: "Find saving opportunities",
    savingsHint: "Get practical ways to reduce costs.",
    followUps: "Ask follow-up questions",
    followUpsHint: "Keep chatting about the same bill.",
    newBill: "New Bill",
    uploadError:
      "Please upload a PDF, JPG, JPEG, or PNG bill.",
    languageRequired:
      "Please select the language you want for the bill analysis.",
    fileRequired:
      "Please upload your bill or take a photo first.",
    uploadedButNoId:
      "The bill was uploaded but no document ID was returned.",
    uploadFailed:
      "Failed to upload bill. Please try again.",
    analysisFailed:
      "AI analysis failed. Please try again.",
    chatFailed:
      "Could not create the bill chat.",

    payBill: "Pay your bill",
    payBillDescription:
      "Continue to the official provider website to make your payment.",
    payMyBill: "Pay My Bill",
    providerNotRecognized: "Provider not recognized",
    providerUnknownDescription:
      "PaperPal could not confidently identify the bill provider, so no payment link is shown.",
  },

  Hindi: {
    badge: "बिल इंटेलिजेंस",
    title: "अपने बिलों को बेहतर समझें",
    subtitle:
      "बिल अपलोड करें या उसकी फोटो लें। PaperPal महत्वपूर्ण विवरण, शुल्क, भुगतान की तारीख, उपयोग, अलर्ट और बचत के सुझाव आसान भाषा में समझाएगा।",
    defaultLanguage: "डिफ़ॉल्ट भाषा",
    defaultHint:
      "अगली बार Bills खोलने पर यही भाषा अपने आप चुनी जाएगी।",
    chooseLanguage: "1. भाषा चुनें",
    chooseLanguageHint:
      "जिस भाषा में PaperPal आपके बिल को समझाए, वह चुनें।",
    billType: "2. यह किस प्रकार का बिल है?",
    billTypeHint:
      "इससे PaperPal सही उपयोग और शुल्क पर ध्यान दे पाएगा।",
    addBill: "3. अपना बिल जोड़ें",
    addBillHint:
      "दस्तावेज़ अपलोड करें या अपने बिल की नई फोटो लें।",
    uploadBill: "बिल अपलोड करें",
    uploadHint: "PDF, JPG, JPEG या PNG",
    takePhoto: "फोटो लें",
    cameraHint: "कैमरा खोलें और बिल की फोटो लें",
    analyze: "बिल का विश्लेषण करें",
    selectLanguage: "पहले भाषा चुनें",
    ready: "विश्लेषण के लिए तैयार",
    emptyKicker: "PAPERPAL BILL AI",
    emptyTitle: "क्या आप अपना बिल समझने के लिए तैयार हैं?",
    emptyText:
      "भाषा चुनें, अपना बिल जोड़ें और PaperPal जटिल विवरणों को आसान समझ में बदल देगा।",
    analyzing: "आपके बिल का विश्लेषण हो रहा है...",
    analyzingText:
      "PaperPal बिल पढ़ रहा है, शुल्क और तारीखें पहचान रहा है और उपयोगी जानकारी तैयार कर रहा है।",
    analyzingSteps: [
      "मुख्य जानकारी निकाली जा रही है...",
      "शुल्क और विवरण का विश्लेषण हो रहा है...",
      "महत्वपूर्ण अलर्ट जांचे जा रहे हैं...",
      "बचत के सुझाव तैयार हो रहे हैं...",
    ],
    wait:
      "इसमें कुछ सेकंड लग सकते हैं। कृपया यह पेज बंद न करें।",
    complete: "विश्लेषण पूरा हुआ",
    report: "आपकी बिल इंटेलिजेंस रिपोर्ट",
    continueHint:
      "आगे सवाल पूछें या इस बिल और चैट को बाद के लिए सेव करें।",
    continueChat: "चैट जारी रखें",
    anotherPhoto: "दूसरी फोटो लें",
    saveAll: "चैट और दस्तावेज़ सेव करें",
    saved: "सेव किया गया",
    completeIntro: "आपके बिल का विश्लेषण हो गया है।",
    completeIntroHint:
      "बातचीत जारी रखें या बिल और चैट को बाद के लिए सेव करें।",
    understandCharges: "शुल्क समझें",
    understandChargesHint: "जानें आपका पैसा कहाँ जा रहा है।",
    dueDates: "भुगतान की तारीख न भूलें",
    dueDatesHint: "भुगतान की अंतिम तारीख जल्दी देखें।",
    savings: "बचत के अवसर खोजें",
    savingsHint: "खर्च कम करने के व्यावहारिक तरीके पाएं।",
    followUps: "आगे के सवाल पूछें",
    followUpsHint: "उसी बिल के बारे में चैट जारी रखें।",
    newBill: "नया बिल",
    uploadError:
      "कृपया PDF, JPG, JPEG या PNG बिल चुनें।",
    languageRequired:
      "कृपया बिल विश्लेषण के लिए भाषा चुनें।",
    fileRequired:
      "पहले बिल अपलोड करें या उसकी फोटो लें।",
    uploadedButNoId:
      "बिल अपलोड हो गया लेकिन दस्तावेज़ ID नहीं मिली।",
    uploadFailed:
      "बिल अपलोड नहीं हो पाया। फिर से कोशिश करें।",
    analysisFailed:
      "AI विश्लेषण विफल हुआ। फिर से कोशिश करें।",
    chatFailed:
      "बिल चैट नहीं बनाई जा सकी।",

    payBill: "अपना बिल भुगतान करें",
    payBillDescription:
      "भुगतान करने के लिए आधिकारिक प्रदाता की वेबसाइट पर जाएं।",
    payMyBill: "बिल भुगतान करें",
    providerNotRecognized: "प्रदाता पहचाना नहीं गया",
    providerUnknownDescription:
      "PaperPal बिल प्रदाता की विश्वसनीय पहचान नहीं कर पाया, इसलिए कोई भुगतान लिंक नहीं दिखाया गया।",
  },

  Telugu: {
    badge: "బిల్ ఇంటెలిజెన్స్",
    title: "మీ బిల్లులను మరింత సులభంగా అర్థం చేసుకోండి",
    subtitle:
      "బిల్‌ను అప్‌లోడ్ చేయండి లేదా ఫోటో తీయండి. ముఖ్యమైన వివరాలు, ఛార్జీలు, గడువు తేదీలు, వినియోగం, హెచ్చరికలు మరియు పొదుపు సూచనలను PaperPal సులభమైన తెలుగులో వివరిస్తుంది.",
    defaultLanguage: "డిఫాల్ట్ భాష",
    defaultHint:
      "తర్వాత Bills పేజీని తెరిచినప్పుడు ఇదే భాష ఆటోమేటిక్‌గా ఎంపిక అవుతుంది.",
    chooseLanguage: "1. భాషను ఎంచుకోండి",
    chooseLanguageHint:
      "PaperPal మీ బిల్‌ను ఏ భాషలో వివరించాలో ఎంచుకోండి.",
    billType: "2. ఇది ఏ రకమైన బిల్?",
    billTypeHint:
      "దీంతో సరైన వినియోగం మరియు ఛార్జీలపై PaperPal దృష్టి పెడుతుంది.",
    addBill: "3. మీ బిల్‌ను జోడించండి",
    addBillHint:
      "డాక్యుమెంట్‌ను అప్‌లోడ్ చేయండి లేదా బిల్‌కు కొత్త ఫోటో తీయండి.",
    uploadBill: "బిల్‌ను అప్‌లోడ్ చేయండి",
    uploadHint: "PDF, JPG, JPEG లేదా PNG",
    takePhoto: "ఫోటో తీయండి",
    cameraHint: "కెమెరాను తెరిచి మీ బిల్ ఫోటో తీయండి",
    analyze: "బిల్‌ను విశ్లేషించండి",
    selectLanguage: "ముందుగా భాషను ఎంచుకోండి",
    ready: "విశ్లేషణకు సిద్ధంగా ఉంది",
    emptyKicker: "PAPERPAL BILL AI",
    emptyTitle: "మీ బిల్‌ను అర్థం చేసుకోవడానికి సిద్ధమేనా?",
    emptyText:
      "భాషను ఎంచుకోండి, మీ బిల్‌ను జోడించండి. PaperPal క్లిష్టమైన వివరాలను సులభమైన వివరణగా మారుస్తుంది.",
    analyzing: "మీ బిల్‌ను విశ్లేషిస్తోంది...",
    analyzingText:
      "PaperPal మీ బిల్‌ను చదివి ఛార్జీలు, తేదీలు, వినియోగాన్ని పరిశీలించి ఉపయోగకరమైన సమాచారాన్ని సిద్ధం చేస్తోంది.",
    analyzingSteps: [
      "ముఖ్యమైన సమాచారాన్ని సేకరిస్తోంది...",
      "ఛార్జీలు మరియు వివరాలను విశ్లేషిస్తోంది...",
      "ముఖ్యమైన హెచ్చరికలను పరిశీలిస్తోంది...",
      "పొదుపు సూచనలను రూపొందిస్తోంది...",
    ],
    wait:
      "దీనికి కొన్ని సెకండ్లు పట్టవచ్చు. దయచేసి ఈ పేజీని మూసివేయవద్దు.",
    complete: "విశ్లేషణ పూర్తైంది",
    report: "మీ బిల్ ఇంటెలిజెన్స్ రిపోర్ట్",
    continueHint:
      "తదుపరి ప్రశ్నలు అడగండి లేదా ఈ బిల్ మరియు చాట్‌ను తర్వాత కోసం సేవ్ చేయండి.",
    continueChat: "చాట్ కొనసాగించండి",
    anotherPhoto: "మరో ఫోటో తీయండి",
    saveAll: "చాట్ మరియు డాక్యుమెంట్‌ను సేవ్ చేయండి",
    saved: "సేవ్ అయింది",
    completeIntro: "మీ బిల్ విశ్లేషణ పూర్తైంది.",
    completeIntroHint:
      "చాట్ కొనసాగించండి లేదా బిల్ మరియు చాట్‌ను తర్వాత కోసం సేవ్ చేయండి.",
    understandCharges: "ఛార్జీలను అర్థం చేసుకోండి",
    understandChargesHint: "మీ డబ్బు ఎక్కడ ఖర్చవుతుందో తెలుసుకోండి.",
    dueDates: "గడువు తేదీలను మిస్ అవ్వవద్దు",
    dueDatesHint: "చెల్లింపు చివరి తేదీని త్వరగా తెలుసుకోండి.",
    savings: "పొదుపు అవకాశాలను కనుగొనండి",
    savingsHint: "ఖర్చులను తగ్గించడానికి ఉపయోగకరమైన మార్గాలు పొందండి.",
    followUps: "తదుపరి ప్రశ్నలు అడగండి",
    followUpsHint: "అదే బిల్ గురించి చాట్ కొనసాగించండి.",
    newBill: "కొత్త బిల్",
    uploadError:
      "దయచేసి PDF, JPG, JPEG లేదా PNG బిల్‌ను ఎంచుకోండి.",
    languageRequired:
      "బిల్ విశ్లేషణ కోసం దయచేసి భాషను ఎంచుకోండి.",
    fileRequired:
      "ముందుగా మీ బిల్‌ను అప్‌లోడ్ చేయండి లేదా ఫోటో తీయండి.",
    uploadedButNoId:
      "బిల్ అప్‌లోడ్ అయింది కానీ డాక్యుమెంట్ ID రాలేదు.",
    uploadFailed:
      "బిల్‌ను అప్‌లోడ్ చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
    analysisFailed:
      "AI విశ్లేషణ విఫలమైంది. మళ్లీ ప్రయత్నించండి.",
    chatFailed: "బిల్ చాట్‌ను సృష్టించలేకపోయాం.",

    payBill: "మీ బిల్‌ను చెల్లించండి",
    payBillDescription:
      "చెల్లింపు చేయడానికి అధికారిక ప్రొవైడర్ వెబ్‌సైట్‌కు వెళ్లండి.",
    payMyBill: "బిల్ చెల్లించండి",
    providerNotRecognized: "ప్రొవైడర్ గుర్తించబడలేదు",
    providerUnknownDescription:
      "PaperPal బిల్ ప్రొవైడర్‌ను విశ్వసనీయంగా గుర్తించలేకపోయింది, కాబట్టి చెల్లింపు లింక్ చూపించబడలేదు.",
  },

  Tamil: {
    badge: "பில் நுண்ணறிவு",
    title: "உங்கள் பில்களை எளிதாகப் புரிந்துகொள்ளுங்கள்",
    subtitle:
      "பில்லை பதிவேற்றுங்கள் அல்லது புகைப்படம் எடுக்குங்கள். முக்கிய விவரங்கள், கட்டணங்கள், கடைசி தேதி, பயன்பாடு, எச்சரிக்கைகள் மற்றும் சேமிப்பு குறிப்புகளை PaperPal எளிய தமிழில் விளக்கும்.",
    defaultLanguage: "இயல்புநிலை மொழி",
    defaultHint:
      "அடுத்த முறை Bills பக்கத்தைத் திறக்கும் போது இதே மொழி தானாகத் தேர்ந்தெடுக்கப்படும்.",
    chooseLanguage: "1. மொழியைத் தேர்ந்தெடுக்கவும்",
    chooseLanguageHint:
      "PaperPal உங்கள் பில்லை எந்த மொழியில் விளக்க வேண்டும் என்பதைத் தேர்ந்தெடுக்கவும்.",
    billType: "2. இது எந்த வகை பில்?",
    billTypeHint:
      "இதன் மூலம் சரியான பயன்பாடு மற்றும் கட்டணங்களில் PaperPal கவனம் செலுத்தும்.",
    addBill: "3. உங்கள் பில்லை சேர்க்கவும்",
    addBillHint:
      "ஆவணத்தைப் பதிவேற்றுங்கள் அல்லது புதிய புகைப்படம் எடுக்குங்கள்.",
    uploadBill: "பில்லை பதிவேற்றவும்",
    uploadHint: "PDF, JPG, JPEG அல்லது PNG",
    takePhoto: "புகைப்படம் எடுக்கவும்",
    cameraHint: "கேமராவைத் திறந்து பில் புகைப்படம் எடுக்கவும்",
    analyze: "பில்லை பகுப்பாய்வு செய்யவும்",
    selectLanguage: "முதலில் மொழியைத் தேர்ந்தெடுக்கவும்",
    ready: "பகுப்பாய்வுக்கு தயார்",
    emptyKicker: "PAPERPAL BILL AI",
    emptyTitle: "உங்கள் பில்லைப் புரிந்துகொள்ள தயாரா?",
    emptyText:
      "மொழியைத் தேர்ந்தெடுத்து, உங்கள் பில்லைச் சேர்க்கவும். PaperPal சிக்கலான விவரங்களை எளிய விளக்கமாக மாற்றும்.",
    analyzing: "உங்கள் பில் பகுப்பாய்வு செய்யப்படுகிறது...",
    analyzingText:
      "PaperPal உங்கள் பில்லைப் படித்து, கட்டணங்கள், தேதிகள் மற்றும் பயன்பாட்டை ஆய்வு செய்து பயனுள்ள தகவலைத் தயாரிக்கிறது.",
    analyzingSteps: [
      "முக்கிய தகவல்கள் எடுக்கப்படுகின்றன...",
      "கட்டணங்கள் மற்றும் விவரங்கள் பகுப்பாய்வு செய்யப்படுகின்றன...",
      "முக்கிய எச்சரிக்கைகள் சரிபார்க்கப்படுகின்றன...",
      "சேமிப்பு குறிப்புகள் உருவாக்கப்படுகின்றன...",
    ],
    wait:
      "இதற்கு சில வினாடிகள் ஆகலாம். இந்தப் பக்கத்தை மூட வேண்டாம்.",
    complete: "பகுப்பாய்வு முடிந்தது",
    report: "உங்கள் பில் நுண்ணறிவு அறிக்கை",
    continueHint:
      "தொடர்ந்து கேள்விகள் கேளுங்கள் அல்லது இந்த பில் மற்றும் உரையாடலைச் சேமிக்கவும்.",
    continueChat: "உரையாடலைத் தொடரவும்",
    anotherPhoto: "மற்றொரு புகைப்படம்",
    saveAll: "உரையாடல் மற்றும் ஆவணத்தைச் சேமிக்கவும்",
    saved: "சேமிக்கப்பட்டது",
    completeIntro: "உங்கள் பில் பகுப்பாய்வு முடிந்தது.",
    completeIntroHint:
      "உரையாடலைத் தொடருங்கள் அல்லது பில் மற்றும் உரையாடலைச் சேமிக்கவும்.",
    understandCharges: "கட்டணங்களைப் புரிந்துகொள்ளுங்கள்",
    understandChargesHint: "உங்கள் பணம் எங்கு செல்கிறது என்பதை அறியுங்கள்.",
    dueDates: "கடைசி தேதிகளை தவறவிடாதீர்கள்",
    dueDatesHint: "கட்டண கடைசி தேதியை விரைவாக அறியுங்கள்.",
    savings: "சேமிப்பு வாய்ப்புகளை கண்டறியுங்கள்",
    savingsHint: "செலவைக் குறைக்க உதவும் நடைமுறை வழிகளைப் பெறுங்கள்.",
    followUps: "தொடர்ந்து கேள்விகள் கேளுங்கள்",
    followUpsHint: "அதே பில் பற்றி உரையாடலைத் தொடருங்கள்.",
    newBill: "புதிய பில்",
    uploadError:
      "PDF, JPG, JPEG அல்லது PNG பில் தேர்ந்தெடுக்கவும்.",
    languageRequired:
      "பில் பகுப்பாய்விற்கான மொழியைத் தேர்ந்தெடுக்கவும்.",
    fileRequired:
      "முதலில் பில்லை பதிவேற்றவும் அல்லது புகைப்படம் எடுக்கவும்.",
    uploadedButNoId:
      "பில் பதிவேற்றப்பட்டது, ஆனால் ஆவண ID கிடைக்கவில்லை.",
    uploadFailed:
      "பில்லைப் பதிவேற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    analysisFailed:
      "AI பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    chatFailed:
      "பில் உரையாடலை உருவாக்க முடியவில்லை.",

    payBill: "உங்கள் பில் செலுத்துங்கள்",
    payBillDescription:
      "பணம் செலுத்த அதிகாரப்பூர்வ வழங்குநர் இணையதளத்திற்குச் செல்லுங்கள்.",
    payMyBill: "பில் செலுத்தவும்",
    providerNotRecognized: "வழங்குநர் அடையாளம் காணப்படவில்லை",
    providerUnknownDescription:
      "PaperPal பில் வழங்குநரை நம்பகத்தன்மையுடன் அடையாளம் காண முடியவில்லை, எனவே கட்டண இணைப்பு காட்டப்படவில்லை.",
  },

  Kannada: {
    badge: "ಬಿಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್",
    title: "ನಿಮ್ಮ ಬಿಲ್‌ಗಳನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    subtitle:
      "ಬಿಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ. ಪ್ರಮುಖ ವಿವರಗಳು, ಶುಲ್ಕಗಳು, ಪಾವತಿ ದಿನಾಂಕಗಳು, ಬಳಕೆ, ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಉಳಿತಾಯ ಸಲಹೆಗಳನ್ನು PaperPal ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸುತ್ತದೆ.",
    defaultLanguage: "ಡೀಫಾಲ್ಟ್ ಭಾಷೆ",
    defaultHint:
      "ಮುಂದಿನ ಬಾರಿ Bills ಪುಟ ತೆರೆಯುವಾಗ ಇದೇ ಭಾಷೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಆಯ್ಕೆಯಾಗುತ್ತದೆ.",
    chooseLanguage: "1. ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    chooseLanguageHint:
      "PaperPal ನಿಮ್ಮ ಬಿಲ್ ಅನ್ನು ಯಾವ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸಬೇಕು ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    billType: "2. ಇದು ಯಾವ ರೀತಿಯ ಬಿಲ್?",
    billTypeHint:
      "ಇದರಿಂದ ಸರಿಯಾದ ಬಳಕೆ ಮತ್ತು ಶುಲ್ಕಗಳ ಮೇಲೆ PaperPal ಗಮನ ಹರಿಸುತ್ತದೆ.",
    addBill: "3. ನಿಮ್ಮ ಬಿಲ್ ಸೇರಿಸಿ",
    addBillHint:
      "ಡಾಕ್ಯುಮೆಂಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಹೊಸ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
    uploadBill: "ಬಿಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadHint: "PDF, JPG, JPEG ಅಥವಾ PNG",
    takePhoto: "ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
    cameraHint: "ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ ಮತ್ತು ಬಿಲ್‌ನ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
    analyze: "ಬಿಲ್ ವಿಶ್ಲೇಷಿಸಿ",
    selectLanguage: "ಮೊದಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    ready: "ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧ",
    emptyKicker: "PAPERPAL BILL AI",
    emptyTitle: "ನಿಮ್ಮ ಬಿಲ್ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಿದ್ಧವೇ?",
    emptyText:
      "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ, ನಿಮ್ಮ ಬಿಲ್ ಸೇರಿಸಿ. PaperPal ಸಂಕೀರ್ಣ ವಿವರಗಳನ್ನು ಸರಳ ವಿವರಣೆಯಾಗಿ ಬದಲಿಸುತ್ತದೆ.",
    analyzing: "ನಿಮ್ಮ ಬಿಲ್ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    analyzingText:
      "PaperPal ಬಿಲ್ ಓದಿ, ಶುಲ್ಕಗಳು, ದಿನಾಂಕಗಳು ಮತ್ತು ಬಳಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಉಪಯುಕ್ತ ಮಾಹಿತಿಯನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದೆ.",
    analyzingSteps: [
      "ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ತೆಗೆದುಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
      "ಶುಲ್ಕಗಳು ಮತ್ತು ವಿವರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      "ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      "ಉಳಿತಾಯ ಸಲಹೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
    ],
    wait:
      "ಇದಕ್ಕೆ ಕೆಲವು ಸೆಕೆಂಡುಗಳು ಬೇಕಾಗಬಹುದು. ದಯವಿಟ್ಟು ಈ ಪುಟವನ್ನು ಮುಚ್ಚಬೇಡಿ.",
    complete: "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ",
    report: "ನಿಮ್ಮ ಬಿಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ವರದಿ",
    continueHint:
      "ಮುಂದಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಅಥವಾ ಈ ಬಿಲ್ ಮತ್ತು ಚಾಟ್ ಅನ್ನು ಉಳಿಸಿ.",
    continueChat: "ಚಾಟ್ ಮುಂದುವರಿಸಿ",
    anotherPhoto: "ಮತ್ತೊಂದು ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ",
    saveAll: "ಚಾಟ್ ಮತ್ತು ಡಾಕ್ಯುಮೆಂಟ್ ಉಳಿಸಿ",
    saved: "ಉಳಿಸಲಾಗಿದೆ",
    completeIntro: "ನಿಮ್ಮ ಬಿಲ್ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ.",
    completeIntroHint:
      "ಚಾಟ್ ಮುಂದುವರಿಸಿ ಅಥವಾ ಬಿಲ್ ಮತ್ತು ಚಾಟ್ ಅನ್ನು ನಂತರಕ್ಕಾಗಿ ಉಳಿಸಿ.",
    understandCharges: "ಶುಲ್ಕಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    understandChargesHint: "ನಿಮ್ಮ ಹಣ ಎಲ್ಲಿ ಖರ್ಚಾಗುತ್ತಿದೆ ಎಂದು ತಿಳಿಯಿರಿ.",
    dueDates: "ಪಾವತಿ ದಿನಾಂಕಗಳನ್ನು ತಪ್ಪಿಸಬೇಡಿ",
    dueDatesHint: "ಪಾವತಿಯ ಕೊನೆಯ ದಿನಾಂಕವನ್ನು ಬೇಗ ಕಂಡುಹಿಡಿಯಿರಿ.",
    savings: "ಉಳಿತಾಯ ಅವಕಾಶಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ",
    savingsHint:
      "ಖರ್ಚು ಕಡಿಮೆ ಮಾಡಲು ಪ್ರಾಯೋಗಿಕ ಮಾರ್ಗಗಳನ್ನು ಪಡೆಯಿರಿ.",
    followUps: "ಮುಂದಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ",
    followUpsHint: "ಅದೇ ಬಿಲ್ ಬಗ್ಗೆ ಚಾಟ್ ಮುಂದುವರಿಸಿ.",
    newBill: "ಹೊಸ ಬಿಲ್",
    uploadError:
      "ದಯವಿಟ್ಟು PDF, JPG, JPEG ಅಥವಾ PNG ಬಿಲ್ ಆಯ್ಕೆಮಾಡಿ.",
    languageRequired:
      "ಬಿಲ್ ವಿಶ್ಲೇಷಣೆಗೆ ದಯವಿಟ್ಟು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    fileRequired:
      "ಮೊದಲು ನಿಮ್ಮ ಬಿಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ.",
    uploadedButNoId:
      "ಬಿಲ್ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ ಆದರೆ ಡಾಕ್ಯುಮೆಂಟ್ ID ಬಂದಿಲ್ಲ.",
    uploadFailed:
      "ಬಿಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    analysisFailed:
      "AI ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    chatFailed: "ಬಿಲ್ ಚಾಟ್ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",

    payBill: "ನಿಮ್ಮ ಬಿಲ್ ಪಾವತಿಸಿ",
    payBillDescription:
      "ಪಾವತಿ ಮಾಡಲು ಅಧಿಕೃತ ಪೂರೈಕೆದಾರರ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹೋಗಿ.",
    payMyBill: "ಬಿಲ್ ಪಾವತಿಸಿ",
    providerNotRecognized: "ಪೂರೈಕೆದಾರ ಗುರುತಿಸಲಾಗಿಲ್ಲ",
    providerUnknownDescription:
      "PaperPal ಬಿಲ್ ಪೂರೈಕೆದಾರರನ್ನು ವಿಶ್ವಾಸಾರ್ಹವಾಗಿ ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ, ಆದ್ದರಿಂದ ಪಾವತಿ ಲಿಂಕ್ ತೋರಿಸಲಾಗಿಲ್ಲ.",
  },
};

const Bills = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [language, setLanguage] = useState(() => {
    try {
      return (
        localStorage.getItem(
          "paperpal-bill-default-language"
        ) || "English"
      );
    } catch {
      return "English";
    }
  });

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [billType, setBillType] =
    useState("Electricity");

  const [uploading, setUploading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [analysis, setAnalysis] =
    useState("");

  const [documentId, setDocumentId] =
    useState(null);

  const [billProvider, setBillProvider] =
    useState(null);

  const [error, setError] =
    useState("");

  const [savingChat, setSavingChat] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const copy =
    COPY[language] || COPY.English;

  const handleLanguageChange = (
    nextLanguage
  ) => {
    setLanguage(nextLanguage);

    try {
      localStorage.setItem(
        "paperpal-bill-default-language",
        nextLanguage
      );
    } catch {
      // localStorage can be unavailable in restricted contexts.
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowed.includes(file.type)) {
      setError(copy.uploadError);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError("");
    setAnalysis("");
    setDocumentId(null);
    setBillProvider(null);
    setSaved(false);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setAnalysis("");
    setDocumentId(null);
    setBillProvider(null);
    setSaved(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const resetBill = () => {
    setSelectedFile(null);
    setAnalysis("");
    setDocumentId(null);
    setBillProvider(null);
    setError("");
    setSaved(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const buildBillPrompt = () => `
You are PaperPal AI Bill Intelligence.

The uploaded document is a ${billType} bill.

The user's preferred response language is:
${language}.

IMPORTANT LANGUAGE RULE:
Write the entire answer in ${language}.
Use the native writing system of ${language}.
For example:
- Telugu must be written only in Telugu script.
- Hindi must be written only in Devanagari.
- Tamil must be written only in Tamil script.
- Kannada must be written only in Kannada script.
- English must be written in English.

Keep actual names, provider names, invoice numbers,
dates, amounts, account numbers, and technical identifiers
exactly as shown in the bill when needed.

Provide EXACTLY these sections, translated into the
requested language:

1. TOTAL AMOUNT
2. DUE DATE
3. USAGE / CONSUMPTION
4. CHARGE BREAKDOWN
5. IMPORTANT ALERTS
6. SAVING TIPS
7. BILL PROVIDER

Rules:
- Carefully inspect the uploaded document.
- Do not invent information.
- Preserve exact numbers, dates, amounts and units.
- If a specific item is not available, clearly say that it
  is not available in the bill in the requested language.
- Explain everything in simple, friendly language.
- For BILL PROVIDER, include the company/provider name only
  when it is clearly visible or confidently identifiable
  from the uploaded bill.
- Do not guess the provider.
- If the provider is unclear or unavailable, clearly say so.
`;

  const analyzeBill = async (id) => {
    try {
      setAnalyzing(true);

      const response = await API.post(
        `/documents/${id}/ask`,
        {
          question: buildBillPrompt(),
        }
      );

      const answer =
        response.data?.answer;

      if (!answer) {
        throw new Error(
          "PaperPal did not return a bill analysis."
        );
      }

      setAnalysis(answer);
      setBillProvider(
        detectBillProvider(answer)
      );
    } catch (err) {
      console.error(
        "Bill Analysis Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          copy.analysisFailed
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!language) {
      setError(copy.languageRequired);
      return;
    }

    if (!selectedFile) {
      setError(copy.fileRequired);
      return;
    }

    try {
      setUploading(true);
      setAnalyzing(false);
      setAnalysis("");
      setDocumentId(null);
      setBillProvider(null);
      setError("");
      setSaved(false);

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "title",
        `${billType} Bill - ${selectedFile.name}`
      );

      const response =
        await API.post(
          "/documents/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const document =
        response.data?.document;

      if (!document?._id) {
        throw new Error(
          copy.uploadedButNoId
        );
      }

      setDocumentId(
        document._id
      );

      setUploading(false);
      setAnalyzing(true);

      await analyzeBill(
        document._id
      );
    } catch (err) {
      console.error(
        "Bill Upload Error:",
        err
      );

      setUploading(false);
      setAnalyzing(false);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          copy.uploadFailed
      );
    }
  };

  const createBillChat = async ({
    navigateAfter = true,
  } = {}) => {
    if (!analysis || !documentId) {
      setError(
        copy.analysisFailed
      );
      return null;
    }

    try {
      setSavingChat(true);
      setError("");

      const createResponse =
        await API.post(
          "/chat",
          {
            type: "general",
          }
        );

      const conversation =
        createResponse.data?.conversation;

      if (!conversation?._id) {
        throw new Error(
          copy.chatFailed
        );
      }

      const contextMessage = `
We are continuing a conversation about a ${billType} bill.

The user prefers ${language}.

Here is the PaperPal AI analysis of the bill:

${analysis}

Continue helping the user about this same bill.
Answer follow-up questions in ${language} unless the user
explicitly asks for another language.
Keep dates, amounts, provider names, units and other
bill facts grounded in the uploaded document.
`;

      const messageResponse =
        await API.post(
          `/chat/${conversation._id}/message`,
          {
            message:
              contextMessage,
          }
        );

      const savedConversation =
        messageResponse.data?.conversation ||
        conversation;

      window.dispatchEvent(
        new Event(
          "paperpal-chat-updated"
        )
      );

      setSaved(true);

      if (navigateAfter) {
        navigate(
          `/chat?conversation=${savedConversation._id}`
        );
      }

      return savedConversation;
    } catch (err) {
      console.error(
        "Create Bill Chat Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          copy.chatFailed
      );

      return null;
    } finally {
      setSavingChat(false);
    }
  };

  const handleContinueChat = () => {
    createBillChat({
      navigateAfter: true,
    });
  };

  const handleSaveAll = async () => {
    const conversation =
      await createBillChat({
        navigateAfter: false,
      });

    if (!conversation) return;

    window.dispatchEvent(
      new Event(
        "paperpal-chat-updated"
      )
    );

    navigate("/library");
  };

  const isBusy =
    uploading || analyzing;

  return (
    <Layout>
      <main className="bills-page">
        <header className="bills-header">
          <div className="bills-header-copy">
            <div className="bills-badge">
              <Sparkles size={13} />
              {copy.badge}
            </div>

            <h1>
              {copy.title}
              <span> ✨</span>
            </h1>

            <p>{copy.subtitle}</p>
          </div>

          <div className="bills-header-controls">
            <div className="default-language-control">
              <Languages size={15} />

              <div>
                <span>
                  {copy.defaultLanguage}
                </span>

                <strong>
                  {LANGUAGE_DATA.find(
                    (item) =>
                      item.value ===
                      language
                  )?.native || language}
                </strong>
              </div>

              <select
                value={language}
                onChange={(event) =>
                  handleLanguageChange(
                    event.target.value
                  )
                }
                disabled={isBusy}
                aria-label={
                  copy.defaultLanguage
                }
              >
                {LANGUAGE_DATA.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.native}
                    </option>
                  )
                )}
              </select>
            </div>

            {selectedFile && (
              <button
                type="button"
                className="bills-reset-button"
                onClick={resetBill}
                disabled={isBusy}
              >
                <X size={15} />
                {copy.newBill}
              </button>
            )}
          </div>
        </header>

        <div className="default-language-hint">
          <Languages size={13} />
          {copy.defaultHint}
        </div>

        {error && (
          <div className="bills-error">
            <AlertTriangle size={17} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="bill-stepper">
          <Step
            number="1"
            label={copy.chooseLanguage}
            active
          />

          <div className="step-line" />

          <Step
            number="2"
            label={copy.addBill}
            active={Boolean(selectedFile)}
          />

          <div className="step-line" />

          <Step
            number="3"
            label={copy.analyzing}
            active={Boolean(analysis)}
          />

          <div className="step-line" />

          <Step
            number="4"
            label={copy.continueChat}
            active={Boolean(analysis)}
          />
        </div>

        <section className="bills-main-grid">
          <div className="bills-left">
            <section className="bill-card">
              <CardHead
                icon={<Languages size={19} />}
                title={copy.chooseLanguage}
                text={copy.chooseLanguageHint}
              />

              <div className="language-grid">
                {LANGUAGE_DATA.map(
                  (item) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`language-card ${
                        language ===
                        item.value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleLanguageChange(
                          item.value
                        )
                      }
                      disabled={isBusy}
                    >
                      <span className="language-flag">
                        {item.flag}
                      </span>

                      <span>
                        {item.native}
                      </span>

                      {language ===
                        item.value && (
                        <i>
                          <Check
                            size={12}
                          />
                        </i>
                      )}
                    </button>
                  )
                )}
              </div>
            </section>

            <section className="bill-card">
              <CardHead
                icon={<FileText size={19} />}
                title={copy.billType}
                text={copy.billTypeHint}
                compact
              />

              <div className="bill-types">
                {BILL_TYPES.map(
                  ({
                    value,
                    icon: Icon,
                  }) => (
                    <button
                      key={value}
                      type="button"
                      className={`bill-type ${
                        billType ===
                        value
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setBillType(
                          value
                        )
                      }
                      disabled={isBusy}
                    >
                      <Icon size={16} />

                      <span>
                        {getBillTypeLabel(
                          value,
                          language
                        )}
                      </span>

                      {billType ===
                        value && (
                        <Check
                          size={13}
                        />
                      )}
                    </button>
                  )
                )}
              </div>
            </section>

            <section className="bill-card upload-card-section">
              <CardHead
                icon={
                  <Upload size={19} />
                }
                title={copy.addBill}
                text={copy.addBillHint}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={
                  handleFileChange
                }
                hidden
              />

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={
                  handleFileChange
                }
                hidden
              />

              {selectedFile ? (
                <div className="chosen-file">
                  <div className="chosen-icon">
                    <FileText
                      size={21}
                    />
                  </div>

                  <div>
                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {copy.ready}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeSelectedFile
                    }
                    aria-label="Remove file"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="upload-grid">
                  <UploadOption
                    icon={
                      <Upload
                        size={21}
                      />
                    }
                    title={
                      copy.uploadBill
                    }
                    hint={
                      copy.uploadHint
                    }
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  />

                  <UploadOption
                    icon={
                      <Camera
                        size={21}
                      />
                    }
                    title={
                      copy.takePhoto
                    }
                    hint={
                      copy.cameraHint
                    }
                    camera
                    onClick={() =>
                      cameraInputRef.current?.click()
                    }
                  />
                </div>
              )}

              <button
                type="button"
                className="analyze-button"
                onClick={
                  handleAnalyze
                }
                disabled={
                  isBusy ||
                  !language ||
                  !selectedFile
                }
              >
                {uploading ? (
                  <>
                    <Loader2
                      size={17}
                      className="bill-spin"
                    />
                    {copy.ready}
                  </>
                ) : analyzing ? (
                  <>
                    <Loader2
                      size={17}
                      className="bill-spin"
                    />
                    {copy.analyzing}
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    {copy.analyze}
                    <ArrowRight
                      size={16}
                    />
                  </>
                )}
              </button>

              {!language && (
                <div className="bill-helper">
                  <Languages
                    size={13}
                  />
                  {copy.selectLanguage}
                </div>
              )}
            </section>
          </div>

          <section
            className={`bill-ai-panel ${
              analyzing
                ? "analyzing"
                : analysis
                ? "result"
                : "idle"
            }`}
          >
            {!analysis &&
              !analyzing && (
                <EmptyState copy={copy} />
              )}

            {analyzing && (
              <AnalysisState copy={copy} />
            )}

            {analysis &&
              !analyzing && (
                <ResultState
                  copy={copy}
                  language={
                    language
                  }
                  billType={
                    billType
                  }
                  analysis={
                    analysis
                  }
                />
              )}
          </section>
        </section>

        {/* =====================================================
            PAY MY BILL
        ===================================================== */}

        {analysis &&
          !analyzing && (
            <section className="bill-pay-card">
              <div className="bill-pay-icon">
                <CreditCard size={20} />
              </div>

              <div className="bill-pay-content">
                <strong>
                  {billProvider
                    ? `${copy.payBill} — ${billProvider.name}`
                    : copy.payBill}
                </strong>

                <p>
                  {billProvider
                    ? copy.payBillDescription
                    : copy.providerUnknownDescription}
                </p>
              </div>

              {billProvider ? (
                <a
                  href={billProvider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bill-pay-button"
                >
                  <CreditCard size={16} />

                  {copy.payMyBill}

                  <ArrowRight size={16} />
                </a>
              ) : (
                <div className="bill-provider-unknown">
                  {copy.providerNotRecognized}
                </div>
              )}
            </section>
          )}

        {analysis &&
          !analyzing && (
            <section className="bill-actions">
              <div className="action-copy">
                <div>
                  <CheckCircle2
                    size={19}
                  />
                </div>

                <span>
                  <strong>
                    {copy.completeIntro}
                  </strong>

                  <small>
                    {
                      copy.completeIntroHint
                    }
                  </small>
                </span>
              </div>

              <div className="action-buttons">
                <button
                  type="button"
                  className="primary"
                  onClick={
                    handleContinueChat
                  }
                  disabled={
                    savingChat
                  }
                >
                  {savingChat ? (
                    <Loader2
                      size={16}
                      className="bill-spin"
                    />
                  ) : (
                    <MessageCircle
                      size={16}
                    />
                  )}

                  {
                    copy.continueChat
                  }
                </button>

                <button
                  type="button"
                  onClick={() =>
                    cameraInputRef.current?.click()
                  }
                  disabled={
                    savingChat
                  }
                >
                  <Camera size={16} />

                  {
                    copy.anotherPhoto
                  }
                </button>

                <button
                  type="button"
                  onClick={
                    handleSaveAll
                  }
                  disabled={
                    savingChat ||
                    saved
                  }
                >
                  {saved ? (
                    <CheckCircle2
                      size={16}
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saved
                    ? copy.saved
                    : copy.saveAll}
                </button>
              </div>
            </section>
          )}

        {!analysis &&
          !analyzing && (
            <div className="bill-info-strip">
              <InfoItem
                icon={
                  <IndianRupee
                    size={18}
                  />
                }
                title={
                  copy.understandCharges
                }
                text={
                  copy.understandChargesHint
                }
              />

              <InfoItem
                icon={
                  <Calendar
                    size={18}
                  />
                }
                title={
                  copy.dueDates
                }
                text={
                  copy.dueDatesHint
                }
              />

              <InfoItem
                icon={
                  <TrendingDown
                    size={18}
                  />
                }
                title={
                  copy.savings
                }
                text={
                  copy.savingsHint
                }
              />

              <InfoItem
                icon={
                  <Lightbulb
                    size={18}
                  />
                }
                title={
                  copy.followUps
                }
                text={
                  copy.followUpsHint
                }
              />
            </div>
          )}
      </main>
    </Layout>
  );
};

const Step = ({
  number,
  label,
  active = false,
}) => (
  <div
    className={`bill-step ${
      active ? "active" : ""
    }`}
  >
    <span>{number}</span>
    <b>{label}</b>
  </div>
);

const CardHead = ({
  icon,
  title,
  text,
  compact = false,
}) => (
  <div
    className={`bill-card-head ${
      compact ? "compact" : ""
    }`}
  >
    <div className="bill-head-icon">
      {icon}
    </div>

    <div>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  </div>
);

const UploadOption = ({
  icon,
  title,
  hint,
  camera = false,
  onClick,
}) => (
  <button
    type="button"
    className="upload-card"
    onClick={onClick}
  >
    <div
      className={
        camera
          ? "camera-icon"
          : ""
      }
    >
      {icon}
    </div>

    <span>
      <strong>{title}</strong>
      <small>{hint}</small>
    </span>

    <ArrowRight size={16} />
  </button>
);

const EmptyState = ({
  copy,
}) => (
  <div className="idle-view">
    <BillStack idle />

    <span>
      {copy.emptyKicker}
    </span>

    <h2>
      {copy.emptyTitle}
    </h2>

    <p>
      {copy.emptyText}
    </p>
  </div>
);

const AnalysisState = ({
  copy,
}) => (
  <div className="analyzing-view">
    <BillStack />

    <span>
      {copy.emptyKicker}
    </span>

    <h2>
      {copy.analyzing}
    </h2>

    <p>
      {copy.analyzingText}
    </p>

    <div className="progress-list">
      {copy.analyzingSteps.map(
        (step, index) => (
          <div
            className={
              index === 0
                ? "current"
                : ""
            }
            key={step}
          >
            <b>
              {index === 0 ? (
                <Loader2
                  size={12}
                  className="bill-spin"
                />
              ) : (
                <Check
                  size={11}
                />
              )}
            </b>

            <span>{step}</span>
          </div>
        )
      )}
    </div>

    <div className="analysis-note">
      <Sparkles size={14} />
      <span>{copy.wait}</span>
    </div>
  </div>
);

const ResultState = ({
  copy,
  language,
  billType,
  analysis,
}) => (
  <div className="result-view">
    <div className="result-head">
      <div className="result-icon">
        <CheckCircle2
          size={20}
        />
      </div>

      <div>
        <span>
          {copy.complete}
        </span>

        <h2>{copy.report}</h2>

        <p>
          {getBillTypeLabel(
            billType,
            language
          )}
          {" · "}
          {LANGUAGE_DATA.find(
            (item) =>
              item.value ===
              language
          )?.native}
        </p>
      </div>
    </div>

    <div className="result-note">
      <Sparkles size={15} />

      <span>
        {copy.continueHint}
      </span>
    </div>

    <div className="result-scroll">
      <pre>{analysis}</pre>
    </div>
  </div>
);

const BillStack = ({
  idle = false,
}) => (
  <div
    className={
      idle
        ? "idle-stack"
        : "animated-stack"
    }
  >
    <div className="scan-glow" />

    <div className="stack-bill back">
      <span>BILL</span>
      <strong>₹</strong>
      <i />
      <i />
      <i />
    </div>

    <div className="stack-bill mid">
      <span>BILL</span>
      <strong>₹</strong>
      <i />
      <i />
      <i />
    </div>

    <div className="stack-bill front">
      <span>
        {idle
          ? "YOUR BILL"
          : "ANALYZING"}
      </span>

      <strong>
        <Zap size={15} />
      </strong>

      <i />
      <i />
      <i />

      {!idle && (
        <em className="scan-line" />
      )}
    </div>

    <div className="orbit" />
    <div className="orbit two" />

    <Sparkles
      size={17}
      className="float-spark a"
    />

    <Sparkles
      size={13}
      className="float-spark b"
    />
  </div>
);

const InfoItem = ({
  icon,
  title,
  text,
}) => (
  <div className="info-item">
    <div>{icon}</div>

    <span>
      <strong>{title}</strong>
      <small>{text}</small>
    </span>
  </div>
);

const getBillTypeLabel = (
  billType,
  language
) => {
  const labels = {
    English: {
      Electricity: "Electricity",
      Mobile: "Mobile",
      Internet: "Internet",
      Water: "Water",
      Insurance: "Insurance",
      Other: "Other",
    },

    Hindi: {
      Electricity: "बिजली",
      Mobile: "मोबाइल",
      Internet: "इंटरनेट",
      Water: "पानी",
      Insurance: "बीमा",
      Other: "अन्य",
    },

    Telugu: {
      Electricity: "విద్యుత్",
      Mobile: "మొబైల్",
      Internet: "ఇంటర్నెట్",
      Water: "నీరు",
      Insurance: "బీమా",
      Other: "ఇతర",
    },

    Tamil: {
      Electricity: "மின்சாரம்",
      Mobile: "மொபைல்",
      Internet: "இணையம்",
      Water: "தண்ணீர்",
      Insurance: "காப்பீடு",
      Other: "மற்றவை",
    },

    Kannada: {
      Electricity: "ವಿದ್ಯುತ್",
      Mobile: "ಮೊಬೈಲ್",
      Internet: "ಇಂಟರ್ನೆಟ್",
      Water: "ನೀರು",
      Insurance: "ವಿಮೆ",
      Other: "ಇತರೆ",
    },
  };

  return (
    labels[language]?.[billType] ||
    labels.English[billType]
  );
};

export default Bills;