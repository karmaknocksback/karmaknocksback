/**
 * DIGAMBAR JAIN COMPLETE FESTIVAL DATABASE
 * All 24 Tirthankar Panch Kalyanaks + Major Parvas + Vrats
 * Based on Mahapuran (Digambar tradition) — samyakdarshan.org
 * Tithis in AMANTA system (matches our Brahma Muhurta calculator)
 * NOT Shwetambar — pure Digambar research
 */

export interface JainFestival {
  key:          string;
  name:         string;
  nameHi:       string;
  category:     "kalyanak"|"parva"|"mahaparva"|"vrat"|"auspicious"|"ashtaahnika";
  tirthankarNum?: number;  // 1–24 for Tirthankar festivals
  emoji:        string;
  color:        string;
  description:  string;
  descriptionHi?: string;
  paksha:       "shukla"|"krishna"|"both";
  tithi:        number;   // 1–15 (30 = Amavasya)
  monthIndex:   number;   // 0=Chaitra...11=Phalguna; -1=every month
}

// ════════════════════════════════════════════════════════════════
// 24 TIRTHANKAR JANMA KALYANAKS (Digambar Mahapuran tithis)
// ════════════════════════════════════════════════════════════════
// Note: Tithis are in Amanta system. Digambar panchang uses Purnimanta
// so some Krishna-paksha tithis shift by one month label.
// Verified against 2026 calendar from samyakdarshan.org

