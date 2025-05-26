// frontend/src/services/favoriteService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Get user's favorite properties
export const getUserFavorites = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(`${API_URL}/favorites`, config);
    const data = response.data;

    // Handle different response formats
    if (Array.isArray(data.favorites)) {
      return data.favorites;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch favorites');
  }
};

// Add property to favorites
export const addToFavorites = async (propertyId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post(
      `${API_URL}/favorites`,
      { property_id: propertyId },
      config
    );

    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed');
    }
    throw new Error(error.response?.data?.message || 'Failed to add to favorites');
  }
};

// Remove property from favorites
export const removeFromFavorites = async (propertyId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.delete(`${API_URL}/favorites/${propertyId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed');
    }
    throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
  }
};

// Check if property is in user's favorites
export const isFavorite = async (propertyId) => {
  try {
    const favorites = await getUserFavorites();
    return favorites.some(fav => fav.property_id === propertyId || fav.id === propertyId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Toggle favorite status
export const toggleFavorite = async (propertyId) => {
  try {
    const isCurrentlyFavorite = await isFavorite(propertyId);
    
    if (isCurrentlyFavorite) {
      await removeFromFavorites(propertyId);
      return false;
    } else {
      await addToFavorites(propertyId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};