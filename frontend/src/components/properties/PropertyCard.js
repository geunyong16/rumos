// frontend/src/components/properties/PropertyCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorite } from '../../hooks/useFavorite';

const API_BASE = process.env.REACT_APP_API_URL || '';

const PropertyCard = ({ property }) => {
  const { t } = useTranslation('properties');
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite, loading } = useFavorite(property.property_id);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })
      .format(amount);

  const handleFavoriteClick = e => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert(t('properties.loginToFavorite'));
    } else {
      toggleFavorite();
    }
  };

  // thumbnail 이 있으면, 업로드된 파일 경로로, 아니면 placeholder
  const imageUrl = property.thumbnail
    ? `${API_BASE}/uploads/properties/${property.thumbnail}`
    : '/placeholder.png';

  return (
    <Link to={`/properties/${property.property_id}`} className="group">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
        <div className="relative h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={property.address}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100"
          >
            {isFavorite
              ? <HeartSolidIcon className="h-6 w-6 text-red-500"/>
              : <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500"/>}
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 truncate">{property.address}</h3>
          <p className="text-sm text-gray-500">{property.city}, {property.district}</p>

          <div className="mt-4 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('deposit')}</p>
              <p className="text-lg font-bold text-indigo-600">{formatCurrency(property.deposit)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('monthlyRent')}</p>
              <p className="text-lg font-bold text-indigo-600">{formatCurrency(property.monthly_rent)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-gray-500 justify-between">
            <span>{t(`propertyTypes.${property.property_type}`)}</span>
            <span>
              {property.room_count} {t('rooms')} / {property.bathroom_count} {t('bathrooms')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