const TIRTHANKAR_JANMA: JainFestival[] = [
  // 1 — RISHABHDEV (Adinath)
  { key:"t01_rishabhdev_janma", tirthankarNum:1,
    name:"Rishabhdev Janma Kalyanak", nameHi:"ऋषभदेव जन्म कल्याणक",
    category:"kalyanak", emoji:"🐂", color:"#FF6F00",
    descriptionHi:"प्रथम तीर्थंकर भगवान ऋषभदेव (आदिनाथ) का जन्म कल्याणक। इन्हीं से इस अवसर्पिणी काल के जैन धर्म का पुनः प्रवर्तन हुआ।",
    description:"Birth of 1st Tirthankar Bhagwan Rishabhdev (Adinath). Originator of Jainism in this age.",
    paksha:"krishna", tithi:9, monthIndex:11 },  // Phalguna Krishna 9 (amanta) = traditional Chaitra Krishna 9

  // 2 — AJITNATH
  { key:"t02_ajitnath_janma", tirthankarNum:2,
    name:"Ajitnath Janma Kalyanak", nameHi:"अजितनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🐘", color:"#FF8F00",
    descriptionHi:"2nd तीर्थंकर भगवान अजितनाथ का जन्म कल्याणक।",
    description:"Birth of 2nd Tirthankar Bhagwan Ajitnath.",
    paksha:"shukla", tithi:10, monthIndex:10 },  // Magh Shukla 10

  // 3 — SAMBHAVANATH
  { key:"t03_sambhavanath_janma", tirthankarNum:3,
    name:"Sambhavanath Janma Kalyanak", nameHi:"सम्भवनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🐴", color:"#E65100",
    descriptionHi:"3rd तीर्थंकर भगवान सम्भवनाथ का जन्म कल्याणक — मार्गशीर्ष शुक्ल चतुर्दशी।",
    description:"Birth of 3rd Tirthankar Bhagwan Sambhavanath — Margashirsha Shukla 14.",
    paksha:"shukla", tithi:14, monthIndex:8 },  // Margashirsha Shukla 14

  // 4 — ABHINANDANNATH
  { key:"t04_abhinandan_janma", tirthankarNum:4,
    name:"Abhinandannath Janma Kalyanak", nameHi:"अभिनन्दन जन्म कल्याणक",
    category:"kalyanak", emoji:"🐒", color:"#F57F17",
    descriptionHi:"4th तीर्थंकर भगवान अभिनन्दन स्वामी का जन्म कल्याणक — माघ शुक्ल द्वादशी।",
    description:"Birth of 4th Tirthankar Bhagwan Abhinandannath — Magh Shukla 12.",
    paksha:"shukla", tithi:12, monthIndex:10 },  // Magh Shukla 12

  // 5 — SUMATINATH
  { key:"t05_sumatinath_janma", tirthankarNum:5,
    name:"Sumatinath Janma Kalyanak", nameHi:"सुमतिनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🪢", color:"#F9A825",
    descriptionHi:"5th तीर्थंकर भगवान सुमतिनाथ का जन्म — इनका जन्म, केवलज्ञान और मोक्ष तीनों एक ही तिथि को हुए।",
    description:"Birth of 5th Tirthankar Bhagwan Sumatinath. Unique: Janma, Kevaljnan & Nirvan all on same tithi — Chaitra Shukla 11.",
    paksha:"shukla", tithi:11, monthIndex:0 },  // Chaitra Shukla 11

  // 6 — PADMAPRABHU
  { key:"t06_padmaprabhu_janma", tirthankarNum:6,
    name:"Padmaprabhu Janma Kalyanak", nameHi:"पद्मप्रभु जन्म कल्याणक",
    category:"kalyanak", emoji:"🪷", color:"#D84315",
    descriptionHi:"6th तीर्थंकर भगवान पद्मप्रभु का जन्म — कार्तिक कृष्ण त्रयोदशी।",
    description:"Birth of 6th Tirthankar Bhagwan Padmaprabhu — Kartika Krishna 13.",
    paksha:"krishna", tithi:13, monthIndex:7 },  // Kartika Krishna 13

  // 7 — SUPARSHVANATH
  { key:"t07_suparshvanath_janma", tirthankarNum:7,
    name:"Suparshvanath Janma Kalyanak", nameHi:"सुपार्श्वनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🐊", color:"#558B2F",
    descriptionHi:"7th तीर्थंकर भगवान सुपार्श्वनाथ का जन्म — ज्येष्ठ शुक्ल द्वादशी।",
    description:"Birth of 7th Tirthankar Bhagwan Suparshvanath — Jyeshtha Shukla 12.",
    paksha:"shukla", tithi:12, monthIndex:2 },  // Jyeshtha Shukla 12

  // 8 — CHANDRAPRABHU
  { key:"t08_chandraprabhu_janma", tirthankarNum:8,
    name:"Chandraprabhu Janma Kalyanak", nameHi:"चन्द्रप्रभु जन्म कल्याणक",
    category:"kalyanak", emoji:"🌙", color:"#1565C0",
    descriptionHi:"8th तीर्थंकर भगवान चन्द्रप्रभु का जन्म — भाद्रपद कृष्ण द्वादशी।",
    description:"Birth of 8th Tirthankar Bhagwan Chandraprabhu — Bhadrapad Krishna 12.",
    paksha:"krishna", tithi:12, monthIndex:5 },  // Bhadrapad Krishna 12

  // 9 — PUSHPADANTA (SUVIDHINATH)
  { key:"t09_pushpadanta_janma", tirthankarNum:9,
    name:"Pushpadanta Janma Kalyanak", nameHi:"पुष्पदन्त जन्म कल्याणक",
    category:"kalyanak", emoji:"🌼", color:"#00695C",
    descriptionHi:"9th तीर्थंकर भगवान पुष्पदन्त (सुविधिनाथ) का जन्म — मार्गशीर्ष शुक्ल पञ्चमी।",
    description:"Birth of 9th Tirthankar Bhagwan Pushpadanta (Suvidhinath) — Margashirsha Shukla 5.",
    paksha:"shukla", tithi:5, monthIndex:8 },  // Margashirsha Shukla 5

  // 10 — SHEETALNATH
  { key:"t10_sheetalnath_janma", tirthankarNum:10,
    name:"Sheetalnath Janma Kalyanak", nameHi:"शीतलनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"❄️", color:"#00ACC1",
    descriptionHi:"10th तीर्थंकर भगवान शीतलनाथ का जन्म — पौष कृष्ण द्वादशी।",
    description:"Birth of 10th Tirthankar Bhagwan Sheetalnath — Paush Krishna 12.",
    paksha:"krishna", tithi:12, monthIndex:9 },  // Paush Krishna 12

  // 11 — SHREYANSNATH
  { key:"t11_shreyansnath_janma", tirthankarNum:11,
    name:"Shreyansnath Janma Kalyanak", nameHi:"श्रेयांसनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🦁", color:"#6A1B9A",
    descriptionHi:"11th तीर्थंकर भगवान श्रेयांसनाथ का जन्म। यही वह राजा श्रेयांस के पूर्वज हैं जिन्होंने आदिनाथ को इक्षुरस दिया — माघ कृष्ण एकादशी।",
    description:"Birth of 11th Tirthankar Bhagwan Shreyansnath — Magh Krishna 11.",
    paksha:"krishna", tithi:11, monthIndex:10 },  // Magh Krishna 11

  // 12 — VASUPUJYA
  { key:"t12_vasupujya_janma", tirthankarNum:12,
    name:"Vasupujya Janma Kalyanak", nameHi:"वासुपूज्य जन्म कल्याणक",
    category:"kalyanak", emoji:"🐃", color:"#AD1457",
    descriptionHi:"12th तीर्थंकर भगवान वासुपूज्य का जन्म — माघ कृष्ण चतुर्दशी।",
    description:"Birth of 12th Tirthankar Bhagwan Vasupujya — Magh Krishna 14.",
    paksha:"krishna", tithi:14, monthIndex:10 },  // Magh Krishna 14

  // 13 — VIMALNATH
  { key:"t13_vimalnath_janma", tirthankarNum:13,
    name:"Vimalnath Janma Kalyanak", nameHi:"विमलनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"💫", color:"#1976D2",
    descriptionHi:"13th तीर्थंकर भगवान विमलनाथ का जन्म — माघ शुक्ल तृतीया/चतुर्थी।",
    description:"Birth of 13th Tirthankar Bhagwan Vimalnath — Magh Shukla 3/4.",
    paksha:"shukla", tithi:4, monthIndex:10 },  // Magh Shukla 4 (2026: 22-Jan = Magh Sh 4)

  // 14 — ANANTANATH
  { key:"t14_anantanath_janma", tirthankarNum:14,
    name:"Anantanath Janma Kalyanak", nameHi:"अनन्तनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"♾️", color:"#283593",
    descriptionHi:"14th तीर्थंकर भगवान अनन्तनाथ का जन्म — वैशाख कृष्ण द्वादशी।",
    description:"Birth of 14th Tirthankar Bhagwan Anantanath — Vaishakh Krishna 12.",
    paksha:"krishna", tithi:12, monthIndex:1 },  // Vaishakh Krishna 12

  // 15 — DHARMANATH
  { key:"t15_dharmanath_janma", tirthankarNum:15,
    name:"Dharmanath Janma Kalyanak", nameHi:"धर्मनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"⚖️", color:"#4E342E",
    descriptionHi:"15th तीर्थंकर भगवान धर्मनाथ का जन्म — माघ शुक्ल द्वादशी।",
    description:"Birth of 15th Tirthankar Bhagwan Dharmanath — Magh Shukla 12.",
    paksha:"shukla", tithi:12, monthIndex:10 },  // Magh Shukla 12

  // 16 — SHANTINATH
  { key:"t16_shantinath_janma", tirthankarNum:16,
    name:"Shantinath Janma+Tap+Nirvan Kalyanak", nameHi:"शान्तिनाथ जन्म+तप+निर्वाण कल्याणक",
    category:"kalyanak", emoji:"🕊️", color:"#00796B",
    descriptionHi:"16th तीर्थंकर भगवान शांतिनाथ का जन्म, दीक्षा और निर्वाण — तीनों एक ही तिथि को! वैशाख कृष्ण चतुर्दशी।",
    description:"16th Tirthankar Bhagwan Shantinath — unique: Janma, Diksha & Nirvan all on same tithi! Vaishakh Krishna 14.",
    paksha:"krishna", tithi:14, monthIndex:1 },  // Vaishakh Krishna 14

  // 17 — KUNTHUNATH
  { key:"t17_kunthunath_janma", tirthankarNum:17,
    name:"Kunthunath Janma+Tap+Nirvan Kalyanak", nameHi:"कुन्थुनाथ जन्म+तप+निर्वाण कल्याणक",
    category:"kalyanak", emoji:"🐐", color:"#00838F",
    descriptionHi:"17th तीर्थंकर भगवान कुन्थुनाथ का जन्म, दीक्षा और निर्वाण — तीनों एक ही तिथि। वैशाख शुक्ल द्वितीया।",
    description:"17th Tirthankar Bhagwan Kunthunath — Janma, Diksha & Nirvan on same tithi. Vaishakh Shukla 2.",
    paksha:"shukla", tithi:2, monthIndex:1 },  // Vaishakh Shukla 2

  // 18 — ARANATH
  { key:"t18_aranath_janma", tirthankarNum:18,
    name:"Aranath Janma Kalyanak", nameHi:"अरनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🎯", color:"#558B2F",
    descriptionHi:"18th तीर्थंकर भगवान अरनाथ का जन्म — मार्गशीर्ष कृष्ण एकादशी।",
    description:"Birth of 18th Tirthankar Bhagwan Aranath — Margashirsha Krishna 11.",
    paksha:"krishna", tithi:11, monthIndex:8 },  // Margashirsha Krishna 11

  // 19 — MALLINATH (DIGAMBAR: MALE)
  { key:"t19_mallinath_janma", tirthankarNum:19,
    name:"Mallinath Janma Kalyanak", nameHi:"मल्लिनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🏺", color:"#37474F",
    descriptionHi:"19th तीर्थंकर भगवान मल्लिनाथ का जन्म। दिगम्बर परंपरा में मल्लिनाथ पुरुष थे — माघ कृष्ण एकादशी।",
    description:"19th Tirthankar Bhagwan Mallinath (Digambar tradition: male). Magh Krishna 11.",
    paksha:"krishna", tithi:11, monthIndex:10 },  // Magh Krishna 11

  // 20 — MUNISUVRATA
  { key:"t20_munisuvrata_janma", tirthankarNum:20,
    name:"Munisuvrata Janma Kalyanak", nameHi:"मुनिसुव्रत जन्म कल्याणक",
    category:"kalyanak", emoji:"🐢", color:"#2E7D32",
    descriptionHi:"20th तीर्थंकर भगवान मुनिसुव्रत का जन्म — चैत्र शुक्ल नवमी।",
    description:"Birth of 20th Tirthankar Bhagwan Munisuvrata — Chaitra Shukla 9.",
    paksha:"shukla", tithi:9, monthIndex:0 },  // Chaitra Shukla 9 (2026: Mar 27)

  // 21 — NAMINATH
  { key:"t21_naminath_janma", tirthankarNum:21,
    name:"Naminath Janma Kalyanak", nameHi:"नमिनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🌊", color:"#0277BD",
    descriptionHi:"21st तीर्थंकर भगवान नमिनाथ का जन्म — ज्येष्ठ कृष्ण दशमी।",
    description:"Birth of 21st Tirthankar Bhagwan Naminath — Jyeshtha Krishna 10.",
    paksha:"krishna", tithi:10, monthIndex:2 },  // Jyeshtha Krishna 10 (2026: Jun 10)

  // 22 — NEMINATH (ARISTANEMI)
  { key:"t22_neminath_janma", tirthankarNum:22,
    name:"Neminath Janma Kalyanak", nameHi:"नेमिनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🐚", color:"#00695C",
    descriptionHi:"22nd तीर्थंकर भगवान नेमिनाथ का जन्म — श्रावण शुक्ल षष्ठी।",
    description:"Birth of 22nd Tirthankar Bhagwan Neminath — Shravana Shukla 6.",
    paksha:"shukla", tithi:6, monthIndex:4 },  // Shravana Shukla 6 (2026: Aug 18)

  // 23 — PARSHWANATH
  { key:"t23_parshwanath_janma", tirthankarNum:23,
    name:"Parshwanath Janma Kalyanak", nameHi:"पार्श्वनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🐍", color:"#1B5E20",
    descriptionHi:"23rd तीर्थंकर भगवान पार्श्वनाथ का जन्म — पौष कृष्ण एकादशी। इस दिन 3 दिन का उपवास रखा जाता है।",
    description:"Birth of 23rd Tirthankar Bhagwan Parshwanath. 3-day fast observed — Paush Krishna 11.",
    paksha:"krishna", tithi:11, monthIndex:9 },  // Paush Krishna 11

  // 24 — MAHAVIR
  { key:"t24_mahavir_janma", tirthankarNum:24,
    name:"Mahavir Janma Kalyanak (Jayanti)", nameHi:"महावीर जन्म कल्याणक",
    category:"kalyanak", emoji:"🌟", color:"#FFD700",
    descriptionHi:"24th और अंतिम तीर्थंकर भगवान महावीर का जन्म कुण्डलपुर में हुआ। सबसे बड़ा जैन उत्सव — चैत्र शुक्ल त्रयोदशी।",
    description:"Birth of 24th & last Tirthankar Bhagwan Mahavir at Kundalapur. Greatest Jain festival — Chaitra Shukla 13.",
    paksha:"shukla", tithi:13, monthIndex:0 },  // Chaitra Shukla 13
];

