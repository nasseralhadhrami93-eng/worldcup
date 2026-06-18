export const getCountryCode = (countryName: string): string => {
  const normalized = countryName.trim();
  
  // Mapping of common Arabic country names to ISO 3166-1 alpha-2 codes
  const countryMap: Record<string, string> = {
    "عمان": "om",
    "سلطنة عمان": "om",
    "السعودية": "sa",
    "المملكة العربية السعودية": "sa",
    "قطر": "qa",
    "الإمارات": "ae",
    "الامارات": "ae",
    "البحرين": "bh",
    "الكويت": "kw",
    "مصر": "eg",
    "المغرب": "ma",
    "تونس": "tn",
    "الجزائر": "dz",
    "الأردن": "jo",
    "الاردن": "jo",
    "العراق": "iq",
    "فلسطين": "ps",
    "سوريا": "sy",
    "لبنان": "lb",
    "السودان": "sd",
    "ليبيا": "ly",
    "اليمن": "ye",
    
    // World Cup regulars
    "البرازيل": "br",
    "الأرجنتين": "ar",
    "الارجنتين": "ar",
    "ألمانيا": "de",
    "المانيا": "de",
    "إسبانيا": "es",
    "اسبانيا": "es",
    "فرنسا": "fr",
    "إنجلترا": "gb-eng",
    "انجلترا": "gb-eng",
    "البرتغال": "pt",
    "إيطاليا": "it",
    "ايطاليا": "it",
    "هولندا": "nl",
    "بلجيكا": "be",
    "اليابان": "jp",
    "كوريا الجنوبية": "kr",
    "كرواتيا": "hr",
    "المكسيك": "mx",
    "الولايات المتحدة": "us",
    "أمريكا": "us",
    "كندا": "ca",
    "السنغال": "sn",
    "الكاميرون": "cm",
    "غانا": "gh",
    "الأوروغواي": "uy",
    "اوروغواي": "uy",
    "كولومبيا": "co",
    "تشيلي": "cl",
    "سويسرا": "ch",
    "صربيا": "rs",
    "الدنمارك": "dk",
    "أستراليا": "au",
    "استراليا": "au"
  };

  // Check exact match
  if (countryMap[normalized]) {
    return countryMap[normalized];
  }

  // Fallback to a generic code if not found, or 'un' for United Nations flag
  return "un";
};
