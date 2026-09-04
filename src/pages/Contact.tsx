import React, { useState, useRef } from 'react';
import { Phone, Mail, MapPin, QrCode, Download, Sparkles, CheckCircle2, MessageSquare, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';
import { QRCodeCanvas } from 'qrcode.react';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { companyName, websiteDomain } = useSiteSettings();
  const { settings, openWhatsApp } = useWhatsApp();
  const [formData, setFormData] = useState({ name: '', phone: '', whatsapp: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const websiteUrl = 'https://farisvipumrahtransport.com/';
  const whatsappUrl = settings?.phoneNumber ? `https://wa.me/${settings.phoneNumber.replace(/[^0-9]/g, '')}` : 'https://wa.me/966576124752';

  const webQrRef = useRef<HTMLDivElement>(null);
  const waQrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = (canvasRef: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(t('message_sent_success') || 'Message sent successfully!');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setStatus(t('message_sent_success') || 'Message sent successfully!');
      setFormData({ name: '', phone: '', whatsapp: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus(t('message_sent_failed') || 'Failed to send message.');
    }
  };

  return (
    <div className="bg-[#F1F4F8] min-h-screen pb-24 text-left rtl:text-right">
      <PageCustomRenderer pageKey="contact" position="top" />
      <Helmet>
        <title>{isAr ? `اتصل بنا ورمز QR | ${companyName}` : `Contact Us & QR Codes | ${companyName}`}</title>
        <meta name="description" content={isAr ? 'تواصل مع فريق خدمة عملاء فارس لنقل المعتمرين 24/7 وا مسح رموز QR الخاصة بالموقع والواتساب.' : 'Contact Faris VIP Umrah Transport 24/7 and scan our permanent Website & WhatsApp QR codes.'} />
      </Helmet>
      <Breadcrumbs items={[{ label: t('contact') || 'Contact Us' }]} />

      {/* Header Banner */}
      <div className="bg-[var(--color-saudi-green)] py-12 md:py-16 text-center text-white relative overflow-hidden shadow-sm px-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-white/10 text-emerald-100 border border-white/20 mb-3">
            <Sparkles size={14} className="text-[var(--color-luxury-gold)]" /> {isAr ? 'تواصل معنا على مدار الساعة 24/7' : '24/7 Dedicated Support & Dispatch'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-white tracking-tight">{t('contact_page_title') || 'Contact Us'}</h1>
          <p className="text-sm md:text-base opacity-90 max-w-2xl mx-auto text-emerald-100 leading-relaxed">
            {t('contact_page_subtitle') || 'Get in touch with our VIP transport supervisors or scan our official QR codes for instant access.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10 max-w-6xl space-y-12">
        
        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-[var(--color-saudi-green)] mb-5 shadow-2xs">
              <Phone size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0c2e22] mb-1">{t('phone_whatsapp_card') || 'Phone & WhatsApp'}</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">{t('phone_whatsapp_card_desc') || 'Instant dispatch & inquiries'}</p>
            {settings ? (
              <button onClick={() => openWhatsApp('contact')} className="text-[var(--color-saudi-green)] font-extrabold text-base hover:underline cursor-pointer" dir="ltr">{settings.phoneNumber}</button>
            ) : <span className="font-extrabold text-base text-[var(--color-saudi-green)]" dir="ltr">+966 57 612 4752</span>}
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-[var(--color-saudi-green)] mb-5 shadow-2xs">
              <Mail size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0c2e22] mb-1">{t('email_card') || 'Email Address'}</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">{t('email_card_desc') || 'Official bookings & support'}</p>
            <a href="mailto:contact@FarisVIPUmrahTransport.com" className="text-[var(--color-saudi-green)] font-extrabold text-sm hover:underline">contact@FarisVIPUmrahTransport.com</a>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xs border border-slate-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-[var(--color-saudi-green)] mb-5 shadow-2xs">
              <MapPin size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0c2e22] mb-1">{t('office_card') || 'Head Office'}</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">{t('office_card_desc') || 'Kingdom of Saudi Arabia'}</p>
            <span className="text-[var(--color-saudi-green)] font-extrabold text-sm">{t('office_address') || 'Makkah Al-Mukarramah, KSA'}</span>
          </div>
        </div>

        {/* Permanent QR Codes Section */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[var(--color-saudi-green)] border border-emerald-200 mb-2">
              <QrCode size={14} /> {isAr ? 'رمز الاستجابة السريعة الدائم' : 'Permanent QR Codes'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0c2e22]">
              {isAr ? 'امسح أو حمّل رموز QR الرسمية' : 'Scan or Download Official QR Codes'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {isAr ? 'رموز QR دائمة للموقع الإلكتروني وخدمة الواتساب لضمان التواصل والوصول الفوري في أي وقت.' : 'Permanent QR codes for our website and WhatsApp business line to ensure quick access anytime.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Website QR Card */}
            <div className="bg-gradient-to-b from-emerald-50/50 to-white p-6 rounded-2xl border-2 border-emerald-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-saudi-green)] text-white flex items-center justify-center mb-3 shadow-2xs">
                <Globe size={20} />
              </div>
              <h3 className="font-black text-base text-[#0c2e22] mb-1">
                {isAr ? 'رمز QR للموقع الإلكتروني' : 'Website Official QR Code'}
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                {isAr ? 'امسح الكود لفتح الموقع وحجز سيارات VIP فوراً' : 'Scan to open our official booking portal'}
              </p>

              <div ref={webQrRef} className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-md inline-block mb-4">
                <QRCodeCanvas 
                  value={websiteUrl} 
                  size={180} 
                  level="H" 
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => downloadQRCode(webQrRef, 'faris-vip-website-qr.png')}
                className="w-full bg-[var(--color-saudi-green)] hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Download size={15} />
                <span>{isAr ? 'تحميل رمز QR للموقع (PNG)' : 'Download Website QR (PNG)'}</span>
              </button>
            </div>

            {/* WhatsApp QR Card */}
            <div className="bg-gradient-to-b from-emerald-50/50 to-white p-6 rounded-2xl border-2 border-emerald-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-3 shadow-2xs">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-black text-base text-[#0c2e22] mb-1">
                {isAr ? 'رمز QR للواتساب المباشر' : 'WhatsApp Dispatch QR Code'}
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                {isAr ? 'امسح الكود للتحدث مع مشرف التنسيق عبر الواتساب' : 'Scan to chat directly with our 24/7 dispatch team'}
              </p>

              <div ref={waQrRef} className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-md inline-block mb-4">
                <QRCodeCanvas 
                  value={whatsappUrl} 
                  size={180} 
                  level="H" 
                  includeMargin={true}
                />
              </div>

              <button
                type="button"
                onClick={() => downloadQRCode(waQrRef, 'faris-vip-whatsapp-qr.png')}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Download size={15} />
                <span>{isAr ? 'تحميل رمز QR للواتساب (PNG)' : 'Download WhatsApp QR (PNG)'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-[#0c2e22] mb-6">{t('send_message_title') || 'Send us a Message'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={t('your_name') || 'Your Name'} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-sm font-medium" required />
              <input type="email" placeholder={t('email_address') || 'Email Address'} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-sm font-medium" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={t('phone_number') || 'Phone Number'} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-sm font-medium" required />
              <input type="text" placeholder={t('whatsapp_optional') || 'WhatsApp (Optional)'} value={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-sm font-medium" />
            </div>
            <input type="text" placeholder={t('subject') || 'Subject'} value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] text-sm font-medium" required />
            <textarea placeholder={t('your_message') || 'Your Message'} value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})} className="w-full border border-slate-200 p-3.5 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-[var(--color-saudi-green)] h-32 resize-none text-sm font-medium" required />
            <button type="submit" className="w-full bg-[var(--color-saudi-green)] text-white font-bold py-4 rounded-xl hover:bg-emerald-800 transition-colors uppercase tracking-wider text-xs shadow-sm cursor-pointer">{t('send_message_btn') || 'Send Message'}</button>
            {status && <p className="text-center mt-4 font-bold text-gray-700 text-sm">{status}</p>}
          </form>
        </div>

      </div>
      <PageCustomRenderer pageKey="contact" position="bottom" />
    </div>
  );
}
