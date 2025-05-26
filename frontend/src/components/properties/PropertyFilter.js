import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PropertyFilter = ({ filters, onFilterChange }) => {
  const { t } = useTranslation('properties');

  const [cities] = useState([
    'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan'
  ]);

  const [localFilters, setLocalFilters] = useState(filters);

  // filters prop이 바뀌면 localFilters도 업데이트
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // localFilters 변경 시 부모 컴포넌트로 전달 (디바운스)
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);
    return () => clearTimeout(handler);
  }, [localFilters]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClear = () => {
    const reset = {
      city: '',
      min_deposit: '',
      max_deposit: '',
      min_monthly_rent: '',
      max_monthly_rent: '',
      property_type: '',
      has_air_conditioner: false,
      has_washing_machine: false,
      has_refrigerator: false,
    };
    setLocalFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mb-6">
      <h3 className="text-lg font-medium mb-4">{t('filters.filters')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.city')}
          </label>
          <select
            name="city"
            value={localFilters.city}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filters.noFiltersApplied')}</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Deposit Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.minDeposit')} – {t('filters.maxDeposit')} (₩)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="min_deposit"
              value={localFilters.min_deposit}
              onChange={handleInputChange}
              placeholder={t('filters.minDeposit')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>-</span>
            <input
              type="number"
              name="max_deposit"
              value={localFilters.max_deposit}
              onChange={handleInputChange}
              placeholder={t('filters.maxDeposit')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Monthly Rent Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.minMonthlyRent')} – {t('filters.maxMonthlyRent')} (₩)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="min_monthly_rent"
              value={localFilters.min_monthly_rent}
              onChange={handleInputChange}
              placeholder={t('filters.minMonthlyRent')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>-</span>
            <input
              type="number"
              name="max_monthly_rent"
              value={localFilters.max_monthly_rent}
              onChange={handleInputChange}
              placeholder={t('filters.maxMonthlyRent')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.propertyType')}
          </label>
          <select
            name="property_type"
            value={localFilters.property_type}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('filters.noFiltersApplied')}</option>
            <option value="apartment">{t('propertyTypes.apartment')}</option>
            <option value="officetel">{t('propertyTypes.officetel')}</option>
            <option value="house">{t('propertyTypes.house')}</option>
            <option value="studio">{t('propertyTypes.studio')}</option>
          </select>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">{t('amenities')}</p>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="has_air_conditioner"
              checked={localFilters.has_air_conditioner}
              onChange={handleInputChange}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('amenitiesList.airConditioner')}</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="has_washing_machine"
              checked={localFilters.has_washing_machine}
              onChange={handleInputChange}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('amenitiesList.washingMachine')}</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="has_refrigerator"
              checked={localFilters.has_refrigerator}
              onChange={handleInputChange}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('amenitiesList.refrigerator')}</span>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {t('filters.resetFilters')}
        </button>
      </div>
    </div>
  );
};

export default PropertyFilter;
