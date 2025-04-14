
import React from 'react';
import { Link } from 'react-router-dom';
import { Artwork } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Ban } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  // Function to ensure valid image URLs
  const getValidImageUrl = (url: string): string => {
    if (!url) return '/placeholder.svg';
    
    // Handle base64 images
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Handle server paths correctly
    if (url.startsWith('/static/')) {
      return url;
    }
    
    // Fix protocol issues
    if (url.includes(';//')) {
      return url.replace(';//', '://');
    }
    
    // If it's an absolute URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // Prepend / if it's a relative path and doesn't already start with /
    if (!url.startsWith('/')) {
      return `/${url}`;
    }
    
    return url;
  };

  return (
    <div className="group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
      <div className="image-container relative">
        <AspectRatio ratio={3/4}>
          <img
            src={getValidImageUrl(artwork.imageUrl)}
            alt={artwork.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error(`Failed to load artwork image: ${artwork.imageUrl}`);
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        {artwork.status === 'sold' && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
            <Ban className="h-4 w-4" />
            <span>Sold</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-xl font-semibold mb-1 group-hover:text-gold transition-colors">
          {artwork.title}
        </h3>
        <p className="text-gray-600 mb-2">by {artwork.artist}</p>
        <p className="font-medium text-lg text-gold mb-3">
          {formatPrice(artwork.price)}
        </p>
        <div className="text-gray-700 text-sm mb-4">
          <p>{artwork.dimensions} | {artwork.medium}</p>
        </div>
        <Link to={`/artworks/${artwork.id}`}>
          <Button className="w-full bg-gold hover:bg-gold-dark text-white">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ArtworkCard;
