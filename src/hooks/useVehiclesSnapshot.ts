import { useState, useEffect } from 'react';

// Global cache and listeners for memoized sharing across components
let globalVehiclesCache: any[] = [{"id":2,"name":"FORD EXPEDITION","year":2025,"passengerCapacity":7,"luggageCapacity":8,"features":"VIP Leather, 8 Bags, Chilled Water, Rear AC","imageUrl":"/images/fleet/ford-expedition.jpg","startingPrice":300,"description":"Flagship Luxury SUV for VIP transfers & families","category":"suv","status":"active","displayOrder":1},{"id":1,"name":"FORD TAURUS","year":2025,"passengerCapacity":4,"luggageCapacity":4,"features":"Comfort AC, 4 Bags, USB Charging","imageUrl":"/images/fleet/ford-taurus.jpg","startingPrice":160,"description":"Updated test description","category":"sedan","status":"active","displayOrder":2},{"id":3,"name":"H1 HYUNDAI","year":2024,"passengerCapacity":7,"luggageCapacity":8,"features":"Dual AC, 8 Bags, Spacious Legroom","imageUrl":"/images/fleet/h1-hyundai.jpg","startingPrice":175,"description":"Spacious family van for smooth group rides","category":"van","status":"active","displayOrder":3},{"id":4,"name":"STARIA","year":2025,"passengerCapacity":8,"luggageCapacity":8,"features":"VIP Captain Seats, 8 Bags, Panoramic View","imageUrl":"/images/fleet/staria.jpg","startingPrice":200,"description":"Futuristic luxury van with supreme comfort","category":"van","status":"active","displayOrder":4},{"id":5,"name":"FORD TAURUS","year":2025,"passengerCapacity":4,"luggageCapacity":3,"features":"Executive Quiet Cabin, 3 Bags, Smooth Highway Ride","imageUrl":"/images/fleet/ford-taurus.jpg","startingPrice":200,"description":"Modern executive sedan for pilgrims","category":"sedan","status":"active","displayOrder":5},{"id":6,"name":"TOYOTA HIACE","year":2025,"passengerCapacity":12,"luggageCapacity":12,"features":"High Roof, 12 Bags, Group AC, Large Luggage Trunk","imageUrl":"/images/fleet/toyota-hiace.jpg","startingPrice":250,"description":"Ideal transport for medium Umrah groups & families","category":"van","status":"active","displayOrder":6}];
let listeners: Set<React.Dispatch<React.SetStateAction<any[]>>> = new Set();
let isPolling = false;
let initialFetchPromise: Promise<void> | null = null;

const fetchVehicles = async () => {
  try {
    const res = await fetch('/api/vehicles', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    
    if (JSON.stringify(globalVehiclesCache) !== JSON.stringify(data)) {
      globalVehiclesCache = data;
      listeners.forEach(listener => listener(data));
    }
  } catch (err) {
    console.error("Vehicles snapshot sync failed", err);
  }
};

// Start fetching immediately as soon as this module loads (before React renders)
if (typeof window !== 'undefined' && !initialFetchPromise) {
  initialFetchPromise = fetchVehicles();
}

const startRealtimeSync = () => {
  if (isPolling) return;
  isPolling = true;
  setInterval(fetchVehicles, 3000); 
};

export function useVehiclesSnapshot() {
  const [vehicles, setVehicles] = useState<any[]>(globalVehiclesCache);

  useEffect(() => {
    startRealtimeSync();
    listeners.add(setVehicles);
    
    if (globalVehiclesCache.length > 0) {
      setVehicles(globalVehiclesCache);
    } else if (initialFetchPromise) {
      initialFetchPromise.then(() => {
        setVehicles(globalVehiclesCache);
      });
    }

    return () => {
      listeners.delete(setVehicles);
    };
  }, []);

  return vehicles;
}