// ════════════════════════════════════════════════════════════════
// KEY NIRVAN KALYANAKS
// ════════════════════════════════════════════════════════════════
const NIRVAN_KALYANAKS: JainFestival[] = [
  { key:"t01_rishabhdev_nirvan", tirthankarNum:1,
    name:"Rishabhdev Nirvan Kalyanak — Meru Trayodashi", nameHi:"ऋषभदेव निर्वाण कल्याणक — मेरु त्रयोदशी",
    category:"kalyanak", emoji:"🏔", color:"#9C27B0",
    descriptionHi:"प्रथम तीर्थंकर का कैलाश पर्वत (अष्टापद) से मोक्ष। 5 मेरु और 80 अकृत्रिम जिनालयों के मांडले बनाकर मोक्ष-लाडू चढ़ाया जाता है — पौष कृष्ण चतुर्दशी।",
    description:"Bhagwan Rishabhdev attained Moksha at Ashtapad (Kailash). Special Mandal puja with Moksha Ladu — Paush Krishna 14.",
    paksha:"krishna", tithi:14, monthIndex:9 },  // Paush Krishna 14

  { key:"t22_neminath_nirvan", tirthankarNum:22,
    name:"Neminath Moksha Kalyanak", nameHi:"नेमिनाथ मोक्ष कल्याणक",
    category:"kalyanak", emoji:"⛰", color:"#2E7D32",
    descriptionHi:"भगवान नेमिनाथ का गिरनार पर्वत से मोक्ष — आषाढ़ शुक्ल सप्तमी।",
    description:"Bhagwan Neminath attained Moksha at Girnar — Ashadha Shukla 7.",
    paksha:"shukla", tithi:7, monthIndex:3 },  // Ashadha Shukla 7

  { key:"t23_parshwanath_nirvan", tirthankarNum:23,
    name:"Parshwanath Nirvan Kalyanak", nameHi:"पार्श्वनाथ निर्वाण कल्याणक",
    category:"kalyanak", emoji:"🏔", color:"#1B5E20",
    descriptionHi:"भगवान पार्श्वनाथ का सम्मेद शिखरजी से मोक्ष — श्रावण शुक्ल सप्तमी।",
    description:"Bhagwan Parshwanath attained Moksha at Sammet Shikhar — Shravana Shukla 7.",
    paksha:"shukla", tithi:7, monthIndex:4 },  // Shravana Shukla 7

  { key:"t24_mahavir_garbha", tirthankarNum:24,
    name:"Mahavir Garbha Kalyanak", nameHi:"महावीर गर्भ कल्याणक",
    category:"kalyanak", emoji:"💛", color:"#F9A825",
    descriptionHi:"भगवान महावीर का माता त्रिशला के गर्भ में अवतरण — आषाढ़ शुक्ल षष्ठी।",
    description:"Bhagwan Mahavir descended into mother Trishala's womb — Ashadha Shukla 6.",
    paksha:"shukla", tithi:6, monthIndex:3 },  // Ashadha Shukla 6

  { key:"t24_mahavir_kevaljnan", tirthankarNum:24,
    name:"Mahavir Kevaljnan Kalyanak", nameHi:"महावीर केवलज्ञान कल्याणक",
    category:"kalyanak", emoji:"💡", color:"#FFEB3B",
    descriptionHi:"भगवान महावीर ने ऋजुबालुका नदी के तट पर घातीय कर्मों का नाश कर केवलज्ञान प्राप्त किया — वैशाख शुक्ल दशमी।",
    description:"Mahavir attained Omniscience at Rijuvaluka river — Vaishakh Shukla 10.",
    paksha:"shukla", tithi:10, monthIndex:1 },  // Vaishakh Shukla 10

  { key:"t24_mahavir_nirvan", tirthankarNum:24,
    name:"Mahavir Nirvan — Jain Diwali 🪔", nameHi:"महावीर निर्वाण दीपावली",
    category:"kalyanak", emoji:"🪔", color:"#FF5722",
    descriptionHi:"पावापुरी से भगवान महावीर का निर्वाण। जैन 'निर्वाण लाडू' चढ़ाते हैं और दीप जलाते हैं — कार्तिक कृष्ण चतुर्दशी/अमावस्या।",
    description:"Mahavir's Moksha at Pawapuri (527 BCE). Jains offer 'Nirvan Ladu'. Jain Diwali — Kartika Krishna 14.",
    paksha:"krishna", tithi:14, monthIndex:7 },  // Kartika Krishna 14 (night = Amavasya)
];

