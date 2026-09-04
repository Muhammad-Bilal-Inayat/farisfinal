import { useState, useEffect } from 'react';

let globalReviewsCache: any[] = [];
let listeners: Set<React.Dispatch<React.SetStateAction<any[]>>> = new Set();
let isPolling = false;
let initialFetchPromise: Promise<void> | null = null;

const fetchReviews = async () => {
  try {
    const res = await fetch('/api/testimonials', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    
    if (JSON.stringify(globalReviewsCache) !== JSON.stringify(data)) {
      globalReviewsCache = data;
      listeners.forEach(listener => listener(data));
    }
  } catch (err) {
    console.error("Reviews snapshot sync failed", err);
  }
};

if (typeof window !== 'undefined' && !initialFetchPromise) {
  initialFetchPromise = fetchReviews();
}

const startRealtimeSync = () => {
  if (isPolling) return;
  isPolling = true;
  setInterval(fetchReviews, 5000); // Polling every 5 seconds for reviews
};

export function useReviewsSnapshot() {
  const [reviews, setReviews] = useState<any[]>(globalReviewsCache);

  useEffect(() => {
    startRealtimeSync();
    listeners.add(setReviews);
    
    if (globalReviewsCache.length > 0) {
      setReviews(globalReviewsCache);
    } else if (initialFetchPromise) {
      initialFetchPromise.then(() => {
        setReviews(globalReviewsCache);
      });
    }

    return () => {
      listeners.delete(setReviews);
    };
  }, []);

  return reviews;
}
