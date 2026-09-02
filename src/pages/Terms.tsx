import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export default function Terms() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="bg-[var(--color-soft-ivory)] min-h-screen pb-20">
      <PageCustomRenderer pageKey="terms" position="top" />
      <Helmet>
        <title>{isAr ? 'الشروط والأحكام | فارس لنقل المعتمرين' : 'Terms & Conditions | Faris VIP Umrah Transport'}</title>
        <meta name="description" content="Terms and conditions for VIP Umrah private chauffeur and transportation services in Saudi Arabia." />
      </Helmet>
      <Breadcrumbs items={[{ label: t('terms') || 'Terms & Conditions' }]} />

      <div className="bg-white border-b border-emerald-100 py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-saudi-emerald)]/5 pattern-grid"></div>
        <FileText size={48} className="mx-auto text-[var(--color-saudi-emerald)] mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-saudi-emerald)] relative z-10">
          {isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
        </h1>
      </div>
      <div className="container mx-auto px-4 mt-12 max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-emerald-50 text-emerald-900/80 leading-relaxed space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="space-y-4">
          <p className="text-lg">
            {isAr 
              ? 'مرحباً بكم في فارس لخدمات النقل الخاص لكبار الشخصيات. باستخدام خدماتنا أو موقعنا الإلكتروني، فإنك توافق على الشروط التالية.'
              : 'Welcome to Faris VIP Umrah Transport. By using our website and services, you agree to the following terms.'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] border-b pb-2">
            {isAr ? '١. الحجوزات والمدفوعات' : '1. Bookings & Payments'}
          </h2>
          <p>
            {isAr 
              ? 'يجب تأكيد جميع الحجوزات عبر قنواتنا الرسمية (مثل واتساب). يتم تسوية المدفوعات بناءً على الاتفاق مع فريق المبيعات لدينا.'
              : 'All bookings must be confirmed via our official channels (e.g., WhatsApp). Payments are settled upon agreement with our sales team.'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] border-b pb-2">
            {isAr ? '٢. سياسة الإلغاء' : '2. Cancellations'}
          </h2>
          <p>
            {isAr
              ? 'يجب إجراء الإلغاءات قبل 24 ساعة على الأقل من وقت الاستقبال المجدول لضمان استرداد المبالغ (إن وجدت).'
              : 'Cancellations must be made at least 24 hours prior to the scheduled pickup time for a full refund (if applicable).'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] border-b pb-2">
            {isAr ? '٣. الأمتعة والركاب' : '3. Luggage & Passengers'}
          </h2>
          <p>
            {isAr
              ? 'يرجى التأكد من أن السيارة المحجوزة تتوافق مع عدد الأمتعة والركاب الخاص بك. نحتفظ بالحق في رفض الخدمة إذا تم تجاوز الحدود المسموح بها للسلامة.'
              : 'Please ensure that the vehicle booked matches your luggage and passenger count. We reserve the right to refuse service if the limits are exceeded for safety reasons.'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] border-b pb-2">
            {isAr ? '٤. استخدام الموقع والإعلانات' : '4. Website Use & Advertising'}
          </h2>
          <p>
            {isAr
              ? 'قد يحتوي هذا الموقع على إعلانات وروابط تابعة لجهات خارجية (مثل Google AdSense). نحن لسنا مسؤولين عن محتوى هذه الإعلانات أو مواقع الأطراف الثالثة.'
              : 'This website may contain advertisements and links to third-party websites (e.g., Google AdSense). We are not responsible for the content of these ads or third-party sites.'}
          </p>
        </div>
      </div>
      <PageCustomRenderer pageKey="terms" position="bottom" />
    </div>
  );
}
