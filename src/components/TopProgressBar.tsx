import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, minimum: 0.1, speed: 400 });

export default function TopProgressBar() {
  const location = useLocation();

  useEffect(() => {
    // Start progress bar on route change
    NProgress.start();

    // End progress bar after a brief moment
    // In a fully dynamic Suspense setup, you might tie this to Suspense resolution,
    // but a short timeout provides a consistent visual cue for instant cached navigations too.
    const timer = setTimeout(() => {
      NProgress.done();
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return null;
}
