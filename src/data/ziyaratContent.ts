import { Clock, Users, Award, CheckCircle2 } from 'lucide-react';

export const ziyaratHero = {
  badgeAr: 'جولات التراث الإسلامي والمعالم التاريخية',
  badgeEn: 'Sacred Heritage & Historical Tours',
  descriptionAr: 'عش تجربة إيمانية فريدة في استكشاف المعالم الإسلامية المباركة في مكة والمدينة بسيارات فاخرة وسائقين محترفين.',
  descriptionEn: 'Immerse yourself in the sacred history of Islam with private, climate-controlled chauffeur tours to foundational holy sites and prophetic landmarks.'
};

export const ziyaratHighlights = [
  {
    id: 'flexible-stops',
    icon: Clock,
    iconColor: 'var(--color-saudi-green)',
    titleAr: 'أوقات توقف مرنة ومريحة',
    titleEn: 'Unhurried, Flexible Stop Timers',
    descriptionAr: 'استمتع بالوقت الكافي لأداء ركعتين في مسجد قباء، والدعاء عند جبل الرحمة، والتأمل عند جبل أحد برفقة العائلة دون استعجال.',
    descriptionEn: "Never feel rushed. Take ample time to pray 2 Rak'ahs at Masjid Quba, make heartfelt Dua at Jabal Al-Rahmah, or contemplate at Mount Uhud with your family.",
    badgeIcon: CheckCircle2,
    badgeTextAr: 'مواعيد انطلاق مخصصة من فندقك',
    badgeTextEn: 'Custom departure times from your hotel'
  },
  {
    id: 'family-friendly',
    icon: Users,
    iconColor: 'var(--color-luxury-gold)',
    titleAr: 'مناسب للعائلات وكبار السن',
    titleEn: 'Elderly & Family Friendly',
    descriptionAr: 'سيارات SUV وفانات حديثة توفر سهولة ركوب لكبار السن ومقاعد أطفال ومساحات فسيحة مع تكييف قوي لأجواء مريحة.',
    descriptionEn: 'Our modern SUVs and VIP Vans offer low-entry steps, high headroom, child safety seats on request, and spacious seating to keep senior citizens and children comfortable in desert weather.',
    badgeIcon: CheckCircle2,
    badgeTextAr: 'نظام تكييف مزدوج قوي',
    badgeTextEn: 'Heavy-duty dual AC chilling systems'
  },
  {
    id: 'multilingual-chauffeurs',
    icon: Award,
    iconColor: 'var(--color-saudi-green)',
    titleAr: 'سائقون محترفون متعددو اللغات',
    titleEn: 'Multilingual Local Chauffeurs',
    descriptionAr: 'سائقون مؤهلون يتحدثون العربية والإنجليزية والأوردو على دراية تامة بكافة المعالم ومواقف السيارات ومسارات المرور السلسة.',
    descriptionEn: 'Courteous, vetted drivers fluent in English, Arabic, and Urdu who know the best vantage points, parking approvals, and peak traffic workarounds.',
    badgeIcon: CheckCircle2,
    badgeTextAr: 'سائقون مرخصون وذوو خبرة عالية',
    badgeTextEn: 'Licensed professional chauffeurs'
  }
];

export const ziyaratCallToAction = {
  badgeAr: 'شفافية في الأسعار',
  badgeEn: 'Transparent Rates',
  titleAr: 'احجز جولة المزارات الخاصة بك اليوم',
  titleEn: 'Book Your Private Ziyarat Tour Today',
  descriptionAr: 'متاحة يومياً في مكة المكرمة والمدينة المنورة مع التوصيل من وإلى باب الفندق.',
  descriptionEn: 'Available daily across Makkah and Madinah with door-to-door hotel pick-up and drop-off.',
  whatsappMessageAr: 'السلام عليكم، أرغب بحجز جولة مزارات خاصة في مكة / المدينة.',
  whatsappMessageEn: 'Assalam-o-Alaikum, I would like to book a private VIP Ziyarat tour for my family.'
};
