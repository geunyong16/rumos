import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PropertyFilter = ({ onFilterChange }) => {
  // properties.json 네임스페이스 사용
  const { t } = useTranslation('properties');

  const [cities] = useState([
    'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan'
  ]);

  const [filters, setFilters] = useState({
    city: '',
    minDeposit: '',
    maxDeposit: '',
    minMonthlyRent: '',
    maxMonthlyRent: '',
    propertyType: '',
    hasAirConditioner: false,
    hasWashingMachine: false,
    hasRefrigerator: false,
  });

  // 디바운스 적용: 필터 변경 시 500ms 뒤에 부모로 전달
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClear = () => {
    setFilters({
      city: '',
      minDeposit: '',
      maxDeposit: '',
      minMonthlyRent: '',
      maxMonthlyRent: '',
      propertyType: '',
      hasAirConditioner: false,
      hasWashingMachine: false,
      hasRefrigerator: false,
    });
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mb-6">
      {/* Filter Header */}
      <h3 className="text-lg font-medium mb-4">{t('filters.filters')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.city')}
          </label>
          <select
            name="city"
            value={filters.city}
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
              name="minDeposit"
              value={filters.minDeposit}
              onChange={handleInputChange}
              placeholder={t('filters.minDeposit')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>-</span>
            <input
              type="number"
              name="maxDeposit"
              value={filters.maxDeposit}
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
              name="minMonthlyRent"
              value={filters.minMonthlyRent}
              onChange={handleInputChange}
              placeholder={t('filters.minMonthlyRent')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>-</span>
            <input
              type="number"
              name="maxMonthlyRent"
              value={filters.maxMonthlyRent}
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
            name="propertyType"
            value={filters.propertyType}
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
              name="hasAirConditioner"
              checked={filters.hasAirConditioner}
              onChange={handleInputChange}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('amenitiesList.airConditioner')}</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="hasWashingMachine"
              checked={filters.hasWashingMachine}
              onChange={handleInputChange}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('amenitiesList.washingMachine')}</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="hasRefrigerator"
              checked={filters.hasRefrigerator}
              onChange={handleInputChange}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('amenitiesList.refrigerator')}</span>
          </label>
        </div>
      </div>

      {/* Clear Filters Button */}
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
