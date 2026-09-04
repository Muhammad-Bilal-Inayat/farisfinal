export const VEHICLE_IMAGE_MAP: Record<string, string> = {
  'gmc-xl': '/images/fleet/gmc-xl.jpg',
  'camry': '/images/fleet/toyota-camry.jpg',
  'h1-hyundai': '/images/fleet/h1-hyundai.jpg',
  'staria': '/images/fleet/staria.jpg',
  'ford-taurus': '/images/fleet/ford-taurus.jpg',
  'toyota-hiace': '/images/fleet/toyota-hiace.jpg',
  'lexus-es300h': '/images/fleet/lexus-es300h.jpg',
  'toyota-coaster': '/images/fleet/toyota-coaster.jpg',
  'bus-2025': '/images/fleet/bus-2025.jpg',
};

export const getVehicleImageByName = (name: string = '', fallbackUrl?: string): string => {
  // 1. If a valid custom image URL or uploaded data URL is provided from DB / Admin, ALWAYS use it!
  if (fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl.trim().length > 0) {
    const trimmed = fallbackUrl.trim();
    // Ignore only old generic unsplash placeholder if desired, otherwise use the admin-provided URL
    if (!trimmed.includes('photo-1549317661-bd32c8ce0db2')) {
      return trimmed;
    }
  }

  // 2. Fall back to default fleet assets based on name matching
  const n = (name || '').toLowerCase();
  if (n.includes('gmc') || n.includes('yukon') || n.includes('suv')) {
    return '/images/fleet/gmc-xl.jpg';
  }
  if (n.includes('camry') || n.includes('toyota sedan')) {
    return '/images/fleet/toyota-camry.jpg';
  }
  if (n.includes('staria')) {
    return '/images/fleet/staria.jpg';
  }
  if (n.includes('h1') || n.includes('starex') || n.includes('h-1')) {
    return '/images/fleet/h1-hyundai.jpg';
  }
  if (n.includes('taurus') || n.includes('ford')) {
    return '/images/fleet/ford-taurus.jpg';
  }
  if (n.includes('hiace') || n.includes('haice')) {
    return '/images/fleet/toyota-hiace.jpg';
  }
  if (n.includes('lexus') || n.includes('es300')) {
    return '/images/fleet/lexus-es300h.jpg';
  }
  if (n.includes('coaster') || n.includes('coster')) {
    return '/images/fleet/toyota-coaster.jpg';
  }
  if (n.includes('bus') || n.includes('coach')) {
    return '/images/fleet/bus-2025.jpg';
  }
  if (n.includes('van')) {
    return '/images/fleet/staria.jpg';
  }
  if (n.includes('sedan')) {
    return '/images/fleet/toyota-camry.jpg';
  }
  return '/images/fleet/gmc-xl.jpg';
};

export function getResponsiveImageProps(url: string | undefined | null, defaultSizes: string = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw") {
  if (!url) return { src: '' };

  // Check if it's an Unsplash URL
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      
      // Ensure we have a high-quality fallback for older browsers that don't support srcset
      u.searchParams.set('auto', 'format');
      u.searchParams.set('q', '75');
      
      const widths = [400, 600, 800, 1200, 1600];
      const srcSet = widths.map(w => {
        const uClone = new URL(url);
        uClone.searchParams.set('auto', 'format');
        uClone.searchParams.set('q', '75');
        uClone.searchParams.set('w', w.toString());
        return `${uClone.toString()} ${w}w`;
      }).join(', ');

      u.searchParams.set('w', '1200'); // Standard fallback width

      return {
        src: u.toString(),
        srcSet,
        sizes: defaultSizes,
      };
    } catch (e) {
      return { src: url };
    }
  }

  // Return as is for other URLs (like base64, local assets, etc.)
  return { src: url };
}
