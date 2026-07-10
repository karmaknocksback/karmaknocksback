/**
 * DIGAMBAR JAIN FESTIVALS DATABASE
 * All tithi-based festivals with exact Hindu month + tithi
 * Based on traditional Digambar Jain Panchang
 */

export interface JainFestival {
  key:         string;
  name:        string;
  nameHi:      string;
  category:    "kalyanak"|"parva"|"vrat"|"auspicious"|"samiti";
  emoji:       string;
  color:       string;
  description: string;
  // Tithi-based trigger: shukla/krishna paksha + tithi number + month index (0=Chaitra)
  paksha:      "shukla"|"krishna"|"both";
  tithi:       number;   // 1-15 (30 for Amavasya)
  monthIndex:  number;   // 0=Chaitra,1=Vaishakh,...,11=Phalguna. -1 = every month
}

// ── DIGAMBAR JAIN FESTIVALS & KALYANAK TITHIS ─────────────
export const JAIN_FESTIVALS: JainFestival[] = [

  // ══════════ MAJOR KALYANAK DAYS ══════════
  // Bhagwan Mahavir (24th Tirthankar)
  { key:"mahavir_jayanti",  name:"Mahavir Janma Kalyanak",  nameHi:"महावीर जन्म कल्याणक", category:"kalyanak", emoji:"🌟", color:"#FFD700",
    description:"Birth of Bhagwan Mahavir (599 BCE) — Chaitra Shukla 13. Most celebrated Jain festival.",
    paksha:"shukla", tithi:13, monthIndex:0 },
  { key:"mahavir_diksha",   name:"Mahavir Diksha Kalyanak", nameHi:"महावीर दीक्षा कल्याणक", category:"kalyanak", emoji:"🧘", color:"#FF9800",
    description:"Bhagwan Mahavir renounced the world — Margashirsha Krishna 10.",
    paksha:"krishna", tithi:10, monthIndex:8 },
  { key:"mahavir_kevaljnan",name:"Mahavir Kevaljnan Kalyanak",nameHi:"महावीर केवलज्ञान कल्याणक", category:"kalyanak", emoji:"💡", color:"#FFEB3B",
    description:"Bhagwan Mahavir attained Omniscience — Vaishakh Shukla 10.",
    paksha:"shukla", tithi:10, monthIndex:1 },
  { key:"mahavir_nirvan",   name:"Mahavir Nirvan (Jain Diwali)",nameHi:"महावीर निर्वाण दीपावली", category:"kalyanak", emoji:"🪔", color:"#FF5722",
    description:"Bhagwan Mahavir attained Moksha (527 BCE). Jains celebrate this as Diwali — Kartik Krishna Amavasya.",
    paksha:"krishna", tithi:30, monthIndex:7 },

  // Bhagwan Rishabhdev (1st Tirthankar - Adinath)
  { key:"rishabhdev_jayanti",name:"Bhagwan Rishabhdev Jayanti",nameHi:"भगवान ऋषभदेव जयंती", category:"kalyanak", emoji:"🌺", color:"#E91E63",
    description:"Birth of Bhagwan Rishabhdev, first Tirthankar — Chaitra Krishna 9.",
    paksha:"krishna", tithi:9, monthIndex:0 },
  { key:"rishabhdev_nirvan", name:"Rishabhdev Nirvan (Magh Amavasya)",nameHi:"ऋषभदेव निर्वाण", category:"kalyanak", emoji:"🌸", color:"#9C27B0",
    description:"Bhagwan Rishabhdev's Moksha at Ashtapad — Magh Krishna 14.",
    paksha:"krishna", tithi:14, monthIndex:10 },
  { key:"akshay_tritiya",   name:"Akshaya Tritiya (Varshitap Parana)",nameHi:"अक्षय तृतीया (वर्षीतप पारणा)", category:"parva", emoji:"✨", color:"#FFD700",
    description:"Day Bhagwan Rishabhdev broke his year-long fast with sugarcane juice. Varshitap Parana — Vaishakh Shukla 3.",
    paksha:"shukla", tithi:3, monthIndex:1 },

  // Bhagwan Parshwanath (23rd Tirthankar)
  { key:"parshwanath_jayanti",name:"Parshwanath Jayanti",nameHi:"पार्श्वनाथ जयंती", category:"kalyanak", emoji:"🐍", color:"#4CAF50",
    description:"Birth of Bhagwan Parshwanath — Paush Krishna 10/11. Three-day fast observed.",
    paksha:"krishna", tithi:11, monthIndex:9 },
  { key:"parshwanath_nirvan",name:"Parshwanath Nirvan",nameHi:"पार्श्वनाथ निर्वाण", category:"kalyanak", emoji:"🏔", color:"#2196F3",
    description:"Bhagwan Parshwanath's Moksha at Sammet Shikhar — Shravan Shukla 7.",
    paksha:"shukla", tithi:7, monthIndex:4 },

  // Bhagwan Neminath (22nd Tirthankar)
  { key:"neminath_jayanti", name:"Neminath Jayanti",nameHi:"नेमिनाथ जयंती", category:"kalyanak", emoji:"🦋", color:"#00BCD4",
    description:"Birth of Bhagwan Neminath — Shravan Krishna 5.",
    paksha:"krishna", tithi:5, monthIndex:4 },
  { key:"neminath_nirvan",  name:"Neminath Nirvan",nameHi:"नेमिनाथ निर्वाण", category:"kalyanak", emoji:"⛰", color:"#607D8B",
    description:"Bhagwan Neminath's Moksha at Girnar — Ashadha Shukla 8.",
    paksha:"shukla", tithi:8, monthIndex:3 },

  // Bhagwan Shantinath (16th Tirthankar)
  { key:"shantinath_jayanti",name:"Shantinath Jayanti",nameHi:"शांतिनाथ जयंती", category:"kalyanak", emoji:"🕊", color:"#8BC34A",
    description:"Birth of Bhagwan Shantinath (16th Tirthankar) — Jyeshtha Krishna 14.",
    paksha:"krishna", tithi:14, monthIndex:2 },

  // ══════════ MAJOR PARVA & FESTIVALS ══════════
  { key:"das_lakshan_1",    name:"Das Lakshan Parva (Bhadrapad)",nameHi:"दशलक्षण पर्व (भाद्रपद)", category:"parva", emoji:"💎", color:"#7C4DFF",
    description:"10-day Digambar Jain festival — Bhadrapad Shukla 5 to 14. Worship of 10 dharmas.",
    paksha:"shukla", tithi:5, monthIndex:5 },
  { key:"kshamavani",       name:"Kshamavani (Forgiveness Day)",nameHi:"क्षमावाणी", category:"parva", emoji:"💝", color:"#FF7043",
    description:"Jain Forgiveness Day — Bhadrapad Krishna 1. 'Micchami Dukkadam'",
    paksha:"krishna", tithi:1, monthIndex:5 },
  { key:"shrut_panchami",   name:"Shrut Panchami",nameHi:"श्रुत पंचमी", category:"parva", emoji:"📿", color:"#795548",
    description:"Day of Jain scriptures worship — Jyeshtha Shukla 5. Sacred day for Agam study.",
    paksha:"shukla", tithi:5, monthIndex:2 },
  { key:"guru_purnima",     name:"Guru Purnima (Ashadha Purnima)",nameHi:"गुरु पूर्णिमा", category:"parva", emoji:"🙏", color:"#FF9800",
    description:"Day of gratitude to Jain Gurus and Acharyas — Ashadha Purnima.",
    paksha:"shukla", tithi:15, monthIndex:3 },
  { key:"das_lakshan_2",    name:"Das Lakshan Parva (Magh)",nameHi:"दशलक्षण पर्व (माघ)", category:"parva", emoji:"💎", color:"#7C4DFF",
    description:"Second Das Lakshan of the year — Magh Shukla 5 to 14.",
    paksha:"shukla", tithi:5, monthIndex:10 },
  { key:"das_lakshan_3",    name:"Das Lakshan Parva (Chaitra)",nameHi:"दशलक्षण पर्व (चैत्र)", category:"parva", emoji:"💎", color:"#7C4DFF",
    description:"Third Das Lakshan of the year — Chaitra Shukla 5 to 14.",
    paksha:"shukla", tithi:5, monthIndex:0 },
  { key:"roth_teej",        name:"Roth Teej",nameHi:"रोट तीज", category:"parva", emoji:"🌙", color:"#9E9D24",
    description:"Special fasting day — Bhadrapad Shukla 3.",
    paksha:"shukla", tithi:3, monthIndex:5 },
  { key:"sugandha_dashami", name:"Sugandha Dashami",nameHi:"सुगंध दशमी", category:"parva", emoji:"🌸", color:"#E91E63",
    description:"Fragrance offering to Jinas — Bhadrapad Shukla 10.",
    paksha:"shukla", tithi:10, monthIndex:5 },
  { key:"anant_chaturdashi",name:"Anant Chaturdashi",nameHi:"अनंत चतुर्दशी", category:"parva", emoji:"♾️", color:"#3F51B5",
    description:"Worship of infinite qualities of Jinas — Bhadrapad Shukla 14.",
    paksha:"shukla", tithi:14, monthIndex:5 },
  { key:"kartik_purnima",   name:"Kartik Purnima",nameHi:"कार्तिक पूर्णिमा", category:"parva", emoji:"🌕", color:"#FFD700",
    description:"Highly auspicious Jain day. Jain New Year begins after Diwali — Kartik Shukla 15.",
    paksha:"shukla", tithi:15, monthIndex:7 },
  { key:"jain_new_year",    name:"Jain New Year (Pratipada)",nameHi:"जैन नव वर्ष", category:"parva", emoji:"🎊", color:"#FF9800",
    description:"Jain New Year begins on Kartik Shukla Pratipada (day after Diwali).",
    paksha:"shukla", tithi:1, monthIndex:7 },
  { key:"merutrayodashi",   name:"Meru Trayodashi",nameHi:"मेरु त्रयोदशी", category:"parva", emoji:"🏔", color:"#795548",
    description:"Symbolic worship of Mount Meru — Magh Shukla 13.",
    paksha:"shukla", tithi:13, monthIndex:10 },
  { key:"labdhi_vidhan",    name:"Labdhi Vidhan",nameHi:"लब्धि विधान", category:"parva", emoji:"📿", color:"#00BCD4",
    description:"Jain worship ceremony — Bhadrapad Shukla 1.",
    paksha:"shukla", tithi:1, monthIndex:5 },
  { key:"sol_karan_1",      name:"Solah Karan Vrat (Chaitra)",nameHi:"षोडश कारण व्रत (चैत्र)", category:"vrat", emoji:"✨", color:"#00BCD4",
    description:"16-cause vrat related to Tirthankar-hood — Chaitra Shukla 5 to 14.",
    paksha:"shukla", tithi:5, monthIndex:0 },

  // ══════════ AYAMBIL OLI ══════════
  { key:"ayambil_oli_1",    name:"Ayambil Oli (Chaitra)",nameHi:"अयंबिल ओली (चैत्र)", category:"vrat", emoji:"🪷", color:"#E91E63",
    description:"9-day Ayambil fasting — Chaitra Shukla 7 to 15.",
    paksha:"shukla", tithi:7, monthIndex:0 },
  { key:"ayambil_oli_2",    name:"Ayambil Oli (Ashwin)",nameHi:"अयंबिल ओली (आश्विन)", category:"vrat", emoji:"🪷", color:"#E91E63",
    description:"9-day Ayambil fasting — Ashwin Shukla 7 to 15.",
    paksha:"shukla", tithi:7, monthIndex:6 },

  // ══════════ RECURRING AUSPICIOUS DAYS (every month) ══════════
  { key:"purnima",          name:"Purnima (Full Moon)",nameHi:"पूर्णिमा", category:"auspicious", emoji:"🌕", color:"#FFD700",
    description:"Full Moon — Auspicious for Poshadh Vrat, Upvas, and Pratikraman.",
    paksha:"shukla", tithi:15, monthIndex:-1 },
  { key:"amavasya",         name:"Amavasya (New Moon)",nameHi:"अमावस्या", category:"auspicious", emoji:"🌑", color:"#9C27B0",
    description:"New Moon — Auspicious for Poshadh Vrat, Upvas, and remembrance of ancestors.",
    paksha:"krishna", tithi:30, monthIndex:-1 },
  { key:"ekadashi_s",       name:"Shukla Ekadashi",nameHi:"शुक्ल एकादशी", category:"auspicious", emoji:"⭐", color:"#4CAF50",
    description:"11th tithi (Shukla) — Auspicious for fasting and spiritual practices.",
    paksha:"shukla", tithi:11, monthIndex:-1 },
  { key:"ekadashi_k",       name:"Krishna Ekadashi",nameHi:"कृष्ण एकादशी", category:"auspicious", emoji:"⭐", color:"#66BB6A",
    description:"26th tithi (Krishna 11) — Auspicious for fasting.",
    paksha:"krishna", tithi:11, monthIndex:-1 },
  { key:"chaturdashi_s",    name:"Shukla Chaturdashi",nameHi:"शुक्ल चतुर्दशी", category:"auspicious", emoji:"🙏", color:"#FF9800",
    description:"14th tithi — Poshadh Vrat and Pratikraman day.",
    paksha:"shukla", tithi:14, monthIndex:-1 },
  { key:"chaturdashi_k",    name:"Krishna Chaturdashi",nameHi:"कृष्ण चतुर्दशी", category:"auspicious", emoji:"🙏", color:"#E65100",
    description:"29th tithi — Poshadh Vrat day.",
    paksha:"krishna", tithi:14, monthIndex:-1 },
  { key:"ashtami_s",        name:"Shukla Ashtami",nameHi:"शुक्ल अष्टमी", category:"auspicious", emoji:"🌟", color:"#2196F3",
    description:"8th tithi — Auspicious day for Jain worship and fasting.",
    paksha:"shukla", tithi:8, monthIndex:-1 },
  { key:"ashtami_k",        name:"Krishna Ashtami",nameHi:"कृष्ण अष्टमी", category:"auspicious", emoji:"🌟", color:"#1565C0",
    description:"23rd tithi — Auspicious day for worship.",
    paksha:"krishna", tithi:8, monthIndex:-1 },
];

// ── Check if a panchang day has any Jain festival ──────────
export function getJainFestivals(
  tithiNum: number,   // 1-30 (30=Amavasya)
  monthIndex: number, // 0=Chaitra...11=Phalguna
): JainFestival[] {
  const isShukla = tithiNum <= 15;
  const paksha = isShukla ? "shukla" : "krishna";
  // In Krishna paksha, tithiNum is 16-30, but festivals use 1-15
  const pakshaNum = isShukla ? tithiNum : tithiNum - 15;

  return JAIN_FESTIVALS.filter(f => {
    const monthMatch = f.monthIndex === -1 || f.monthIndex === monthIndex;
    const pakshaMatch = f.paksha === paksha || f.paksha === "both";
    const tithiMatch = f.tithi === pakshaNum || (f.tithi === 30 && tithiNum === 30);
    return monthMatch && pakshaMatch && tithiMatch;
  });
}