// ════════════════════════════════════════════════════════════════
// MAJOR DIGAMBAR JAIN PARVAS & FESTIVALS
// ════════════════════════════════════════════════════════════════
const MAJOR_FESTIVALS: JainFestival[] = [
  // Varshitap sequence
  { key:"varshitap_start",
    name:"Varshitap Praarambh (Rishabhdev Diksha)", nameHi:"वर्षीतप प्रारंभ (ऋषभदेव दीक्षा)",
    category:"vrat", emoji:"🔥", color:"#FF9800",
    descriptionHi:"भगवान ऋषभदेव की दीक्षा व वर्षीतप का प्रारंभ (एकांतर उपवास)। फाल्गुन/चैत्र कृष्ण अष्टमी।",
    description:"Start of Varshitap (alternating fasting). Rishabhdev's Diksha day — Phalguna/Chaitra Krishna 8.",
    paksha:"krishna", tithi:8, monthIndex:11 },  // Phalguna Krishna 8

  { key:"akshay_tritiya",
    name:"Akshaya Tritiya — Varshitap Parana", nameHi:"अक्षय तृतीया — वर्षीतप पारणा",
    category:"parva", emoji:"✨", color:"#FFD700",
    descriptionHi:"राजा श्रेयांस ने भगवान आदिनाथ को गन्ने का रस (इक्षुरस) देकर 1 वर्ष का उपवास तोड़ा। जैन इतिहास में दान-तीर्थ की स्थापना — वैशाख शुक्ल तृतीया।",
    description:"King Shreyansh gave sugarcane juice to Bhagwan Adinath ending year-long fast. Origin of Jain daan — Vaishakh Shukla 3.",
    paksha:"shukla", tithi:3, monthIndex:1 },  // Vaishakh Shukla 3

  // Das Lakshan — 3 times per year
  { key:"das_lakshan_bhadrapad",
    name:"Das Lakshan Mahaparva (Bhadrapad — मुख्य)", nameHi:"भाद्रपद दशलक्षण महापर्व",
    category:"mahaparva", emoji:"💎", color:"#7C4DFF",
    descriptionHi:"दिगम्बर जैनों का सबसे बड़ा वार्षिक पर्व। भाद्रपद शुक्ल तृतीया से अनन्त चतुर्दशी (14वीं) तक 10 दिन। आत्मा के 10 उत्तम धर्मों की आराधना।",
    description:"Greatest Digambar Jain annual festival — 10 days (Bhadrapad Shukla 3 to 14). 10 supreme Dharmas worship.",
    paksha:"shukla", tithi:3, monthIndex:5 },  // Bhadrapad Shukla 3

  { key:"das_lakshan_magh",
    name:"Das Lakshan Parva (Magh)", nameHi:"माघ दशलक्षण पर्व",
    category:"parva", emoji:"💎", color:"#7C4DFF",
    descriptionHi:"वर्ष का पहला दशलक्षण — माघ शुक्ल चतुर्थी से द्वादशी।",
    description:"First Das Lakshan of the year — Magh Shukla 4 to 12.",
    paksha:"shukla", tithi:4, monthIndex:10 },  // Magh Shukla 4

  { key:"das_lakshan_chaitra",
    name:"Das Lakshan Parva (Chaitra)", nameHi:"चैत्र दशलक्षण पर्व",
    category:"parva", emoji:"💎", color:"#7C4DFF",
    descriptionHi:"वर्ष का दूसरा दशलक्षण — चैत्र शुक्ल चतुर्थी से द्वादशी।",
    description:"Second Das Lakshan of the year — Chaitra Shukla 4 to 12.",
    paksha:"shukla", tithi:4, monthIndex:0 },  // Chaitra Shukla 4

  // Ashtaahnika — 3 times
  { key:"ashtaahnika_kartik",
    name:"Kartik Ashtaahnika Parva", nameHi:"कार्तिक अष्टाह्निका पर्व",
    category:"ashtaahnika", emoji:"⭐", color:"#FF8F00",
    descriptionHi:"8 दिन (कार्तिक शुक्ल अष्टमी से पूर्णिमा) — नंदीश्वर द्वीप के 84 अकृत्रिम जिनालयों की भाव-पूजा। सिद्धचक्र महामण्डल विधान।",
    description:"8-day Nandishvar Dweep Bhav-Puja, Siddhachakra Vidhan — Kartik Shukla 8-15.",
    paksha:"shukla", tithi:8, monthIndex:7 },  // Kartik Shukla 8

  { key:"ashtaahnika_phalgun",
    name:"Phalgun Ashtaahnika Parva", nameHi:"फाल्गुन अष्टाह्निका पर्व",
    category:"ashtaahnika", emoji:"⭐", color:"#FF8F00",
    descriptionHi:"8 दिन (फाल्गुन शुक्ल अष्टमी से पूर्णिमा) — नंदीश्वर द्वीप पूजा।",
    description:"8-day Nandishvar puja — Phalgun Shukla 8-15.",
    paksha:"shukla", tithi:8, monthIndex:11 },  // Phalgun Shukla 8

  { key:"ashtaahnika_ashadha",
    name:"Ashadha Ashtaahnika Parva", nameHi:"आषाढ़ अष्टाह्निका पर्व",
    category:"ashtaahnika", emoji:"⭐", color:"#FF8F00",
    descriptionHi:"8 दिन (आषाढ़ शुक्ल अष्टमी से पूर्णिमा) — नंदीश्वर द्वीप की भाव-पूजा।",
    description:"8-day Nandishvar puja — Ashadha Shukla 8-15.",
    paksha:"shukla", tithi:8, monthIndex:3 },  // Ashadha Shukla 8

  // Special events
  { key:"anant_chaturdashi",
    name:"Anant Chaturdashi — Das Lakshan Samaapti", nameHi:"अनन्त चतुर्दशी",
    category:"parva", emoji:"♾️", color:"#3F51B5",
    descriptionHi:"दशलक्षण महापर्व का अंतिम दिन। 'अनन्त' — आत्मा के अनन्त गुणों की पूजा। पूर्ण उपवास रखा जाता है — भाद्रपद शुक्ल चतुर्दशी।",
    description:"Final day of Das Lakshan. Worship of soul's infinite qualities. Full fast — Bhadrapad Shukla 14.",
    paksha:"shukla", tithi:14, monthIndex:5 },

  { key:"kshamavani",
    name:"Kshamavani — Forgiveness Day", nameHi:"क्षमावाणी पर्व",
    category:"parva", emoji:"💝", color:"#E91E63",
    descriptionHi:"दशलक्षण के बाद — समस्त जीवों के प्रति हाथ जोड़कर 'मिच्छामि दुक्कडं' बोलकर क्षमा माँगना — भाद्रपद कृष्ण प्रतिपदा।",
    description:"Digambar Jain Forgiveness Day after Das Lakshan — 'Micchami Dukkadam' — Bhadrapad Krishna 1.",
    paksha:"krishna", tithi:1, monthIndex:5 },

  { key:"jain_new_year",
    name:"Jain New Year (Veer Nirvan Samvat)", nameHi:"जैन नव वर्ष (वीर निर्वाण संवत)",
    category:"parva", emoji:"🎊", color:"#FF9800",
    descriptionHi:"भगवान महावीर के निर्वाण के अगले दिन गौतम गणधर को केवलज्ञान प्राप्त हुआ। वीर निर्वाण संवत नव वर्ष — कार्तिक शुक्ल प्रतिपदा।",
    description:"Day Gautam Gandhar attained Kevaljnan. Veer Nirvan Samvat New Year — Kartik Shukla 1.",
    paksha:"shukla", tithi:1, monthIndex:7 },

  { key:"gyan_panchami",
    name:"Gyan Panchami (Shrut Panchami)", nameHi:"ज्ञान पञ्चमी",
    category:"parva", emoji:"📿", color:"#795548",
    descriptionHi:"आचार्य पुष्पदंत व भूतबलि द्वारा 'षट्खंडागम' (प्रथम दिगम्बर जैन ग्रंथ) की रचना समाप्त हुई। जिनवाणी माँ की विशेष पूजा — कार्तिक शुक्ल पञ्चमी।",
    description:"Completion of Shat-khandagam (first Digambar Jain text). Jinvani puja — Kartik Shukla 5.",
    paksha:"shukla", tithi:5, monthIndex:7 },

  { key:"shrut_panchami_jyeshtha",
    name:"Shrut Panchami (Jyeshtha)", nameHi:"श्रुत पञ्चमी (ज्येष्ठ)",
    category:"parva", emoji:"📚", color:"#1565C0",
    descriptionHi:"जैन शास्त्रों और जिनवाणी आराधना का दिन — ज्येष्ठ शुक्ल पञ्चमी।",
    description:"Jain scriptures worship day — Jyeshtha Shukla 5.",
    paksha:"shukla", tithi:5, monthIndex:2 },

  { key:"raksha_bandhan_jain",
    name:"Raksha Bandhan (Jain Historical)", nameHi:"रक्षाबंधन — जैन ऐतिहासिक",
    category:"parva", emoji:"🧿", color:"#9E9D24",
    descriptionHi:"मुनिराज विष्णुकुमार ने वामन रूप धारण कर राजा बलि द्वारा 700 दिगम्बर जैन मुनियों की रक्षा की — भाद्रपद शुक्ल पञ्चमी।",
    description:"Muniraaj Vishnukumar saved 700 Digambar Jain munis from King Bali — Bhadrapad Shukla 5.",
    paksha:"shukla", tithi:5, monthIndex:5 },

  { key:"vir_shashan_jayanti",
    name:"Vir Shashan Jayanti", nameHi:"वीर शासन जयंती",
    category:"parva", emoji:"📢", color:"#FF6F00",
    descriptionHi:"भगवान महावीर की प्रथम दिव्यध्वनि (दिव्य उपदेश) का दिन। वीर शासन प्रारंभ — आषाढ़ शुक्ल एकादशी।",
    description:"Day of Bhagwan Mahavir's first Divya Dhwani (divine sermon). Vir Shashan begins — Ashadha Shukla 11.",
    paksha:"shukla", tithi:11, monthIndex:3 },

  { key:"guru_purnima",
    name:"Guru Purnima (Ashadha Purnima)", nameHi:"गुरु पूर्णिमा",
    category:"parva", emoji:"🙏", color:"#FF9800",
    descriptionHi:"जैन गुरुओं, आचार्यों और मुनियों के प्रति कृतज्ञता का दिन — आषाढ़ पूर्णिमा।",
    description:"Day of reverence for Jain Acharyas, Gurus and Munis — Ashadha Purnima.",
    paksha:"shukla", tithi:15, monthIndex:3 },

  // Ayambil Oli (Navapada Aradhana)
  { key:"ayambil_oli_chaitra",
    name:"Ayambil Oli / Navapada Aradhana (Chaitra)", nameHi:"अयंबिल ओली / नवपद आराधना (चैत्र)",
    category:"vrat", emoji:"🪷", color:"#AD1457",
    descriptionHi:"9 दिन का अयंबिल तप व नवपद (सिद्धचक्र) की आराधना — चैत्र शुक्ल सप्तमी से पूर्णिमा।",
    description:"9-day Ayambil fasting + Navapada (Siddhachakra) worship — Chaitra Shukla 7-15.",
    paksha:"shukla", tithi:7, monthIndex:0 },

  { key:"ayambil_oli_ashwin",
    name:"Ayambil Oli / Navapada Aradhana (Ashwin)", nameHi:"अयंबिल ओली / नवपद आराधना (आश्विन)",
    category:"vrat", emoji:"🪷", color:"#AD1457",
    descriptionHi:"9 दिन का अयंबिल तप — आश्विन शुक्ल सप्तमी से पूर्णिमा।",
    description:"9-day Ayambil fasting + Navapada worship — Ashwin Shukla 7-15.",
    paksha:"shukla", tithi:7, monthIndex:6 },

  { key:"kartik_purnima",
    name:"Kartik Purnima", nameHi:"कार्तिक पूर्णिमा",
    category:"auspicious", emoji:"🌕", color:"#FFD700",
    descriptionHi:"कार्तिक पूर्णिमा — अत्यंत शुभ दिन, उपवास और विशेष पूजा।",
    description:"Extremely auspicious Jain day — fasting and special puja — Kartik Shukla 15.",
    paksha:"shukla", tithi:15, monthIndex:7 },
];

