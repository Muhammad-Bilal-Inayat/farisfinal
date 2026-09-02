import React, { createContext, useContext, useState, useCallback } from 'react';

interface BookingTrackerContextType {
  isTrackerOpen: boolean;
  activeBookingId: string;
  openTracker: (bookingId?: string) => void;
  closeTracker: () => void;
}

const BookingTrackerContext = createContext<BookingTrackerContextType>({
  isTrackerOpen: false,
  activeBookingId: '',
  openTracker: () => {},
  closeTracker: () => {}
});

export const BookingTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState('');

  const openTracker = useCallback((bookingId?: string) => {
    if (bookingId) {
      setActiveBookingId(bookingId.trim());
    }
    setIsTrackerOpen(true);
  }, []);

  const closeTracker = useCallback(() => {
    setIsTrackerOpen(false);
  }, []);

  return (
    <BookingTrackerContext.Provider value={{ isTrackerOpen, activeBookingId, openTracker, closeTracker }}>
      {children}
    </BookingTrackerContext.Provider>
  );
};

export const useBookingTracker = () => useContext(BookingTrackerContext);
