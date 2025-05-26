// src/pages/AgentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import {
  getAgentProfile,
  getAgentProperties,
  updateAgentProfile,
} from '../services/authService';

import useForm from '../hooks/useForm';
import { validateProfile } from '../utils/validators';
import PropertyCard from '../components/properties/PropertyCard';

const AgentProfile = () => {
  const { t } = useTranslation('profile');
  const { currentUser, updateUser } = useAuth();

  /* ───────────── state ───────────── */
  const [properties, setProperties] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitOK, setSubmitOK] = useState(false);
  const [submitErr, setSubmitErr] = useState(null);

  /* ───────────── form ───────────── */
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit: submitForm,
    /* ⚠️ useForm 훅에 아래 메서드가 없으면
       네 훅에 setFormValues 같은 리셋 함수 추가하면 됩니다 */
    setFormValues,
  } = useForm(
    { companyName: '', officeAddress: '' },
    validateProfile,
    async (vals) => {
      setSubmitOK(false);
      setSubmitErr(null);
      try {
        await updateAgentProfile({
          companyName: vals.companyName,
          officeAddress: vals.officeAddress,
        });
        updateUser((prev) => ({
          ...prev,
          agentProfile: {
            ...prev.agentProfile,
            company_name: vals.companyName,
            office_address: vals.officeAddress,
          },
        }));
        setSubmitOK(true);
      } catch (e) {
        setSubmitErr(e.message || t('profile.updateError'));
      }
    }
  );

  /* ───────────── 프로필 + 매물 한번에 로드 ───────────── */
  useEffect(() => {
    const loadEverything = async () => {
      if (!currentUser || currentUser.role !== 'agent') return;

      try {
        // ① 프로필 (없을 때만)
        if (!currentUser.agentProfile) {
          const profile = await getAgentProfile();
          updateUser((prev) => ({ ...prev, agentProfile: profile }));
          setFormValues({
            companyName: profile.company_name || '',
            officeAddress: profile.office_address || '',
          });
        } else {
          setFormValues({
            companyName: currentUser.agentProfile.company_name || '',
            officeAddress: currentUser.agentProfile.office_address || '',
          });
        }

        // ② 내 매물
        const list = await getAgentProperties();
        setProperties(list);
      } catch (err) {
        console.error('AgentProfile load fail', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadEverything();
  }, [currentUser, updateUser, setFormValues]);

  /* ───────────── 보호 라우팅 ───────────── */
  if (!currentUser || currentUser.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  const status = currentUser.agentProfile?.verification_status;

  /* ───────────── JSX ───────────── */
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

      {/* ----- INFO CARD ----- */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('agent.info')}</h2>

        {submitOK && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
            {t('profile.updateSuccess')}
          </div>
        )}
        {submitErr && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {submitErr}
          </div>
        )}

        {/* ── verification badge ── */}
        <div className="mb-4">
          <span className="font-medium mr-2">{t('agent.verificationStatus')}:</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              status === 'verified'
                ? 'bg-green-100 text-green-800'
                : status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status ? t(`agent.${status}`) : t('agent.loadingStatus')}
          </span>
        </div>

        {/* ── profile form ── */}
        <form onSubmit={submitForm}>
          {/* companyName */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('agent.companyName')}
            </label>
            <input
              type="text"
              name="companyName"
              value={values.companyName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border rounded-md ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
            )}
          </div>

          {/* officeAddress */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('agent.officeAddress')}
            </label>
            <textarea
              name="officeAddress"
              value={values.officeAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              className={`w-full p-2 border rounded-md ${
                errors.officeAddress ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.officeAddress && (
              <p className="text-red-500 text-xs mt-1">{errors.officeAddress}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('agent.updateInfo')}
          </button>
        </form>
      </div>

      {/* ----- MY PROPERTIES ----- */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('agent.myProperties')}</h2>
          <Link
            to="/properties/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('agent.addProperty')}
          </Link>
        </div>

        {loadingData ? (
          <p className="text-center py-8">Loading…</p>
        ) : properties.length === 0 ? (
          <div className="bg-gray-100 p-8 text-center rounded">
            {t('agent.noProperties')}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard key={p.property_id} property={p} isAgent />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentProfile;
