import React, { useState, useEffect, useRef } from 'react';

/**
 * Defers the rendering of its children until the user scrolls near it,
 * or until a timeout completes (fallback for modals/floating elements).
 * This significantly reduces initial blocking time on the main thread.
 */
export default function DeferredRender({ 
  children, 
  rootMargin = '400px',
  fallbackDelay = 3000
}: { 
  children: React.ReactNode, 
  rootMargin?: string,
  fallbackDelay?: number
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Fallback: render after delay even if no scroll occurs
    timeout = setTimeout(() => {
      setShouldRender(true);
      if (observer) observer.disconnect();
    }, fallbackDelay);

    return () => {
      if (observer) observer.disconnect();
      clearTimeout(timeout);
    };
  }, [rootMargin, fallbackDelay]);

  return <div ref={ref} className="deferred-render-wrapper">{shouldRender ? children : null}</div>;
}
