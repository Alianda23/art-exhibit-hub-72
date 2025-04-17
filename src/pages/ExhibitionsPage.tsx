
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/utils';

const API_URL = 'http://localhost:8000';

const ExhibitionsPage: React.FC = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing, past

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/exhibitions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exhibitions');
      }
      
      const data = await response.json();
      
      if (data.exhibitions) {
        setExhibitions(data.exhibitions);
      } else {
        setExhibitions([]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      setError('Failed to load exhibitions. Please try again later.');
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Exhibitions</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our curated exhibitions featuring the best of Kenyan and African art. 
          Book your tickets online and immerse yourself in the vibrant art scene.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-full ${
              filter === 'upcoming' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 rounded-full ${
              filter === 'ongoing' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-full ${
              filter === 'past' 
                ? 'bg-blue-600 text-white' 
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 p-8 bg-red-50 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchExhibitions}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredExhibitions.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No exhibitions found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
          <img 
            src="https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=500" 
            alt="Empty gallery" 
            className="max-w-md mx-auto rounded-lg shadow-md"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExhibitions.map((exhibition) => (
            <Link
              to={`/exhibitions/${exhibition.id}`}
              key={exhibition.id}
              className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={exhibition.imageUrl || "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=500"}
                  alt={exhibition.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{exhibition.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    exhibition.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    exhibition.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exhibition.status.charAt(0).toUpperCase() + exhibition.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                </p>
                <p className="text-gray-800 mb-2">{exhibition.location}</p>
                <p className="text-gray-600 line-clamp-3 mb-4">{exhibition.description}</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">{formatCurrency(exhibition.ticketPrice)}</p>
                  <p className="text-sm text-gray-600">
                    {exhibition.availableSlots} / {exhibition.totalSlots} slots available
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExhibitionsPage;
