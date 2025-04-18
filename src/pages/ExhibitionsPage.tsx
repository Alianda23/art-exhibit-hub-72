
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Exhibition } from '@/types';
import { formatPrice, formatDateRange } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { getAllExhibitions } from '@/services/api';
import { getValidImageUrl, handleImageError } from '@/utils/imageUtils';
import ExhibitionCard from '@/components/ExhibitionCard';

const ExhibitionsPage = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, past
  const { toast } = useToast();

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const data = await getAllExhibitions();
      console.log('Fetched exhibitions:', data);
      setExhibitions(data);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      toast({
        title: "Error",
        description: "Failed to load exhibitions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter exhibitions based on selected filter
  const filteredExhibitions = exhibitions.filter(exhibition => {
    if (filter === 'all') return true;
    return exhibition.status === filter;
  });

  return (
    <div className="py-12 px-4 md:px-6 bg-secondary min-h-screen">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">
            Discover Our <span className="text-gold">Exhibitions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Immerse yourself in our curated exhibitions featuring the finest Kenyan artworks
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full ${
                filter === 'all' 
                  ? 'bg-gold text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-full ${
                filter === 'upcoming' 
                  ? 'bg-gold text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('ongoing')}
              className={`px-4 py-2 rounded-full ${
                filter === 'ongoing' 
                  ? 'bg-gold text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-full ${
                filter === 'past' 
                  ? 'bg-gold text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Past
            </button>
          </div>

          <p className="text-center text-gray-600">
            Showing {filteredExhibitions.length} exhibitions
          </p>
        </div>

        {/* Exhibition Grid */}
        {loading ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-medium mb-2">Loading exhibitions...</h3>
            <p className="text-gray-600">Please wait while we fetch the exhibitions</p>
          </div>
        ) : filteredExhibitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExhibitions.map((exhibition) => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-medium mb-2">No exhibitions found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitionsPage;
