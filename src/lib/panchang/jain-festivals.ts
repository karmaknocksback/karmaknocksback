/**
 * DIGAMBAR JAIN FESTIVALS DATABASE — Complete Edition
 * Based on Digambar Jain shastra research and traditional panchang
 * Includes: Panch Kalyanak, Mahaparvs, Ashtaahnika, Das Lakshan (3x), Vrat days
 */

export interface JainFestival {
  key:         string;
  name:        string;
  nameHi:      string;
  category:    "kalyanak"|"parva"|"mahaparvа"|"vrat"|"auspicious"|"ashtaahnika";
  emoji:       string;
  color:       string;
  description: string;
  descriptionHi?: string;
  paksha:      "shukla"|"krishna"|"both";
  tithi:       number;
  monthIndex:  number;  // 0=Chaitra...11=Phalguna. -1=every month
}

export const JAIN_FESTIVALS: JainFestival[] = [

  // ══════════════════════════════════════════════════════════
  // MAHAVIR — 24th Tirthankar (most important)
  // ══════════════════════════════════════════════════════════
  { key:"mahavir_garbha",    name:"Mahavir Garbha Kalyanak", nameHi:"महावीर गर्भ कल्याणक",
    category:"kalyanak", emoji:"🌟", color:"#FFD700",
    descriptionHi:"भगवान महावीर के जीव का माता त्रिशलादेवी के गर्भ में अवतरण दिवस।",
    description:"Mahavir's soul descended into mother Trishala's womb — Ashadha Shukla 6.",
    paksha:"shukla", tithi:6, monthIndex:3 },

  { key:"mahavir_janma",     name:"Mahavir Janma Kalyanak (Jayanti)", nameHi:"महावीर जन्म कल्याणक (जयंती)",
    category:"kalyanak", emoji:"🎊", color:"#FFD700",
    descriptionHi:"कुंडलपुर में माता त्रिशला के गर्भ से अंतिम तीर्थंकर भगवान महावीर का जन्म। दिगंबर परंपरा में भव्य रथयात्राएं और पालकी उत्सव।",
    description:"Birth of Bhagwan Mahavir (599 BCE) at Kundalapur — Chaitra Shukla 13. Grand rath yatras celebrated.",
    paksha:"shukla", tithi:13, monthIndex:0 },

  { key:"mahavir_diksha",    name:"Mahavir Diksha Kalyanak", nameHi:"महावीर दीक्षा कल्याणक",
    category:"kalyanak", emoji:"🧘", color:"#FF9800",
    descriptionHi:"भगवान महावीर ने संसार से विरक्त होकर समस्त परिग्रह का त्याग किया और मुनि दीक्षा ग्रहण की।",
    description:"Mahavir renounced all worldly possessions and became a Digambar muni — Margashirsha Krishna 10.",
    paksha:"krishna", tithi:10, monthIndex:8 },

  { key:"mahavir_kevaljnan", name:"Mahavir Kevaljnan Kalyanak", nameHi:"महावीर केवलज्ञान कल्याणक",
    category:"kalyanak", emoji:"💡", color:"#FFEB3B",
    descriptionHi:"भगवान महावीर ने ऋजुबालुका नदी के तट पर शाल वृक्ष के नीचे चार घातीय कर्मों का नाश किया और केवलज्ञान प्राप्त किया।",
    description:"Mahavir attained Omniscience (Kevaljnan) under a Sal tree at Rijuvaluka river — Vaishakh Shukla 10.",
    paksha:"shukla", tithi:10, monthIndex:1 },

  { key:"mahavir_nirvan",    name:"Mahavir Nirvan — Jain Diwali 🪔", nameHi:"महावीर निर्वाण — दीपावली",
    category:"kalyanak", emoji:"🪔", color:"#FF5722",
    descriptionHi:"पावापुरी की जलमंदिर नगरी से भगवान महावीर ने स्वाति नक्षत्र में अंतिम उपदेश देकर मोक्ष प्राप्त किया। जैन मंदिरों में 'निर्वाण लाडू' चढ़ाया जाता है।",
    description:"Mahavir attained Moksha (527 BCE) at Pawapuri. Jains offer 'Nirvan Ladu' at temples early morning — Ashwin Krishna Amavasya.",
    paksha:"krishna", tithi:30, monthIndex:6 },

  // ══════════════════════════════════════════════════════════
  // RISHABHDEV — 1st Tirthankar (Adinath)
  // ══════════════════════════════════════════════════════════
  { key:"rishabhdev_janma",  name:"Rishabhdev Janma Kalyanak", nameHi:"ऋषभदेव जन्म कल्याणक",
    category:"kalyanak", emoji:"🌺", color:"#E91E63",
    descriptionHi:"प्रथम तीर्थंकर भगवान ऋषभदेव (आदिनाथ) का पावन जन्म दिवस। इन्हें जैन धर्म का प्रवर्तक माना जाता है।",
    description:"Birth of Bhagwan Rishabhdev, first Tirthankar and founder of Jainism — Chaitra Krishna 9.",
    paksha:"krishna", tithi:9, monthIndex:0 },

  { key:"varshitap_start",   name:"Varshitap Praarambh", nameHi:"वर्षीतप प्रारंभ",
    category:"vrat", emoji:"🔥", color:"#FF9800",
    descriptionHi:"दीक्षा लेने के बाद मुनि आहार न जानने के कारण भगवान आदिनाथ को भिक्षा नहीं मिली, तब उन्होंने 365 दिन के कठिन निराहार काल की शुरुआत इसी तिथि से की। चैत्र कृष्ण अष्टमी।",
    description:"Start of Bhagwan Adinath's year-long fast (alternating fasting). Varshitap vrat begins — Chaitra Krishna 8.",
    paksha:"krishna", tithi:8, monthIndex:0 },

  { key:"akshay_tritiya",    name:"Akshaya Tritiya — Varshitap Parana", nameHi:"अक्षय तृतीया — वर्षीतप पारणा",
    category:"parva", emoji:"✨", color:"#FFD700",
    descriptionHi:"एक वर्ष के कठिन उपवास के बाद हस्तिनापुर के राजा श्रेयांस ने भगवान आदिनाथ को नवधा भक्ति पूर्वक गन्ने का रस (इक्षु-रस) दिया। यह जैन इतिहास में दान-तीर्थ की स्थापना का दिन है।",
    description:"King Shreyansh gave sugarcane juice to Bhagwan Adinath ending his year-long fast — Vaishakh Shukla 3. Origin of Jain daan tradition.",
    paksha:"shukla", tithi:3, monthIndex:1 },

  { key:"meru_trayodashi",   name:"Meru Trayodashi — Adinath Nirvan", nameHi:"मेरु त्रयोदशी — आदिनाथ निर्वाण",
    category:"kalyanak", emoji:"🏔", color:"#9C27B0",
    descriptionHi:"प्रथम तीर्थंकर भगवान ऋषभदेव ने पौष कृष्ण द्वादशी को कैलाश पर्वत (अष्टापद) से समस्त कर्मों का क्षय कर मोक्ष प्राप्त किया। 5 मेरु और 80 अकृत्रिम जिनालयों के प्रतीक मांडले बनाकर मोक्ष-लाडू चढ़ाया जाता है।",
    description:"Bhagwan Rishabhdev attained Moksha at Ashtapad (Kailash). Special Mandal-puja with 'Moksha-Ladu' — Paush Krishna 13.",
    paksha:"krishna", tithi:13, monthIndex:9 },

  // ══════════════════════════════════════════════════════════
  // OTHER TIRTHANKAR KALYANAK
  // ══════════════════════════════════════════════════════════
  { key:"sheetalnath_kalyanak", name:"Sheetalnath Janma/Tap Kalyanak", nameHi:"शीतलनाथ जन्म एवं तप कल्याणक",
    category:"kalyanak", emoji:"❄️", color:"#00BCD4",
    descriptionHi:"10वें तीर्थंकर भगवान शीतलनाथ का जन्म और दीक्षा कल्याणक दिवस।",
    description:"Birth and Diksha Kalyanak of 10th Tirthankar Bhagwan Sheetalnath — Paush Krishna 11.",
    paksha:"krishna", tithi:11, monthIndex:9 },

  { key:"anantanath_kalyanak", name:"Anantanath Janma/Tap Kalyanak", nameHi:"अनंतनाथ जन्म एवं तप कल्याणक",
    category:"kalyanak", emoji:"♾️", color:"#3F51B5",
    descriptionHi:"14वें तीर्थंकर भगवान अनंतनाथ का पावन जन्म और दीक्षा दिवस।",
    description:"Birth and Diksha Kalyanak of 14th Tirthankar Bhagwan Anantanath — Jyeshtha Krishna 12.",
    paksha:"krishna", tithi:12, monthIndex:2 },

  { key:"neminath_nirvan",   name:"Neminath Moksha Kalyanak", nameHi:"नेमिनाथ मोक्ष कल्याणक",
    category:"kalyanak", emoji:"⛰", color:"#2E7D32",
    descriptionHi:"22वें तीर्थंकर भगवान नेमिनाथ का गिरनार पर्वत के पावन शिखर से मोक्ष (निर्वाण) दिवस।",
    description:"22nd Tirthankar Bhagwan Neminath attained Moksha at Girnar — Ashadha Shukla 7.",
    paksha:"shukla", tithi:7, monthIndex:3 },

  { key:"neminath_janma",    name:"Neminath Janma Kalyanak", nameHi:"नेमिनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🦋", color:"#00BCD4",
    descriptionHi:"22वें तीर्थंकर भगवान नेमिनाथ का जन्म कल्याणक।",
    description:"Birth of 22nd Tirthankar Bhagwan Neminath — Shravan Krishna 5.",
    paksha:"krishna", tithi:5, monthIndex:4 },

  { key:"parshwanath_janma", name:"Parshwanath Janma Kalyanak", nameHi:"पार्श्वनाथ जन्म कल्याणक",
    category:"kalyanak", emoji:"🐍", color:"#4CAF50",
    descriptionHi:"23वें तीर्थंकर भगवान पार्श्वनाथ का जन्म कल्याणक। इस दिन 3 दिन का उपवास रखा जाता है।",
    description:"Birth of 23rd Tirthankar Bhagwan Parshwanath — Paush Krishna 10/11. Three-day fast observed.",
    paksha:"krishna", tithi:11, monthIndex:9 },

  { key:"parshwanath_nirvan", name:"Parshwanath Nirvan Kalyanak", nameHi:"पार्श्वनाथ निर्वाण कल्याणक",
    category:"kalyanak", emoji:"🏔", color:"#1565C0",
    descriptionHi:"23वें तीर्थंकर भगवान पार्श्वनाथ का सम्मेद शिखर पर मोक्ष।",
    description:"23rd Tirthankar Bhagwan Parshwanath attained Moksha at Sammet Shikhar — Shravan Shukla 7.",
    paksha:"shukla", tithi:7, monthIndex:4 },

  // ══════════════════════════════════════════════════════════
  // DAS LAKSHAN MAHAPARVА — 3 times per year
  // ══════════════════════════════════════════════════════════
  { key:"das_lakshan_bhadrapad", name:"Das Lakshan Mahaparvа (Bhadrapad — Main)", nameHi:"भाद्रपद दशलक्षण महापर्व (मुख्य पर्युषण)",
    category:"mahaparvа", emoji:"💎", color:"#7C4DFF",
    descriptionHi:"दिगंबर जैनों का सबसे बड़ा वार्षिक पर्व। 10 दिन आत्मा के 10 उत्तम धर्मों (क्षमा, मार्दव, आर्जव, शौच, सत्य, संयम, तप, त्याग, आकिंचन्य, ब्रह्मचर्य) की साधना।",
    description:"MAIN Digambar Das Lakshan — 10 days of Uttar Dharma worship. Bhaadrpad Shukla 3 to Anant Chaturdashi (14).",
    paksha:"shukla", tithi:3, monthIndex:5 },

  { key:"das_lakshan_magh",  name:"Das Lakshan Parva (Magh)", nameHi:"माघ दशलक्षण पर्व",
    category:"parva", emoji:"💎", color:"#7C4DFF",
    descriptionHi:"वर्ष का पहला दशलक्षण महापर्व (माघ शुक्ल चतुर्थी से द्वादशी)।",
    description:"First Das Lakshan of the year — Magh Shukla 4 to 12.",
    paksha:"shukla", tithi:4, monthIndex:10 },

  { key:"das_lakshan_chaitra", name:"Das Lakshan Parva (Chaitra)", nameHi:"चैत्र दशलक्षण पर्व",
    category:"parva", emoji:"💎", color:"#7C4DFF",
    descriptionHi:"वर्ष का दूसरा दशलक्षण (चैत्र शुक्ल चतुर्थी से द्वादशी)।",
    description:"Second Das Lakshan of the year — Chaitra Shukla 4 to 12.",
    paksha:"shukla", tithi:4, monthIndex:0 },

  // ══════════════════════════════════════════════════════════
  // ASHTAAHNIKA — 3 times per year
  // ══════════════════════════════════════════════════════════
  { key:"ashtaahnika_kartik", name:"Kartik Ashtaahnika Parva", nameHi:"कार्तिक अष्टाह्निका पर्व",
    category:"ashtaahnika", emoji:"⭐", color:"#FF8F00",
    descriptionHi:"8 दिन (कार्तिक शुक्ल अष्टमी से पूर्णिमा) — नंदीश्वर द्वीप के 84 अकृत्रिम जिनालयों की भाव-पूजा। देव भी इसी काल में वहाँ पूजा करते हैं।",
    description:"8-day festival — Nandishvar Dweep Bhav-puja, Siddhachakra Mandal Vidhan — Kartik Shukla 8-15.",
    paksha:"shukla", tithi:8, monthIndex:7 },

  { key:"ashtaahnika_phalgun", name:"Phalgun Ashtaahnika Parva", nameHi:"फाल्गुन अष्टाह्निका पर्व",
    category:"ashtaahnika", emoji:"⭐", color:"#FF8F00",
    descriptionHi:"8 दिन (फाल्गुन शुक्ल अष्टमी से पूर्णिमा) — सिद्धचक्र महामंडल विधान।",
    description:"8-day Nandishvar puja — Phalgun Shukla 8-15.",
    paksha:"shukla", tithi:8, monthIndex:11 },

  { key:"ashtaahnika_ashadha", name:"Ashadha Ashtaahnika Parva", nameHi:"आषाढ़ अष्टाह्निका पर्व",
    category:"ashtaahnika", emoji:"⭐", color:"#FF8F00",
    descriptionHi:"8 दिन (आषाढ़ शुक्ल अष्टमी से पूर्णिमा) — नंदीश्वर द्वीप की भाव-पूजा।",
    description:"8-day Nandishvar puja — Ashadha Shukla 8-15.",
    paksha:"shukla", tithi:8, monthIndex:3 },

  // ══════════════════════════════════════════════════════════
  // OTHER IMPORTANT FESTIVALS
  // ══════════════════════════════════════════════════════════
  { key:"anant_chaturdashi", name:"Anant Chaturdashi — End of Das Lakshan", nameHi:"अनंत चतुर्दशी",
    category:"parva", emoji:"♾️", color:"#3F51B5",
    descriptionHi:"दशलक्षण पर्व का अंतिम और मुख्य दिन। धूप दशमी के साथ पूर्ण उपवास रखकर आत्मा के अनंत गुणों की आराधना।",
    description:"Final day of Das Lakshan — worship of soul's infinite virtues. Full fast observed — Bhadrapad Shukla 14.",
    paksha:"shukla", tithi:14, monthIndex:5 },

  { key:"kshamavani",        name:"Kshamavani — Forgiveness Day", nameHi:"क्षमावाणी पर्व",
    category:"parva", emoji:"💝", color:"#E91E63",
    descriptionHi:"दशलक्षण पर्व के पूर्ण होने पर अहंकार को तोड़कर सभी जीवों के सामने हाथ जोड़कर 'उत्तम क्षमा' मांगना — 'मिच्छामि दुक्कडं'।",
    description:"Jain Forgiveness Day — ask forgiveness from all beings: 'Micchami Dukkadam' — Bhadrapad Krishna 1.",
    paksha:"krishna", tithi:1, monthIndex:5 },

  { key:"jain_new_year",     name:"Jain New Year (Veer Nirvan Samvat)", nameHi:"जैन नववर्ष (वीर निर्वाण संवत)",
    category:"parva", emoji:"🎊", color:"#FF9800",
    descriptionHi:"भगवान महावीर के मोक्ष जाने के ठीक अगले दिन प्रथम शिष्य गौतम गणधर स्वामी को केवलज्ञान प्राप्त हुआ। इसी पावन स्मृति में जैन नववर्ष प्रारंभ होता है।",
    description:"Day after Diwali — Gautam Gandhar attained Kevaljnan. Jain New Year (Veer Nirvan Samvat) begins — Kartik Shukla 1.",
    paksha:"shukla", tithi:1, monthIndex:7 },

  { key:"gyan_panchami",     name:"Gyan Panchami — Shrut Panchami", nameHi:"ज्ञान पंचमी (श्रुत पंचमी)",
    category:"parva", emoji:"📿", color:"#795548",
    descriptionHi:"आचार्य पुष्पदंत और भूतबलि महाराज ने जैन धर्म के प्रथम लिखित ग्रंथ 'षट्खंडागम' की रचना पूर्ण की थी। जैन शास्त्रों, जिनवाणी माँ और पवित्र ग्रंथों की विशेष पूजा।",
    description:"Day Shat-khandagam (first written Jain scripture) was completed. Special worship of Jinvani and Jain granths — Kartik Shukla 5.",
    paksha:"shukla", tithi:5, monthIndex:7 },

  { key:"raksha_bandhan_jain", name:"Raksha Bandhan (Jain Historical)", nameHi:"रक्षाबंधन (जैन ऐतिहासिक महत्व)",
    category:"parva", emoji:"🧿", color:"#9E9D24",
    descriptionHi:"मुनिराज विष्णुकुमार ने विक्रिया ऋद्धि से वामन रूप धरकर राजा बलि द्वारा 700 दिगंबर जैन मुनियों पर हो रहे घोर कष्ट को दूर किया। यह मुनि-रक्षा और वात्सल्य भाव का प्रतीक है।",
    description:"Muniraaj Vishnukumar saved 700 Digambar Jain munis from King Bali's persecution — Bhadrapad Shukla 5.",
    paksha:"shukla", tithi:5, monthIndex:5 },

  { key:"kartik_purnima",    name:"Kartik Purnima", nameHi:"कार्तिक पूर्णिमा",
    category:"auspicious", emoji:"🌕", color:"#FFD700",
    descriptionHi:"कार्तिक पूर्णिमा — जैनों के लिए अत्यंत शुभ दिन। स्नान, दान और उपवास का पर्व।",
    description:"Extremely auspicious Jain day — fasting, worship and charity — Kartik Shukla 15.",
    paksha:"shukla", tithi:15, monthIndex:7 },

  { key:"shrut_panchami_jyeshtha", name:"Shrut Panchami (Jyeshtha)", nameHi:"श्रुत पंचमी (ज्येष्ठ)",
    category:"parva", emoji:"📚", color:"#1565C0",
    descriptionHi:"जैन शास्त्रों की पूजा और जिनवाणी आराधना का दिन — ज्येष्ठ शुक्ल पंचमी।",
    description:"Worship of Jain scriptures and Jinvani — Jyeshtha Shukla 5.",
    paksha:"shukla", tithi:5, monthIndex:2 },

  { key:"guru_purnima",      name:"Guru Purnima (Ashadha Purnima)", nameHi:"गुरु पूर्णिमा",
    category:"auspicious", emoji:"🙏", color:"#FF9800",
    descriptionHi:"जैन गुरुओं और आचार्यों के प्रति कृतज्ञता का दिन — आषाढ़ पूर्णिमा।",
    description:"Day of gratitude to Jain Acharyas and Gurus — Ashadha Shukla 15.",
    paksha:"shukla", tithi:15, monthIndex:3 },

  // ══════════════════════════════════════════════════════════
  // RECURRING MONTHLY — every month
  // ══════════════════════════════════════════════════════════
  { key:"purnima",           name:"Purnima (Full Moon)", nameHi:"पूर्णिमा",
    category:"auspicious", emoji:"🌕", color:"#FFD700",
    descriptionHi:"पूर्णिमा — पोषध व्रत, उपवास और प्रतिक्रमण का शुभ दिन।",
    description:"Full Moon — Poshadh Vrat, Upvas and Pratikraman day.",
    paksha:"shukla", tithi:15, monthIndex:-1 },

  { key:"amavasya",          name:"Amavasya (New Moon)", nameHi:"अमावस्या",
    category:"auspicious", emoji:"🌑", color:"#9C27B0",
    descriptionHi:"अमावस्या — पोषध व्रत, पितृ-स्मरण और उपवास का दिन।",
    description:"New Moon — Poshadh Vrat, ancestral remembrance and fasting.",
    paksha:"krishna", tithi:30, monthIndex:-1 },

  { key:"ekadashi_shukla",   name:"Shukla Ekadashi", nameHi:"शुक्ल एकादशी",
    category:"auspicious", emoji:"⭐", color:"#4CAF50",
    descriptionHi:"शुक्ल एकादशी — व्रत और साधना का पवित्र दिन।",
    description:"Shukla Paksha 11th — auspicious for fasting and sadhana.",
    paksha:"shukla", tithi:11, monthIndex:-1 },

  { key:"ekadashi_krishna",  name:"Krishna Ekadashi", nameHi:"कृष्ण एकादशी",
    category:"auspicious", emoji:"⭐", color:"#66BB6A",
    descriptionHi:"कृष्ण एकादशी — उपवास और जैन साधना का शुभ दिन।",
    description:"Krishna Paksha 11th — fasting and spiritual practice.",
    paksha:"krishna", tithi:11, monthIndex:-1 },

  { key:"chaturdashi_shukla", name:"Shukla Chaturdashi", nameHi:"शुक्ल चतुर्दशी",
    category:"auspicious", emoji:"🙏", color:"#FF9800",
    descriptionHi:"'गुणस्थान पारनी' तिथि — चतुर्दशी पर पूर्ण ब्रह्मचर्य, पोषध और प्रतिक्रमण। प्रथम तीर्थंकर भगवान आदिनाथ ने इसी तिथि को मोक्ष प्राप्त किया।",
    description:"'Gunsthan Parni' tithi — Poshadh, complete celibacy, Pratikraman. Tirthankara Adinath attained Moksha on Chaturdashi.",
    paksha:"shukla", tithi:14, monthIndex:-1 },

  { key:"chaturdashi_krishna", name:"Krishna Chaturdashi", nameHi:"कृष्ण चतुर्दशी",
    category:"auspicious", emoji:"🙏", color:"#E65100",
    descriptionHi:"कृष्ण चतुर्दशी — पोषध व्रत और आत्म-निरीक्षण का दिन।",
    description:"Krishna Paksha 14th — Poshadh Vrat and self-reflection.",
    paksha:"krishna", tithi:14, monthIndex:-1 },

  { key:"ashtami_shukla",    name:"Shukla Ashtami — Ashtkarm Nashani", nameHi:"शुक्ल अष्टमी — अष्टकर्म नाशनी",
    category:"auspicious", emoji:"🌟", color:"#2196F3",
    descriptionHi:"'अष्टकर्म नाशनी' तिथि — इस दिन आत्मा को आठों कर्मों से मुक्त करने के लिए विशेष पुरुषार्थ। हरी सब्जी का त्याग, एकासन या उपवास और सामायिक।",
    description:"'Ashtkarm Nashani' — special effort to free soul from 8 karmas. Green veg tyag, Ekasana or Upvas, extended Samayik.",
    paksha:"shukla", tithi:8, monthIndex:-1 },

  { key:"ashtami_krishna",   name:"Krishna Ashtami", nameHi:"कृष्ण अष्टमी",
    category:"auspicious", emoji:"🌟", color:"#1565C0",
    descriptionHi:"कृष्ण अष्टमी — अष्टकर्म नाशनी तिथि, उपवास और साधना का शुभ दिन।",
    description:"Krishna Ashtami — fasting, Samayik, green veg tyag, karmic purification.",
    paksha:"krishna", tithi:8, monthIndex:-1 },
];

// ── Match festivals for a given tithi & month ─────────────
export function getJainFestivals(
  tithiNum: number,   // 1-30
  monthIndex: number, // 0-11
): JainFestival[] {
  const isShukla = tithiNum <= 15;
  const paksha   = isShukla ? "shukla" : "krishna";
  const pakshaNum = isShukla ? tithiNum : tithiNum - 15;

  return JAIN_FESTIVALS.filter(f => {
    const monthMatch  = f.monthIndex === -1 || f.monthIndex === monthIndex;
    const pakshaMatch = f.paksha === paksha || f.paksha === "both";
    const tithiMatch  = f.tithi === pakshaNum
                     || (f.tithi === 30 && tithiNum === 30);
    return monthMatch && pakshaMatch && tithiMatch;
  });
}
