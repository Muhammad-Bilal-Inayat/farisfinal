import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface BookingDraft {
  tripType: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  luggage: number;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  phone: string;
  email: string;
  specialRequest: string;
  step: number;
}

const DEFAULT_DRAFT: BookingDraft = {
  tripType: 'One Way',
  pickup: '',
  destination: '',
  date: new Date().toISOString().split('T')[0],
  time: '',
  passengers: 2,
  luggage: 2,
  vehicleId: '',
  vehicleName: '',
  customerName: '',
  phone: '',
  email: '',
  specialRequest: '',
  step: 1
};

interface BookingTrackerContextType {
  isTrackerOpen: boolean;
  activeBookingId: string;
  openTracker: (bookingId?: string) => void;
  closeTracker: () => void;
  draft: BookingDraft;
  updateDraft: (updates: Partial<BookingDraft>) => void;
  clearDraft: () => void;
  vehicleVersion: number;
  notifyVehicleUpdated: () => void;
  fetchTrackedBookingCached: (bookingId: string) => Promise<{ found: boolean; booking?: any; error?: string }>;
}

const BookingTrackerContext = createContext<BookingTrackerContextType>({
  isTrackerOpen: false,
  activeBookingId: '',
  openTracker: () => {},
  closeTracker: () => {},
  draft: DEFAULT_DRAFT,
  updateDraft: () => {},
  clearDraft: () => {},
  vehicleVersion: 0,
  notifyVehicleUpdated: () => {},
  fetchTrackedBookingCached: async () => ({ found: false })
});

// Cache for tracking lookups to eliminate unnecessary Hostinger / API polling
const lookupCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60000; // 1 minute local cache before re-verifying

