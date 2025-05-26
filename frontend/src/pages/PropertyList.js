// frontend/src/pages/PropertyList.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilter from '../components/properties/PropertyFilter';
import { useAuth } from '../contexts/AuthContext';

const PropertyList = ({ userProperties = false }) => {
  const { t } = useTranslation(['properties', 'common']);
  const { isAuthenticated, isAgent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for properties and pagination
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    city: '',
    district: '',
    min_deposit: '',
    max_deposit: '',
    min_monthly_rent: '',
    max_monthly_rent: '',
    property_type: '',
    room_count: '',
  });

  // Memoize auth headers to prevent re-renders
  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [isAuthenticated]);

  // Parse URL parameters and update state - this should only happen when URL actually changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Extract page
    const pageParam = searchParams.get('page');
    const newPage = pageParam ? parseInt(pageParam) : 1;
    
    // Extract filters
    const newFilters = {};
    Object.keys(filters).forEach((key) => {
      newFilters[key] = searchParams.get(key) || '';
    });
    
    // Only update if values actually changed
    setPagination(prev => {
      if (prev.page !== newPage) {
        return { ...prev, page: newPage };
      }
      return prev;
    });
    
    // Only update filters if they actually changed
    setFilters(prev => {
      const hasChanged = Object.keys(newFilters).some(key => prev[key] !== newFilters[key]);
      return hasChanged ? newFilters : prev;
    });
  }, [location.search]); // Only depend on location.search

  // Fetch properties effect - separate from URL parsing
  useEffect(() => {
    let cancelled = false;
    
    const fetchProperties = async () => {
      if (cancelled) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let endpoint = `${process.env.REACT_APP_API_URL}/properties`;
        
        // If on agent page, get only agent's properties
        if (userProperties && isAgent) {
          endpoint = `${process.env.REACT_APP_API_URL}/properties/agent/me`;
        }
        
        // Build query string
        const params = new URLSearchParams();
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        
        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            params.append(key, value);
          }
        });
        
        console.log('Fetching properties with params:', params.toString());
        console.log('Current page:', pagination.page);
        
        const config = isAuthenticated ? { headers: authHeaders } : {};
        const response = await axios.get(`${endpoint}?${params.toString()}`, config);
        
        if (!cancelled) {
          setProperties(response.data.properties || []);
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination?.total || 0,
            totalPages: response.data.pagination?.totalPages || 1
          }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching properties:', err);
          setError(err.response?.data?.message || t('common.errorFetchingProperties', { ns: 'common' }));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    // Use a longer delay to prevent rapid successive calls
    const timeoutId = setTimeout(fetchProperties, 300);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    pagination.page,
    pagination.limit,
    filters.city,
    filters.district,
    filters.min_deposit,
    filters.max_deposit,
    filters.min_monthly_rent,
    filters.max_monthly_rent,
    filters.property_type,
    filters.room_count,
    userProperties,
    isAgent,
    isAuthenticated,
    authHeaders,
    t
  ]);
  
  // Handle filter change - this should update URL and reset page to 1 ONLY if filters actually changed
  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams(location.search);
    
    // Check if filters actually changed
    const filtersChanged = Object.keys(newFilters).some(key => {
      const oldValue = filters[key] || '';
      const newValue = newFilters[key] || '';
      return oldValue !== newValue;
    });
    
    console.log('Filter change detected:', filtersChanged);
    console.log('Old filters:', filters);
    console.log('New filters:', newFilters);
    
    // Add filters to params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    if (filtersChanged) {
      // Reset to page 1 only when filters actually change
      params.set('page', '1');
      console.log('Resetting to page 1 due to filter change');
    } else {
      // Keep current page if filters didn't change
      const currentPage = params.get('page') || pagination.page.toString();
      params.set('page', currentPage);
      console.log('Keeping current page:', currentPage);
    }
    
    // Update URL - this will trigger the useEffect above
    navigate({ search: params.toString() }, { replace: true });
  };
  
  // Handle page change - this should only update the page parameter
  const handlePageChange = (newPage) => {
    // Don't go below page 1 or above total pages
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }
    
    // Get current search params
    const params = new URLSearchParams(location.search);
    
    // Update only the page parameter
    params.set('page', newPage.toString());
    
    // Update URL - this will trigger the useEffect above
    navigate({ search: params.toString() }, { replace: true });
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {userProperties ? t('myProperties') : t('searchProperties')}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {userProperties
                ? t('myPropertiesDescription')
                : t('findYourPerfectHome')}
            </p>
          </div>
          
          {userProperties && isAgent && (
            <Link
              to="/agent/properties/upload"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('uploadProperty')}
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter sidebar */}
          <div className="lg:col-span-1">
            <PropertyFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>
          
          {/* Property grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('noProperties')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {userProperties
                    ? t('noPropertiesAgent')
                    : t('common.noResults', { ns: 'common' })}
                </p>
                {userProperties && isAgent && (
                  <div className="mt-6">
                    <Link
                      to="/agent/properties/upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {t('uploadProperty')}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Properties count and current page info */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing page {pagination.page} of {pagination.totalPages} 
                  ({pagination.total} total properties)
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.property_id}
                      property={property}
                      isOwner={userProperties}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">{t('common.previous', { ns: 'common' })}</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, index) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = index + 1;
                        } else {
                          // Show pages around current page
                          const start = Math.max(1, pagination.page - 2);
                          const end = Math.min(pagination.totalPages, start + 4);
                          pageNum = start + index;
                          if (pageNum > end) return null;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">{t('common.next', { ns: 'common' })}</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyList;