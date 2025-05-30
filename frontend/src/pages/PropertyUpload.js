import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  createProperty,
  updateProperty,
  getPropertyById,
} from '../services/propertyService';
import useForm from '../hooks/useForm';
import { validatePropertyForm } from '../utils/validators';

/* ──────────────────────────────────────────────────────────────── */
const PropertyUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'property']);
  const { currentUser, isAuthenticated } = useAuth();

  /* ---------- local state ---------- */
  const [images, setImages] = useState([]);          // 새로 올린 파일
  const [previews, setPreviews] = useState([]);      // 미리보기 URL
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(!!id);

  /* ---------- useForm ---------- */
  const initialValues = {
    address: '',
    city: '',
    district: '',
    deposit: '',
    monthlyRent: '',
    maintenanceFee: '',
    constructionDate: '',
    availableFrom: '',
    roomSize: '',
    roomCount: '1',
    bathroomCount: '1',
    floor: '',
    totalFloors: '',
    heatingType: 'individual',
    propertyType: 'apartment',
    minStayMonths: '6',
    hasBed: false,
    hasWashingMachine: false,
    hasRefrigerator: false,
    hasMicrowave: false,
    hasDesk: false,
    hasCloset: false,
    hasAirConditioner: false,
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit: submitForm,
    setValues,
  } = useForm(initialValues, validatePropertyForm, handleSubmit);

  /* ---------- submit ---------- */
  async function handleSubmit(v) {
    if (images.length === 0 && !isEditMode) {
      setServerError('Please upload at least one image');
      return false;
    }

    setLoading(true);
    setServerError(null);

    try {
      const fd = new FormData();

      /* camelCase → snake_case 매핑 */
      const map = {
        monthlyRent: 'monthly_rent',
        maintenanceFee: 'maintenance_fee',
        constructionDate: 'construction_date',
        availableFrom: 'available_from',
        roomSize: 'room_size',
        roomCount: 'room_count',
        bathroomCount: 'bathroom_count',
        totalFloors: 'total_floors',
        heatingType: 'heating_type',
        propertyType: 'property_type',
        minStayMonths: 'min_stay_months',
        hasBed: 'has_bed',
        hasWashingMachine: 'has_washing_machine',
        hasRefrigerator: 'has_refrigerator',
        hasMicrowave: 'has_microwave',
        hasDesk: 'has_desk',
        hasCloset: 'has_closet',
        hasAirConditioner: 'has_air_conditioner',
      };

      Object.keys(v).forEach((k) => {
        const key = map[k] || k;
        if (v[k] !== undefined && v[k] !== null) fd.append(key, v[k]);
      });

      images.forEach((img) => fd.append('images', img));
      fd.append('thumbnailIndex', 0);

      if (isEditMode) {
        await updateProperty(id, fd);
      } else {
        await createProperty(fd);
      }
      navigate('/agent/properties');
      return true;
    } catch (e) {
      setServerError(e.message || 'Failed to save property');
      return false;
    } finally {
      setLoading(false);
    }
  }

  /* ---------- edit 모드: 데이터 로드 ---------- */
  useEffect(() => {
    if (!isEditMode || !isAuthenticated) return;

    (async () => {
      try {
        setLoading(true);
        const { property } = await getPropertyById(id);

        /* 권한 확인 */
        if (
          currentUser?.role !== 'admin' &&
          (!currentUser?.agentProfile ||
            property.agent_id !== currentUser.agentProfile.agent_id)
        ) {
          navigate('/profile/agent');
          return;
        }

        /* 폼 값 매핑 */
        setValues({
          address: property.address || '',
          city: property.city || '',
          district: property.district || '',
          deposit: property.deposit?.toString() || '',
          monthlyRent: property.monthly_rent?.toString() || '',
          maintenanceFee: property.maintenance_fee?.toString() || '',
          constructionDate: property.construction_date
            ? new Date(property.construction_date).toISOString().split('T')[0]
            : '',
          availableFrom: property.available_from
            ? new Date(property.available_from).toISOString().split('T')[0]
            : '',
          roomSize: property.room_size?.toString() || '',
          roomCount: property.room_count?.toString() || '1',
          bathroomCount: property.bathroom_count?.toString() || '1',
          floor: property.floor?.toString() || '',
          totalFloors: property.total_floors?.toString() || '',
          heatingType: property.heating_type || 'individual',
          propertyType: property.property_type || 'apartment',
          minStayMonths: property.min_stay_months?.toString() || '6',
          hasBed: !!property.has_bed,
          hasWashingMachine: !!property.has_washing_machine,
          hasRefrigerator: !!property.has_refrigerator,
          hasMicrowave: !!property.has_microwave,
          hasDesk: !!property.has_desk,
          hasCloset: !!property.has_closet,
          hasAirConditioner: !!property.has_air_conditioner,
        });

        /* 이미지 프리뷰 */
        const urlPrefix =
          process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
        if (property.images?.length) {
          setPreviews(
            property.images.map((img) =>
              img.image_path.startsWith('/uploads')
                ? `${urlPrefix}${img.image_path}`
                : img.image_path,
            ),
          );
        }
      } catch (e) {
        setServerError(e.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditMode, isAuthenticated, currentUser, navigate, setValues]);

  /* ---------- 이미지 핸들러 ---------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setPreviews([...previews, ...files.map((f) => URL.createObjectURL(f))]);
    setImages([...images, ...files]);
  };
  const removeImage = (i) => {
    setPreviews(previews.filter((_, idx) => idx !== i));
    if (i < images.length) setImages(images.filter((_, idx) => idx !== i));
  };

  /* ---------- 접근 제한 ---------- */
  if (
    !isAuthenticated ||
    (currentUser &&
      !['agent', 'admin'].includes(currentUser.role))
  )
    return <Navigate to="/" replace />;
  if (
    currentUser.role === 'agent' &&
    currentUser.agentProfile &&
    currentUser.agentProfile.verification_status !== 'verified'
  ) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {t('register.agentPending')}
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? t('property.editProperty') : t('property.addProperty')}
      </h1>

      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}

      <form onSubmit={submitForm} className="bg-white rounded-lg shadow-md p-6">
        {/* ────────────── Images ────────────── */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('property.images')}</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {previews.map((src, idx) => (
              <div key={idx} className="relative">
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="w-32 h-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}

            {/* 파일 선택 */}
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="mt-2 text-sm text-gray-500">
                {t('property.addImage')}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                multiple
              />
            </label>
          </div>
          {!isEditMode && previews.length === 0 && (
            <p className="text-red-500 text-sm">
              * {t('property.imageRequired')}
            </p>
          )}
        </div>

        {/* ────────────── Basic Information ────────────── */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {t('property.basicInfo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.address')} *
              </label>
              <input
                type="text"
                name="address"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.city')} *
              </label>
              <select
                name="city"
                value={values.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t('property.selectCity')}</option>
                <option value="Seoul">Seoul</option>
                <option value="Busan">Busan</option>
                <option value="Incheon">Incheon</option>
                <option value="Daegu">Daegu</option>
                <option value="Daejeon">Daejeon</option>
                <option value="Gwangju">Gwangju</option>
                <option value="Ulsan">Ulsan</option>
                <option value="Sejong">Sejong</option>
              </select>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.district')}
              </label>
              <input
                type="text"
                name="district"
                value={values.district}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.type')} *
              </label>
              <select
                name="propertyType"
                value={values.propertyType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.propertyType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="apartment">
                  {t('property.types.apartment')}
                </option>
                <option value="officetel">
                  {t('property.types.officetel')}
                </option>
                <option value="house">
                  {t('property.types.house')}
                </option>
                <option value="studio">
                  {t('property.types.studio')}
                </option>
              </select>
              {errors.propertyType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.propertyType}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ────────────── Pricing ────────────── */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {t('property.pricing')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Deposit */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.deposit')} *
              </label>
              <input
                type="number"
                name="deposit"
                value={values.deposit}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.deposit ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.deposit && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.deposit}
                </p>
              )}
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.monthlyRent')} *
              </label>
              <input
                type="number"
                name="monthlyRent"
                value={values.monthlyRent}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-3 border rounded-md ${
                  errors.monthlyRent ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.monthlyRent && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.monthlyRent}
                </p>
              )}
            </div>

            {/* Maintenance Fee */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.maintenanceFee')}
              </label>
              <input
                type="number"
                name="maintenanceFee"
                value={values.maintenanceFee}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* ────────────── Details ────────────── */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {t('property.details')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 각종 숫자/날짜 입력들 */}
            {[
              ['roomSize', 'number', 'property.roomSize'],
              ['roomCount', 'number', 'property.roomCount'],
              ['bathroomCount', 'number', 'property.bathroomCount'],
              ['floor', 'number', 'property.floor'],
              ['totalFloors', 'number', 'property.totalFloors'],
              ['constructionDate', 'date', 'property.constructionDate'],
              ['availableFrom', 'date', 'property.availableFrom'],
              ['minStayMonths', 'number', 'property.minStay'],
            ].map(([name, type, i18nKey]) => (
              <div key={name}>
                <label className="block text-sm mb-1">
                  {t(i18nKey)}
                </label>
                <input
                  type={type}
                  name={name}
                  value={values[name]}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            ))}

            {/* Heating Type */}
            <div>
              <label className="block text-sm mb-1">
                {t('property.heatingType')}
              </label>
              <select
                name="heatingType"
                value={values.heatingType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="individual">
                  {t('property.heatingTypes.individual')}
                </option>
                <option value="central">
                  {t('property.heatingTypes.central')}
                </option>
                <option value="district">
                  {t('property.heatingTypes.district')}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ────────────── Amenities ────────────── */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {t('property.amenities')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'hasBed',
              'hasWashingMachine',
              'hasRefrigerator',
              'hasMicrowave',
              'hasDesk',
              'hasCloset',
              'hasAirConditioner',
            ].map((field) => (
              <label key={field} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name={field}
                  checked={values[field] || false}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">
                  {t(`property.amenityLabels.${field}`)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ────────────── Buttons ────────────── */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyUpload;
