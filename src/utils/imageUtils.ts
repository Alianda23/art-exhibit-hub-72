
/**
 * Fixes common issues with image URLs and provides fallback handling
 * @param url The original image URL
 * @param fallbackUrl Optional fallback URL if the image is invalid (defaults to /placeholder.svg)
 * @returns A properly formatted image URL
 */
export const getValidImageUrl = (url: string, fallbackUrl: string = '/placeholder.svg'): string => {
  if (!url) return fallbackUrl;
  
  // Fix the semicolon issue in URLs
  if (url.includes(';')) {
    url = url.replace(';', ':');
  }
  
  // Handle relative URLs (starting with /)
  if (url.startsWith('/')) {
    return `http://localhost:8000${url}`;
  }
  
  return url;
};

/**
 * Creates an onError handler for image elements
 * @param originalUrl The original URL that failed to load (for logging)
 * @param fallbackUrl The fallback URL to use
 * @returns An onError event handler function
 */
export const handleImageError = (originalUrl: string, fallbackUrl: string = '/placeholder.svg') => {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Image failed to load: ${originalUrl}`);
    (e.target as HTMLImageElement).src = fallbackUrl;
  };
};
