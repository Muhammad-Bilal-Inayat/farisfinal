import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const { companyName, websiteDomain } = useSiteSettings();
  const { t } = useTranslation();
  const { settings, openWhatsApp } = useWhatsApp();

  return (
    <footer className="bg-[var(--color-dark-charcoal)] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-6">
              <BrandLogo size="lg" />
            </div>
            <p className="text-gray-300 leading-relaxed text-sm mb-6">
              {t('footer_desc')}
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick Links">
            <h4 className="text-[11px] uppercase tracking-widest font-bold mb-6 text-[var(--color-luxury-gold)]">{t('quick_links')}</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-200 font-medium">
              <li><Link to="/" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label={t('home')}>{t('home')}</Link></li>
              <li><Link to="/about-us" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label={t('about')}>{t('about')}</Link></li>
              <li><Link to="/vehicles" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label={t('vehicles')}>{t('vehicles')}</Link></li>
              <li><Link to="/routes-rates" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label={t('routes_rates')}>{t('routes_rates')}</Link></li>
              <li><Link to="/services" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label={t('services')}>{t('services')}</Link></li>
            </ul>
          </nav>

          {/* Services */}
          <nav aria-label="Vehicles">
            <h4 className="text-[11px] uppercase tracking-widest font-bold mb-6 text-[var(--color-luxury-gold)]">{t('vehicles')}</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-200 font-medium">
              <li><Link to="/vehicles?car=gmc" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label="GMC Yukon XL 2025">GMC Yukon XL 2025</Link></li>
              <li><Link to="/vehicles?car=lexus" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label="Lexus ES300h 2026">Lexus ES300h 2026</Link></li>
              <li><Link to="/vehicles?car=taurus" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label="Ford Taurus Executive">Ford Taurus Executive</Link></li>
              <li><Link to="/vehicles?car=staria" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label="Hyundai Staria VIP">Hyundai Staria VIP</Link></li>
              <li><Link to="/vehicles?car=coaster" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label="VIP Toyota Coaster 2025">VIP Toyota Coaster 2025</Link></li>
            </ul>
          </nav>

          {/* Contact */}
          <address className="not-italic">
            <h4 className="text-[11px] uppercase tracking-widest font-bold mb-6 text-[var(--color-luxury-gold)]">{t('contact')}</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-200 font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="shrink-0 text-[var(--color-saudi-green)]" size={18} aria-hidden="true" />
                <span>Jeddah, Al Ajwad, Saudi Arabia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="shrink-0 text-[var(--color-saudi-green)]" size={18} aria-hidden="true" />
                {settings ? (
                  <button onClick={() => openWhatsApp('general')} className="hover:text-[var(--color-saudi-green)] transition-colors font-bold" dir="ltr" aria-label="Call on WhatsApp">{settings.phoneNumber}</button>
                ) : (
                  <a href="tel:+966576124752" className="hover:text-[var(--color-saudi-green)] transition-colors font-bold" dir="ltr" aria-label="Call +966 57 612 4752">+966 57 612 4752</a>
                )}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="shrink-0 text-[var(--color-saudi-green)]" size={18} aria-hidden="true" />
                <a href={websiteDomain ? `mailto:contact@${websiteDomain}` : 'mailto:contact@FarisVIPUmrahTransport.com'} className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label="Send email">
                  {websiteDomain ? `contact@${websiteDomain}` : 'contact@FarisVIPUmrahTransport.com'}
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
          <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved by MBI DEVELOPERS.</p>
          <nav className="flex gap-4" aria-label="Legal Links">
            <Link to="/privacy" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label={t('privacy')}>{t('privacy')}</Link>
            <Link to="/terms" className="hover:text-[var(--color-saudi-green)] transition-colors" aria-label={t('terms')}>{t('terms')}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
