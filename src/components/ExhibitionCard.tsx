
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Exhibition } from '@/types';
import { formatPrice, formatDateRange } from '@/utils/formatters';
import { getValidImageUrl, handleImageError } from '@/utils/imageUtils';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { MapPin, Calendar, Ban } from 'lucide-react';

interface ExhibitionCardProps {
  exhibition: Exhibition;
}

const ExhibitionCard = ({ exhibition }: ExhibitionCardProps) => {
  const isSoldOut = exhibition.availableSlots === 0;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
      <div className="image-container relative">
        <AspectRatio ratio={16/9}>
          <img
            src={getValidImageUrl(exhibition.imageUrl)}
            alt={exhibition.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              handleImageError(e, exhibition.imageUrl);
              setImageLoaded(true);
            }}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          )}
        </AspectRatio>
        {isSoldOut && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
            <Ban className="h-4 w-4" />
            <span>Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-gold transition-colors">
          {exhibition.title}
        </h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1 text-gold" />
          <span className="text-sm">{exhibition.location}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-3">
          <Calendar className="h-4 w-4 mr-1 text-gold" />
          <span className="text-sm">{formatDateRange(exhibition.startDate, exhibition.endDate)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-medium text-lg text-gold">
            {formatPrice(exhibition.ticketPrice)}
          </p>
          <p className="text-sm text-gray-600">
            {isSoldOut ? (
              <span className="text-red-500 font-medium">No slots available</span>
            ) : (
              `${exhibition.availableSlots} slots available`
            )}
          </p>
        </div>
        <Link to={`/exhibitions/${exhibition.id}`}>
          <Button className="w-full bg-gold hover:bg-gold-dark text-white">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ExhibitionCard;
