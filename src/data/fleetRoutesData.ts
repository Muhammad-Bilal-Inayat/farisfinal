export interface VehicleFleet {
  id: string;
  name: string;
  nameAr: string;
  category: 'Sedan' | 'SUV' | 'Van' | 'Bus';
  passengers: string;
  passengersAr: string;
  luggage: string;
  luggageAr: string;
  image: string;
  routes: {
    routeId: string;
    routeNameEn: string;
    routeNameAr: string;
    price: number | string;
    pickup: string;
    destination: string;
  }[];
}

export interface QuickRoutePill {
  id: string;
  nameEn: string;
  nameAr: string;
  pickup: string;
  destination: string;
  type?: 'One Way' | 'Round Trip' | 'Full Day';
}

export const QUICK_ROUTE_PILLS: QuickRoutePill[] = [
  { id: 'makkah-madinah', nameEn: 'Mecca To Madinah', nameAr: 'مكة المكرمة إلى المدينة المنورة', pickup: 'Makkah Hotel / Haram', destination: 'Madinah Hotel / Markazia' },
  { id: 'madinah-makkah', nameEn: 'Madinah To Mecca', nameAr: 'المدينة المنورة إلى مكة المكرمة', pickup: 'Madinah Hotel / Markazia', destination: 'Makkah Hotel / Haram' },
  { id: 'jeddah-makkah', nameEn: 'Jeddah To Mecca Hotel', nameAr: 'مطار جدة إلى فنادق مكة', pickup: 'Jeddah Airport (JED)', destination: 'Makkah Hotel / Haram' },
  { id: 'makkah-jeddah', nameEn: 'Mecca to Jeddah Hotel', nameAr: 'فنادق مكة إلى مطار/فنادق جدة', pickup: 'Makkah Hotel / Haram', destination: 'Jeddah Airport (JED)' },
  { id: 'madinah-air-hotel', nameEn: 'Madinah Airport to Hotel', nameAr: 'مطار المدينة إلى فندق المدينة', pickup: 'Madinah Airport (MED)', destination: 'Madinah Hotel / Markazia' },
  { id: 'madinah-hotel-air', nameEn: 'Madinah Hotel to Airport', nameAr: 'فندق المدينة إلى مطار المدينة', pickup: 'Madinah Hotel / Markazia', destination: 'Madinah Airport (MED)' },
  { id: 'hotel-train', nameEn: 'Hotel to Train Station', nameAr: 'من الفندق إلى محطة القطار', pickup: 'Makkah Hotel / Haram', destination: 'Makkah Train Station (HHR)' },
  { id: 'train-hotel', nameEn: 'Train Station to Hotel', nameAr: 'من محطة القطار إلى الفندق', pickup: 'Makkah Train Station (HHR)', destination: 'Makkah Hotel / Haram' },
  { id: 'mecca-ziyarat', nameEn: 'Mecca Ziyarat', nameAr: 'مزارات مكة المكرمة', pickup: 'Makkah Hotel / Haram', destination: 'Makkah Ziyarat Tour' },
  { id: 'madinah-ziyarat', nameEn: 'Madinah Ziyarat', nameAr: 'مزارات المدينة المنورة', pickup: 'Madinah Hotel / Markazia', destination: 'Madinah Ziyarat Tour' },
  { id: 'taif-ziyarat', nameEn: 'Taif Ziyarat', nameAr: 'رحلة مزارات الطائف', pickup: 'Makkah Hotel / Haram', destination: 'Taif Ziyarat Tour' },
  { id: 'full-day', nameEn: 'Full Day Tour (8 Hours)', nameAr: 'يوم كامل مع سائق خاص (8 ساعات)', pickup: 'Full Day Chauffeur', destination: '8 Hours City Charter', type: 'Full Day' },
];

