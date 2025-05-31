// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import  { getAgentProfile } from '../services/authService';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Registration form field validation
export const validateRegistration = (field, values) => {
  // Username validation
  if (field === 'username') {
    if (!values.username) {
      return 'validation.required';
    }
    if (values.username.length < 4) {
      return { key: 'validation.minLength', params: { min: 4 } };
    }
    if (values.username.length > 20) {
      return { key: 'validation.maxLength', params: { max: 20 } };
    }
  }

  // Password validation (min 8 chars + at least one special char)
  if (field === 'password') {
    if (!values.password) {
      return 'validation.required';
    }
    const complexity = /^(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!complexity.test(values.password)) {
      return 'validation.passwordComplexity';
    }
  }

  // Confirm password validation
  if (field === 'confirmPassword') {
    if (!values.confirmPassword) {
      return 'validation.required';
    }
    if (values.password !== values.confirmPassword) {
      return 'validation.passwordMatch';
    }
  }

  // Email validation
  if (field === 'email') {
    if (!values.email) {
      return 'validation.required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      return 'validation.email';
    }
  }

  // Phone number validation (Korean format)
  if (field === 'phoneNumber') {
    if (!values.phoneNumber) {
      return 'validation.required';
    }
    const phoneRegex = /^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(values.phoneNumber.replace(/\s/g, ''))) {
      return 'validation.phoneFormat';
    }
  }

  // Agent-specific fields
  if (values.role === 'agent') {
    if (field === 'companyName' && !values.companyName) {
      return 'validation.required';
    }
    if (field === 'officeAddress' && !values.officeAddress) {
      return 'validation.required';
    }
    if (field === 'licenseImage' && !values.licenseImage && !values.licenseImageUrl) {
      return 'validation.required';
    }
  }

  return null;
};

// Profile form validation
export const validateProfile = (field, values) => {
  if (field === 'email') {
    if (!values.email) {
      return 'validation.required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      return 'validation.email';
    }
  }

  if (field === 'phoneNumber') {
    if (!values.phoneNumber) {
      return 'validation.required';
    }
    const phoneRegex = /^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(values.phoneNumber.replace(/\s/g, ''))) {
      return 'validation.phoneFormat';
    }
  }

  if (field === 'companyName' && values.role === 'agent' && !values.companyName) {
    return 'validation.required';
  }

  return null;
};

// Password change form validation
export const validatePasswordChange = (field, values) => {
  if (field === 'currentPassword' && !values.currentPassword) {
    return 'validation.required';
  }

  if (field === 'newPassword') {
    if (!values.newPassword) {
      return 'validation.required';
    }
    const complexity = /^(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!complexity.test(values.newPassword)) {
      return 'validation.passwordComplexity';
    }
  }

  if (field === 'confirmPassword') {
    if (!values.confirmPassword) {
      return 'validation.required';
    }
    if (values.newPassword !== values.confirmPassword) {
      return 'validation.passwordMatch';
    }
  }

  return null;
};

// Property form validation
export const validatePropertyForm = (field, values) => {
  const requiredFields = ['address', 'city', 'deposit', 'monthlyRent'];
  if (requiredFields.includes(field) && !values[field]) {
    return 'validation.required';
  }

  const numericFields = ['deposit', 'monthlyRent', 'maintenanceFee', 'roomSize', 'floor', 'totalFloors'];
  if (numericFields.includes(field) && values[field] && isNaN(Number(values[field]))) {
    return 'validation.numeric';
  }

  return null;
};

// Board post form validation
export const validatePostForm = (field, values) => {
  if (field === 'title') {
    if (!values.title) {
      return 'validation.titleRequired';
    }
    if (values.title.length > 100) {
      return 'validation.titleLength';
    }
  }
  if (field === 'content' && !values.content) {
    return 'validation.contentRequired';
  }
  return null;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkUserSession(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkUserSession = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/profile`, config);
      const user = response.data.user;

      // 👉 에이전트라면 프로필 추가 로딩
      if (user.role === 'agent') {
        try {
          const agentProfile = await getAgentProfile();
          setCurrentUser({ ...user, agentProfile });
        } catch (e) {
          console.error('Agent profile load failed', e);
          setCurrentUser(user);      // 그래도 최소 user 는 세팅
        }
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error checking user session:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
      setLoading(false);
    }
  };
const updateUser = (updater) => {
    setCurrentUser(prev =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  };

  const login = async (username, password) => {
  try {
    setError(null);
    setLoading(true);

    /* 1️⃣ 로그인 */
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/users/login`,
      { username, password }
    );

    const { token, user } = data;
    localStorage.setItem('token', token);

    /* 2️⃣ agent 인데 응답에 agentProfile 이 없으면 추가 조회 */
    let finalUser = user;
    if (user.role === 'agent' && !user.agentProfile) {
      try {
        // api 인스턴스에 토큰 인터셉터가 있다면 헤더는 자동
        const agentProfile = await getAgentProfile();
        finalUser = { ...user, agentProfile };
      } catch (e) {
        console.warn('⚠️  agentProfile fetch failed → 계속 진행', e);
      }
    }

    /* 3️⃣ 컨텍스트·로컬스토리지 동기화 */
    setCurrentUser(finalUser);
    localStorage.setItem('user', JSON.stringify(finalUser));

    return finalUser;
  } catch (err) {
    console.error('Login error:', err);
    setError(err.response?.data?.message || 'Login failed');
    throw err;
  } finally {
    setLoading(false);
  }
};

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerAsAgent = async (formData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/agents/register`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const { token, agent } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser({ ...agent, role: 'agent' });
      return agent;
    } catch (err) {
      console.error('Agent registration error:', err);
      setError(err.response?.data?.message || 'Agent registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/users/profile`,
        userData,
        config
      );
      setCurrentUser({ ...currentUser, ...response.data.user });
      return response.data.user;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const isAuthenticated = !!currentUser;
  const isAgent = currentUser?.role === 'agent';
  const isAdmin = currentUser?.role === 'admin';

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    registerAsAgent,
    logout,
    updateProfile,
    isAuthenticated,
    isAgent,
    updateUser,
    isAdmin,
    getAuthHeader
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};