import React, { useEffect, useCallback } from 'react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const { openWhatsApp } = useWhatsApp();

  const handlePersistentEvent = useCallback((e: MouseEvent) => {
    // Persistent event handler for resource efficiency
  }, []);

  useEffect(() => {
    window.addEventListener('click', handlePersistentEvent, { passive: true });
    return () => {
      window.removeEventListener('click', handlePersistentEvent);
    };
  }, [handlePersistentEvent]);

  return (
    <button
      onClick={() => openWhatsApp('general')}
      className="hidden md:flex fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform items-center justify-center animate-bounce-subtle cursor-pointer"
      aria-label="Contact us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle size={32} />
    </button>
  );
}

