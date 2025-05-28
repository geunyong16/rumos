// frontend/src/pages/PropertyDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useFavorite } from '../hooks/useFavorite';
import ContactModal from '../components/properties/ContactModal';

const getImageUrl = (imagePath) => {
  return imagePath.startsWith('/uploads')
    ? `${process.env.REACT_APP_API_URL}${imagePath}`
    : `${process.env.REACT_APP_API_URL}/uploads/properties/${imagePath}`;
};

const PropertyDetail = () => {
  const { t } = useTranslation(['properties', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAgent, currentUser, getAuthHeader } = useAuth();
  const { isFavorite, toggleFavorite, loading: favoriteLoading } = useFavorite(id);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/properties/${id}`);
        setProperty(data.property);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || t('errorFetchingPropertyDetails'));
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [id, t]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.info(t('loginToContact'));
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    setIsContactModalOpen(true);
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast.info(t('loginToFavorite'));
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }

    try {
      await toggleFavorite();
      toast.success(
        isFavorite ? t('removedFromFavorites') : t('addedToFavorites')
      );
    } catch (err) {
      console.error(err);
      toast.error(t('errorTogglingFavorite'));
    }
  };

  const handleContactSubmit = async (message) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/contacts/${id}`,
        { message },
        { headers: getAuthHeader() }
      );
      toast.success(t('contactRequest.sent'));
      setIsContactModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(t('contactRequest.error'));
    }
  };

  const handleDeleteProperty = async () => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/properties/${id}`,
        { headers: getAuthHeader() }
      );
      toast.success(t('propertyDeleted'));
      navigate('/agent/properties');
    } catch (err) {
      console.error(err);
      toast.error(t('errorDeletingProperty'));
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" /></div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!property) return null;

  const isOwner = isAgent && currentUser && property.agent_id === currentUser.agent_id;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          <div className="flex flex-col">
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(property.images?.[activeImageIndex]?.image_path)}
                  alt={property.address}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = '/no-image.svg')}
                />
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  disabled={favoriteLoading}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
                  )}
                </button>
              </div>
            </div>

            {property.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={image.image_id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${activeImageIndex === index ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    <img
                      src={getImageUrl(image.image_path)}
                      alt={`${property.address} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = '/no-image.svg')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 lg:mt-0 lg:ml-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{property.address}</h1>
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium text-indigo-600">{formatCurrency(property.deposit)}</span>
                <span className="text-gray-400">/</span>
                <span className="text-lg font-medium text-indigo-600">{formatCurrency(property.monthly_rent)} {t('monthlyRent')}</span>
              </div>
              {property.maintenance_fee > 0 && (
                <p className="mt-1 text-sm text-gray-500">{t('maintenanceFee')}: {formatCurrency(property.maintenance_fee)}</p>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{property.city}</span>{property.district && <span>, {property.district}</span>}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('propertyDetails')}</h3>
                <dl className="mt-2 space-y-3 text-sm text-gray-600">
                  {[{ label: t('propertyType'), value: t(`propertyTypes.${property.property_type}`) },
                    { label: t('roomSize'), value: property.room_size ? `${property.room_size} m²` : '-' },
                    { label: t('rooms'), value: property.room_count || '-' },
                    { label: t('bathrooms'), value: property.bathroom_count || '-' },
                    { label: t('floor'), value: property.floor ? `${property.floor} / ${property.total_floors || '-'}` : '-' },
                    { label: t('heatingType'), value: t(`heatingTypes.${property.heating_type}`) },
                    { label: t('minStay'), value: property.min_stay_months ? `${property.min_stay_months} ${t('months')}` : '-' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <dt>{label}:</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('amenities')}</h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  {[
                    ['bed', property.has_bed],
                    ['washingMachine', property.has_washing_machine],
                    ['refrigerator', property.has_refrigerator],
                    ['microwave', property.has_microwave],
                    ['desk', property.has_desk],
                    ['closet', property.has_closet],
                    ['airConditioner', property.has_air_conditioner],
                  ].map(([key, enabled]) => (
                    <li key={key} className={enabled ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {t(`amenitiesList.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900">{t('available')}</h3>
              <p className="mt-2 text-sm text-gray-600">{property.available_from ? `${t('from')} ${formatDate(property.available_from)}` : t('availableNow')}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900">{t('agentInfo')}</h3>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500">
                    <span className="text-lg font-medium leading-none text-white">
                      {property.agent_name ? property.agent_name.charAt(0).toUpperCase() : 'A'}
                    </span>
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{property.agent_name}</p>
                  {property.company_name && <p className="text-sm text-gray-500">{property.company_name}</p>}
                </div>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              {isOwner ? (
                <>
                  <Link
                    to={`/agent/properties/edit/${property.property_id}`}
                    className="flex-1 py-3 px-8 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
                  >
                    {t('editProperty')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleDeleteProperty}
                    className="flex-1 py-3 px-8 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {t('deleteProperty')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleContactClick}
                    className="flex-1 py-3 px-8 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {t('contactAgent')}
                  </button>
                  <button
                    type="button"
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                    className={`flex-1 py-3 px-8 rounded-md text-base font-medium focus:ring-2 focus:ring-offset-2 ${isFavorite ? 'bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 focus:ring-red-500' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500'}`}
                  >
                    {isFavorite ? (
                      <>
                        <HeartSolidIcon className="h-5 w-5 text-red-500 mr-2" />
                        {t('removeFromFavorites')}
                      </>
                    ) : (
                      <>
                        <HeartIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {t('addToFavorites')}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSubmit={handleContactSubmit}
        property={property}
      />
    </div>
  );
};

export default PropertyDetail;