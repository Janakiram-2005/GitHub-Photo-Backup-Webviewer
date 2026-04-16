import { useState, useEffect, useRef } from 'react';
import { GitHubFile, GalleryConfig } from '@/lib/github-api';

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  file: GitHubFile;
  config: GalleryConfig;
}

export function SecureImage({ file, config, className, alt, ...props }: SecureImageProps) {
  const [src, setSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !src) {
          const fetchImage = async () => {
            try {
              const auth = config.token ? { 'Authorization': `Bearer ${config.token}` } : {};
              const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(file.path)}`;
              const res = await fetch(url, { 
                headers: { ...auth, 'Accept': 'application/vnd.github.v3.raw' } 
              });
              if (res.ok) {
                const blob = await res.blob();
                setSrc(URL.createObjectURL(blob));
              }
            } catch (err) {
              console.error('Failed to load secure image', err);
            }
          };
          fetchImage();
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [file.path, config, src]);

  // Cleanup object URLs to prevent memory leaks when component unmounts
  useEffect(() => {
    return () => {
      if (src && src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  // Base64 transparent pixel is rendered natively while waiting for intersection observer
  const emptySrc = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  return (
    <img 
      ref={imgRef} 
      src={src || emptySrc} 
      className={`transition-opacity duration-500 ${!src ? 'opacity-0' : 'opacity-100'} ${className}`} 
      alt={alt} 
      key={file.sha}
      {...props} 
    />
  );
}
