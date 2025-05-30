import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { updateUserProfile, updatePassword } from '../services/authService';
import useForm from '../hooks/useForm';
import { validateProfile, validatePasswordChange } from '../utils/validators';
import { updateAgentProfile } from '../services/authService';
import { getCurrentUser } from '../services/authService';


const UserProfile = () => {
  const { t } = useTranslation(['profile', 'agentProfile']);
  const { currentUser, updateUser, isAuthenticated } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Profile form setup
  const initialProfileValues = {
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phone_number || '',
    companyName: currentUser?.agentProfile?.company_name || '',
    officeAddress: currentUser?.agentProfile?.office_address || '',
  };


  const handleProfileSubmit = async (values) => {
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      const { email, phoneNumber, companyName, officeAddress } = values;

      const updatedUser = await updateUserProfile({
        email,
        phone_number: phoneNumber
      });

      if (currentUser.role === 'agent') {
        await updateAgentProfile({
          companyName,
          officeAddress
        });
      }

      // ✅ 서버에서 새로 받아서 context 최신화
      const freshUser = await getCurrentUser();
      updateUser(freshUser);


      setUpdateSuccess(true);
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      setUpdateError(error.message || t('profile.updateError'));
    }
  };

  const {
    values: profileValues,
    errors: profileErrors,
    handleChange: handleProfileChange,
    handleBlur: handleProfileBlur,
    handleSubmit: submitProfileForm
  } = useForm(initialProfileValues, validateProfile, handleProfileSubmit);

  // Password form setup
  const initialPasswordValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handlePasswordSubmit = async (values) => {
    setPasswordSuccess(false);
    setPasswordError(null);

    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setPasswordSuccess(true);

      // Reset form
      passwordResetForm();
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  const {
    values: passwordValues,
    errors: passwordErrors,
    handleChange: handlePasswordChange,
    handleBlur: handlePasswordBlur,
    handleSubmit: submitPasswordForm,
    resetForm: passwordResetForm
  } = useForm(initialPasswordValues, validatePasswordChange, handlePasswordSubmit);

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('profile.info')}</h2>

        {updateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {t('profile.updateSuccess')}
          </div>
        )}

        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {updateError}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('profile.username')}
          </label>
          <input
            type="text"
            value={currentUser.username}
            disabled
            className="w-full p-3 border border-gray-300 rounded-md bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('profile.usernameCannotBeChanged')}
          </p>
        </div>

        <form onSubmit={submitProfileForm}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileValues.email}
              onChange={handleProfileChange}
              onBlur={handleProfileBlur}
              className={`w-full p-3 border rounded-md ${profileErrors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {profileErrors.email && (
              <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.phoneNumber')}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={profileValues.phoneNumber}
              onChange={handleProfileChange}
              onBlur={handleProfileBlur}
              className={`w-full p-3 border rounded-md ${profileErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {profileErrors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{profileErrors.phoneNumber}</p>
            )}
          </div>
          {currentUser.agentProfile && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">{t('agentProfile.title')}</h3>

              <div className="mb-2">
                <span className="font-medium">{t('agentProfile.verificationStatus')}:</span>{' '}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${currentUser.agentProfile.verification_status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : currentUser.agentProfile.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                  {t(`agentProfile.verificationStatuses.${currentUser.agentProfile.verification_status}`)}
                </span>
              </div>

              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agentProfile.companyName')}
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={profileValues.companyName}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  className={`w-full p-3 border rounded-md ${profileErrors.companyName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {profileErrors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{profileErrors.companyName}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="officeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('agentProfile.officeAddress')}
                </label>
                <input
                  id="officeAddress"
                  name="officeAddress"
                  rows="3"
                  value={profileValues.officeAddress}
                  onChange={handleProfileChange}
                  onBlur={handleProfileBlur}
                  className={`w-full p-3 border rounded-md ${profileErrors.officeAddress ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {profileErrors.officeAddress && (
                  <p className="text-red-500 text-xs mt-1">{profileErrors.officeAddress}</p>
                )}
              </div>

            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('profile.updateInfo')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('profile.password')}</h2>
          <button
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {showPasswordForm ? t('common.cancel') : t('profile.updatePassword')}
          </button>
        </div>

        {showPasswordForm && (
          <>
            {passwordSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {t('profile.passwordUpdateSuccess')}
              </div>
            )}

            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {passwordError}
              </div>
            )}

            <form onSubmit={submitPasswordForm}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.currentPassword')}
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordValues.currentPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`w-full p-3 border rounded-md ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.newPassword')}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordValues.newPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`w-full p-3 border rounded-md ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.confirmPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordValues.confirmPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`w-full p-3 border rounded-md ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('profile.updatePassword')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;