
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExhibitionForm from '../components/ExhibitionForm';
import { toast } from '../components/ui/use-toast';

const API_URL = 'http://localhost:8000';

const AdminExhibitions: React.FC = () => {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/exhibitions`);
      const data = await response.json();
      
      if (data.exhibitions) {
        setExhibitions(data.exhibitions);
      } else {
        console.error('Unexpected response format:', data);
        setExhibitions([]);
      }
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load exhibitions. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedExhibition(null);
    setIsAddingNew(true);
  };

  const handleEdit = (exhibition) => {
    setSelectedExhibition(exhibition);
    setIsAddingNew(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exhibition?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/exhibitions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          variant: 'success', // Now using the success variant
          title: 'Success',
          description: 'Exhibition deleted successfully',
        });
        fetchExhibitions();
      } else {
        throw new Error(result.error || 'Failed to delete exhibition');
      }
    } catch (error) {
      console.error('Error deleting exhibition:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete exhibition',
      });
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('You must be logged in as an admin');
      }

      let url = `${API_URL}/exhibitions`;
      let method = 'POST';
      
      if (selectedExhibition) {
        url = `${API_URL}/exhibitions/${selectedExhibition.id}`;
        method = 'PUT';
      }

      console.log('Submitting exhibition form:', method, url);
      console.log('Form data keys:', [...formData.keys()]);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save exhibition');
      }
      
      toast({
        variant: 'success', // Now using the success variant
        title: 'Success',
        description: `Exhibition ${selectedExhibition ? 'updated' : 'created'} successfully`,
      });
      
      setIsAddingNew(false);
      fetchExhibitions();
    } catch (error) {
      console.error('Error saving exhibition:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save exhibition',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in as admin, redirect to login
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin-login');
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Exhibitions</h1>
      
      {isAddingNew ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedExhibition ? 'Edit Exhibition' : 'Add New Exhibition'}
          </h2>
          <ExhibitionForm
            initialData={selectedExhibition}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>
      ) : (
        <div>
          <button
            onClick={handleAddNew}
            className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add New Exhibition
          </button>
          
          {loading ? (
            <p>Loading exhibitions...</p>
          ) : exhibitions.length === 0 ? (
            <p>No exhibitions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left border-b">Title</th>
                    <th className="py-3 px-4 text-left border-b">Location</th>
                    <th className="py-3 px-4 text-left border-b">Dates</th>
                    <th className="py-3 px-4 text-left border-b">Price</th>
                    <th className="py-3 px-4 text-left border-b">Status</th>
                    <th className="py-3 px-4 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exhibitions.map((exhibition) => (
                    <tr key={exhibition.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{exhibition.title}</td>
                      <td className="py-3 px-4 border-b">{exhibition.location}</td>
                      <td className="py-3 px-4 border-b">
                        {new Date(exhibition.startDate).toLocaleDateString()} - 
                        {new Date(exhibition.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 border-b">
                        KSh {exhibition.ticketPrice}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs ${
                          exhibition.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          exhibition.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exhibition.status.charAt(0).toUpperCase() + exhibition.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={() => handleEdit(exhibition)}
                          className="mr-2 text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exhibition.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminExhibitions;
