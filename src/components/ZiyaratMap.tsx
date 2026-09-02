import { useState, useEffect, useRef } from 'react';
import ResponsiveImage from './ResponsiveImage';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Compass, 
  Sparkles, 
  Car, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight, 
  Layers, 
  Phone, 
  Calendar,
  Eye,
  Maximize2,
  Minimize2,
  Route
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWhatsApp } from '../hooks/useWhatsApp';

export interface ZiyaratLocation {
  id: string;
  name: string;
  arabicName: string;
  category: 'sacred_mosque' | 'mountain_cave' | 'hajj_site' | 'miqat' | 'historical';
  lat: number;
  lng: number;
  duration: string;
  distanceFromHaram: string;
  description: string;
  historicalSignificance: string;
  visitingTips: string;
  imageUrl: string;
  highlightBadge?: string;
}

export interface ZiyaratCircuit {
  id: 'makkah' | 'madinah';
  title: string;
  arabicTitle: string;
  subtitle: string;
  center: [number, number];
  zoom: number;
  totalDuration: string;
  totalDistance: string;
  recommendedTime: string;
  locations: ZiyaratLocation[];
}

export const ZIYARAT_CIRCUITS: Record<'makkah' | 'madinah', ZiyaratCircuit> = {
  makkah: {
    id: 'makkah',
    title: 'Makkah Al-Mukarramah Holy Ziyarat',
    arabicTitle: 'جولة المزارات والمعالم التاريخية بمكة المكرمة',
    subtitle: 'A spiritually enriching 4–5 hour private circuit covering the cradle of Islamic revelation and Hajj sites.',
    center: [21.4133, 39.8650],
    zoom: 12,
    totalDuration: '4 - 5 Hours',
    totalDistance: 'Approx. 42 km',
    recommendedTime: 'Early Morning (After Fajr) or Post-Asr',
    locations: [
      {
        id: 'haram-makkah',
        name: 'Al-Masjid Al-Haram (Starting Point)',
        arabicName: 'المسجد الحرام والكعبة المشرفة',
        category: 'sacred_mosque',
        lat: 21.422487,
        lng: 39.826206,
        duration: 'Departure Point',
        distanceFromHaram: '0 km (Holy Center)',
        description: 'The holiest site in Islam surrounding the Kaaba. Chauffeur pick-up directly from your hotel entrance in Clock Tower, Ajyad, or Jabal Omar.',
        historicalSignificance: 'The first House of worship established for mankind, towards which 1.9 billion Muslims pray daily.',
        visitingTips: 'Our VIP driver coordinates exact hotel lobby pickup to bypass Haram pedestrian zones easily.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/The_Kaaba_during_Hajj_-_edited.jpg',
        highlightBadge: 'Starting Point'
      },
      {
        id: 'jabal-al-nour',
        name: 'Jabal Al-Nour & Cave of Hira (Ghar-e-Hira)',
        arabicName: 'جبل النور وغار حراء',
        category: 'mountain_cave',
        lat: 21.457917,
        lng: 39.859667,
        duration: '35 - 45 Mins Stop',
        distanceFromHaram: '6.5 km North-East',
        description: 'The sacred mountain rising 642m above Makkah, containing the cave where Prophet Muhammad (PBUH) spent months in contemplation.',
        historicalSignificance: 'The blessed sanctuary where Angel Jibreel (Gabriel) revealed the very first verses of the Holy Quran (Surah Al-Alaq: "Iqra").',
        visitingTips: 'You can visit the new Hira Cultural District museum at the base with panoramic views of the peak.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Jabbal_An-Nour_%282024%29.jpg',
        highlightBadge: 'First Revelation'
      },
      {
        id: 'jabal-thawr',
        name: 'Jabal Thawr & Cave of Thawr (Ghar Thawr)',
        arabicName: 'جبل ثور وغار ثور',
        category: 'mountain_cave',
        lat: 21.3768,
        lng: 39.849,
        duration: '25 - 35 Mins Stop',
        distanceFromHaram: '8.2 km South',
        description: 'Historic mountain south of Makkah where the Prophet (PBUH) and Abu Bakr As-Siddiq (RA) took refuge during the Hijrah migration to Madinah.',
        historicalSignificance: 'Mentioned in Quran (9:40): "He was the second of the two, when they both were in the cave... Be not sad, surely Allah is with us."',
        visitingTips: 'Clear roadside vantage points with shaded rest pavilions for photography and contemplation.',
        imageUrl: 'https://www.islamiclandmarks.com/wp-content/uploads/2022/01/Entrance-to-the-Cave-of-Thawr.jpg',
        highlightBadge: 'Hijrah Sanctuary'
      },
      {
        id: 'mina-jamarat',
        name: 'Mina & Jamarat (The Historic Tent City)',
        arabicName: 'مشعر منى ومنطقة الجمرات',
        category: 'hajj_site',
        lat: 21.4146,
        lng: 39.8933,
        duration: '20 - 30 Mins Stop',
        distanceFromHaram: '7.5 km East',
        description: 'The vast white fireproof tent valley of Mina where millions of Hajj pilgrims spend the days of Tashreeq.',
        historicalSignificance: 'The place where Prophet Ibrahim (AS) stoned the devil testing his devotion, and site of Masjid Al-Khaif where 70 prophets prayed.',
        visitingTips: 'Drive past the world-famous multi-tiered Jamarat Bridge complex and Masjid Al-Khaif.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mina_Overview.JPG',
        highlightBadge: 'Hajj Landmark'
      },
      {
        id: 'muzdalifah',
        name: 'Muzdalifah Plain & Mashar Al-Haram',
        arabicName: 'مشعر مزدلفة والمشعر الحرام',
        category: 'hajj_site',
        lat: 21.3892,
        lng: 39.9325,
        duration: '15 - 20 Mins Stop',
        distanceFromHaram: '11.0 km East',
        description: 'The open plain between Mina and Arafat where pilgrims gather pebbles and spend the night under the stars on the 9th of Dhul Hijjah.',
        historicalSignificance: 'Mentioned in Surah Al-Baqarah: "When you depart from Arafat, remember Allah at Al-Mashar Al-Haram."',
        visitingTips: 'Spacious stop with clear scenic vistas across the sacred valley.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Fajr_in_Muzdalifah.jpg',
        highlightBadge: 'Sacred Station'
      },
      {
        id: 'mount-arafat',
        name: 'Jabal Al-Rahmah & Plain of Arafat',
        arabicName: 'جبل الرحمة وصعيد عرفات',
        category: 'hajj_site',
        lat: 21.3547,
        lng: 39.984,
        duration: '35 - 45 Mins Stop',
        distanceFromHaram: '21.5 km South-East',
        description: 'The Mount of Mercy, a small granite hill standing in the center of the Plain of Arafat. The climax of the annual Hajj pilgrimage.',
        historicalSignificance: 'Where Prophet Muhammad (PBUH) delivered the historic Farewell Sermon (Khutbat Al-Wada) to over 100,000 companions.',
        visitingTips: 'Easy steps allow pilgrims to climb Jabal Al-Rahmah and make heartfelt Dua; Masjid Nimrah is located nearby.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Pilgrims_cover_Arafat%27s_roads%2C_plains_and_mountain_-_Flickr_-_Al_Jazeera_English.jpg',
        highlightBadge: 'Hajj Pinnacle'
      },
      {
        id: 'masjid-aisha',
        name: 'Masjid Aisha (Al-Tan\'eem Miqat)',
        arabicName: 'مسجد السيدة عائشة (التنعيم)',
        category: 'miqat',
        lat: 21.474444,
        lng: 39.787778,
        duration: '25 - 40 Mins Stop',
        distanceFromHaram: '7.5 km North-West',
        description: 'The designated Miqat for the people of Makkah and pilgrims intending to perform second or repeated Umrahs.',
        historicalSignificance: 'Where Mother of the Believers, Sayyidah Aisha (RA), assumed Ihram under the guidance of Prophet Muhammad (PBUH).',
        visitingTips: 'Equipped with pristine modern washrooms and shower facilities for pilgrims wishing to don Ihram during the tour.',
        imageUrl: 'https://www.islamiclandmarks.com/wp-content/uploads/2020/04/External-view-of-Masjid-Aisha-740x456.jpg',
        highlightBadge: 'Umrah Miqat'
      },
      {
        id: 'jannat-al-mualla',
        name: 'Jannat Al-Mu\'alla Cemetery',
        arabicName: 'مقبرة جنة المعلاة التاريخية',
        category: 'historical',
        lat: 21.4361,
        lng: 39.8322,
        duration: '20 - 30 Mins Stop',
        distanceFromHaram: '1.8 km North-East',
        description: 'The ancient historic cemetery of Makkah located near the foot of Mount Hujun.',
        historicalSignificance: 'Resting place of Mother of the Believers Sayyidah Khadijah (RA), the Prophet\'s grandfather Abdul Muttalib, and uncle Abu Talib.',
        visitingTips: 'Respectful roadside stop with clear view of the historic perimeter.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Jannat_ul_Mualla_Cemetery.jpg',
        highlightBadge: 'Historic Rest'
      }
    ]
  },
  madinah: {
    id: 'madinah',
    title: 'Madinah Al-Munawwarah Holy Ziyarat',
    arabicTitle: 'جولة المزارات والمعالم النبوية بالمدينة المنورة',
    subtitle: 'A serene 3–4 hour journey through the foundation mosques of Islam, Mount Uhud, and sacred prophetic sites.',
    center: [24.4700, 39.6100],
    zoom: 12.5,
    totalDuration: '3 - 4 Hours',
    totalDistance: 'Approx. 32 km',
    recommendedTime: 'Morning (07:30 AM) or Post-Asr (04:30 PM)',
    locations: [
      {
        id: 'masjid-nabawi',
        name: 'Al-Masjid An-Nabawi (Starting Point)',
        arabicName: 'المسجد النبوي الشريف والروضة المباركة',
        category: 'sacred_mosque',
        lat: 24.4672,
        lng: 39.6111,
        duration: 'Departure Point',
        distanceFromHaram: '0 km (Madinah Center)',
        description: 'The Prophet\'s Mosque, containing the Sacred Rawdah and the resting place of Prophet Muhammad (PBUH), Abu Bakr (RA), and Umar (RA).',
        historicalSignificance: 'One prayer here is rewarded more than 1,000 prayers elsewhere (Sahih Bukhari).',
        visitingTips: 'Chauffeur will meet you at your designated Markaziah hotel driveway (Northern/Southern/Central area).',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Masjid_Nabawi._Medina%2C_Saudi_Arabia.jpg',
        highlightBadge: 'Starting Point'
      },
      {
        id: 'masjid-quba',
        name: 'Masjid Quba (First Mosque in Islam)',
        arabicName: 'مسجد قباء أول مسجد أسس على التقوى',
        category: 'sacred_mosque',
        lat: 24.4392,
        lng: 39.6172,
        duration: '40 - 50 Mins Stop',
        distanceFromHaram: '3.8 km South',
        description: 'The very first mosque built in Islamic history, whose foundation stone was laid by Prophet Muhammad (PBUH) upon arriving from Makkah.',
        historicalSignificance: 'Hadith: "Whoever purifies himself in his house, then comes to the mosque of Quba and prays in it, will have a reward like the Umrah pilgrimage." (Ibn Majah).',
        visitingTips: 'Ample time is given for pilgrims to perform Wudu and pray 2 Sunnah Rak\'ahs inside the tranquil courtyard.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Masjid_Quba_Mosque.jpg',
        highlightBadge: 'Equivalent to Umrah'
      },
      {
        id: 'mount-uhud',
        name: 'Mount Uhud & Martyrs Cemetery (Shuhada Uhud)',
        arabicName: 'جبل أحد ومقبرة شهداء أحد',
        category: 'mountain_cave',
        lat: 24.5033,
        lng: 39.6111,
        duration: '35 - 45 Mins Stop',
        distanceFromHaram: '5.2 km North',
        description: 'The majestic red-stone mountain beloved by the Prophet (PBUH) and site of the legendary Battle of Uhud (3 AH).',
        historicalSignificance: 'Hadith: "Uhud is a mountain that loves us and we love it." Resting place of Sayyidush-Shuhada Hazrat Hamza ibn Abdul-Muttalib (RA) and 70 Sahaba martyrs.',
        visitingTips: 'Climb the Archery Hill (Jabal Al-Rumat) for a sweeping 360-degree view of the battlefield.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Jabal-e-Uhud.jpg',
        highlightBadge: 'Beloved Mountain'
      },
      {
        id: 'masjid-qiblatayn',
        name: 'Masjid Al-Qiblatayn (Mosque of the Two Qiblas)',
        arabicName: 'مسجد القبلتين',
        category: 'sacred_mosque',
        lat: 24.4845,
        lng: 39.5785,
        duration: '25 - 35 Mins Stop',
        distanceFromHaram: '5.0 km North-West',
        description: 'The historic mosque where Prophet Muhammad (PBUH) received divine revelation during mid-prayer to turn towards the Kaaba.',
        historicalSignificance: 'Quran (2:144): "We have certainly seen the turning of your face toward heaven... so turn your face toward Al-Masjid Al-Haram."',
        visitingTips: 'Experience the serene prayer halls that commemorate this pivotal turning point in Islamic history.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Masjid_al-Qiblatayn.jpg',
        highlightBadge: 'Two Qiblas'
      },
      {
        id: 'seven-mosques',
        name: 'The Seven Mosques & Battle of the Trench (Al-Khandaq)',
        arabicName: 'المساجد السبعة وموقع غزوة الخندق',
        category: 'historical',
        lat: 24.4756,
        lng: 39.5931,
        duration: '25 - 30 Mins Stop',
        distanceFromHaram: '3.6 km North-West',
        description: 'The military vantage site along Mount Sela where the Muslim defenders dug the strategic trench during the Battle of Ahzab (5 AH).',
        historicalSignificance: 'Includes Masjid Al-Fath, where Prophet Muhammad (PBUH) made supplication for three consecutive days for Islamic victory.',
        visitingTips: 'Visit the newly restored grand Masjid Al-Khandaq and the historic hillside prayer posts.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Mosque_Salman_Al_farissi.jpg',
        highlightBadge: 'Trench Victory'
      },
      {
        id: 'bir-ali',
        name: 'Bir Ali / Masjid Dhul Hulayfah (Madinah Miqat)',
        arabicName: 'مسجد ذي الحليفة (آبار علي)',
        category: 'miqat',
        lat: 24.4137,
        lng: 39.5439,
        duration: '25 - 35 Mins Stop',
        distanceFromHaram: '9.5 km South-West',
        description: 'The grand oasis Miqat mosque where pilgrims heading from Madinah to Makkah put on their Ihram garments and make their Umrah Niyyah.',
        historicalSignificance: 'The Miqat explicitly designated by Prophet Muhammad (PBUH) for the people of Madinah and all passing through it.',
        visitingTips: 'Famous for its distinctive minaret, lush gardens, and extensive ablution complexes.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Masjid-u-Shajarah_-_Abiar_Ali_Mosque_-_Miqats.jpg',
        highlightBadge: 'Madinah Miqat'
      },
      {
        id: 'date-gardens',
        name: 'Madinah Date Farms & Ajwa Market',
        arabicName: 'مزارع نخيل المدينة وسوق التمور الأصلي',
        category: 'historical',
        lat: 24.4608,
        lng: 39.6053,
        duration: '25 - 35 Mins Stop',
        distanceFromHaram: '3.2 km South-East',
        description: 'Authentic heritage palm groves where Madinah\'s famous Ajwa, Safawi, Mabroom, and Sukari dates are cultivated.',
        historicalSignificance: 'Prophet (PBUH) said: "Whoever eats seven Ajwa dates in the morning will not be harmed by poison or sorcery on that day." (Sahih Bukhari).',
        visitingTips: 'Enjoy fresh complimentary Arabic Gahwa coffee and sample premium authentic harvest dates directly from growers.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Ripe_and_dry_dates_fruit_bunches.jpg',
        highlightBadge: 'Ajwa Palm Groves'
      }
    ]
  }
};

