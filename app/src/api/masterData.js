/**
 * Wedring Matrimony — Master Data API
 * Fetch options for dropdowns like Religion, Caste, Location
 */
import apiClient from './apiClient';

// Helper to format string arrays to {id, name} if backend returns simple arrays
const formatResponse = (data) => {
  if (!Array.isArray(data)) return [];
  if (data.length > 0 && typeof data[0] === 'string') {
    return data.map(item => ({ id: item, name: item }));
  }
  return data; // Already objects
};

export const getReligions = async () => {
  // Hardcoded or fetched from backend if we add a route.
  // For now, return standard list
  return [
    { id: 'Hindu', name: 'Hindu' },
    { id: 'Muslim', name: 'Muslim' },
    { id: 'Christian', name: 'Christian' },
    { id: 'Sikh', name: 'Sikh' },
    { id: 'Jain', name: 'Jain' },
    { id: 'Buddhist', name: 'Buddhist' },
  ];
};

export const getCastes = async (religionName) => {
  if (!religionName) return [];
  try {
    const data = await apiClient.get(`/profile/religion/castes/${religionName}`);
    return formatResponse(data);
  } catch (err) {
    return [];
  }
};

export const getCountries = async () => {
  return [{ id: 'India', name: 'India' }];
};

export const getStates = async (countryId) => {
  try {
    const data = await apiClient.get('/profile/location/states');
    return formatResponse(data);
  } catch (err) {
    return [];
  }
};

export const getDistricts = async (stateName) => {
  if (!stateName) return [];
  try {
    const data = await apiClient.get(`/profile/location/districts/${stateName}`);
    return formatResponse(data);
  } catch (err) {
    return [];
  }
};

export const getCities = async (districtName) => {
  if (!districtName) return [];
  try {
    const data = await apiClient.get(`/profile/location/cities/${districtName}`);
    return formatResponse(data);
  } catch (err) {
    return [];
  }
};
