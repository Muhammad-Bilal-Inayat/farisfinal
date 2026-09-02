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
