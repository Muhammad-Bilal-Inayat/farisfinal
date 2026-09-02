import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import PageCustomRenderer from '../components/PageCustomRenderer';

export default function Privacy() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <div className="bg-[var(--color-soft-ivory)] min-h-screen pb-20">
      <PageCustomRenderer pageKey="privacy" position="top" />
      <Helmet>
        <title>{isAr ? 'سياسة الخصوصية | فارس لنقل المعتمرين' : 'Privacy Policy | Faris VIP Umrah Transport'}</title>
        <meta name="description" content="Privacy policy and data protection terms for Faris VIP Umrah Transport services in Saudi Arabia." />
      </Helmet>
      <Breadcrumbs items={[{ label: t('privacy') || 'Privacy Policy' }]} />

      <div className="bg-white border-b border-emerald-100 py-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-saudi-emerald)]/5 pattern-grid"></div>
        <ShieldCheck size={48} className="mx-auto text-[var(--color-saudi-emerald)] mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-saudi-emerald)] relative z-10">
          {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
      </div>
      <div className="container mx-auto px-4 mt-12 max-w-4xl bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-emerald-50 text-emerald-900/80 leading-relaxed space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] border-b pb-2">
            {isAr ? '١. جمع المعلومات' : '1. Information Collection'}
          </h2>
          <p>
            {isAr 
              ? 'نحن نجمع المعلومات الشخصية مثل اسمك وتفاصيل الاتصال بك ومسار السفر الخاص بك لغرض تلبية طلبات الحجز الخاصة بك وتحسين خدماتنا.'
              : 'We collect personal information such as your name, contact details, and travel itinerary solely for the purpose of fulfilling your booking requests and improving our services.'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] border-b pb-2">
            {isAr ? '٢. ملفات تعريف الارتباط والإعلانات الرقمية' : '2. Cookies and Digital Advertising'}
          </h2>
          <p>
            {isAr 
              ? 'تستخدم الجهات الخارجية، بما في ذلك Google، ملفات تعريف الارتباط لعرض الإعلانات بناءً على زيارات المستخدم السابقة لموقعنا الإلكتروني أو مواقع أخرى على الإنترنت.'
              : 'Third party vendors, including Google, use cookies to serve ads based on a user\'s prior visits to your website or other websites.'}
          </p>
          <p>
            {isAr
              ? 'يمكّن استخدام Google لملفات تعريف الارتباط للإعلانات، إياها وشركاءها من عرض الإعلانات للمستخدمين استنادًا إلى زيارتهم لمواقعنا و/أو مواقع أخرى على الإنترنت.'
              : 'Google\'s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.'}
          </p>
          <p>
            {isAr
              ? 'يمكن للمستخدمين إلغاء الاشتراك في الإعلانات المخصصة عن طريق زيارة إعدادات الإعلانات (Ads Settings) الخاصة بجوجل.'
              : 'Users may opt out of personalized advertising by visiting Google Ads Settings.'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--color-saudi-emerald)] border-b pb-2">
            {isAr ? '٣. أمن البيانات' : '3. Data Security'}
          </h2>
          <p>
            {isAr
              ? 'يتم تخزين بياناتك بشكل آمن ولا تتم مشاركتها أبدًا مع أطراف ثالثة لأغراض تسويقية دون موافقتك الصريحة (باستثناء مزودي الإعلانات والتحليلات المذكورين أعلاه).'
              : 'Your data is securely stored and never shared with third parties for direct marketing purposes without your explicit consent (except for advertising and analytics providers mentioned above).'}
          </p>
        </div>
      </div>
      <PageCustomRenderer pageKey="privacy" position="bottom" />
    </div>
  );
}