// ════════════════════════════════════════════════════════════════
// MONTHLY RECURRING AUSPICIOUS DAYS
// ════════════════════════════════════════════════════════════════
const MONTHLY_DAYS: JainFestival[] = [
  { key:"purnima",
    name:"Purnima", nameHi:"पूर्णिमा",
    category:"auspicious", emoji:"🌕", color:"#FFD700",
    descriptionHi:"पूर्णिमा — पोषध व्रत, उपवास और प्रतिक्रमण का शुभ दिन। चाँदनी रात में ध्यान।",
    description:"Full Moon — Poshadh Vrat, Upvas and Pratikraman day.",
    paksha:"shukla", tithi:15, monthIndex:-1 },

  { key:"amavasya",
    name:"Amavasya", nameHi:"अमावस्या",
    category:"auspicious", emoji:"🌑", color:"#9C27B0",
    descriptionHi:"अमावस्या — पोषध व्रत, पितृ-स्मरण और आत्म-शुद्धि।",
    description:"New Moon — Poshadh Vrat, ancestral remembrance and self-purification.",
    paksha:"krishna", tithi:30, monthIndex:-1 },

  { key:"ekadashi_shukla",
    name:"Shukla Ekadashi", nameHi:"शुक्ल एकादशी",
    category:"auspicious", emoji:"⭐", color:"#4CAF50",
    descriptionHi:"शुक्ल एकादशी — व्रत, सामायिक और आत्म-चिंतन का दिन।",
    description:"11th tithi bright fortnight — Upvas, Samayik, self-reflection.",
    paksha:"shukla", tithi:11, monthIndex:-1 },

  { key:"ekadashi_krishna",
    name:"Krishna Ekadashi", nameHi:"कृष्ण एकादशी",
    category:"auspicious", emoji:"⭐", color:"#66BB6A",
    descriptionHi:"कृष्ण एकादशी — उपवास और साधना।",
    description:"26th tithi — fasting and spiritual practice.",
    paksha:"krishna", tithi:11, monthIndex:-1 },

  { key:"chaturdashi_shukla",
    name:"Shukla Chaturdashi — Gunsthan Parni", nameHi:"शुक्ल चतुर्दशी — गुणस्थान पारनी",
    category:"auspicious", emoji:"🙏", color:"#FF9800",
    descriptionHi:"'गुणस्थान पारनी' तिथि — पोषध, ब्रह्मचर्य और प्रतिक्रमण। अनेक तीर्थंकरों ने इसी तिथि पर मोक्ष प्राप्त किया।",
    description:"'Gunsthan Parni' tithi — Poshadh, celibacy, Pratikraman. Many Tirthankaras attained Moksha on Chaturdashi.",
    paksha:"shukla", tithi:14, monthIndex:-1 },

  { key:"chaturdashi_krishna",
    name:"Krishna Chaturdashi", nameHi:"कृष्ण चतुर्दशी",
    category:"auspicious", emoji:"🙏", color:"#E65100",
    descriptionHi:"कृष्ण चतुर्दशी — पोषध व्रत और आत्म-निरीक्षण।",
    description:"29th tithi — Poshadh Vrat and self-examination.",
    paksha:"krishna", tithi:14, monthIndex:-1 },

  { key:"ashtami_shukla",
    name:"Shukla Ashtami — Ashtkarm Nashani", nameHi:"शुक्ल अष्टमी — अष्टकर्म नाशनी",
    category:"auspicious", emoji:"🌟", color:"#2196F3",
    descriptionHi:"'अष्टकर्म नाशनी' — आत्मा के 8 कर्मों के नाश का विशेष प्रयास। हरी सब्जी त्याग, एकासन या उपवास, दीर्घ सामायिक।",
    description:"'Ashtkarm Nashani' — special effort to destroy 8 karmas. Green veg tyag, Ekasana/Upvas, extended Samayik.",
    paksha:"shukla", tithi:8, monthIndex:-1 },

  { key:"ashtami_krishna",
    name:"Krishna Ashtami — Ashtkarm Nashani", nameHi:"कृष्ण अष्टमी — अष्टकर्म नाशनी",
    category:"auspicious", emoji:"🌟", color:"#1565C0",
    descriptionHi:"कृष्ण अष्टमी — उपवास, सामायिक, अष्टकर्म नाशनी तिथि।",
    description:"23rd tithi — fasting, Samayik, karmic purification.",
    paksha:"krishna", tithi:8, monthIndex:-1 },
];

// ════════════════════════════════════════════════════════════════
// COMBINED DATABASE
// ════════════════════════════════════════════════════════════════
export const JAIN_FESTIVALS: JainFestival[] = [
  ...TIRTHANKAR_JANMA,
  ...NIRVAN_KALYANAKS,
  ...MAJOR_FESTIVALS,
  ...MONTHLY_DAYS,
];

// ─── Match festivals for a given tithi + month ──────────────
export function getJainFestivals(
  tithiNum:   number,   // 1–30
  monthIndex: number,   // 0–11
): JainFestival[] {
  const isShukla  = tithiNum <= 15;
  const paksha    = isShukla ? "shukla" : "krishna";
  const pakshaNum = isShukla ? tithiNum : tithiNum - 15;

  return JAIN_FESTIVALS.filter(f => {
    const monthMatch  = f.monthIndex === -1 || f.monthIndex === monthIndex;
    const pakshaMatch = f.paksha === paksha || f.paksha === "both";
    const tithiMatch  = f.tithi === pakshaNum
                     || (f.tithi === 30 && tithiNum === 30);
    return monthMatch && pakshaMatch && tithiMatch;
  });
}
