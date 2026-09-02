import { useState, useEffect } from 'react';

export function useWhatsApp() {
  const [settings, setSettings] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('faris_whatsapp_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      phoneNumber: '+966576124752',
      generalMessage: 'Assalamu Alaikum, I would like to inquire about VIP Umrah transportation.',
      contactMessage: 'Assalamu Alaikum, I am contacting you regarding VIP Umrah transfers.'
    };
  });

  useEffect(() => {
    fetch('/api/whatsapp')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(data);
          try {
            localStorage.setItem('faris_whatsapp_settings', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(console.error);
  }, []);

  const openWhatsApp = (type: 'general' | 'contact' | 'booking' = 'general', customText?: string) => {
    if (!settings) {
      window.open(`https://wa.me/966576124752?text=${encodeURIComponent(customText || 'Assalamu Alaikum! I would like to inquire about VIP Umrah transportation.')}`, '_blank');
      return;
    }
    const phone = settings.phoneNumber ? settings.phoneNumber.replace(/[^0-9]/g, '') : '966576124752';
    const msg = customText || (type === 'general' ? settings.generalMessage : settings.contactMessage) || 'Assalamu Alaikum! I would like to book a ride.';
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return { settings, openWhatsApp };
}