export const BookingTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState('');
  const [vehicleVersion, setVehicleVersion] = useState(0);

  // Initialize draft from localStorage to preserve selection across reloads
  const [draft, setDraft] = useState<BookingDraft>(() => {
    try {
      const saved = localStorage.getItem('faris_booking_draft');
      if (saved) {
        return { ...DEFAULT_DRAFT, ...JSON.parse(saved) };
      }
      // Migrate legacy individual keys if present
      const tripType = localStorage.getItem('faris_booking_tripType') || DEFAULT_DRAFT.tripType;
      const pickup = localStorage.getItem('faris_booking_pickup') || DEFAULT_DRAFT.pickup;
      const destination = localStorage.getItem('faris_booking_destination') || DEFAULT_DRAFT.destination;
      const date = localStorage.getItem('faris_booking_date') || DEFAULT_DRAFT.date;
      const time = localStorage.getItem('faris_booking_time') || DEFAULT_DRAFT.time;
      const passengers = Number(localStorage.getItem('faris_booking_passengers')) || DEFAULT_DRAFT.passengers;
      const luggage = Number(localStorage.getItem('faris_booking_luggage')) || DEFAULT_DRAFT.luggage;
      const vehicleId = localStorage.getItem('faris_booking_vehicleId') || DEFAULT_DRAFT.vehicleId;
      const step = Number(localStorage.getItem('faris_booking_step')) || DEFAULT_DRAFT.step;
      const customerName = localStorage.getItem('faris_booking_name') || DEFAULT_DRAFT.customerName;
      const phone = localStorage.getItem('faris_booking_phone') || DEFAULT_DRAFT.phone;
      const email = localStorage.getItem('faris_booking_email') || DEFAULT_DRAFT.email;
      const specialRequest = localStorage.getItem('faris_booking_special') || DEFAULT_DRAFT.specialRequest;

      return {
        tripType,
        pickup,
        destination,
        date,
        time,
        passengers,
        luggage,
        vehicleId,
        vehicleName: '',
        customerName,
        phone,
        email,
        specialRequest,
        step
      };
    } catch (e) {
      return DEFAULT_DRAFT;
    }
  });

  const updateDraft = useCallback((updates: Partial<BookingDraft>) => {
    setDraft(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('faris_booking_draft', JSON.stringify(next));
        // Also keep legacy individual keys synchronized for any external listeners
        if (updates.tripType !== undefined) localStorage.setItem('faris_booking_tripType', updates.tripType);
        if (updates.pickup !== undefined) localStorage.setItem('faris_booking_pickup', updates.pickup);
        if (updates.destination !== undefined) localStorage.setItem('faris_booking_destination', updates.destination);
        if (updates.date !== undefined) localStorage.setItem('faris_booking_date', updates.date);
        if (updates.time !== undefined) localStorage.setItem('faris_booking_time', updates.time);
        if (updates.passengers !== undefined) localStorage.setItem('faris_booking_passengers', String(updates.passengers));
        if (updates.luggage !== undefined) localStorage.setItem('faris_booking_luggage', String(updates.luggage));
        if (updates.vehicleId !== undefined) localStorage.setItem('faris_booking_vehicleId', updates.vehicleId);
        if (updates.step !== undefined) localStorage.setItem('faris_booking_step', String(updates.step));
        if (updates.customerName !== undefined) localStorage.setItem('faris_booking_name', updates.customerName);
        if (updates.phone !== undefined) localStorage.setItem('faris_booking_phone', updates.phone);
        if (updates.email !== undefined) localStorage.setItem('faris_booking_email', updates.email);
        if (updates.specialRequest !== undefined) localStorage.setItem('faris_booking_special', updates.specialRequest);
      } catch (e) {}
      return next;
    });
  }, []);

  const clearDraft = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
    try {
      localStorage.removeItem('faris_booking_draft');
      [
        'faris_booking_tripType', 'faris_booking_pickup', 'faris_booking_destination',
        'faris_booking_date', 'faris_booking_time', 'faris_booking_passengers',
        'faris_booking_luggage', 'faris_booking_vehicleId', 'faris_booking_step',
        'faris_booking_name', 'faris_booking_phone', 'faris_booking_email', 'faris_booking_special'
      ].forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }, []);

  const notifyVehicleUpdated = useCallback(() => {
    setVehicleVersion(v => v + 1);
    try {
      window.dispatchEvent(new CustomEvent('faris_vehicle_updated', { detail: { timestamp: Date.now() } }));
      window.dispatchEvent(new CustomEvent('faris_vehicles_updated', { detail: { timestamp: Date.now() } }));
    } catch (e) {}
  }, []);

  // Listen for vehicle updates from Admin panel in real time across the app
  useEffect(() => {
    const handleVehicleEvent = () => {
      setVehicleVersion(v => v + 1);
    };
    window.addEventListener('faris_vehicle_updated', handleVehicleEvent);
    window.addEventListener('faris_vehicles_updated', handleVehicleEvent);
    return () => {
      window.removeEventListener('faris_vehicle_updated', handleVehicleEvent);
      window.removeEventListener('faris_vehicles_updated', handleVehicleEvent);
    };
  }, []);

  const openTracker = useCallback((bookingId?: string) => {
    if (bookingId) {
      setActiveBookingId(bookingId.trim());
    }
    setIsTrackerOpen(true);
  }, []);

  const closeTracker = useCallback(() => {
    setIsTrackerOpen(false);
  }, []);

  // Local-first cached tracker fetch to avoid repeated polling
  const fetchTrackedBookingCached = useCallback(async (bookingId: string) => {
    const key = bookingId.trim().toUpperCase();
    if (!key) return { found: false, error: 'Empty booking reference' };

    const cached = lookupCache.get(key);
    const now = Date.now();
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    try {
      const res = await fetch(`/api/bookings/track/${encodeURIComponent(key)}`);
      const data = await res.json();
      if (res.ok && data.found) {
        lookupCache.set(key, { data, timestamp: now });
      }
      return data;
    } catch (e) {
      if (cached) return cached.data; // Fallback to cached version if offline
      return { found: false, error: 'Network error fetching booking status' };
    }
  }, []);

  return (
    <BookingTrackerContext.Provider 
      value={{ 
        isTrackerOpen, 
        activeBookingId, 
        openTracker, 
        closeTracker,
        draft,
        updateDraft,
        clearDraft,
        vehicleVersion,
        notifyVehicleUpdated,
        fetchTrackedBookingCached
      }}
    >
      {children}
    </BookingTrackerContext.Provider>
  );
};

export const useBookingTracker = () => useContext(BookingTrackerContext);
