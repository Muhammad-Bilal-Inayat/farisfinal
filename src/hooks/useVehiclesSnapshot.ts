import { useState, useEffect } from 'react';

// Global cache and listeners for memoized sharing across components
let globalVehiclesCache: any[] = [];
let listeners: Set<React.Dispatch<React.SetStateAction<any[]>>> = new Set();
let isPolling = false;

const fetchVehicles = async () => {
  try {
    // Mimics the behavior of firestore.collection('vehicles').where('status', '==', 'active')
    // The filtering is securely handled by the backend SQLite query in server.ts
    const res = await fetch('/api/vehicles', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    
    // Only dispatch updates if the snapshot data has actually changed (Memoization)
    if (JSON.stringify(globalVehiclesCache) !== JSON.stringify(data)) {
      globalVehiclesCache = data;
      listeners.forEach(listener => listener(data));
    }
  } catch (err) {
    console.error("Vehicles snapshot sync failed", err);
  }
};

const startRealtimeSync = () => {
  if (isPolling) return;
  isPolling = true;
  fetchVehicles();
  // Poll every 3 seconds to achieve real-time reactivity without websockets
  setInterval(fetchVehicles, 3000); 
};

/**
 * A memoized hook that mimics Firestore's onSnapshot reactivity.
 * Ensures the public UI instantly updates when Admin modifies vehicles.
 */
export function useVehiclesSnapshot() {
  const [vehicles, setVehicles] = useState<any[]>(globalVehiclesCache);

  useEffect(() => {
    startRealtimeSync();
    listeners.add(setVehicles);
    
    // Serve from cache instantly if available (optimistic load)
    if (globalVehiclesCache.length > 0) {
      setVehicles(globalVehiclesCache);
    } else {
      fetchVehicles();
    }

    return () => {
      listeners.delete(setVehicles);
    };
  }, []);

  return vehicles;
}
