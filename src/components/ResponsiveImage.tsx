import React from 'react';
import { getResponsiveImageProps } from '../utils/imageUtils';

export default function ResponsiveImage({ src, alt, className, sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', priority = false, ...props }: any) {
  const responsiveProps = getResponsiveImageProps(src, sizes);

  return (
    <img 
      loading={priority ? 'eager' : 'lazy'} 
      decoding="async" 
      fetchpriority={priority ? 'high' : 'auto'}
      className={className} 
      alt={alt || ''} 
      {...props} 
      {...responsiveProps} 
    />
  );
}

