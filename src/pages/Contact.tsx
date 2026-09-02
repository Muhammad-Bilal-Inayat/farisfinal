import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { companyName, websiteDomain } = useSiteSettings();
  const { settings, openWhatsApp } = useWhatsApp();
  const [formData, setFormData] = useState({ name: '', phone: '', whatsapp: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(t('message_sent_success'));
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setStatus(t('message_sent_success'));
      setFormData({ name: '', phone: '', whatsapp: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus(t('message_sent_failed'));
    }
  };

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-20">
      <PageCustomRenderer pageKey="contact" position="top" />
      <Helmet>
        <title>{isAr ? `اتصل بنا | ${companyName}` : `Contact Us | ${companyName}`}</title>
        <meta name="description" content={isAr ? 'تواصل مع فريق خدمة عملاء فارس لنقل المعتمرين 24/7 عبر الواتساب أو الهاتف أو نموذج المراسلة.' : 'Contact Faris VIP Umrah Transport 24/7 team via WhatsApp, direct call, or online form across Saudi Arabia.'} />
      </Helmet>
      <Breadcrumbs items={[{ label: t('contact') || 'Contact Us' }]} />

      <div className="bg-white border-b border-slate-200/80 py-12 text-center relative overflow-hidden shadow-2xs">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-dark-charcoal)]">{t('contact_page_title')}</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto text-[var(--color-dark-charcoal)]/70">{t('contact_page_subtitle')}</p>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/90 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200/80 rounded-full flex items-center justify-center text-[var(--color-saudi-green)] mb-6 shadow-2xs"><Phone size={30} /></div>
            <h3 className="text-xl font-bold text-[var(--color-dark-charcoal)] mb-2">{t('phone_whatsapp_card')}</h3>
            <p className="text-[var(--color-dark-charcoal)]/60 font-medium mb-4">{t('phone_whatsapp_card_desc')}</p>
            {settings ? (
              <button onClick={() => openWhatsApp('contact')} className="text-[var(--color-saudi-green)] font-bold text-lg hover:underline cursor-pointer" dir="ltr">{settings.phoneNumber}</button>
            ) : <span dir="ltr">+966 57 612 4752</span>}
          </div>
          
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/90 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200/80 rounded-full flex items-center justify-center text-[var(--color-saudi-green)] mb-6 shadow-2xs"><Mail size={30} /></div>
            <h3 className="text-xl font-bold text-[var(--color-dark-charcoal)] mb-2">{t('email_card')}</h3>
            <p className="text-[var(--color-dark-charcoal)]/60 font-medium mb-4">{t('email_card_desc')}</p>
            <a href={websiteDomain ? `mailto:contact@${websiteDomain}` : 'mailto:contact@FarisVIPUmrahTransport.com'} className="text-[var(--color-saudi-green)] font-bold text-lg hover:underline">{websiteDomain ? `contact@${websiteDomain}` : 'contact@FarisVIPUmrahTransport.com'}</a>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/90 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 border border-slate-200/80 rounded-full flex items-center justify-center text-[var(--color-saudi-green)] mb-6 shadow-2xs"><MapPin size={30} /></div>
            <h3 className="text-xl font-bold text-[var(--color-dark-charcoal)] mb-2">{t('office_card')}</h3>
            <p className="text-[var(--color-dark-charcoal)]/60 font-medium mb-4">{t('office_card_desc')}</p>
            <span className="text-[var(--color-saudi-green)] font-bold text-lg">{t('office_address')}</span>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200/90 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-dark-charcoal)] mb-6">{t('send_message_title')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={t('your_name')} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200/90 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-[var(--color-dark-charcoal)] text-sm" required aria-label={t('your_name')} />
              <input type="email" placeholder={t('email_address')} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200/90 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-[var(--color-dark-charcoal)] text-sm" required aria-label={t('email_address')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={t('phone_number')} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200/90 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-[var(--color-dark-charcoal)] text-sm" required aria-label={t('phone_number')} />
              <input type="text" placeholder={t('whatsapp_optional')} value={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.value})} className="w-full border border-slate-200/90 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-[var(--color-dark-charcoal)] text-sm" aria-label={t('whatsapp_optional')} />
            </div>
            <input type="text" placeholder={t('subject')} value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-200/90 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-[var(--color-dark-charcoal)] text-sm" required aria-label={t('subject')} />
            <textarea placeholder={t('your_message')} value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} className="w-full border border-slate-200/90 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-[var(--color-dark-charcoal)] h-32 resize-none text-sm" required aria-label={t('your_message')} />
            <button type="submit" className="w-full bg-[var(--color-saudi-green)] text-white font-bold py-4 rounded-xl hover:bg-emerald-800 transition-colors uppercase tracking-wider text-xs shadow-sm cursor-pointer">{t('send_message_btn')}</button>
            {status && <p className="text-center mt-4 font-bold text-gray-700">{status}</p>}
          </form>
        </div>
      </div>
      <PageCustomRenderer pageKey="contact" position="bottom" />
    </div>
  );
}