export const STANDARD_ROUTES_META = [
  { id: 'jed_mak', en: 'Jeddah Airport to Makkah Hotel', ar: 'مطار جدة إلى فنادق مكة', pickup: 'Jeddah Airport (JED)', destination: 'Makkah Hotel / Haram' },
  { id: 'mak_jed', en: 'Makkah Hotel to Jeddah Airport', ar: 'فندق مكة إلى مطار جدة', pickup: 'Makkah Hotel / Haram', destination: 'Jeddah Airport (JED)' },
  { id: 'mak_med', en: 'Makkah Hotel to Madina Hotel', ar: 'فندق مكة إلى فندق المدينة', pickup: 'Makkah Hotel / Haram', destination: 'Madinah Hotel / Markazia' },
  { id: 'med_mak', en: 'Madina Hotel to Makkah Hotel', ar: 'فندق المدينة إلى فندق مكة', pickup: 'Madinah Hotel / Markazia', destination: 'Makkah Hotel / Haram' },
  { id: 'med_air_med', en: 'Madina Airport to Madina Hotel', ar: 'مطار المدينة إلى فندق المدينة', pickup: 'Madinah Airport (MED)', destination: 'Madinah Hotel / Markazia' },
  { id: 'med_med_air', en: 'Madina Hotel to Madina Airport', ar: 'فندق المدينة إلى مطار المدينة', pickup: 'Madinah Hotel / Markazia', destination: 'Madinah Airport (MED)' },
  { id: 'med_jed', en: 'Madina Hotel to Jeddah', ar: 'فندق المدينة إلى جدة', pickup: 'Madinah Hotel / Markazia', destination: 'Jeddah Hotel / Corniche' },
  { id: 'jed_med', en: 'Jeddah Airport to Madina Hotel', ar: 'مطار جدة إلى فندق المدينة', pickup: 'Jeddah Airport (JED)', destination: 'Madinah Hotel / Markazia' },
  { id: 'med_mak_badr', en: 'Madina to Makkah by Badar', ar: 'المدينة إلى مكة عبر بدر', pickup: 'Madinah Hotel / Markazia', destination: 'Makkah via Badr' },
  { id: 'med_badr', en: 'Madina to Badar', ar: 'المدينة المنورة إلى غزوة بدر', pickup: 'Madinah Hotel / Markazia', destination: 'Badr Ziyarat' },
  { id: 'mak_taif', en: 'Makkah to Taif Ziyarat', ar: 'مكة إلى مزارات الطائف', pickup: 'Makkah Hotel / Haram', destination: 'Taif Ziyarat Tour' },
  { id: 'mak_ziyarat', en: 'Makkah Ziyarat', ar: 'مزارات مكة المكرمة', pickup: 'Makkah Hotel / Haram', destination: 'Makkah Ziyarat Tour' },
  { id: 'med_ziyarat', en: 'Madina Ziyarat', ar: 'مزارات المدينة المنورة', pickup: 'Madinah Hotel / Markazia', destination: 'Madinah Ziyarat Tour' },
  { id: 'jed_jed_hotel', en: 'Jeddah Airport to Jeddah Hotel', ar: 'مطار جدة إلى فنادق جدة', pickup: 'Jeddah Airport (JED)', destination: 'Jeddah Hotel / Corniche' },
  { id: 'hotel_train', en: 'Hotel to Train Station', ar: 'من الفندق إلى محطة القطار', pickup: 'Makkah Hotel / Haram', destination: 'Makkah Train Station (HHR)' },
  { id: 'train_hotel', en: 'Train Station to Hotel', ar: 'من محطة القطار إلى الفندق', pickup: 'Makkah Train Station (HHR)', destination: 'Makkah Hotel / Haram' },
  { id: 'full_day_8h', en: 'Full Day (8 Hours)', ar: 'خدمة يوم كامل (8 ساعات)', pickup: 'Full Day Chauffeur', destination: '8 Hours City Charter' },
];

export const FLEET_VEHICLES_DATA: VehicleFleet[] = [];
