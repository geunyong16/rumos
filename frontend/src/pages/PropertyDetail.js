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
// import { getImageUrl } from '../utils/getImageUrl';

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

  /* ───────────── 데이터 가져오기 ───────────── */
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/properties/${id}`,
        );
        setProperty(data.property);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || t('errorFetchingPropertyDetails'),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, t]);

  /* ───────────── 포맷터 ───────────── */
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

  /* ───────────── 핸들러 ───────────── */
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
        isFavorite ? t('removedFromFavorites') : t('addedToFavorites'),
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
        { headers: getAuthHeader() },
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
        { headers: getAuthHeader() },
      );
      toast.success(t('propertyDeleted'));
      navigate('/agent/properties');
    } catch (err) {
      console.error(err);
      toast.error(t('errorDeletingProperty'));
    }
  };

  /* ───────────── 로딩 / 에러 화면 ───────────── */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
          <div className="mt-4">
            <Link
              to="/properties"
              className="text-sm font-medium text-red-800 hover:text-red-700"
            >
              {t('common.back', { ns: 'common' })}{' '}
              {t('common.properties', { ns: 'common' })}
            </Link>
          </div>
        </div>
      </div>
    );

  if (!property)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h3 className="text-lg font-medium text-gray-900">
          {t('common.notFound', { ns: 'common' })}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{t('propertyNotFound')}</p>
        <Link
          to="/properties"
          className="mt-6 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {t('common.back', { ns: 'common' })}{' '}
          {t('common.properties', { ns: 'common' })}
        </Link>
      </div>
    );

  const isOwner =
    isAgent && currentUser && property.agent_id === currentUser.agent_id;

  /* ───────────── 뷰 ───────────── */
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex mb-6">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">
                  {t('common.home', { ns: 'common' })}
                </span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <Link
                  to="/properties"
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {t('common.properties', { ns: 'common' })}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500 truncate max-w-xs">
                  {property.address}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* ── 이미지 갤러리 ── */}
          <div className="flex flex-col">
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                {property.images?.length ? (
                  <img
                    // src={getImageUrl(
                    //   property.images[activeImageIndex].image_path,
                    // )}
                    src={`${process.env.REACT_APP_API_URL}/uploads/properties/${property.images[activeImageIndex].image_path}`}
                    alt={property.address}
                    className="w-full h-full object-center object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/no-image.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                )}

                {/* 찜 버튼 */}
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

            {/* 썸네일 */}
            {property.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={image.image_id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden ${
                      activeImageIndex === index
                        ? 'ring-2 ring-offset-2 ring-indigo-500'
                        : 'focus:outline-none'
                    }`}
                  >
                    <img
                      // src={getImageUrl(image.image_path)}
                      src={`${process.env.REACT_APP_API_URL}/uploads/properties/${image.image_path}`}

                      alt={`${property.address} ${index + 1}`}
                      className="w-full h-full object-center object-cover"
                      onError={(e) => {
                        e.currentTarget.style.opacity = 0.4;
                        e.currentTarget.src = '/no-image.svg';
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 bg-black bg-opacity-10 ${
                        activeImageIndex === index
                          ? ''
                          : 'hover:bg-opacity-20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 상세 정보 ── */}
          <div className="mt-10 lg:mt-0 lg:ml-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {property.address}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">{t('propertyDetails')}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium text-indigo-600">
                  {formatCurrency(property.deposit)}
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-lg font-medium text-indigo-600">
                  {formatCurrency(property.monthly_rent)} {t('monthlyRent')}
                </span>
              </div>

              {property.maintenance_fee > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {t('maintenanceFee')}: {formatCurrency(property.maintenance_fee)}
                </p>
              )}
            </div>

            {/* 위치·기본 스펙 */}
            <div className="mt-6">
              <div className="flex items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="mr-1.5 h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{property.city}</span>
                  {property.district && <span>, {property.district}</span>}
                </div>
              </div>

              {/* 상세 스펙 */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {t('propertyDetails')}
                  </h3>
                  <dl className="mt-2 space-y-3 text-sm text-gray-600">
                    {[
                      {
                        label: t('propertyType'),
                        value: property.property_type
                          ? t(`propertyTypes.${property.property_type}`)
                          : '-',
                      },
                      {
                        label: t('roomSize'),
                        value: property.room_size
                          ? `${property.room_size} m²`
                          : '-',
                      },
                      {
                        label: t('rooms'),
                        value: property.room_count || '-',
                      },
                      {
                        label: t('bathrooms'),
                        value: property.bathroom_count || '-',
                      },
                      {
                        label: t('floor'),
                        value: property.floor
                          ? `${property.floor} / ${property.total_floors || '-'}`
                          : '-',
                      },
                      {
                        label: t('heatingType'),
                        value: property.heating_type
                          ? t(`heatingTypes.${property.heating_type}`)
                          : '-',
                      },
                      {
                        label: t('minStay'),
                        value: property.min_stay_months
                          ? `${property.min_stay_months} ${t('months')}`
                          : '-',
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between"
                      >
                        <dt>{label}:</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* 편의시설 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {t('amenities')}
                  </h3>
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
                      <li
                        key={key}
                        className={
                          enabled
                            ? 'text-gray-900'
                            : 'text-gray-400 line-through'
                        }
                      >
                        {t(`amenitiesList.${key}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 입주 가능일 */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">
                  {t('available')}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {property.available_from
                    ? `${t('from')} ${formatDate(property.available_from)}`
                    : t('availableNow')}
                </p>
              </div>

              {/* 중개인 정보 */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900">
                  {t('agentInfo')}
                </h3>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500">
                      <span className="text-lg font-medium leading-none text-white">
                        {property.agent_name
                          ? property.agent_name.charAt(0).toUpperCase()
                          : 'A'}
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {property.agent_name}
                    </p>
                    {property.company_name && (
                      <p className="text-sm text-gray-500">
                        {property.company_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
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
                      className={`flex-1 py-3 px-8 rounded-md text-base font-medium focus:ring-2 focus:ring-offset-2 ${
                        isFavorite
                          ? 'bg-red-50 border border-red-300 text-red-700 hover:bg-red-100 focus:ring-red-500'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500'
                      }`}
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
      </div>

      {/* 연락 모달 */}
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
