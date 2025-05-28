// frontend/src/pages/MyProperties.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  PlusIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const MyProperties = () => {
  const { t } = useTranslation(['properties', 'common']);
  const { currentUser, isAuthenticated, isAgent, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, property: null });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    if (!isAuthenticated || !isAgent) {
      navigate('/');
      return;
    }
    fetchMyProperties();
  }, [isAuthenticated, isAgent, navigate]);

  const fetchMyProperties = async () => {
    if (!currentUser?.agentProfile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/properties/agent/${currentUser.agentProfile.agent_id}`,
        { headers: getAuthHeader() }
      );
      
      const propertyList = response.data.properties || [];
      setProperties(propertyList);
      
      // Calculate stats
      setStats({
        total: propertyList.length,
        active: propertyList.filter(p => p.is_active).length,
        inactive: propertyList.filter(p => !p.is_active).length
      });
      
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError(err.response?.data?.message || 'Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/properties/${propertyId}`,
        { headers: getAuthHeader() }
      );
      
      toast.success('Property deleted successfully');
      setDeleteModal({ isOpen: false, property: null });
      
      // Refresh the properties list
      fetchMyProperties();
      
    } catch (err) {
      console.error('Error deleting property:', err);
      toast.error(err.response?.data?.message || 'Failed to delete property');
    }
  };

  const togglePropertyStatus = async (propertyId, currentStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/properties/${propertyId}`,
        { is_active: !currentStatus },
        { headers: getAuthHeader() }
      );
      
      toast.success(`Property ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Update the property in the list
      setProperties(prev => prev.map(p => 
        p.property_id === propertyId 
          ? { ...p, is_active: !currentStatus }
          : p
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        active: prev.active + (!currentStatus ? 1 : -1),
        inactive: prev.inactive + (!currentStatus ? -1 : 1)
      }));
      
    } catch (err) {
      console.error('Error toggling property status:', err);
      toast.error(err.response?.data?.message || 'Failed to update property status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (!isAuthenticated || !isAgent) {
    return null;
  }

  if (!currentUser?.agentProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
              <p className="mt-2 text-gray-600">
                Manage your property listings and track their performance
              </p>
            </div>
            
            {currentUser.agentProfile.verification_status === 'verified' && (
              <Link
                to="/properties/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Property
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <HomeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Properties
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Listings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.active}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-red-500"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Inactive Listings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.inactive}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-center">Loading your properties...</p>
            </div>
          </div>
        ) : currentUser.agentProfile.verification_status !== 'verified' ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-yellow-800">Account Verification Required</h3>
            <p className="mt-2 text-sm text-yellow-700">
              Your agent account is pending verification. You can add and manage properties after admin approval.
            </p>
            <div className="mt-6">
              <Link
                to="/agent/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
              >
                View Profile Status
              </Link>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by adding your first property listing to attract potential tenants.
            </p>
            <div className="mt-6">
              <Link
                to="/agent/properties/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Property
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {properties.map((property) => (
                <li key={property.property_id} className="hover:bg-gray-50">
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        {/* Property Image */}
                        <div className="flex-shrink-0">
                          {property.thumbnail ? (
                            <img
                              className="h-24 w-24 rounded-lg object-cover shadow-sm"
                              src={`${process.env.REACT_APP_API_URL}${property.thumbnail}`}
                              alt={property.address}
                            />
                          ) : (
                            <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                              <HomeIcon className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="ml-6 flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-indigo-600 truncate">
                                  {property.address}
                                </h3>
                                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  property.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {property.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span>{property.city}{property.district && `, ${property.district}`}</span>
                              </div>
                              
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span className="font-medium">
                                  {formatCurrency(property.deposit)} / {formatCurrency(property.monthly_rent)}
                                </span>
                                <span className="mx-2">•</span>
                                <span>{property.room_count} rooms, {property.bathroom_count} baths</span>
                              </div>
                              
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                <span>Created: {formatDate(property.created_at)}</span>
                              </div>
                            </div>
                            
                            <div className="ml-4 text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {t(`propertyTypes.${property.property_type}`) || property.property_type}
                              </p>
                              {property.room_size && (
                                <p className="text-sm text-gray-500">{property.room_size}m²</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-6 flex items-center space-x-3">
                        <Link
                          to={`/properties/${property.property_id}`}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="View Property"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        
                        <Link
                          to={`/agent/properties/edit/${property.property_id}`}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="Edit Property"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => togglePropertyStatus(property.property_id, property.is_active)}
                          className={`inline-flex items-center p-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            property.is_active
                              ? 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500'
                              : 'border-green-300 text-green-700 bg-white hover:bg-green-50 focus:ring-green-500'
                          }`}
                          title={property.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <div className={`h-4 w-4 rounded-full ${
                            property.is_active ? 'bg-red-500' : 'bg-green-500'
                          }`}></div>
                        </button>
                        
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, property })}
                          className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Delete Property"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  Delete Property
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>"{deleteModal.property?.address}"</strong>? 
                    This action cannot be undone and will permanently remove all property data and images.
                  </p>
                </div>
                <div className="items-center px-4 py-3 flex space-x-3 justify-center">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, property: null })}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(deleteModal.property.property_id)}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete Property
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;