export default function ZiyaratMap() {
  const [selectedCity, setSelectedCity] = useState<'makkah' | 'madinah'>('makkah');
  const [activeLocationId, setActiveLocationId] = useState<string>('jabal-al-nour');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { openWhatsApp } = useWhatsApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);

  const circuit = ZIYARAT_CIRCUITS[selectedCity];

  // Filter locations
  const filteredLocations = circuit.locations.filter(loc => {
    if (filterCategory === 'all') return true;
    return loc.category === filterCategory;
  });

  const activeLocation = circuit.locations.find(l => l.id === activeLocationId) || circuit.locations[0];

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: circuit.center,
        zoom: circuit.zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Luxury CartoDB Voyager / OpenStreetMap Tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    } else {
      // Pan/Zoom to new city
      mapInstanceRef.current.setView(circuit.center, circuit.zoom, { animate: true });
    }

    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    // Clear old markers & polyline
    markersLayerRef.current.clearLayers();
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }

    // Draw Route Polyline
    const latLngs: [number, number][] = circuit.locations.map(loc => [loc.lat, loc.lng]);
    const routeLine = L.polyline(latLngs, {
      color: '#006C35',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    polylineLayerRef.current = routeLine;

    // Add Custom Markers
    circuit.locations.forEach((loc, idx) => {
      const isSelected = loc.id === activeLocationId;
      const isStart = idx === 0;

      const markerHtml = `
        <div class="relative group cursor-pointer transition-all duration-300 transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'}">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 ${
            isSelected 
              ? 'bg-[var(--color-luxury-gold)] text-white border-white ring-4 ring-amber-300/60 ring-offset-1' 
              : isStart 
                ? 'bg-emerald-950 text-white border-white'
                : 'bg-[var(--color-saudi-green)] text-white border-white'
          }">
            ${isStart ? '★' : idx + 1}
          </div>
          ${isSelected ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping"></div>
          ` : ''}
          <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-emerald-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}">
            ${loc.name.split('(')[0].trim()}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-ziyarat-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      marker.on('click', () => {
        setActiveLocationId(loc.id);
        map.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
      });

      markersLayerRef.current?.addLayer(marker);
    });

  }, [selectedCity, activeLocationId]);

  // When city changes, reset active location to first stop
  const handleCityChange = (city: 'makkah' | 'madinah') => {
    setSelectedCity(city);
    setActiveLocationId(ZIYARAT_CIRCUITS[city].locations[1].id);
    setFilterCategory('all');
  };

  // Focus location handler
  const handleSelectLocation = (loc: ZiyaratLocation) => {
    setActiveLocationId(loc.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14.5, { duration: 0.8 });
    }
  };

  return (
    <div className="w-full">
      {/* City Switcher Bar */}
      <div className="bg-emerald-950 text-white rounded-2xl p-4 sm:p-6 mb-6 shadow-xl border border-emerald-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 mb-2 backdrop-blur-xs">
              <Compass size={14} className="text-[var(--color-luxury-gold)]" /> Interactive Holy Route Planner
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {circuit.title}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl font-light">
              {circuit.subtitle}
            </p>
          </div>

          {/* City Toggle Buttons */}
          <div className="flex items-center gap-2 bg-[var(--color-saudi-green)]/80 p-1.5 rounded-xl border border-emerald-700/60 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleCityChange('makkah')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedCity === 'makkah'
                  ? 'bg-[var(--color-luxury-gold)] text-white shadow-md'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              🕋 Makkah Circuit ({ZIYARAT_CIRCUITS.makkah.locations.length} Sites)
            </button>
            <button
              type="button"
              onClick={() => handleCityChange('madinah')}
              className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedCity === 'madinah'
                  ? 'bg-[var(--color-luxury-gold)] text-white shadow-md'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              🕌 Madinah Circuit ({ZIYARAT_CIRCUITS.madinah.locations.length} Sites)
            </button>
          </div>
        </div>

        {/* Quick Circuit Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-emerald-800/80 text-xs">
          <div className="bg-[var(--color-saudi-green)]/40 p-2.5 rounded-xl border border-emerald-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-saudi-green)] text-white flex items-center justify-center shrink-0 font-bold">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Tour Duration</span>
              <span className="font-extrabold text-white">{circuit.totalDuration}</span>
            </div>
          </div>

          <div className="bg-[var(--color-saudi-green)]/40 p-2.5 rounded-xl border border-emerald-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-luxury-gold)] text-white flex items-center justify-center shrink-0 font-bold">
              <Route size={16} />
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Round Trip</span>
              <span className="font-extrabold text-white">{circuit.totalDistance}</span>
            </div>
          </div>

          <div className="bg-[var(--color-saudi-green)]/40 p-2.5 rounded-xl border border-emerald-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold">
              <Car size={16} />
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Vehicle Type</span>
              <span className="font-extrabold text-white">Private VIP Chauffeur</span>
            </div>
          </div>

          <div className="bg-[var(--color-saudi-green)]/40 p-2.5 rounded-xl border border-emerald-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold">
              <Calendar size={16} />
            </div>
            <div>
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Best Timing</span>
              <span className="font-extrabold text-white truncate max-w-[120px]" title={circuit.recommendedTime}>{circuit.recommendedTime.split('(')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Circuit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Interactive Map & Selected Stop Showcase (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Map Container */}
          <div className={`relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-300 shadow-md ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[360px] sm:h-[420px] md:h-[480px]'}`}>
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Map Top Floating Overlay Controls */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-200 pointer-events-auto flex items-center gap-2 text-xs font-bold text-[var(--color-dark-charcoal)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-saudi-green)] animate-pulse"></span>
                <span>Optimal Route: Stop 1 ➔ {circuit.locations.length}</span>
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="bg-white/95 hover:bg-white text-[var(--color-dark-charcoal)] p-2 rounded-xl shadow-md border border-gray-300 transition-all"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            {/* Map Bottom Helper Pill */}
            <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none flex justify-center">
              <div className="bg-emerald-950/90 backdrop-blur-md text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-700/60 pointer-events-auto flex items-center gap-2">
                <Info size={13} className="text-[var(--color-luxury-gold)] shrink-0" />
                <span>Tap any pin on the map or select a site from the list to view history & photos</span>
              </div>
            </div>
          </div>

          {/* Active Highlighted Location Detail Card */}
          {activeLocation && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-md">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="sm:w-1/3 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-gray-50 shrink-0 relative shadow-inner">
                  <ResponsiveImage src={activeLocation.imageUrl} alt={activeLocation.name} className="w-full h-full object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  {activeLocation.highlightBadge && (
                    <span className="absolute top-2 left-2 bg-[var(--color-luxury-gold)] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {activeLocation.highlightBadge}
                    </span>
                  )}
                </div>

                <div className="sm:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                        {activeLocation.arabicName}
                      </span>
                      <span className="text-[11px] font-bold bg-gray-50 text-[var(--color-saudi-green)] px-2.5 py-0.5 rounded-full border border-gray-300">
                        {activeLocation.distanceFromHaram}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[var(--color-dark-charcoal)] mb-1">
                      {activeLocation.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--color-dark-charcoal)]/80 mb-3 leading-relaxed">
                      {activeLocation.description}
                    </p>

                    <div className="bg-gray-50/60 rounded-xl p-3 border border-gray-200/80 mb-3">
                      <span className="text-[11px] font-bold text-[var(--color-dark-charcoal)] block mb-0.5 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[var(--color-luxury-gold)]" /> Spiritual & Historical Significance:
                      </span>
                      <p className="text-xs text-[var(--color-dark-charcoal)]/70 italic leading-snug">
                        "{activeLocation.historicalSignificance}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-900 font-semibold">
                      <Clock size={14} className="text-[var(--color-saudi-green)]" />
                      <span>Recommended Visit: <strong>{activeLocation.duration}</strong></span>
                    </div>

                    <Link
                      to={`/booking?service=ziyarat&city=${selectedCity}`}
                      className="bg-[var(--color-luxury-gold)] hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5"
                    >
                      Book This Tour <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Step-by-Step Itinerary & Stop Selection (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Category Filter Chips */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'all' 
                  ? 'bg-[var(--color-saudi-green)] text-white' 
                  : 'bg-gray-50 text-[var(--color-dark-charcoal)] hover:bg-gray-200'
              }`}
            >
              All Stops ({circuit.locations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('sacred_mosque')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'sacred_mosque' 
                  ? 'bg-[var(--color-saudi-green)] text-white' 
                  : 'bg-gray-50 text-[var(--color-dark-charcoal)] hover:bg-gray-200'
              }`}
            >
              Masajid
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('mountain_cave')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'mountain_cave' 
                  ? 'bg-[var(--color-saudi-green)] text-white' 
                  : 'bg-gray-50 text-[var(--color-dark-charcoal)] hover:bg-gray-200'
              }`}
            >
              Mountains & Caves
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('hajj_site')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === 'hajj_site' 
                  ? 'bg-[var(--color-saudi-green)] text-white' 
                  : 'bg-gray-50 text-[var(--color-dark-charcoal)] hover:bg-gray-200'
              }`}
            >
              Hajj / Sacred
            </button>
          </div>

          {/* Scrollable Itinerary Stops List */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm max-h-[640px] overflow-y-auto custom-scrollbar space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Itinerary Timeline ({filteredLocations.length} Locations)
              </span>
              <span className="text-[11px] text-gray-600 font-medium">
                Click stop to focus on map
              </span>
            </div>

            {filteredLocations.map((loc, idx) => {
              const isSelected = loc.id === activeLocationId;
              const globalIndex = circuit.locations.findIndex(l => l.id === loc.id);

              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected 
                      ? 'bg-gray-50/90 border-[var(--color-saudi-green)] ring-2 ring-[var(--color-saudi-green)]/20 shadow-sm' 
                      : 'bg-white hover:bg-gray-50/40 border-gray-200'
                  }`}
                >
                  {/* Sequence Badge */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSelected 
                      ? 'bg-[var(--color-luxury-gold)] text-white shadow-sm' 
                      : globalIndex === 0 
                        ? 'bg-emerald-950 text-white'
                        : 'bg-gray-200 text-[var(--color-dark-charcoal)]'
                  }`}>
                    {globalIndex === 0 ? '★' : globalIndex + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[var(--color-saudi-green)]' : 'text-[var(--color-dark-charcoal)]'}`}>
                        {loc.name}
                      </h4>
                      {loc.highlightBadge && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                          {loc.highlightBadge}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-900/70 font-medium truncate mb-1">
                      {loc.arabicName}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-gray-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-[var(--color-saudi-green)]" /> {loc.distanceFromHaram}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-[var(--color-luxury-gold)]" /> {loc.duration}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className={`shrink-0 self-center transition-transform ${isSelected ? 'text-[var(--color-saudi-green)] translate-x-1' : 'text-gray-300'}`} />
                </div>
              );
            })}
          </div>

          {/* Quick Book / Custom Tour CTA Box */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md border border-emerald-800 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--color-luxury-gold)]" />
              <h4 className="font-bold text-sm">Need a Custom Itinerary or Extended Stops?</h4>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Our experienced English & Urdu-speaking drivers provide complete guidance and flexibility for elderly pilgrims and families.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to={`/booking?service=ziyarat&city=${selectedCity}`}
                className="bg-[var(--color-luxury-gold)] hover:bg-amber-600 text-white text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                Book {selectedCity === 'makkah' ? 'Makkah' : 'Madinah'} Tour
              </Link>
              <button
                type="button"
                onClick={() => openWhatsApp('booking', `Assalam-o-Alaikum, I want to book a private VIP Ziyarat tour for ${selectedCity === 'makkah' ? 'Makkah' : 'Madinah'}.`)}
                className="bg-emerald-800 hover:bg-emerald-700 text-white text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
              >
                <Phone size={13} /> Inquire WhatsApp
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
