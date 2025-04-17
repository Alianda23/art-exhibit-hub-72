
import React, { useState } from 'react';
import { Button } from './ui/button';
import FileUpload from './FileUpload';
import { toast } from './ui/use-toast';

type Exhibition = {
  id?: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  imageUrl?: string;
  totalSlots: number;
  availableSlots?: number;
  status: 'upcoming' | 'ongoing' | 'past';
};

type ExhibitionFormProps = {
  initialData?: Exhibition;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
};

const ExhibitionForm: React.FC<ExhibitionFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [startDate, setStartDate] = useState(initialData?.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(initialData?.endDate?.split('T')[0] || '');
  const [ticketPrice, setTicketPrice] = useState(initialData?.ticketPrice?.toString() || '');
  const [totalSlots, setTotalSlots] = useState(initialData?.totalSlots?.toString() || '');
  const [status, setStatus] = useState(initialData?.status || 'upcoming');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !location || !startDate || !endDate || !ticketPrice || !totalSlots) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('ticketPrice', ticketPrice);
      formData.append('totalSlots', totalSlots);
      formData.append('status', status);
      
      // Append availableSlots only for new exhibitions
      if (!initialData) {
        formData.append('availableSlots', totalSlots);
      } else if (initialData.availableSlots !== undefined) {
        formData.append('availableSlots', initialData.availableSlots.toString());
      }
      
      // Only append image if it exists and has changed
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (initialData?.imageUrl) {
        formData.append('imageUrl', initialData.imageUrl);
      }
      
      await onSubmit(formData);
      
      // Form will be reset by the parent component if successful
    } catch (error) {
      console.error('Exhibition form submission error:', error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to save exhibition. Please try again."
      });
    }
  };
  
  const handleFileChange = (file: File | null) => {
    setImageFile(file);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title*
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location*
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date*
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date*
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">
                Ticket Price (KSh)*
              </label>
              <input
                id="ticketPrice"
                type="number"
                min="0"
                step="0.01"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div>
              <label htmlFor="totalSlots" className="block text-sm font-medium text-gray-700">
                Total Slots*
              </label>
              <input
                id="totalSlots"
                type="number"
                min="1"
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status*
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exhibition Image{initialData ? '' : '*'}
        </label>
        <FileUpload onFileChange={handleFileChange} />
        
        {initialData?.imageUrl && !imageFile && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Current Image:</p>
            <img 
              src={initialData.imageUrl} 
              alt={initialData.title} 
              className="max-h-48 object-contain border rounded-md" 
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Exhibition' : 'Create Exhibition'}
        </Button>
      </div>
    </form>
  );
};

export default ExhibitionForm;
